from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import Flashcard
from src.schemas import FlashcardCreate, FlashcardResponse, FlashcardUpdate

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("/", response_model=list[FlashcardResponse])
async def list_flashcards(db: AsyncSession = Depends(get_db)) -> list[Flashcard]:
    result = await db.execute(select(Flashcard).order_by(Flashcard.added_at.desc()))
    return list(result.scalars().all())


@router.post("/", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    payload: FlashcardCreate, db: AsyncSession = Depends(get_db)
) -> Flashcard:
    existing = await db.execute(select(Flashcard).where(Flashcard.greek == payload.greek))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Flashcard with this Greek word already exists")
    card = Flashcard(**payload.model_dump())
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


@router.get("/{card_id}", response_model=FlashcardResponse)
async def get_flashcard(card_id: str, db: AsyncSession = Depends(get_db)) -> Flashcard:
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return card


@router.patch("/{card_id}", response_model=FlashcardResponse)
async def update_flashcard(
    card_id: str, payload: FlashcardUpdate, db: AsyncSession = Depends(get_db)
) -> Flashcard:
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(card, field, value)
    await db.commit()
    await db.refresh(card)
    return card


@router.post("/{card_id}/review", response_model=FlashcardResponse)
async def mark_reviewed(card_id: str, db: AsyncSession = Depends(get_db)) -> Flashcard:
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    card.review_count += 1
    card.last_reviewed = datetime.now(tz=UTC)
    await db.commit()
    await db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(card_id: str, db: AsyncSession = Depends(get_db)) -> None:
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    await db.delete(card)
    await db.commit()
