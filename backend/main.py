"""Root-level entrypoint alias for hosting platforms that expect a top-level
main.py with an importable ASGI `app` (e.g. Vercel's Python builder), since
our actual app package lives at app/main.py. Local dev and Render both use
`app.main:app` directly and don't need this file."""

from app.main import app

__all__ = ["app"]
