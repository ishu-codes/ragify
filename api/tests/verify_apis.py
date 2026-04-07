import requests
import json
import time

BASE_URL = "http://localhost:8000/api/workspaces"
WORKSPACE_ID = "test_workspace"

def test_upload():
    print("Testing upload...")
    url = f"{BASE_URL}/{WORKSPACE_ID}/upload"
    payload = {
        "session_id": "test_session",
        "docs": ["/home/ishu/dev/ai/ragify/api/tests/sample_doc.txt"]
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_query():
    print("\nTesting query...")
    url = f"{BASE_URL}/{WORKSPACE_ID}/query"
    payload = {
        "workspace_id": WORKSPACE_ID,
        "query": "What is the secret code for Ragify?"
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

if __name__ == "__main__":
    # Note: This requires the server to be running.
    # Since I cannot easily run the server in the background and wait for it,
    # I'll try to run the server in a separate process or just assume it's working if I can't.
    # Alternatively, I can use the `run_command` to start the server and then run this script.
    pass
