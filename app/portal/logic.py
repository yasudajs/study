"""
ポータル画面 - ロジック
"""

def get_available_apps():
    """
    利用可能な学習アプリの一覧を取得
    """
    apps = [
        {
            'id': 'kuku',
            'name': '九九練習',
            'description': '1×1～9×9の九九を練習します',
            'icon': '/static/images/app_icons/kuku.svg',
            'url': '/kuku/',
            'level': '小学1～3年生'
        },
        {
            'id': 'calc',
            'name': '四則演算練習',
            'description': '足し算、引き算、掛け算、割り算を練習します',
            'icon': '/static/images/app_icons/calc.svg',
            'url': '/calc/',
            'level': '小学生低学年～'
        },
    ]
    return apps
