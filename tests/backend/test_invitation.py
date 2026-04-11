import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Invitation_accept(db_session, invitation_cd, user_c, user_d):
    # wysylamy valid zaproszenie od C do D, D akceptuje zaproszenie, sprawdzamy czy zapro zniknelo i czy dodalo sie Friendship
    from_user_id = invitation_cd.fromUserID
    to_user_id = invitation_cd.toUserID
    invitation_cd.accept()
    assert db_session.query(Invitation).filter_by(fromUserID=from_user_id, toUserID=to_user_id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_c.id, userTwoID=user_d.id).first() is not None
    
def test_Invitation_reject(db_session, invitation_cd, user_c, user_d):
    # wysylamy valid zaproszenie od C do D, D odrzuca zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Friendship
    from_user_id = invitation_cd.fromUserID
    to_user_id = invitation_cd.toUserID
    invitation_cd.reject()
    assert db_session.query(Invitation).filter_by(fromUserID=from_user_id, toUserID=to_user_id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_c.id, userTwoID=user_d.id).first() is None

def test_Invitation_cancel(db_session, invitation_cd, user_c, user_d):
    # wysylamy valid zaproszenie od C do D, C wycofuje zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Friendship
    from_user_id = invitation_cd.fromUserID
    to_user_id = invitation_cd.toUserID
    invitation_cd.cancel()
    assert db_session.query(Invitation).filter_by(fromUserID=from_user_id, toUserID=to_user_id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_c.id, userTwoID=user_d.id).first() is None

def test_Invitation_notify(db_session, invitation_cd, user_d):
    # wysylamy valid zaproszenie od C do D, sprawdzamy, czy D dostal powiadomienie
    invitation_cd.notify()
    assert db_session.query(Notification).filter_by(userID=user_d.id).first() is not None

