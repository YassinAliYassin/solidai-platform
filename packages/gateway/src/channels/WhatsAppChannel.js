const express = require('express');
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
const path = require('path');

const router = express.Router();

// Process WhatsApp booking message
router.post('/process-booking', [
    body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const scriptPath = '/home/yassin/fresh-people-event-ops/event_processor.py';
    
    // Write message to temp file and process
    const tempFile = '/tmp/whatsapp_booking.txt';
    require('fs').writeFileSync(tempFile, message);
    
    exec(`python3 ${scriptPath} ${tempFile}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                error: 'Processing failed', 
                details: stderr 
            });
        }
        
        res.json({ 
            success: true,
            result: stdout 
        });
    });
});

// Web form for manual paste
router.get('/whatsapp-form', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Booking Processor</title>
    <style>
        body { font-family: Inter, sans-serif; padding: 20px; background: #FBFBF9; }
        textarea { width: 100%; height: 200px; margin: 10px 0; padding: 10px; }
        button { background: #A4C71D; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        pre { background: #0A0A0A; color: #FBFBF9; padding: 15px; overflow-x: auto; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Fresh People - WhatsApp Booking</h1>
    <p>Paste WhatsApp booking message below:</p>
    <textarea id="message" placeholder="EVENT: Corporate Gala&#10;CLIENT: Sarah M&#10;DATE: 2026-06-15&#10;..."></textarea>
    <br>
    <button onclick="processMessage()">Process Booking</button>
    <h3>Result:</h3>
    <pre id="result"></pre>
    
    <script>
        function processMessage() {
            const msg = document.getElementById('message').value;
            fetch('/whatsapp/process-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            })
            .then(r => r.json())
            .then(data => {
                document.getElementById('result').textContent = data.result || JSON.stringify(data, null, 2);
            });
        }
    </script>
</body>
</html>
    `);
});

module.exports = router;
