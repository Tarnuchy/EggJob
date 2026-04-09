import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_ProgressEntry_validate():
    pass
    # weryfikujemy prawidłowy wpis (np. jest photoUrl w sytuacji, gdy photoRequired jest True w TaskParams), oczekujemy True
    # weryfikujemy wpis bez zdjęcia dla zadania z photoRequired=True, oczekujemy False

def test_ProgressEntry_delete(db_session, PE_shoppingList_eggs):
    # usuwamy istniejacy ProgressEntry, sprawdzamy czy sie usunal idk
    entry_id = PE_shoppingList_eggs.id
    
    saved = db_session.query(ProgressEntry).filter(ProgressEntry.id == entry_id).first()
    assert saved is not None
    
    PE_shoppingList_eggs.delete(db_session)
    db_session.flush()
    
    deleted = db_session.query(ProgressEntry).filter(ProgressEntry.id == entry_id).first()
    assert deleted is None
    
    
def test_ProgressEntry_addComment(db_session, PE_shoppingList_eggs):
    pass