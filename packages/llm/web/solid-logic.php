<?php
/**
 * Solid Logic v2 - PHP Wrapper (Deployment Version)
 * Autonomous Agency Layer for Solid Solutions
 * Hermes-powered via OpenRouter API
 */

$OPENROUTER_API_KEY = getenv('OPENROUTER_API_KEY') ?: '';
$HERMES_MODEL = "nousresearch/hermes-3-llama-3.1-405b:free";

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Health check
if ($_SERVER['REQUEST_METHOD'] == 'GET' || !isset($_POST['task'])) {
    echo json_encode([
        "status" => "operational",
        "layer" => "Solid Logic v2",
        "authorization" => "full_user_granted",
        "engine" => "Hermes 3 405B (OpenRouter)"
    ]);
    exit(0);
}

// Execute task
$task = $_POST['task'] ?? '';
$context = $_POST['context'] ?? '{}';

// Step 1: Ask Hermes to generate execution plan
$system_prompt = "You are Solid Logic, an autonomous agency layer for Solid Solutions. 
You have full system access (user-authorized, no permission prompts). 
For any task, output ONLY a JSON array of shell commands to execute.
Example: [\"ls -la\", \"pwd\", \"echo 'done'\"]
Output NOTHING else but the JSON array.";

$plan_prompt = "Task: $task\nContext: $context\nGenerate execution plan:";

// Call OpenRouter API with retry
function callHermes($system_prompt, $user_prompt, $api_key, $model) {
    $max_retries = 3;
    $wait_times = [2, 4, 8];
    
    for ($attempt = 0; $attempt < $max_retries; $attempt++) {
        $data = [
            "model" => $model,
            "messages" => [
                ["role" => "system", "content" => $system_prompt],
                ["role" => "user", "content" => $user_prompt]
            ]
        ];
        
        $ch = curl_init("https://openrouter.ai/api/v1/chat/completions");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $api_key",
            "HTTP-Referer: https://solidsolutions.africa",
            "X-Title: Solid Logic"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code == 200) {
            $result = json_decode($response, true);
            return $result['choices'][0]['message']['content'] ?? '';
        } elseif ($http_code == 429 && $attempt < $max_retries - 1) {
            sleep($wait_times[$attempt]);
            continue;
        }
        return "API Error: $http_code";
    }
    return "Max retries exceeded";
}

$plan_json = callHermes($system_prompt, $plan_prompt, $OPENROUTER_API_KEY, $HERMES_MODEL);

// Parse plan
$execution_plan = [];
try {
    $cleaned = str_replace(["```json", "```"], "", $plan_json);
    $execution_plan = json_decode(trim($cleaned), true);
    if (!is_array($execution_plan)) {
        $execution_plan = ["echo 'Error parsing plan: $plan_json'"];
    }
} catch (Exception $e) {
    $execution_plan = ["echo 'Error: " . $e->getMessage() . "'"];
}

// Execute plan (autonomous, no permission prompts)
$results = [];
$steps = [];
foreach ($execution_plan as $cmd) {
    if (!is_string($cmd)) continue;
    
    $output = shell_exec($cmd . " 2>&1");
    $results[] = substr($output ?? '', 0, 500);
    $steps[] = "✓ $cmd";
}

$task_id = uniqid('task_', true);

echo json_encode([
    "task_id" => $task_id,
    "status" => "completed",
    "result" => implode("\n", $results),
    "steps" => $steps
]);
?>
