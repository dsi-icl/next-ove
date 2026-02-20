# API Key authentication
from fastapi import Security, HTTPException, Depends, status
from fastapi.security import APIKeyHeader, HTTPBearer, \
    HTTPAuthorizationCredentials

from .config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)
security = HTTPBearer()


def verify_token(
        credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication scheme",
        )

    if settings.minio_webhook_key is None or credentials.credentials != settings.minio_webhook_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token",
        )

    return credentials.credentials


def get_valid_api_keys():
    """Parse and return valid API keys from settings"""
    return [key.strip() for key in settings.api_keys.split(",") if key.strip()]


async def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify the provided API key"""
    valid_keys = get_valid_api_keys()
    if api_key not in valid_keys:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key
