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
            'id': 'shisoku',
            'name': '四則演算',
            'description': 'たし算・ひき算・かけ算・わり算を練習します',
            'icon': '/static/images/app_icons/shisoku.svg',
            'url': '/shisoku/',
            'level': '小学1～3年生'
        },
        # 将来：わり算、たし算、ひき算アプリなど
        # {
        #     'id': 'warizan',
        #     'name': '割り算練習',
        #     'description': '割り算の計算を練習します',
        #     'icon': '/static/images/app_icons/warizan.svg',
        #     'url': '/warizan/',
        #     'level': '小学3～4年生'
        # },
    ]
    return apps
