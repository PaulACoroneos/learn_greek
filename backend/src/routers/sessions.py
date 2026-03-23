from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.models import PracticeSession, SessionAnswer
from src.schemas import (
    PracticeSessionCreate,
    PracticeSessionResponse,
    PracticeSessionUpdate,
    SessionAnswerCreate,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=list[PracticeSessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)) -> list[PracticeSession]:
    result = await db.execute(
        select(PracticeSession).order_by(PracticeSession.started_at.desc()).limit(50)
    )
    return list(result.scalars().all())


@router.post("/", response_model=PracticeSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: PracticeSessionCreate, db: AsyncSession = Depends(get_db)
) -> PracticeSession:
    session = PracticeSession(**payload.model_dump())
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/{session_id}", response_model=PracticeSessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)) -> PracticeSession:
    result = await db.execute(
        select(PracticeSession)
        .where(PracticeSession.id == session_id)
        .options(selectinload(PracticeSession.answers))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}", response_model=PracticeSessionResponse)
async def complete_session(
    session_id: str, payload: PracticeSessionUpdate, db: AsyncSession = Depends(get_db)
) -> PracticeSession:
    session = await db.get(PracticeSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    if payload.score is not None and session.completed_at is None:
        session.completed_at = datetime.now(tz=UTC)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{session_id}/answers", status_code=status.HTTP_201_CREATED)
async def add_answer(
    session_id: str, payload: SessionAnswerCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    session = await db.get(PracticeSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    answer = SessionAnswer(session_id=session_id, **payload.model_dump())
    db.add(answer)
    await db.commit()
    return {"id": answer.id, "is_correct": answer.is_correct}
