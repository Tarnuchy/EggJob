import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_TaskProgress_updateProgress(db_session, bingo_bundle):
    # robimy poprawny update, sprawdzamy czy się poprawnie zaktualizowało i czy stworzył się progress entry
    progress = bingo_bundle["tasks"]["money"]["progress"] #endless
    old_value = progress.value
    progress.updateProgress(db_session, 50, progress.userID, "w berlinie na ulicy leżało")
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().value == old_value + 50
    assert db_session.query(ProgressEntry).filter_by(TaskProgressID=progress.id, value=50, message="w berlinie na ulicy leżało").first() is not None
    assert db_session.query(Task).filter_by(id=progress.taskID).first().status == TaskStatus.IN_PROGRESS
    
    progress = bingo_bundle["tasks"]["running"]["progress"] #repeatable
    old_value = progress.value
    old_counter = progress.counter
    progress.updateProgress(db_session, 5, progress.userID, "biegałem dziś 5 dni")
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().value == old_value + 5
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().counter == old_counter + 1
    assert db_session.query(ProgressEntry).filter_by(TaskProgressID=progress.id, value=5, message="biegałem dziś 5 dni").first() is not None
    assert db_session.query(Task).filter_by(id=progress.taskID).first().status == TaskStatus.DONE
    
    progress.updateProgress(db_session, 1, progress.userID, "biegałem znowu")
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().value == old_value + 6
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().counter == old_counter + 1
    assert db_session.query(ProgressEntry).filter_by(TaskProgressID=progress.id, value=1, message="biegałem znowu").first() is not None
    assert db_session.query(Task).filter_by(id=progress.taskID).first().status == TaskStatus.DONE
    
    progress = bingo_bundle["tasks"]["president"]["progress"] #one time
    old_value = progress.value
    progress.updateProgress(db_session, 1, progress.userID, "wtf udało się", photoUrl="http://photo.com/happyface.jpg")
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().value == old_value + 1
    assert db_session.query(ProgressEntry).filter_by(TaskProgressID=progress.id, value=1, message="wtf udało się", photoUrl="http://photo.com/happyface.jpg").first() is not None
    assert db_session.query(Task).filter_by(id=progress.taskID).first().status == TaskStatus.DONE
    
    #test w drugą stronę
    progress.updateProgress(db_session, -1, progress.userID, "wywalili mnie xd", photoUrl="http://photos.com/sadface.jpg")
    assert db_session.query(TaskProgress).filter_by(id=progress.id).first().value == old_value
    assert db_session.query(ProgressEntry).filter_by(TaskProgressID=progress.id, value=-1, message="wywalili mnie xd", photoUrl="http://photos.com/sadface.jpg").first() is not None
    assert db_session.query(Task).filter_by(id=progress.taskID).first().status == TaskStatus.IN_PROGRESS #moze todo?
    
    # robimy niepoprawny update, błąd
    with pytest.raises(ValueError):
        progress.updateProgress(db_session, 1, progress.userID, "nie dodaje zdjęcia ez?")
    
    with pytest.raises(ValueError):
        progress.updateProgress(db_session, "jeden", progress.userID, "ez", photoUrl="http://photos.com/asdf.jpg")
    
    #TODO dodać case gdzie update bez permisji (competetive i nie swój progress, update nie jako członek)
