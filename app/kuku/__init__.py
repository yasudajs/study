"""
九九練習アプリケーション - Blueprint
"""
from flask import Blueprint

kuku_bp = Blueprint(
    'kuku',
    __name__,
    url_prefix='/kuku',
    static_folder='static',
    static_url_path='/kuku/static',
    template_folder='templates'
)

from . import routes
