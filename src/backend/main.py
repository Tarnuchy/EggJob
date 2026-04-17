from datetime import datetime
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.models import Account, User

app = FastAPI()


class DemoUserCreateRequest(BaseModel):
    email: str
    password_hash: str
    username: str
    photo_url: str | None = None


def _demo_user_payload(user: User, email: str) -> dict:
    return {
        "id": str(user.id),
        "account_id": str(user.accountID),
        "email": email,
        "username": user.username,
        "photo_url": user.photoUrl,
    }

@app.get("/")
def read_root():
    return {"message": "jajo"}

@app.get("/test")
def health_check():
    return {"message": "test"}


@app.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"message": "db_ok"}


@app.post("/demo/users", status_code=201)
def demo_create_user(payload: DemoUserCreateRequest, db: Session = Depends(get_db)):
    account = Account(
        email=payload.email,
        passwordHash=payload.password_hash,
        registrationDate=datetime.utcnow(),
    )
    db.add(account)
    db.flush()

    user = User(
        accountID=account.id,
        username=payload.username,
        photoUrl=payload.photo_url,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or username already exists") from exc

    db.refresh(account)
    db.refresh(user)
    return _demo_user_payload(user=user, email=account.email)


@app.get("/demo/users/{user_id}")
def demo_get_user(user_id: UUID, db: Session = Depends(get_db)):
    row = (
        db.query(User, Account.email)
        .join(Account, User.accountID == Account.id)
        .filter(User.id == user_id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")

    user, email = row
    return _demo_user_payload(user=user, email=email)


@app.get("/demo/users")
def demo_list_users(
    username: str | None = Query(default=None, description="Filter usernames containing this value"),
    email: str | None = Query(default=None, description="Filter emails containing this value"),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(User, Account.email).join(Account, User.accountID == Account.id)

    if username:
        query = query.filter(User.username.ilike(f"%{username}%"))
    if email:
        query = query.filter(Account.email.ilike(f"%{email}%"))

    rows = query.order_by(User.username.asc()).limit(limit).all()
    items = [_demo_user_payload(user=user, email=acc_email) for user, acc_email in rows]

    return {
        "count": len(items),
        "items": items,
    }

# @app.get()
# def costam(data, db: Session = Depends(get_db)):
#     data costam
#     metoda(db)
#     db.commit()
