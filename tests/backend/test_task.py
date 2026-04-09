import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Task_edit(db_session, shoppingList_bundle):
    task = shoppingList_bundle["tasks"]["cheese"]["task"]
    owner = shoppingList_bundle["GM"]["owner"]
    member = shoppingList_bundle["GM"]["member"]
    admin = shoppingList_bundle["GM"]["admin"]
    # zmieniamy nazwę, opis, cel zadania na poprawne dane, sprawdzamy czy się zmieniły
    newData = { #wszystko na raz, nie chce mi się dzielić
        "name": "serek",
        "description": "może być jeden rodzaj, ale dużo i szybko",
        "goal": 10,
        "deadline": datetime(2030, 12, 31) #nie pamiętam tamtych dat
    }
    task.edit(db_session, owner.userID, **newData)
    updatedTask = db_session.query(Task).filter_by(id=task.id).first()
    assert updatedTask is not None
    assert updatedTask.name == newData["name"]
    assert updatedTask.description == newData["description"]
    assert updatedTask.goal == newData["goal"]
    assert updatedTask.deadline == newData["deadline"]
    
    # próbujemy zmienić nazwę na błędną, powinno rzucić błąd
    newData["name"] = ""
    with pytest.raises(Exception):
        task.edit(db_session, admin.userID, **newData)
    
    #jeszcze admin
    newData["name"] = "syr"
    task.edit(db_session, admin.userID, **newData)
    updatedTask = db_session.query(Task).filter_by(id=task.id).first()
    assert updatedTask is not None
    assert updatedTask.name == newData["name"]
    
    # próbujemy edytować zadanie bez uprawnień, powinno rzucić błąd
    newData["name"] = "nowa nazwa"
    with pytest.raises(Exception):
        task.edit(db_session, member.userID, **newData)
        
def test_Task_delete(db_session, shoppingList_bundle):
    task = shoppingList_bundle["tasks"]["cheese"]["task"] #one time
    owner = shoppingList_bundle["GM"]["owner"]
    member = shoppingList_bundle["GM"]["member"]
    admin = shoppingList_bundle["GM"]["admin"]
    #params = shoppingList_bundle["tasks"]["cheese"]["params"]
    #progress = shoppingList_bundle["tasks"]["cheese"]["progress"]
    entries = shoppingList_bundle["tasks"]["cheese"]["entries"]
    comments = shoppingList_bundle["tasks"]["cheese"]["comments"]
    group = shoppingList_bundle["TG"]
    # próbujemy usunąć zadanie bez uprawnień, powinno rzucić błąd
    with pytest.raises(Exception):
        task.delete(db_session, member.userID)
    with pytest.raises(Exception):
        task.delete(db_session, admin.userID)

    # usuwamy zadanie, sprawdzamy czy zostało usunięte z bazy i czy usunięto postępy
    task.delete(db_session, owner.userID)
    assert db_session.query(Task).filter_by(id=task.id).first() is None
    assert db_session.query(TaskProgress).filter_by(taskID=task.id).first() is None
    assert db_session.query(TaskParams).filter_by(taskID=task.id).first() is None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id).first() is None
    for comment in comments:
        assert db_session.query(Comment).filter_by(id=comment.id).first() is None
    # sprawdzamy czy taskCount w grupie się zaktualizował
    assert group.taskCount == db_session.query(Task).filter_by(groupID=group.id).count() + 1
    


def test_Task_changeTaskType(db_session, shoppingList_bundle):
    task = shoppingList_bundle["tasks"]["cheese"]["task"] #one time
    owner = shoppingList_bundle["GM"]["owner"]
    member = shoppingList_bundle["GM"]["member"]
    params = shoppingList_bundle["tasks"]["cheese"]["params"]
    progress = shoppingList_bundle["tasks"]["cheese"]["progress"]
    entries = shoppingList_bundle["tasks"]["cheese"]["entries"]

    
    # zmieniamy typ zadania (wszystkie możliwości), sprawdzamy czy się zmienił
    # one time -> repeatable
    task.changeTaskType(db_session, owner.userID, TaskType.REPEATABLE)
    new_task = db_session.query(RepeatableTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(RepeatableTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert new_progress.counter == 0
    assert db_session.query(OneTimeTask).filter_by(id=task.id).first() is None
    assert db_session.query(OneTimeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # repeatable -> one time
    task.changeTaskType(db_session, owner.userID, TaskType.ONE_TIME)
    new_task = db_session.query(OneTimeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(OneTimeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(RepeatableTask).filter_by(id=task.id).first() is None
    assert db_session.query(RepeatableTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
        
    # one time -> endless
    task.changeTaskType(db_session, owner.userID, TaskType.ENDLESS)
    new_task = db_session.query(EndlessTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(EndlessTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(OneTimeTask).filter_by(id=task.id).first() is None
    assert db_session.query(OneTimeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # endless -> one time
    task.changeTaskType(db_session, owner.userID, TaskType.ONE_TIME)
    new_task = db_session.query(OneTimeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(OneTimeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(EndlessTask).filter_by(id=task.id).first() is None
    assert db_session.query(EndlessTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None

    # one time -> challenge
    task.changeTaskType(db_session, owner.userID, TaskType.CHALLENGE)
    new_task = db_session.query(ChallengeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(ChallengeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(OneTimeTask).filter_by(id=task.id).first() is None
    assert db_session.query(OneTimeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # challenge -> one time
    task.changeTaskType(db_session, owner.userID, TaskType.ONE_TIME)
    new_task = db_session.query(OneTimeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(OneTimeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None 
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(ChallengeTask).filter_by(id=task.id).first() is None
    assert db_session.query(ChallengeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:    
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    #no ja już po prostu taba klikam, trzeba się modlić że jest dobrze 
    task.changeTaskType(db_session, owner.userID, TaskType.REPEATABLE)
    
    #repeatable -> challenge
    task.changeTaskType(db_session, owner.userID, TaskType.CHALLENGE)
    new_task = db_session.query(ChallengeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(ChallengeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(RepeatableTask).filter_by(id=task.id).first() is None
    assert db_session.query(RepeatableTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # challenge -> repeatable
    task.changeTaskType(db_session, owner.userID, TaskType.REPEATABLE)
    new_task = db_session.query(RepeatableTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(RepeatableTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(ChallengeTask).filter_by(id=task.id).first() is None
    assert db_session.query(ChallengeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # repeatable -> endless
    task.changeTaskType(db_session, owner.userID, TaskType.ENDLESS)
    new_task = db_session.query(EndlessTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(EndlessTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(RepeatableTask).filter_by(id=task.id).first() is None
    assert db_session.query(RepeatableTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # endless -> repeatable
    task.changeTaskType(db_session, owner.userID, TaskType.REPEATABLE)
    new_task = db_session.query(RepeatableTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(RepeatableTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(EndlessTask).filter_by(id=task.id).first() is None
    assert db_session.query(EndlessTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    #lecim lecim
    task.changeTaskType(db_session, owner.userID, TaskType.CHALLENGE)
    
    # challenge -> endless
    task.changeTaskType(db_session, owner.userID, TaskType.ENDLESS)
    new_task = db_session.query(EndlessTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(EndlessTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None 
    assert new_progress is not None
    assert new_progress.value == progress.value
    assert db_session.query(ChallengeTask).filter_by(id=task.id).first() is None
    assert db_session.query(ChallengeTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:    
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    # endless -> challenge
    task.changeTaskType(db_session, owner.userID, TaskType.CHALLENGE)
    new_task = db_session.query(ChallengeTask).filter_by(name=task.name, description=task.description, goal=task.goal, groupID=task.groupID).first()
    new_progress = db_session.query(ChallengeTaskProgress).filter_by(taskID=new_task.id).first()
    assert new_task is not None
    assert new_progress is not None
    assert new_progress.value == progress.value 
    assert db_session.query(EndlessTask).filter_by(id=task.id).first() is None
    assert db_session.query(EndlessTaskProgress).filter_by(id=progress.id).first() is None
    assert db_session.query(TaskParams).filter_by(id=params.id, taskID=new_task.id).first() is not None
    for entry in entries:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id, TaskProgressID=new_progress.id).first() is not None
        
    #💀💀💀💀💀
    


    # próbujemy zmienić typ zadania bez uprawnień, powinno rzucić błąd
    with pytest.raises(Exception):
        task.changeTaskType(db_session, member.userID, TaskType.REPEATABLE) #jeden przypadek, po bożemu
