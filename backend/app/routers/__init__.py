from app.routers.auth import router as auth_router
from app.routers.absences import router as absences_router
from app.routers.absence_types import router as absence_types_router
from app.routers.users import router as users_router

__all__ = ["auth_router", "absences_router", "absence_types_router", "users_router"]
