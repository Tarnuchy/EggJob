import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Notification_read(db_session, notification_d):
    # odczytujemy powiadomienie, sprawdzamy czy status zmienil sie na odczytane.
    notification_d.read(db_session)
    assert db_session.query(Notification).filter_by(id=notification_d.id).first().active == False
