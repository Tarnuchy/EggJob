from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.exceptions import *
from src.backend.models import *
from src.backend.request import *

app = FastAPI()


@app.exception_handler(ValidationError)
def handle_validation_error(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(ConflictError)
def handle_conflict_error(_: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(AuthenticationError)
def handle_authentication_error(_: Request, exc: AuthenticationError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": str(exc)})


@app.exception_handler(PermissionDeniedError)
def handle_permission_denied_error(_: Request, exc: PermissionDeniedError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.exception_handler(NotFoundError)
def handle_not_found_error(_: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(StateError)
def handle_state_error(_: Request, exc: StateError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(IntegrityError)
def handle_integrity_error(_: Request, __: IntegrityError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": "Integrity error"})


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
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

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
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return _auth_payload(account=account, user=user)


@app.post("/auth/password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    account = db.query(Account).filter_by(email=payload.email).first()
    if account is None:
        raise NotFoundError("Account does not exist")

    try:
        account.changePassword(
            db_session=db,
            old_password=payload.old_password,
            new_password=payload.new_password,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return {"message": "password updated"}
