import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_list_flashcards_empty(client: AsyncClient):
    resp = await client.get("/api/v1/flashcards/")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_flashcard(client: AsyncClient):
    resp = await client.post(
        "/api/v1/flashcards/",
        json={"greek": "Γεια", "english": "Hello", "transliteration": "Yia"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["greek"] == "Γεια"
    assert data["english"] == "Hello"
    assert data["review_count"] == 0
    assert "id" in data


@pytest.mark.asyncio
async def test_create_duplicate_flashcard(client: AsyncClient):
    payload = {"greek": "Γεια", "english": "Hello"}
    await client.post("/api/v1/flashcards/", json=payload)
    resp = await client.post("/api/v1/flashcards/", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_get_flashcard(client: AsyncClient):
    create = await client.post(
        "/api/v1/flashcards/", json={"greek": "Ευχαριστώ", "english": "Thank you"}
    )
    card_id = create.json()["id"]
    resp = await client.get(f"/api/v1/flashcards/{card_id}")
    assert resp.status_code == 200
    assert resp.json()["greek"] == "Ευχαριστώ"


@pytest.mark.asyncio
async def test_get_flashcard_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/flashcards/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_mark_flashcard_reviewed(client: AsyncClient):
    create = await client.post(
        "/api/v1/flashcards/", json={"greek": "Καλημέρα", "english": "Good morning"}
    )
    card_id = create.json()["id"]
    resp = await client.post(f"/api/v1/flashcards/{card_id}/review")
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_count"] == 1
    assert data["last_reviewed"] is not None


@pytest.mark.asyncio
async def test_delete_flashcard(client: AsyncClient):
    create = await client.post(
        "/api/v1/flashcards/", json={"greek": "Αντίο", "english": "Goodbye"}
    )
    card_id = create.json()["id"]
    assert (await client.delete(f"/api/v1/flashcards/{card_id}")).status_code == 204
    assert (await client.get(f"/api/v1/flashcards/{card_id}")).status_code == 404


@pytest.mark.asyncio
async def test_list_flashcards_returns_all(client: AsyncClient):
    await client.post("/api/v1/flashcards/", json={"greek": "Γεια", "english": "Hello"})
    await client.post("/api/v1/flashcards/", json={"greek": "Ευχαριστώ", "english": "Thank you"})
    resp = await client.get("/api/v1/flashcards/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2
