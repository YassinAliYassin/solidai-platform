<?php
/**
 * Solid LLM - Cloud API (OpenRouter)
 * Built by Solid Solutions
 * No local Ollama needed - runs in cloud
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$response = ['success' => false];

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = $input['prompt'] ?? 'Hello';
    $model = $input['model'] ?? 'meta-llama/llama-3.1-8b-instruct:free';
    
    // OpenRouter API
    $api_url = 'https://openrouter.ai/api/v1/chat/completions';
    $api_key = getenv('OPENROUTER_API_KEY') ?: '';

    if (empty($api_key)) {
        http_response_code(500);
        echo json_encode(['error' => 'OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable.']);
        exit;
    }
    
    $data = [
        'model' => $model,
        'messages' => [
            ['role' => 'user', 'content' => $prompt]
        ]
    ];
    
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key,
        'HTTP-Referer: https://solidsolutions.africa',
        'X-Title: Solid LLM'
    ]);
    
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($result && $http_code === 200) {
        $api_response = json_decode($result, true);
        $response = [
            'model' => 'Solid LLM v1.0.0 (Cloud)',
            'response' => $api_response['choices'][0]['message']['content'] ?? 'No response',
            'provider' => 'OpenRouter',
            'base_model' => $model,
            'success' => true,
            'built_by' => 'Solid Solutions'
        ];
    } else {
        $response['error'] = 'API call failed: HTTP ' . $http_code;
        $response['api_response'] = $result ?? null;
    }
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
