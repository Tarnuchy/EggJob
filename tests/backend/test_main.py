from fastapi.testclient import TestClient

# Importujemy aplikację z Twojego pliku main.py
from src.backend.main import app

# Tworzymy klienta testowego
client = TestClient(app)

def test_read_root():
    # Wykonujemy żądanie GET na główny endpoint
    response = client.get("/")
    
    # Sprawdzamy, czy status odpowiedzi to 200 OK
    assert response.status_code == 200
    # Sprawdzamy, czy treść odpowiedzi jest zgodna z oczekiwaniami
    assert response.json() == {"message": "jajo"}

def test_health_check():
    # Wykonujemy żądanie GET na endpoint /test
    response = client.get("/test")
    
    # Sprawdzamy kod statusu HTTP oraz treść JSON
    assert response.status_code == 200
    assert response.json() == {"message": "test"}