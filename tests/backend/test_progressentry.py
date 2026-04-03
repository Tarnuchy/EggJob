import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_ProgressEntry_validate():
    pass
    # weryfikujemy prawidłowy wpis (np. jest photoUrl w sytuacji, gdy photoRequired jest True w TaskParams), oczekujemy True
    # weryfikujemy wpis bez zdjęcia dla zadania z photoRequired=True, oczekujemy False
