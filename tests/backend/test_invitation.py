import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Invitation_accept():
    pass
    # wysylamy valid zaproszenie od A do B, B akceptuje zaproszenie, sprawdzamy czy zapro zniknelo i czy dodalo sie Frendship

def test_Invitation_reject():
    pass
    # wysylamy valid zaproszenie od A do B, B odrzuca zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship

def test_Invitation_cancel():
    pass
    # wysylamy valid zaproszenie od A do B, A wycofuje zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship

def test_Invitation_notify():
    pass
    # wysylamy valid zaproszenie od A do B, sprawdzamy, czy B dostal powiadomienie?? (a co jak B przyjmie, czy A tez dostaje notification?)


# ============= FRIENDSHIP TESTS =============
