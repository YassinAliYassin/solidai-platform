"""
Solid LLM v2.0 - Training Script
Train our LLM with custom dataset + Hermes intelligence
"""

import sys
import os
from pathlib import Path as _Path

_REPO_ROOT = _Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_REPO_ROOT))

import torch
import torch.nn as nn
from training.solid_llm_model import SolidLLM, SolidLLMConfig
from torch.utils.data import Dataset, DataLoader
import json

class SolidDataset(Dataset):
    """Custom dataset for Solid LLM training"""
    def __init__(self, texts, tokenizer, max_length=512):
        self.texts = texts
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        # Simplified tokenization (real: use proper tokenizer)
        tokens = [ord(c) % 32000 for c in text[:self.max_length]]
        tokens += [0] * (self.max_length - len(tokens))  # Pad
        
        return {
            'input_ids': torch.tensor(tokens),
            'labels': torch.tensor(tokens[1:] + [0])  # Shift for causal LM
        }

class SolidTrainer:
    """Train Solid LLM with Hermes intelligence"""
    
    def __init__(self, model, train_dataloader, device='cpu'):
        self.model = model.to(device)
        self.train_dataloader = train_dataloader
        self.device = device
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
        self.loss_fn = nn.CrossEntropyLoss()
        
    def train(self, epochs=3):
        """Train the model"""
        self.model.train()
        
        for epoch in range(epochs):
            total_loss = 0
            num_batches = 0
            
            for batch in self.train_dataloader:
                input_ids = batch['input_ids'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                # Forward pass
                logits = self.model(input_ids)
                loss = self.loss_fn(
                    logits.view(-1, logits.size(-1)),
                    labels.view(-1)
                )
                
                # Backward pass
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
                num_batches += 1
                
            avg_loss = total_loss / num_batches
            print(f"Epoch {epoch+1}/{epochs} - Loss: {avg_loss:.4f}")
            
        print("\nTraining COMPLETE!")

def create_sample_data():
    """Create sample training data for Solid LLM"""
    return [
        "Solid LLM is an AI model built by Solid Solutions.",
        "Hermes Agent provides intelligence to Solid LLM.",
        "We build AI from scratch with transformer architecture.",
        "Solid Solutions creates powerful AI tools for everyone.",
        "Our LLM uses Hermes as the reasoning engine.",
        "Transformers are the foundation of modern language models.",
    ] * 100  # Multiply for more training data

if __name__ == "__main__":
    print("=" * 60)
    print("Solid LLM v2.0 - Training Pipeline")
    print("=" * 60)
    
    # Initialize model
    config = SolidLLMConfig(
        vocab_size=32000,
        hidden_size=256,
        num_hidden_layers=4,
        num_attention_heads=4,
        use_hermes_intelligence=True
    )
    
    model = SolidLLM(config)
    print(f"\nModel initialized: {sum(p.numel() for p in model.parameters()):,} parameters")
    
    # Create dataset
    texts = create_sample_data()
    dataset = SolidDataset(texts, tokenizer=None)
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    print(f"Training samples: {len(dataset)}")
    print(f"Hermes Intelligence: ENABLED\n")
    
    # Train
    trainer = SolidTrainer(model, dataloader)
    print("Starting training...\n")
    trainer.train(epochs=3)
    
    # Save model
    torch.save(model.state_dict(), str(_REPO_ROOT / "models" / "solid-llm-v2.pth"))
    print(f"\nModel saved to: {_REPO_ROOT / 'models' / 'solid-llm-v2.pth'}")
    print("\nSolid LLM v2.0 - TRAINED AND READY!")
