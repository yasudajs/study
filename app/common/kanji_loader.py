"""
漢字データローダー - CSVファイルから漢字データを読み込み
"""
import csv
import os


class KanjiLoader:
    """漢字データをCSVから読み込んで提供するクラス"""
    _data = None

    @classmethod
    def load(cls):
        """CSVファイルを読み込んでデータを返す"""
        if cls._data is None:
            csv_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'data',
                'es_kanji.csv'
            )
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                cls._data = list(reader)
        return cls._data

    @classmethod
    def get_by_grade(cls, grade):
        """学年別に漢字データを取得"""
        data = cls.load()
        return [item for item in data if item['学年'] == str(grade)]

    @classmethod
    def sort_by_strokes(cls, kanji_list):
        """画数でソート"""
        return sorted(kanji_list, key=lambda x: int(x['画数']))

    @classmethod
    def get_all_grades(cls):
        """利用可能な全学年を取得"""
        data = cls.load()
        grades = sorted(set(int(item['学年']) for item in data))
        return grades
