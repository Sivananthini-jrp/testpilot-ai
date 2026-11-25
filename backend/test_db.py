import requests
import json

BACKEND_URL = "http://localhost:8000"

def run_test():
    print("1. Testing Database Connection via Dashboard...")
    res = requests.get(f"{BACKEND_URL}/dashboard/stats")
    print(f"   Dashboard Stats BEFORE: {res.json()}")

    print("\n2. Sending Fake Test Execution to Backend...")
    payload = {
        "test_code": "def test_dummy():\n    assert 1 == 1",
        "source_code": "def dummy():\n    return 1",
        "repo_id": "test_repo_12345",
        "function_name": "dummy_function"
    }
    
    try:
        res = requests.post(f"{BACKEND_URL}/execute/test", json=payload, timeout=10)
        print(f"   Response Status: {res.status_code}")
        print(f"   Response Body: {res.text}")
    except Exception as e:
        print(f"   ❌ The backend crashed before it could respond. Error: {e}")
        return

    print("\n3. Checking Dashboard Stats AFTER...")
    res = requests.get(f"{BACKEND_URL}/dashboard/stats")
    print(f"   Dashboard Stats AFTER: {res.json()}")

if __name__ == "__main__":
    run_test()