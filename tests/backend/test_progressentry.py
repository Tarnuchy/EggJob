import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_ProgressEntry_delete(db_session, eggs_bundle):
    # usuwamy istniejacy ProgressEntry, sprawdzamy czy sie usunal idk
    entry = eggs_bundle["entries"][0]
    comment_id = eggs_bundle["comments"][0].id
    val = entry.value
    progress_val = eggs_bundle["progress"].value
    entry.delete()
    assert db_session.query(ProgressEntry).filter_by(id=entry.id).first() is None
    assert db_session.query(TaskProgress).filter_by(id=entry.TaskProgressID).first().value == progress_val - val
    assert db_session.query(Comment).filter_by(id=comment_id).first() is None
    
    
def test_ProgressEntry_addComment(db_session, eggs_bundle, money_bundle, user_b, user_c, user_d):
    # eggs - prywatne, b jest, c nie jest, d duch
    entry = eggs_bundle["entries"][0] #bylo tylko 10 jaj od d
    entry.addComment(db_session, user_b.id, "gejowo")
    assert db_session.query(Comment).filter_by(progressEntryID=entry.id, userID=user_b.id, message="gejowo").first() is not None
    with pytest.raises(Exception):
        entry.addComment(db_session, user_c.id, "co ja tu robie")
    with pytest.raises(Exception):
        entry.addComment(db_session, user_d.id, "nie blagam nie wywalaj mnie")
        
    # money - public, b owner
    entry = money_bundle["entries"][0]
    entry.addComment(db_session, user_b.id, "ez")
    assert db_session.query(Comment).filter_by(progressEntryID=entry.id, userID=user_b.id, message="ez").first() is not None
    entry.addComment(db_session, user_c.id, "asdfg") 
    assert db_session.query(Comment).filter_by(progressEntryID=entry.id, userID=user_c.id, message="asdfg").first() is not None
    with pytest.raises(Exception): #nie znajomy
        entry.addComment(db_session, user_d.id, "głupiś")
    