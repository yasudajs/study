import os

class Config:
    """共通設定"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = False
    TESTING = False
    
    # セッション設定
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # ログ設定
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    """開発環境設定"""
    DEBUG = True
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """本番環境設定"""
    DEBUG = False

class TestingConfig(Config):
    """テスト環境設定"""
    TESTING = True

# 設定マップ
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}

def get_config(config_name='development'):
    """指定された環境の設定を取得"""
    return config_map.get(config_name, DevelopmentConfig)
