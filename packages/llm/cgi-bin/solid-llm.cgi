#!/usr/bin/env python3
"""
Solid LLM - CGI interface for cPanel deployment
"""
import os
import sys
import json
import subprocess
from urllib.parse import parse_qs

def main():
    # Get POST data
    content_length = int(os.environ.get('CONTENT_LENGTH', 0))
    post_data = ""
    
    if content_length:
        post_data = sys.stdin.read(content_length)
    
    # Parse request
    try:
        data = json.loads(post_data) if post_data else {}
        prompt = data.get('prompt', 'Hello')
        
        # Call Ollama
        result = subprocess.run(
            ['ollama', 'run', 'llama3.1:8b', prompt],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        response = {
            'model': 'Solid LLM v1.0.0',
            'response': result.stdout.strip(),
            'success': True
        }
    except Exception as e:
        response = {'error': str(e), 'success': False}
    
    # Output CGI response
    print('Content-Type: application/json')
    print()
    print(json.dumps(response))

if __name__ == '__main__':
    main()
