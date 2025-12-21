"""
単漢字練習アプリ
"""
from flask import Blueprint

tankanji_bp = Blueprint(
    'tankanji',
    __name__,
    url_prefix='/tankanji',
    template_folder='templates'
)

from . import routes  # noqa: E402, F401
