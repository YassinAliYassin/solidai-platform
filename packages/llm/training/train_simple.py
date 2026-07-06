"""
Solid LLM v2.0 - Simple Working Version
Built from scratch, Hermes-powered
"""

import torch
import torch.nn as nn
import torch.optim as optim
from typing import List
import math

class SimpleSolidLLM(nn.Module):
    """
    Solid LLM - Simple Transformer from Scratch
    Uses Hermes intelligence weight
    """
    def __init__(self, vocab_size=1000, d_model=128, n_layers=2, n_heads=2):
        super().__init__()
        self.vocab_size = vocab_size
        self.d_model = d_model
        
        # Embeddings
        self.token_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(512, d_model)
        
        # Transformer layers (simplified)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, 
            nhead=n_heads, 
            dim_feedforward=d_model*4,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        
        # Output head
        self.lm_head = nn.Linear(d_model, vocab_size)
        
        # Hermes Intelligence Weight
        self.hermes_weight = nn.Parameter(torch.tensor(1.5))
        print("Solid LLM: Hermes Intelligence ENABLED")
        
    def forward(self, x):
        # x: (batch, seq_len)
        seq_len = x.size(1)
        
        # Embeddings
        tok_emb = self.token_emb(x)
        pos = torch.arange(seq_len).unsqueeze(0).to(x.device)
        pos_emb = self.pos_emb(pos)
        
        x = tok_emb + pos_emb
        
        # Transformer
        x = self.transformer(x)
        
        # LM head with Hermes boost
        logits = self.lm_head(x) * self.hermes_weight
        
        return logits
    
    def generate(self, x, max_new_tokens=50):
        """Simple generation"""
        self.eval()
        with torch.no_grad():
            for _ in range(max_new_tokens):
                logits = self.forward(x)
                next_token = logits[:, -1, :].argmax(dim=-1, keepdim=True)
                x = torch.cat([x, next_token], dim=1)
        return x

def train_solid_llm():
    """Train Solid LLM on simple task"""
    print("\n" + "="*60)
    print("Solid LLM v2.0 - Training from Scratch")
    print("="*60 + "\n")
    
    # Initialize
    model = SimpleSolidLLM(vocab_size=1000, d_model=128, n_layers=2, n_heads=2)
    print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Simple training data: learn to copy sequence
    data = torch.randint(0, 100, (200, 20))  # 200 samples, length 20
    
    optimizer = optim.AdamW(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()
    
    # Training loop
    model.train()
    for epoch in range(5):
        total_loss = 0
        for i in range(0, len(data), 10):
            batch = data[i:i+10]
            inputs = batch[:, :-1]
            targets = batch[:, 1:]
            
            logits = model(inputs)
            loss = criterion(logits.transpose(1, 2), targets)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / (len(data) // 10)
        print(f"Epoch {epoch+1}/5 - Loss: {avg_loss:.4f}")
    
    # Save
    torch.save(model.state_dict(), '/home/yassin/solid-llm/models/solid-llm-v2-simple.pth')
    print(f"\nModel saved to: /home/yassin/solid-llm/models/solid-llm-v2-simple.pth")
    
    # Test generation
    print("\nTesting generation...")
    test_input = torch.randint(0, 100, (1, 5))
    output = model.generate(test_input, max_new_tokens=10)
    print(f"Input shape: {test_input.shape} -> Output shape: {output.shape}")
    
    print("\n" + "="*60)
    print("Solid LLM v2.0 - TRAINED & READY!")
    print("Built from Scratch by Solid Solutions")
    print("Hermes Intelligence: ENABLED")
    print("="*60)

if __name__ == "__main__":
    train_solid_llm()
