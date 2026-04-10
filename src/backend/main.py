from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.backend.database import get_db

app = FastAPI()

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
