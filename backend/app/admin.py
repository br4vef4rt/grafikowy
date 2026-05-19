from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.auth import get_current_user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Wymagana rola administratora.")
    return user
