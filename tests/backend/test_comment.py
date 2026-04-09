import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Comment_deleteComment(db_session, comment_shoppingList_eggs):
    # usuwamy istniejacy comment, sprawdzamy czy sie usunal idk
    comment_id = comment_shoppingList_eggs.id
    
    saved = db_session.query(Comment).filter(Comment.id == comment_id).first()
    assert saved is not None
    
    comment_shoppingList_eggs.deleteComment(db_session)
    db_session.flush()
    
    deleted = db_session.query(Comment).filter(Comment.id == comment_id).first()
    assert deleted is None
