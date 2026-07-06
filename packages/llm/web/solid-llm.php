<?php
/**
 * Solid LLM - PHP interface for cPanel deployment
 * Built by Solid Solutions
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = ['success' => false];

try {
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = $input['prompt'] ?? 'Hello';
    
    // Call Ollama API
    $ollama_url = 'http://localhost:11434/api/generate';
    $data = [
        'model' => 'llama3.1:8b',
        'prompt' => $prompt,
        'stream' => false
    ];
    
    $ch = curl_init($ollama_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    if ($result) {
        $ollama_response = json_decode($result, true);
        $response = [
            'model' => 'Solid LLM v1.0.0 (Llama 3.1 8B)',
            'response' => $ollama_response['response'] ?? 'No response',
            'success' => true,
            'provider' => 'Solid Solutions'
        ];
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
