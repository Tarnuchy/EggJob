# todo

## Backend (Phase A)

### 1. Install Python dependencies

```bash
"C:/Program Files/Python312/python.exe" -m pip install -r requirements.txt
```

### 2. Configure PostgreSQL URLs

Create a `.env` file in project root and set:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todo
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todo_test
```

### 3. Run API

```bash
"C:/Program Files/Python312/python.exe" -m uvicorn src.backend.main:app --reload
```

### 4. Health endpoints

- `GET /test` - API alive
- `GET /health/db` - checks DB connection (`SELECT 1`)

## Backend Migrations (Phase C)

### 1. Check migration history

```bash
"c:/Users/Oliwier/todo/.venv/Scripts/python.exe" -m alembic history
```

### 2. Apply latest schema

```bash
"c:/Users/Oliwier/todo/.venv/Scripts/python.exe" -m alembic upgrade head
```

### 3. Roll back to base

```bash
"c:/Users/Oliwier/todo/.venv/Scripts/python.exe" -m alembic downgrade base
```

Note: local PostgreSQL must be running on the host configured by `DATABASE_URL`.