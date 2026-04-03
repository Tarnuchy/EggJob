import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Task_edit():
    pass
    # zmieniamy nazwę, opis, cel zadania na poprawne dane, sprawdzamy czy się zmieniły
    # próbujemy zmienić nazwę na błędną, powinno rzucić błąd
    # próbujemy edytować zadanie bez uprawnień, powinno rzucić błąd

def test_Task_delete():
    pass
    # usuwamy zadanie, sprawdzamy czy zostało usunięte z bazy i czy usunięto postępy
    # sprawdzamy czy taskCount w grupie się zaktualizował
    # próbujemy usunąć zadanie bez uprawnień, powinno rzucić błąd

def test_Task_changeTaskType():
    pass
    # zmieniamy typ zadania (wszystkie możliwości), sprawdzamy czy się zmienił
    # próbujemy zmienić typ zadania bez uprawnień, powinno rzucić błąd
