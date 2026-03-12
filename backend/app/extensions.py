"""Flask extensions — initialized in app factory."""
from __future__ import annotations

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
