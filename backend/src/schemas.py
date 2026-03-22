from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FlashcardCreate(BaseModel):
    greek: str
    english: str
    transliteration: str | None = None
    example: str | None = None


class FlashcardUpdate(BaseModel):
    english: str | None = None
    transliteration: str | None = None
    example: str | None = None


class FlashcardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    greek: str
    english: str
    transliteration: str | None
    example: str | None
    added_at: datetime
    review_count: int
    last_reviewed: datetime | None


class SessionAnswerCreate(BaseModel):
    greek_prompt: str
    user_answer: str | None
    correct_answer: str
    is_correct: bool


class PracticeSessionCreate(BaseModel):
    session_type: str
    total_questions: int | None = None


class PracticeSessionUpdate(BaseModel):
    score: int | None = None
    completed_at: datetime | None = None


class PracticeSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_type: str
    score: int | None
    total_questions: int | None
    started_at: datetime
    completed_at: datetime | None
