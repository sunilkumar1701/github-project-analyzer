import logging
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.error("SUPABASE_URL or SUPABASE_KEY is missing in backend config")
        raise HTTPException(status_code=500, detail="Internal server configuration error")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI dependency to verify Supabase JWT tokens via Supabase Auth API.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    try:
        supabase = get_supabase_client()
        # get_user validates the JWT token against the Supabase server
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed or token expired")

