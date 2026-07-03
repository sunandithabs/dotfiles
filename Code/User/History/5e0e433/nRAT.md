# HADES

Bureau of Systems Continuity (BSC) archival ARG backend.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Anagha-mr/HADES.git
cd HADES
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Initialize the database

```bash
python3 backend/migrate_2c.py
python3 backend/migrate_3e.py
python3 backend/seed.py
```

### 5. Run the server

```bash
python3 -m uvicorn backend.main_2c:app --reload
```

The API will be available at:

- http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

## Notes

- The SQLite database (`db/`) is ignored by Git.
- Each developer should run `backend/seed.py` locally after cloning.