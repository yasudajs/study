"""
ポータル画面 - Blueprint
"""
from flask import Blueprint

portal_bp = Blueprint(
    'portal',
    __name__,
    url_prefix='/',
    template_folder='templates'
)

from . import routes
