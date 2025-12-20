"""
四則演算練習アプリケーション - Blueprint
"""
from flask import Blueprint

shisoku_bp = Blueprint(
    'shisoku',
    __name__,
    url_prefix='/shisoku',
    static_folder='static',
    static_url_path='/shisoku/static',
    template_folder='templates'
)

from . import routes
