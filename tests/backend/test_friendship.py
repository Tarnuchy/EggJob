import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Friendship_deleteFriend(db_session, friendship_ab):
    # A i B sa znajomymi, B usuwa A, sprawdzamy czy friendship zniknelo
    id = friendship_ab.id
    saved = db_session.query(Friendship).filter(Friendship.id == id).first()
    assert saved is not None
    
    friendship_ab.deleteFriend(db_session)
    
    deleted = db_session.query(Friendship).filter(Friendship.id == id).first()
    assert deleted is None

