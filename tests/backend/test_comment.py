import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Comment_deleteComment(db_session, comment_shoppingList_eggs, user_a):
    # usuwamy istniejacy comment, sprawdzamy czy sie usunal idk
    # user_a jest autorem komentarza, wiec ma prawo go usunac
    comment_id = comment_shoppingList_eggs.id

    saved = db_session.query(Comment).filter_by(id=comment_id).first()
    assert saved is not None

    comment_shoppingList_eggs.deleteComment(db_session, user_a.id)
    db_session.flush()
    
    deleted = db_session.query(Comment).filter_by(id=comment_id).first()
    assert deleted is None
