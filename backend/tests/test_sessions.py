import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    resp = await client.post(
        "/api/v1/sessions/",
        json={"session_type": "word-bubbles", "total_questions": 5},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["session_type"] == "word-bubbles"
    assert data["total_questions"] == 5
    assert data["completed_at"] is None


@pytest.mark.asyncio
async def test_list_sessions_empty(client: AsyncClient):
    resp = await client.get("/api/v1/sessions/")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_get_session(client: AsyncClient):
    create = await client.post(
        "/api/v1/sessions/",
        json={"session_type": "free-typing", "total_questions": 3},
    )
    session_id = create.json()["id"]
    resp = await client.get(f"/api/v1/sessions/{session_id}")
    assert resp.status_code == 200
    assert resp.json()["session_type"] == "free-typing"


@pytest.mark.asyncio
async def test_get_session_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/sessions/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_complete_session(client: AsyncClient):
    create = await client.post(
        "/api/v1/sessions/",
        json={"session_type": "word-bubbles", "total_questions": 3},
    )
    session_id = create.json()["id"]
    resp = await client.patch(f"/api/v1/sessions/{session_id}", json={"score": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 2
    assert data["completed_at"] is not None


@pytest.mark.asyncio
async def test_add_answer_to_session(client: AsyncClient):
    create = await client.post(
        "/api/v1/sessions/",
        json={"session_type": "free-typing", "total_questions": 1},
    )
    session_id = create.json()["id"]
    resp = await client.post(
        f"/api/v1/sessions/{session_id}/answers",
        json={
            "greek_prompt": "Hello",
            "user_answer": "Γεια",
            "correct_answer": "Γεια",
            "is_correct": True,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["is_correct"] is True
    assert "id" in data
