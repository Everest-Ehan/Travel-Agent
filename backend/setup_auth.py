#!/usr/bin/env python3
"""
Setup script for Fora Travel API authentication.
This script helps you configure your session cookie for the API.
"""

import os
import requests
import json
from dotenv import load_dotenv

def test_session_cookie(session_cookie: str) -> dict:
    """Test if the session cookie is valid"""
    session_url = "https://advisor.fora.travel/api/auth/session"
    
    cookies = {
        '__Secure-next-auth.session-token': session_cookie
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://advisor.fora.travel/partners/hotels',
        'Origin': 'https://advisor.fora.travel'
    }
    
    try:
        print("Testing session cookie...")
        response = requests.get(session_url, headers=headers, cookies=cookies, timeout=30)
        
        if response.ok:
            session_data = response.json()
            user_info = session_data.get('user', {})
            access_token = session_data.get('accessToken')
            
            print("✅ Session cookie is valid!")
            print(f"👤 User: {user_info.get('name', 'Unknown')}")
            print(f"📧 Email: {user_info.get('email', 'Unknown')}")
            print(f"🔑 Access Token: {'✅ Present' if access_token else '❌ Missing'}")
            print(f"⏰ Expires: {session_data.get('expires', 'Unknown')}")
            
            return {
                "valid": True,
                "user": user_info,
                "access_token": access_token,
                "expires": session_data.get('expires')
            }
        else:
            print(f"❌ Session cookie is invalid. Status: {response.status_code}")
            print(f"Response: {response.text}")
            return {"valid": False, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        print(f"❌ Error testing session cookie: {e}")
        return {"valid": False, "error": str(e)}

def setup_env_file():
    """Set up the .env file with session cookie"""
    env_file = ".env"
    
    print("🔧 Setting up authentication for Fora Travel API")
    print("=" * 50)
    
    # Check if .env file exists
    if os.path.exists(env_file):
        load_dotenv()
        existing_cookie = os.getenv("SESSION_COOKIE")
        if existing_cookie:
            print(f"📝 Found existing session cookie in .env file")
            test_result = test_session_cookie(existing_cookie)
            if test_result["valid"]:
                print("✅ Existing session cookie is still valid!")
                return
            else:
                print("⚠️  Existing session cookie is invalid or expired.")
    
    print("\n📋 To get your session cookie:")
    print("1. Go to https://advisor.fora.travel")
    print("2. Log in to your account")
    print("3. Open Developer Tools (F12)")
    print("4. Go to Application/Storage tab")
    print("5. Find the cookie named '__Secure-next-auth.session-token'")
    print("6. Copy its value")
    print("\n" + "=" * 50)
    
    session_cookie = input("🔑 Paste your session cookie here: ").strip()
    
    if not session_cookie:
        print("❌ No session cookie provided. Setup cancelled.")
        return
    
    # Test the session cookie
    test_result = test_session_cookie(session_cookie)
    
    if test_result["valid"]:
        # Write to .env file
        env_content = f"SESSION_COOKIE={session_cookie}\n"
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"\n✅ Session cookie saved to {env_file}")
        print("🚀 You can now run the FastAPI server!")
        print("\nTo start the server:")
        print("cd backend && python -m uvicorn main:app --reload")
        
    else:
        print(f"\n❌ Session cookie is invalid: {test_result.get('error', 'Unknown error')}")
        print("Please check your session cookie and try again.")

if __name__ == "__main__":
    setup_env_file() 