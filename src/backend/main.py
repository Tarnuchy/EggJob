from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.exceptions import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    StateError,
    ValidationError,
)
from src.backend.models import Account, User
from src.backend.request import ChangePasswordRequest, LoginRequest, RegisterRequest

app = FastAPI()


def _auth_payload(account: Account, user: User) -> dict:
    return {
        "account_id": str(account.id),
        "user_id": str(user.id),
        "email": account.email,
        "username": user.username,
        "photo_url": user.photoUrl,
    }


@app.post("/auth/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    account = Account()
    try:
        account.register(
            db_session=db,
            email=payload.email,
            username=payload.username,
            password=payload.password,
        )
        account.createUser(db_session=db, username=payload.username, photoUrl=payload.photo_url)
        db.commit()
        user = db.query(User).filter_by(accountID=account.id).first()
        if user is None:
            raise StateError("User profile was not created")
    except ValidationError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except StateError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or username already exists") from exc

    return _auth_payload(account=account, user=user)


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    account = Account()
    try:
        account.login(db_session=db, email=payload.email, password=payload.password)
        db.commit()
        user = db.query(User).filter_by(accountID=account.id).first()
        if user is None:
            raise NotFoundError("User profile not found")
    except AuthenticationError as exc:
        db.rollback()
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except NotFoundError as exc:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return _auth_payload(account=account, user=user)


@app.post("/auth/password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    account = db.query(Account).filter_by(email=payload.email).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account does not exist")

    try:
        account.changePassword(
            db_session=db,
            old_password=payload.old_password,
            new_password=payload.new_password,
        )
        db.commit()
    except AuthenticationError as exc:
        db.rollback()
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValidationError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"message": "password_updated"}
