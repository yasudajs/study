#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSVファイルのデータ構造検証スクリプト
修正作業後のCSVチェック用統合プログラム
"""

import csv
import sys

def check_csv_structure(csv_file='data/es_kanji.csv', id_start=2101, id_end=2160):
    """
    CSVファイルの構造と内容を検証する
    
    Args:
        csv_file (str): CSVファイルのパス
        id_start (int): チェック開始ID（デフォルト: 2101）
        id_end (int): チェック終了ID（デフォルト: 2160）
    
    Returns:
        bool: チェック成功時True、失敗時False
    """
    
    errors = []
    warnings = []
    data_list = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8-sig') as f:  # BOM対応
            reader = csv.reader(f)
            header = next(reader)
            
            # ヘッダーの確認
            expected_header = ['ID', '学年', '漢字', '画数', '音読み', '訓読み', 'ヒント音読み', 'ヒント訓読み']
            if header != expected_header:
                errors.append('ヘッダーが不正です: {}'.format(header))
            
            # 各行を検証
            for line_num, row in enumerate(reader, start=2):
                if not row or not row[0]:
                    continue
                
                try:
                    id_value = int(row[0])
                    
                    # ID範囲のチェック
                    if id_start <= id_value <= id_end:
                        data_list.append((line_num, row))
                        
                        # カラム数チェック
                        if len(row) != 8:
                            errors.append('行{} (ID:{}): カラム数が{}です（期待値:8）'.format(
                                line_num, row[0], len(row)))
                            continue
                        
                        # 必須項目チェック
                        if not row[0]:
                            errors.append('行{}: IDが空です'.format(line_num))
                        if not row[1]:
                            errors.append('行{} (ID:{}): 学年が空です'.format(line_num, row[0]))
                        if not row[2]:
                            errors.append('行{} (ID:{}): 漢字が空です'.format(line_num, row[0]))
                        if not row[3]:
                            errors.append('行{} (ID:{}): 画数が空です'.format(line_num, row[0]))
                        if not row[4]:
                            errors.append('行{} (ID:{}): 音読みが空です'.format(line_num, row[0]))
                        
                        # データ型チェック
                        try:
                            grade = int(row[1])
                            if grade not in [1, 2, 3, 4, 5, 6]:
                                warnings.append('行{} (ID:{}): 学年が1-6の範囲外です: {}'.format(
                                    line_num, row[0], grade))
                        except ValueError:
                            errors.append('行{} (ID:{}): 学年が数値ではありません: {}'.format(
                                line_num, row[0], row[1]))
                        
                        try:
                            stroke_count = int(row[3])
                            if stroke_count < 1 or stroke_count > 30:
                                warnings.append('行{} (ID:{}): 画数が異常です: {}'.format(
                                    line_num, row[0], stroke_count))
                        except ValueError:
                            errors.append('行{} (ID:{}): 画数が数値ではありません: {}'.format(
                                line_num, row[0], row[3]))
                        
                        # 訓読みが空の場合の警告
                        if not row[5]:
                            warnings.append('行{} (ID:{}, 漢字:{}): 訓読みが空です'.format(
                                line_num, row[0], row[2]))
                        
                        # 漢字の長さチェック
                        if len(row[2]) != 1:
                            errors.append('行{} (ID:{}): 漢字フィールドが1文字ではありません: {}'.format(
                                line_num, row[0], repr(row[2])))
                        
                except (ValueError, IndexError) as e:
                    errors.append('行{}: データ解析エラー: {}'.format(line_num, e))
    
    except IOError as e:
        errors.append('ファイル読み込みエラー: {}'.format(e))
        return False
    
    # 結果出力
    print('=' * 80)
    print('データ構造検証結果（ID: {}～{}）'.format(id_start, id_end))
    print('=' * 80)
    print('検証対象行数: {}行'.format(len(data_list)))
    print()
    
    if errors:
        print('【エラー】 {}件'.format(len(errors)))
        for error in errors:
            print('  {} {}'.format(u'\u274c', error))
    else:
        print('✅ エラーなし')
    
    if warnings:
        print('\n【警告】 {}件'.format(len(warnings)))
        for warning in warnings:
            print('  {} {}'.format(u'\u26a0', warning))
    else:
        print('\n✅ 警告なし')
    
    print('\n' + '=' * 80)
    
    # IDの連続性チェック
    print('IDの連続性チェック:')
    ids = sorted([int(row[0]) for _, row in data_list])
    missing_ids = []
    for i in range(id_start, id_end + 1):
        if i not in ids:
            missing_ids.append(i)
    
    if missing_ids:
        print('  {} 欠落しているID: {}'.format(u'\u26a0', missing_ids))
    else:
        print('  ✅ ID {}～{} まで連続しています'.format(id_start, id_end))
    
    # 重複IDチェック
    id_counts = {}
    for _, row in data_list:
        id_val = row[0]
        id_counts[id_val] = id_counts.get(id_val, 0) + 1
    
    duplicates = [id_val for id_val, count in id_counts.items() if count > 1]
    if duplicates:
        print('  {} 重複しているID: {}'.format(u'\u274c', duplicates))
    else:
        print('  ✅ 重複IDなし')
    
    # サンプル表示
    if data_list:
        print('\n最初の3件:')
        for line_num, row in data_list[:3]:
            hint_on = row[6][:20] if len(row) > 6 and row[6] else ''
            hint_kun = row[7][:20] if len(row) > 7 and row[7] else ''
            print('  行{}: ID={}, {}({}/{}), ヒント音={}, ヒント訓={}'.format(
                line_num, row[0], row[2], row[4], row[5], hint_on, hint_kun))
        
        if len(data_list) > 6:
            print('\n最後の3件:')
            for line_num, row in data_list[-3:]:
                hint_on = row[6][:20] if len(row) > 6 and row[6] else ''
                hint_kun = row[7][:20] if len(row) > 7 and row[7] else ''
                print('  行{}: ID={}, {}({}/{}), ヒント音={}, ヒント訓={}'.format(
                    line_num, row[0], row[2], row[4], row[5], hint_on, hint_kun))
    
    print('=' * 80)
    print('検証完了')
    print('=' * 80)
    
    success = len(errors) == 0 and len(missing_ids) == 0 and len(duplicates) == 0
    return success

def show_help():
    """ヘルプメッセージを表示"""
    help_text = '''
【CSVチェックスクリプト】
修正作業後のCSVデータを検証するツール

【使用方法】
  python check_csv.py [オプション]

【オプション】
  -h, --help                  このヘルプを表示
  -s, --start <ID>            検証開始ID（デフォルト: 2101）
  -e, --end <ID>              検証終了ID（デフォルト: 2160）
  -f, --file <ファイルパス>    CSVファイルのパス（デフォルト: data/es_kanji.csv）
  
【使用例】
  python check_csv.py
                        → デフォルト範囲 (2101～2160) をチェック
  
  python check_csv.py -s 2002 -e 2050
                        → ID 2002～2050 をチェック
  
  python check_csv.py -s 3001 -e 3100
                        → ID 3001～3100 をチェック
  
  python check_csv.py -f data/other.csv -s 1001 -e 1100
                        → 別のCSVファイルをチェック

【終了コード】
  0  検証成功（エラーなし）
  1  検証失敗（エラーあり）
'''
    print(help_text)

def parse_arguments():
    """コマンドライン引数をパース"""
    csv_file = 'data/es_kanji.csv'
    id_start = 2101
    id_end = 2160
    
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        
        if arg in ['-h', '--help']:
            show_help()
            sys.exit(0)
        elif arg in ['-s', '--start']:
            if i + 1 >= len(args):
                print('エラー: -s/--start には値が必要です')
                sys.exit(1)
            try:
                id_start = int(args[i + 1])
                i += 2
            except ValueError:
                print('エラー: 開始IDは整数である必要があります: {}'.format(args[i + 1]))
                sys.exit(1)
        elif arg in ['-e', '--end']:
            if i + 1 >= len(args):
                print('エラー: -e/--end には値が必要です')
                sys.exit(1)
            try:
                id_end = int(args[i + 1])
                i += 2
            except ValueError:
                print('エラー: 終了IDは整数である必要があります: {}'.format(args[i + 1]))
                sys.exit(1)
        elif arg in ['-f', '--file']:
            if i + 1 >= len(args):
                print('エラー: -f/--file には値が必要です')
                sys.exit(1)
            csv_file = args[i + 1]
            i += 2
        else:
            print('エラー: 不明なオプション: {}'.format(arg))
            print('ヘルプを表示: python check_csv.py -h')
            sys.exit(1)
    
    # バリデーション
    if id_start >= id_end:
        print('エラー: 開始ID({}) は終了ID({}) より小さい必要があります'.format(id_start, id_end))
        sys.exit(1)
    
    return csv_file, id_start, id_end

if __name__ == '__main__':
    csv_file, id_start, id_end = parse_arguments()
    success = check_csv_structure(csv_file, id_start, id_end)
    sys.exit(0 if success else 1)
