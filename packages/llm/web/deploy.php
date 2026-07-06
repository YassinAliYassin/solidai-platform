<?php
/**
 * Solid LLM - Self-deploying script
 * Upload this to cPanel File Manager, then access via browser
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $target_dir = "/home/solidsol/public_html/solid-llm/";
    
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0755, true);
    }
    
    $filename = basename($_FILES['file']['name']);
    $target_file = $target_dir . $filename;
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
        echo "SUCCESS: $filename uploaded to $target_file<br>";
    } else {
        echo "FAILED to upload $filename<br>";
    }
    
    // Also create test page
    $test_page = $target_dir . 'test.html';
    file_put_contents($test_page, '<h1>Solid LLM Deployed!</h1><p>Built by Solid Solutions</p>');
    echo "Test page created: <a href='/solid-llm/test.html'>/solid-llm/test.html</a>";
    exit;
}
?>
<!DOCTYPE html>
<html>
<head><title>Deploy Solid LLM</title></head>
<body>
    <h1>Upload Solid LLM Files</h1>
    <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file"><br><br>
        <button type="submit">Upload</button>
    </form>
</body>
</html>
