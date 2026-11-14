import sys
import os

# Ensure backend directory is in python path across all serverless runtime variations
current_dir = os.path.dirname(os.path.abspath(__file__))
potential_backend_paths = [
    os.path.join(current_dir, "..", "backend"),
    os.path.join(current_dir, "backend"),
    os.path.join(os.getcwd(), "backend")
]

for p in potential_backend_paths:
    if os.path.isdir(p) and p not in sys.path:
        sys.path.insert(0, p)

from main import app
