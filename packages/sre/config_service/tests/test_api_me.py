import time

import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

jwt = pytest.importorskip("jwt")
cryptography = pytest.importorskip("cryptography")
from cryptography.hazmat.primitives.asymmetric import rsa
from src.api.main import create_app
from src.core.security import hash_token
from src.db.base import Base
from src.db.models import NodeType, OrgNode, TeamToken
from src.db.config_models import NodeConfiguration


@pytest.fixture()
def app_and_db(monkeypatch):
    # sqlite in-memory for tests
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    # required for token hashing
    monkeypatch.setenv("TOKEN_PEPPER", "test-pepper")

    # Seed org graph + configs
    with SessionLocal() as s:
        s.add(
            OrgNode(
                org_id="org1",
                node_id="root",
                parent_id=None,
                node_type=NodeType.org,
                name="Root",
            )
        )
        s.add(
            OrgNode(
                org_id="org1",
                node_id="teamA",
                parent_id="root",
                node_type=NodeType.team,
                name="Team A",
            )
        )
        s.add(
            NodeConfiguration(
                id="cfg-root",
                org_id="org1",
                node_id="root",
                node_type="org",
                config_json={"knowledge_source": {"grafana": ["org"]}},
                version=1,
            )
        )
        s.add(
            NodeConfiguration(
                id="cfg-teamA",
                org_id="org1",
                node_id="teamA",
                node_type="team",
                config_json={"knowledge_source": {"confluence": ["team"]}},
                version=1,
            )
        )

        # create token row
        token_id = "tokid"
        token_secret = "toksecret"
        s.add(
            TeamToken(
                org_id="org1",
                team_node_id="teamA",
                token_id=token_id,
                token_hash=hash_token(token_secret, pepper="test-pepper"),
            )
        )
        s.commit()

    # Override the DB dependency to use this sessionmaker
    from src.api.routes import config_v2

    def override_get_db():
        with SessionLocal() as s:
            try:
                yield s
                s.commit()
            except Exception:
                s.rollback()
                raise

    app = create_app()
    app.dependency_overrides[config_v2.get_db] = override_get_db
    return app, f"{token_id}.{token_secret}"


def test_me_effective(app_and_db):
    app, token = app_and_db
    client = TestClient(app)
    resp = client.get(
        "/api/v1/config/me/effective", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    # team overrides wins for confluence; grafana inherited from org remains
    assert body["effective_config"]["knowledge_source"]["grafana"] == ["org"]
    assert body["effective_config"]["knowledge_source"]["confluence"] == ["team"]


def test_me_raw(app_and_db):
    app, token = app_and_db
    client = TestClient(app)
    resp = client.get(
        "/api/v1/config/me/raw", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["lineage"] == ["root", "teamA"]
    assert body["configs"]["root"]["knowledge_source"]["grafana"] == ["org"]


def test_put_me_rejects_team_name(app_and_db):
    app, token = app_and_db
    client = TestClient(app)
    resp = client.patch(
        "/api/v1/config/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"config": {"team_name": "nope"}},
    )
    assert resp.status_code == 400


def test_put_me_merges_overrides(app_and_db):
    app, token = app_and_db
    client = TestClient(app)

    # add google without removing existing confluence override
    resp = client.patch(
        "/api/v1/config/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"config": {"knowledge_source": {"google": ["drive:folder/demo"]}}},
    )
    assert resp.status_code == 200

    eff = client.get(
        "/api/v1/config/me/effective", headers={"Authorization": f"Bearer {token}"}
    ).json()
    assert eff["effective_config"]["knowledge_source"]["confluence"] == ["team"]
    assert eff["effective_config"]["knowledge_source"]["google"] == ["drive:folder/demo"]


def test_me_effective_accepts_oidc(monkeypatch):
    # Enable OIDC auth for team endpoints
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pub = key.public_key()
    jwk = jwt.algorithms.RSAAlgorithm.to_jwk(pub)
    jwks = {"keys": [dict(**__import__("json").loads(jwk), kid="test-kid")]}

    monkeypatch.setenv("TEAM_AUTH_MODE", "oidc")
    monkeypatch.setenv("OIDC_ENABLED", "1")
    monkeypatch.setenv("OIDC_ISSUER", "https://issuer.example")
    monkeypatch.setenv("OIDC_AUDIENCE", "solidai-sre-config-service")
    monkeypatch.setenv("OIDC_JWKS_JSON", __import__("json").dumps(jwks))
    monkeypatch.setenv("OIDC_ORG_ID_CLAIM", "org_id")
    monkeypatch.setenv("OIDC_TEAM_NODE_ID_CLAIM", "team_node_id")

    token = jwt.encode(
        {
            "sub": "user1",
            "iss": "https://issuer.example",
            "aud": "solidai-sre-config-service",
            "org_id": "org1",
            "team_node_id": "teamA",
            "exp": int(time.time()) + 3600,
        },
        key,
        algorithm="RS256",
        headers={"kid": "test-kid"},
    )

    # sqlite in-memory
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    with SessionLocal() as s:
        s.add(
            OrgNode(
                org_id="org1",
                node_id="root",
                parent_id=None,
                node_type=NodeType.org,
                name="Root",
            )
        )
        s.add(
            OrgNode(
                org_id="org1",
                node_id="teamA",
                parent_id="root",
                node_type=NodeType.team,
                name="Team A",
            )
        )
        s.add(
            NodeConfiguration(
                id="cfg-root",
                org_id="org1",
                node_id="root",
                node_type="org",
                config_json={"knowledge_source": {"grafana": ["org"]}},
                version=1,
            )
        )
        s.add(
            NodeConfiguration(
                id="cfg-teamA",
                org_id="org1",
                node_id="teamA",
                node_type="team",
                config_json={"knowledge_source": {"confluence": ["team"]}},
                version=1,
            )
        )
        s.commit()

    from src.api.routes import config_v2

    def override_get_db():
        with SessionLocal() as s:
            yield s

    app = create_app()
    app.dependency_overrides[config_v2.get_db] = override_get_db

    client = TestClient(app)
    resp = client.get(
        "/api/v1/config/me/effective", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["effective_config"]["knowledge_source"]["grafana"] == ["org"]
    assert body["effective_config"]["knowledge_source"]["confluence"] == ["team"]
