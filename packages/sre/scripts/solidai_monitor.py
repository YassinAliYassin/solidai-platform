#!/usr/bin/env python3
"""
SolidAI SRE Platform Monitor

Checks:
- Docker container health
- Neo4j connectivity (Bolt protocol)
- LiteLLM proxy health
- Config service health
- SRE agent health
- Web UI health
- Resource usage

Reports issues to stdout (can be extended to send Telegram alerts).
"""

import json
import subprocess
import time
from datetime import datetime
from pathlib import Path

def run_cmd(cmd, timeout=10):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return {"rc": result.returncode, "stdout": result.stdout.strip(), "stderr": result.stderr.strip()}
    except subprocess.TimeoutExpired:
        return {"rc": -1, "stdout": "", "stderr": "Command timed out"}
    except Exception as e:
        return {"rc": -1, "stdout": "", "stderr": str(e)}

def check_containers():
    """Check Docker container status for SolidAI SRE services."""
    result = run_cmd(
        "docker ps --filter 'label=com.docker.compose.project=solidai-sre' "
        "--format 'table {{.Names}}\\t{{.Status}}\\t{{.Health}}' 2>/dev/null || "
        "docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'"
    )
    
    issues = []
    healthy_count = 0
    total_count = 0
    
    for line in result["stdout"].split("\n"):
        if not line or "NAMES" in line:
            continue
        total_count += 1
        # Check if unhealthy or not running
        if "unhealthy" in line.lower() or "exited" in line.lower() or "restarting" in line.lower():
            issues.append(f"Container issue: {line}")
        elif "healthy" in line.lower() or "up" in line.lower():
            healthy_count += 1
    
    return {
        "healthy": healthy_count,
        "total": total_count,
        "issues": issues,
    }

def check_neo4j():
    """Check Neo4j connectivity via Bolt port."""
    # Check container is running
    container_status = run_cmd("docker ps --filter 'name=solidai-sre-neo4j' --format '{{.Status}}'")
    if "Up" not in container_status["stdout"]:
        return {"status": "down", "reason": "Container not running", "issue": "Neo4j container is not running"}
    
    # Check Bolt port accessibility
    port_check = run_cmd("nc -z localhost 7688 && echo ok || echo fail")
    if port_check["stdout"] != "ok":
        return {"status": "down", "reason": "Bolt port not accessible", "issue": "Neo4j Bolt port 7688 not accessible"}
    
    # Check HTTP port
    http_check = run_cmd("nc -z localhost 7475 && echo ok || echo fail")
    http_ok = http_check["stdout"] == "ok"
    
    return {
        "status": "healthy",
        "bolt_port": 7688,
        "http_port": 7475 if http_ok else "N/A",
        "issue": None,
    }

def check_litellm():
    """Check LiteLLM proxy health and configuration."""
    # Check health endpoint
    health = run_cmd("curl -s http://localhost:4001/health/readiness 2>/dev/null || echo 'failed'")
    if health["stdout"] == "failed":
        return {"status": "down", "issue": "LiteLLM health endpoint unreachable"}
    
    try:
        data = json.loads(health["stdout"])
        if data.get("status") != "healthy":
            return {"status": "degraded", "issue": f"LiteLLM status: {data.get('status')}", "details": data}
        return {
            "status": "healthy",
            "version": data.get("litellm_version", "unknown"),
            "db": data.get("db", "unknown"),
            "issue": None,
        }
    except json.JSONDecodeError:
        return {"status": "down", "issue": "Invalid LiteLLM health response"}

def check_config_service():
    """Check config-service health."""
    result = run_cmd("curl -s http://localhost:8081/health 2>/dev/null || echo 'failed'")
    if result["stdout"] == "failed":
        return {"status": "down", "issue": "Config service unreachable"}
    
    try:
        data = json.loads(result["stdout"])
        if data.get("status") != "ok":
            return {"status": "degraded", "issue": f"Config service status: {data.get('status')}"}
        return {"status": "healthy", "issue": None}
    except json.JSONDecodeError:
        return {"status": "down", "issue": "Invalid config service health response"}

def check_sre_agent():
    """Check SRE agent health."""
    result = run_cmd("curl -s http://localhost:8001/health 2>/dev/null || echo 'failed'")
    if result["stdout"] == "failed":
        return {"status": "down", "issue": "SRE agent unreachable"}
    
    try:
        data = json.loads(result["stdout"])
        status = data.get("status", "unknown")
        return {
            "status": "healthy" if status == "healthy" else status,
            "mode": data.get("mode", "unknown"),
            "active_sessions": data.get("active_sessions", 0),
            "issue": None if status == "healthy" else f"Status: {status}",
        }
    except json.JSONDecodeError:
        return {"status": "down", "issue": "Invalid SRE agent health response"}

def check_web_ui():
    """Check Web UI health."""
    result = run_cmd("curl -s http://localhost:3002/api/health 2>/dev/null || echo 'failed'")
    if result["stdout"] == "failed":
        return {"status": "down", "issue": "Web UI unreachable"}
    
    try:
        data = json.loads(result["stdout"])
        if data.get("status") != "ok":
            return {"status": "degraded", "issue": f"Web UI status: {data.get('status')}"}
        return {"status": "healthy", "issue": None}
    except json.JSONDecodeError:
        return {"status": "down", "issue": "Invalid Web UI health response"}

def check_resources():
    """Check system resource usage."""
    # Memory
    mem_result = run_cmd("free -h | awk '/Mem:/ {print $2, $3, $4}'")
    # Disk
    disk_result = run_cmd("df -h / | awk 'NR==2 {print $2, $3, $4, $5}'")
    # Load average
    load_result = run_cmd("uptime | awk -F'load average:' '{print $2}' | xargs")
    
    return {
        "memory": mem_result["stdout"],
        "disk": disk_result["stdout"],
        "load_average": load_result["stdout"],
    }

def check_neo4j_auth_issues():
    """Check Neo4j logs for authentication failure patterns."""
    logs = run_cmd("docker logs solidai-sre-neo4j --tail=200 2>&1 | grep -iE '(unauthorized|auth failure|auth error)' | tail -5")
    if logs["stdout"]:
        return {"has_issues": True, "samples": logs["stdout"].split("\n")[:5]}
    return {"has_issues": False}

def main():
    print(f"\n{'='*60}")
    print(f"SolidAI SRE Platform Health Check - {datetime.now().isoformat()}")
    print(f"{'='*60}\n")
    
    # Run all checks
    checks = {
        "containers": check_containers(),
        "neo4j": check_neo4j(),
        "litellm": check_litellm(),
        "config_service": check_config_service(),
        "sre_agent": check_sre_agent(),
        "web_ui": check_web_ui(),
        "resources": check_resources(),
        "neo4j_auth_issues": check_neo4j_auth_issues(),
    }
    
    # Print results
    print("📦 Container Status:")
    print(f"   Healthy: {checks['containers']['healthy']}/{checks['containers']['total']}")
    for issue in checks['containers']['issues']:
        print(f"   ⚠️  {issue}")
    
    print("\n🔗 Neo4j:")
    print(f"   Status: {checks['neo4j']['status']}")
    if checks['neo4j']['issue']:
        print(f"   ⚠️  {checks['neo4j']['issue']}")
    
    print("\n🤖 LiteLLM Proxy:")
    print(f"   Status: {checks['litellm']['status']}")
    if checks['litellm']['issue']:
        print(f"   ⚠️  {checks['litellm']['issue']}")
    elif checks['litellm'].get('version'):
        print(f"   Version: {checks['litellm']['version']}")
    
    print("\n⚙️ Config Service:")
    print(f"   Status: {checks['config_service']['status']}")
    if checks['config_service']['issue']:
        print(f"   ⚠️  {checks['config_service']['issue']}")
    
    print("\n🕵️ SRE Agent:")
    print(f"   Status: {checks['sre_agent']['status']}")
    print(f"   Mode: {checks['sre_agent'].get('mode', 'N/A')}")
    print(f"   Active Sessions: {checks['sre_agent'].get('active_sessions', 0)}")
    if checks['sre_agent']['issue']:
        print(f"   ⚠️  {checks['sre_agent']['issue']}")
    
    print("\n🌐 Web UI:")
    print(f"   Status: {checks['web_ui']['status']}")
    if checks['web_ui']['issue']:
        print(f"   ⚠️  {checks['web_ui']['issue']}")
    
    print("\n📊 System Resources:")
    print(f"   Memory: {checks['resources']['memory']}")
    print(f"   Disk: {checks['resources']['disk']}")
    print(f"   Load Average: {checks['resources']['load_average']}")
    
    print("\n🔐 Neo4j Auth Issues:")
    if checks['neo4j_auth_issues']['has_issues']:
        print(f"   ⚠️  Authentication failures detected in logs:")
        for sample in checks['neo4j_auth_issues']['samples']:
            print(f"      {sample[:100]}")
    else:
        print("   OK")
    
    # Summary
    print(f"\n{'='*60}")
    print("Summary:")
    all_issues = []
    for key, check in checks.items():
        if isinstance(check, dict) and check.get("status") == "down":
            all_issues.append(f"{key}: down")
        if isinstance(check, dict) and check.get("issue"):
            all_issues.append(f"{key}: {check['issue']}")
    
    if all_issues:
        print("  ❌ Issues found:")
        for issue in all_issues:
            print(f"     - {issue}")
    else:
        print("  ✅ All services healthy")
    
    print(f"{'='*60}\n")
    
    return checks

if __name__ == "__main__":
    main()