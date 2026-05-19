from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db
from app.models.absence import Absence
from app.models.absence_type import AbsenceTypeDef
from app.models.user import User
from app.schemas import AbsenceCreate, AbsenceUpdate, AbsenceOut
from app.auth import get_current_user

router = APIRouter(prefix="/absences", tags=["absences"])


async def validate_absence_type(type_name: str, db: AsyncSession):
    """Ensure the type exists in AbsenceTypeDef."""
    result = await db.execute(select(AbsenceTypeDef).where(AbsenceTypeDef.name == type_name))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Typ nieobecności '{type_name}' nie istnieje.")


@router.get("/", response_model=list[AbsenceOut])
async def list_absences(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Absence).order_by(Absence.start_date.desc()))
    absences = result.scalars().all()
    return absences


@router.get("/mine", response_model=list[AbsenceOut])
async def my_absences(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Absence).where(Absence.user_id == user.id).order_by(Absence.start_date.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=AbsenceOut, status_code=status.HTTP_201_CREATED)
async def create_absence(
    body: AbsenceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await validate_absence_type(body.type, db)

    if body.end_date < body.start_date:
        raise HTTPException(status_code=400, detail="Data końcowa nie może być wcześniejsza niż data początkowa.")

    absence = Absence(
        user_id=user.id,
        type=body.type,
        start_date=body.start_date,
        end_date=body.end_date,
        reason=body.reason,
    )
    db.add(absence)
    await db.commit()
    await db.refresh(absence)
    return absence


@router.put("/{absence_id}", response_model=AbsenceOut)
async def update_absence(
    absence_id: int,
    body: AbsenceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Absence).where(Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Nie znaleziono wpisu.")

    if absence.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Nie masz uprawnień do tej operacji.")

    if body.type is not None:
        await validate_absence_type(body.type, db)

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(absence, key, value)

    await db.commit()
    await db.refresh(absence)
    return absence


@router.delete("/{absence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_absence(
    absence_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Absence).where(Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Nie znaleziono wpisu.")
    if absence.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Nie masz uprawnień do tej operacji.")

    await db.delete(absence)
    await db.commit()
