<?php
/**
 * Solid LLM website assistant - cPanel/PHP backend.
 *
 * Mirror of api/chat.ts (the Vercel function) for the PHP-hosted deployment of
 * solidsolutions.africa. The site is static, so it calls this same-origin
 * endpoint; the API key stays server-side and is never sent to the browser.
 *
 * Configure the key in either way:
 *   1. Environment variable OPENROUTER_API_KEY (e.g. via .htaccess SetEnv), or
 *   2. A gitignored file next to this one: public/api/config.local.php that
 *      does:  <?php putenv('OPENROUTER_API_KEY=sk-or-...');
 *
 * This file is copied to public_html/api/chat.php by the cPanel deploy because
 * Vite emits everything under public/ into dist/.
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

// Optional local config for the API key (gitignored).
$local_config = __DIR__ . '/config.local.php';
if (is_readable($local_config)) {
    require $local_config;
}

$api_key = getenv('OPENROUTER_API_KEY') ?: '';
if ($api_key === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Assistant is not configured. Set OPENROUTER_API_KEY on the server.']);
    exit;
}

$model = getenv('SOLID_LLM_MODEL') ?: 'meta-llama/llama-3.3-70b-instruct';

// --- Grounding: keep in sync with api/chat.ts / packages/llm/data/knowledge.md
$knowledge = <<<'TXT'
Solid Solutions is a technology initiative focused on Africa's digital future. It works on experimental AI and infrastructure projects. Contact: info@solidsolutions.africa. Website: solidsolutions.africa.
SolidAI is the applied-AI program of Solid Solutions, focused on hyper-local NLP for African dialects, edge efficiency for low-power hardware, and a privacy-first approach. SolidAI is in beta; developers can request early access to its APIs and models.
Solid LLM is Solid Solutions' language-model research effort, including a transformer built from scratch in PyTorch. The current public research preview is a small character-level model trained on first-party text - an honest demonstration of the pipeline, not a large production model.
Sectors SolidAI advises on: agriculture, health, education, finance, legal, transport, and energy - all in the African context.
Privacy: Solid Solutions collects only basic contact information submitted voluntarily and does not sell or share personal information for marketing.
TXT;

$sector_personas = [
    'general'     => 'You are a knowledgeable advisor for the African context, giving practical, actionable guidance.',
    'agriculture' => 'You are an agricultural expert focused on African farming: crops, soil, pests, irrigation, and sustainable practices for small-scale farmers.',
    'health'      => 'You are a healthcare advisor for African communities. You are not a substitute for a doctor; recommend professional care for personal medical issues.',
    'education'   => 'You are an education specialist for African schools: curriculum, teacher training, digital literacy, and reaching remote students.',
    'finance'     => 'You are a fintech advisor for African markets: mobile money, microfinance, and financial inclusion. You give general information, not personalised financial advice.',
    'legal'       => 'You are a legal information guide for African contexts. You give general information, not formal legal advice.',
    'transport'   => 'You are a transport and logistics expert for Africa.',
    'energy'      => 'You are a renewable-energy advisor for Africa: off-grid solar, mini-grids, and clean cooking.',
];

$input = json_decode(file_get_contents('php://input'), true);
$message = isset($input['message']) ? trim((string)$input['message']) : '';
$sector  = isset($input['sector']) ? (string)$input['sector'] : 'general';
if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => "Missing 'message'."]);
    exit;
}
if (strlen($message) > 4000) {
    http_response_code(400);
    echo json_encode(['error' => 'Message too long (max 4000 chars).']);
    exit;
}

$persona = $sector_personas[$sector] ?? $sector_personas['general'];
$system = "You are Solid LLM, the AI assistant for Solid Solutions (solidsolutions.africa).\n"
    . $persona . "\n\n"
    . "Use the facts below when asked about the company or its products; if you do not know, say so and point to info@solidsolutions.africa. Be concise, warm, and practical. Do not invent features, prices, or dates.\n\n"
    . "--- Solid Solutions facts ---\n" . $knowledge . "\n--- end facts ---";

$messages = [['role' => 'system', 'content' => $system]];

// Optional prior turns from the client.
if (isset($input['history']) && is_array($input['history'])) {
    foreach (array_slice($input['history'], -8) as $m) {
        if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
            $messages[] = ['role' => $m['role'], 'content' => substr((string)$m['content'], 0, 4000)];
        }
    }
}
$messages[] = ['role' => 'user', 'content' => $message];

$payload = json_encode([
    'model' => $model,
    'messages' => $messages,
    'temperature' => 0.6,
    'max_tokens' => 800,
]);

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key,
    'HTTP-Referer: https://solidsolutions.africa',
    'X-Title: Solid LLM',
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result && $http_code === 200) {
    $data = json_decode($result, true);
    $reply = $data['choices'][0]['message']['content'] ?? '';
    if ($reply === '') {
        http_response_code(502);
        echo json_encode(['error' => 'Empty response from model.']);
        exit;
    }
    echo json_encode(['reply' => $reply, 'model' => $model]);
} else {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream model error.', 'status' => $http_code]);
}
