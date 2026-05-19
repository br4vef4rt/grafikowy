from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import init_db, async_session
from app.models.team import Team
from app.routers import auth_router, absences_router, absence_types_router, users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with async_session() as session:
        # Ensure at least one default team exists (multi-team ready)
        result = await session.execute(select(Team).limit(1))
        if not result.scalar_one_or_none():
            default = Team(name="Default", description="Default team")
            session.add(default)
            await session.commit()

        # Seed default absence types
        from app.models.absence_type import AbsenceTypeDef
        existing_types = await session.execute(select(AbsenceTypeDef.name))
        existing_names = set(existing_types.scalars().all())

        default_types = [
            ("vacation", "#22c55e", "Urlop wypoczynkowy"),
            ("remote", "#3b82f6", "Praca zdalna"),
            ("sick", "#ef4444", "Zwolnienie lekarskie / chorobowe"),
            ("other", "#6366f1", "Inna nieobecność"),
        ]
        for name, color, description in default_types:
            if name not in existing_names:
                session.add(AbsenceTypeDef(
                    name=name,
                    color=color,
                    description=description,
                    is_default=True,
                ))
        await session.commit()
    yield


app = FastAPI(title="Grafikowy API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(absences_router)
app.include_router(absence_types_router)
app.include_router(users_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
