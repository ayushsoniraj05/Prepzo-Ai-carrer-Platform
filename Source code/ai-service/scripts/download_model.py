"""
Download Mistral 7B Model Script
Downloads the GGUF quantized model for the AI service
"""

import os
import sys
import requests
from pathlib import Path
from tqdm import tqdm


# Model configurations - you can change these
MODELS = {
    "mistral-7b-instruct-q4": {
        "name": "Mistral 7B Instruct Q4_K_M (Recommended)",
        "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        "filename": "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        "size": "4.4 GB",
        "description": "Best balance of quality and speed for most GPUs"
    },
    "mistral-7b-instruct-q5": {
        "name": "Mistral 7B Instruct Q5_K_M",
        "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q5_K_M.gguf",
        "filename": "mistral-7b-instruct-v0.2.Q5_K_M.gguf",
        "size": "5.1 GB",
        "description": "Higher quality, slightly slower"
    },
    "mistral-7b-instruct-q8": {
        "name": "Mistral 7B Instruct Q8_0",
        "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q8_0.gguf",
        "filename": "mistral-7b-instruct-v0.2.Q8_0.gguf",
        "size": "7.7 GB",
        "description": "Best quality, needs more VRAM (12GB+ recommended)"
    },
    "mistral-7b-instruct-q2": {
        "name": "Mistral 7B Instruct Q2_K (Lightweight)",
        "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q2_K.gguf",
        "filename": "mistral-7b-instruct-v0.2.Q2_K.gguf",
        "size": "3.1 GB",
        "description": "Fastest, lower quality, good for testing or limited VRAM"
    }
}


def download_file(url: str, filepath: Path, chunk_size: int = 8192):
    """Download a file with progress bar"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filepath, 'wb') as f:
        with tqdm(
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
            desc=filepath.name
        ) as pbar:
            for chunk in response.iter_content(chunk_size=chunk_size):
                size = f.write(chunk)
                pbar.update(size)


def main():
    """Main download function"""
    print("=" * 60)
    print("🤖 PREPZO AI - MODEL DOWNLOADER")
    print("=" * 60)
    print()
    
    # Create models directory
    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    # Show available models
    print("Available models:\n")
    for i, (key, model) in enumerate(MODELS.items(), 1):
        print(f"  {i}. {model['name']}")
        print(f"     Size: {model['size']}")
        print(f"     {model['description']}")
        print()
    
    # Get user choice
    while True:
        try:
            choice = input("Select model (1-4) [1 recommended]: ").strip()
            if not choice:
                choice = "1"
            choice = int(choice)
            if 1 <= choice <= len(MODELS):
                break
            print("Invalid choice. Please enter 1-4.")
        except ValueError:
            print("Invalid input. Please enter a number.")
    
    # Get selected model
    model_key = list(MODELS.keys())[choice - 1]
    model = MODELS[model_key]
    
    print(f"\n📥 Downloading: {model['name']}")
    print(f"   Size: {model['size']}")
    print(f"   URL: {model['url']}")
    print()
    
    # Check if already exists
    filepath = models_dir / model['filename']
    if filepath.exists():
        print(f"⚠️ Model already exists: {filepath}")
        overwrite = input("Overwrite? (y/N): ").strip().lower()
        if overwrite != 'y':
            print("✅ Using existing model.")
            print(f"\n📁 Model path: {filepath}")
            print(f"\nAdd to your .env:")
            print(f"  MODEL_PATH={filepath}")
            return
    
    # Download
    print("⏳ Starting download...\n")
    try:
        download_file(model['url'], filepath)
        print(f"\n✅ Download complete!")
        print(f"📁 Model saved to: {filepath}")
        print(f"\n📝 Add to your .env file:")
        print(f"   MODEL_PATH={filepath}")
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Download failed: {e}")
        print("\nAlternative: Download manually from HuggingFace:")
        print(f"  {model['url']}")
        print(f"\nSave to: {models_dir}")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 MODEL READY!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Update .env with MODEL_PATH")
    print("  2. Start the AI service: python -m uvicorn app.main:app --reload")
    print("  3. Seed knowledge base: python scripts/seed_knowledge_base.py")


if __name__ == "__main__":
    main()
