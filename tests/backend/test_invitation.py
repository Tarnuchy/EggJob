import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Invitation_accept(db_session, invitation_bc, user_b, user_c):
    # wysylamy valid zaproszenie od B do C, C akceptuje zaproszenie, sprawdzamy czy zapro zniknelo i czy dodalo sie Frendship
    invitation_bc.accept()
    assert db_session.query(Invitation).filter_by(id=invitation_bc.id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_b.id, userTwoID=user_c.id).first() is not None
    
def test_Invitation_reject(db_session, invitation_bc, user_b, user_c):
    # wysylamy valid zaproszenie od B do C, C odrzuca zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship
    invitation_bc.reject()
    assert db_session.query(Invitation).filter_by(id=invitation_bc.id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_b.id, userTwoID=user_c.id).first() is None

def test_Invitation_cancel(db_session, invitation_bc, user_b, user_c):
    # wysylamy valid zaproszenie od B do C, B wycofuje zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship
    invitation_bc.cancel()
    assert db_session.query(Invitation).filter_by(id=invitation_bc.id).first() is None
    assert db_session.query(Friendship).filter_by(userOneID=user_b.id, userTwoID=user_c.id).first() is None

def test_Invitation_notify(db_session, invitation_bc, user_c):
    # wysylamy valid zaproszenie od B do C, sprawdzamy, czy C dostal powiadomienie?? (a co jak C przyjmie, czy B tez dostaje notification?|nwm, chyba ta)
    invitation_bc.notify()
    assert db_session.query(Notification).filter_by(userID=user_c.id).first() is not None

