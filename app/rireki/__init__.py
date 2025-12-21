from flask import Blueprint

rireki_bp = Blueprint(
    'rireki',
    __name__,
    url_prefix='/rireki',
    template_folder='templates',
    static_folder='static'
)

def register_blueprint(app):
    """rireki Blueprint を登録"""
    app.register_blueprint(rireki_bp)

from app.rireki import routes
