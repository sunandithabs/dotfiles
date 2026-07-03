# Simulyn dev server (Docker)

This directory contains a minimal Express server used for local development demo. To run without installing Node/npm locally, use Docker / docker-compose.

Build and start (docker-compose):

```bash
# from project root
docker compose build
docker compose up -d
```

Open http://127.0.0.1:3000/

Stop and remove:

```bash
docker compose down
```

Notes:
- This server is for development/demo only. It serves static files from the repository root and exposes simple demo APIs under `/api/*`.
- Do not use this image for production; replace with a proper API and secure services before deploying.
