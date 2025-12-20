from flask import Blueprint

calc_bp = Blueprint('calc', __name__, template_folder='templates', static_folder='static')

from . import routes
