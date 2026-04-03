import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_TaskProgress_updateProgress():
    pass
    # robimy poprawny update, sprawdzamy czy się poprawnie zaktualizowało i czy stworzył się progress entry
    # robimy niepoprawny update, błąd
    # sprawdzamy czy po osiągnięciu celu zadanie poprawnie zmienia status na DONE (dla OneTimeTask)
