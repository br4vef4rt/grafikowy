from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db
from app.models.absence import Absence
from app.models.absence_type import AbsenceTypeDef
from app.schemas import AbsenceTypeCreate, AbsenceTypeOut
from app.admin import require_admin

router = APIRouter(prefix="/absence-types", tags=["absence-types"])


@router.get("/", response_model=list[AbsenceTypeOut])
async def list_types(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AbsenceTypeDef).order_by(AbsenceTypeDef.name))
    return result.scalars().all()


@router.post("/", response_model=AbsenceTypeOut, status_code=status.HTTP_201_CREATED)
async def create_type(
    body: AbsenceTypeCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    result = await db.execute(select(AbsenceTypeDef).where(AbsenceTypeDef.name == body.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Typ '{body.name}' już istnieje.")

    absence_type = AbsenceTypeDef(
        name=body.name,
        color=body.color,
        description=body.description,
        is_default=False,
    )
    db.add(absence_type)
    await db.commit()
    await db.refresh(absence_type)
    return absence_type


@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_type(
    type_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    result = await db.execute(select(AbsenceTypeDef).where(AbsenceTypeDef.id == type_id))
    absence_type = result.scalar_one_or_none()
    if not absence_type:
        raise HTTPException(status_code=404, detail="Nie znaleziono typu.")

    if absence_type.is_default:
        raise HTTPException(status_code=400, detail="Nie można usunąć predefiniowanego typu nieobecności.")

    # Check if type is used in any absence
    usage_result = await db.execute(
        select(Absence).where(Absence.type == absence_type.name).limit(1)
    )
    if usage_result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail=f"Nie można usunąć typu '{absence_type.name}' – jest używany w istniejących nieobecnościach."
        )

    await db.delete(absence_type)
    await db.commit()
