"""Run the development server."""
from __future__ import annotations

import os

from app import create_app
from app.config import Config

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))
