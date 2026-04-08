import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Comment_addComment(db_session, user_b, PE_shoppingList_eggs):
    # dodajemy niepusty comment, sprawdzamy czy sie dodal xd
    # Metoda addComment na obiekcie ProgressEntry tworzy nowy komentarz
    PE_shoppingList_eggs.addComment(message="kocham jaja", user_id=user_b.id, session=db_session)
    db_session.flush()
    
    saved = db_session.query(Comment).filter(Comment.progressEntryID == PE_shoppingList_eggs.id).first()
    assert saved is not None
    assert saved.message == "kocham jaja"

    # dodajemu ousty comment, wywala blad
    with pytest.raises(ValueError):
        PE_shoppingList_eggs.addComment(message="", user_id=user_b.id, session=db_session)

def test_Comment_deleteComment(db_session, comment_shoppingList_eggs):
    # usuwamy istniejacy comment, sprawdzamy czy sie usunal idk
    comment_id = comment_shoppingList_eggs.id
    
    saved = db_session.query(Comment).filter(Comment.id == comment_id).first()
    assert saved is not None
    
    comment_shoppingList_eggs.deleteComment(db_session)
    db_session.flush()
    
    deleted = db_session.query(Comment).filter(Comment.id == comment_id).first()
    assert deleted is None
