import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.exceptions import ValidationError
from src.backend.models import *

def test_TaskParams_edit(db_session, TaskParams_shoppingList_eggs, user_a):
    # user_a jest ownerem grupy shopping, wiec ma uprawnienia ADMIN do edycji parametrow
    # zmieniamy ustawienia na nowe poprawne wartości, sprawdzamy czy nastąpiła zmiana
    newParams = {
        "photoRequired": True,
        "color": "#FF0000",
        "notifications": True
    }
    TaskParams_shoppingList_eggs.edit(db_session, user_a.id, **newParams)
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().photoRequired == True
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().color == "#FF0000"
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().notifications == True
    
    newParams["photoRequired"] = None
    newParams["notifications"] = False

    TaskParams_shoppingList_eggs.edit(db_session, user_a.id, **newParams)
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().photoRequired == True
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().color == "#FF0000"
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().notifications == False
    
    # próbujemy zmienić na niepoprawne wartości, powinno wywalić błąd
    
    newParams["color"] = "notAColor"
    with pytest.raises(ValidationError):
        TaskParams_shoppingList_eggs.edit(db_session, user_a.id, **newParams)
        
    assert db_session.query(TaskParams).filter_by(id=TaskParams_shoppingList_eggs.id).first().color == "#FF0000"
