import os
import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ForaAuthService:
    def __init__(self):
        # Load environment variables if not already loaded
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            pass
        
        self.session_url = "https://advisor.fora.travel/api/auth/session"
        self.session_cookie = os.getenv("SESSION_COOKIE")
        self._access_token = None
        self._token_expires = None
        self._user_info = None
        
    def _get_session_cookies(self) -> Dict[str, str]:
        """Get the session cookies from environment variable"""
        if not self.session_cookie:
            raise ValueError("SESSION_COOKIE environment variable is required")
        
        return {
            '__Secure-next-auth.session-token': self.session_cookie
        }
    
    def _fetch_session_data(self) -> Dict[str, Any]:
        """Fetch session data from Fora Travel API"""
        try:
            cookies = self._get_session_cookies()
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://advisor.fora.travel/partners/hotels',
                'Origin': 'https://advisor.fora.travel'
            }
            
            logger.info(f"Fetching session data from: {self.session_url}")
            response = requests.get(
                self.session_url, 
                headers=headers, 
                cookies=cookies, 
                timeout=30
            )
            
            logger.info(f"Session API response status: {response.status_code}")
            
            if not response.ok:
                logger.error(f"Session API request failed: {response.status_code} - {response.text}")
                raise Exception(f"Failed to fetch session: {response.status_code}")
            
            session_data = response.json()
            logger.info("Successfully fetched session data")
            
            return session_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error fetching session: {e}")
            raise Exception(f"Network error: {e}")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from session API: {e}")
            raise Exception("Invalid response from session API")
        except Exception as e:
            logger.error(f"Unexpected error fetching session: {e}")
            raise
    
    def _is_token_expired(self) -> bool:
        """Check if the current token is expired or will expire soon"""
        if not self._token_expires:
            return True
        
        # Consider token expired if it expires within the next 5 minutes
        buffer_time = timedelta(minutes=5)
        current_time = datetime.utcnow()
        
        # Ensure both datetimes are timezone-naive for comparison
        if self._token_expires.tzinfo is not None:
            token_expires = self._token_expires.replace(tzinfo=None)
        else:
            token_expires = self._token_expires
            
        return current_time + buffer_time >= token_expires
    
    def _parse_expires_date(self, expires_str: str) -> datetime:
        """Parse the expires date from the session response"""
        try:
            # Handle ISO format: "2025-10-22T21:36:58.779Z"
            if expires_str.endswith('Z'):
                expires_str = expires_str[:-1] + '+00:00'
            parsed_date = datetime.fromisoformat(expires_str.replace('Z', '+00:00'))
            # Convert to timezone-naive datetime for consistent comparison
            return parsed_date.replace(tzinfo=None)
        except Exception as e:
            logger.error(f"Error parsing expires date '{expires_str}': {e}")
            # Default to 1 hour from now if parsing fails
            return datetime.utcnow() + timedelta(hours=1)
    
    def get_access_token(self, force_refresh: bool = False) -> str:
        """Get a valid access token, refreshing if necessary"""
        try:
            # Check if we need to refresh the token
            if force_refresh or self._is_token_expired():
                logger.info("Token expired or refresh requested, fetching new session")
                self._refresh_token()
            
            if not self._access_token:
                raise Exception("Failed to obtain access token")
            
            return self._access_token
            
        except Exception as e:
            logger.error(f"Error getting access token: {e}")
            raise
    
    def _refresh_token(self):
        """Refresh the access token by fetching new session data"""
        try:
            session_data = self._fetch_session_data()
            
            # Extract access token
            access_token = session_data.get('accessToken')
            if not access_token:
                raise Exception("No access token found in session response")
            
            # Extract expires date
            expires_str = session_data.get('expires')
            if expires_str:
                self._token_expires = self._parse_expires_date(expires_str)
            else:
                # Default to 1 hour if no expires date
                self._token_expires = datetime.utcnow() + timedelta(hours=1)
            
            # Store user info for debugging
            self._user_info = session_data.get('user', {})
            
            # Update the access token
            self._access_token = access_token
            
            logger.info(f"Successfully refreshed token for user: {self._user_info.get('email', 'unknown')}")
            logger.info(f"Token expires at: {self._token_expires}")
            
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            # Clear stored data on error
            self._access_token = None
            self._token_expires = None
            self._user_info = None
            raise
    
    def get_user_info(self) -> Optional[Dict[str, Any]]:
        """Get current user information"""
        return self._user_info
    
    def get_auth_headers(self, force_refresh: bool = False) -> Dict[str, str]:
        """Get authentication headers with valid bearer token"""
        token = self.get_access_token(force_refresh)
        return {
            'Authorization': f'Bearer {token}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Referer': 'https://advisor.fora.travel/partners/hotels',
            'Origin': 'https://advisor.fora.travel',
            'X-Requested-With': 'XMLHttpRequest'
        }
    
    def get_session_cookies(self) -> Dict[str, str]:
        """Get session cookies for API requests"""
        return self._get_session_cookies()
    
    def is_authenticated(self) -> bool:
        """Check if we have a valid authentication"""
        try:
            return self.get_access_token() is not None
        except:
            return False

# Global instance
auth_service = ForaAuthService() 