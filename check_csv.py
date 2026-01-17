#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSVファイルのデータ構造検証スクリプト
ID: 2002～2050のデータをチェック
"""

import csv

def check_csv_structure():
    csv_file = r"c:\work\lolipop\study\data\es_kanji.csv"
    
    errors = []
    warnings = []
    data_list = []
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # BOM対応
        reader = csv.reader(f)
        header = next(reader)
        
        # ヘッダーの確認
        expected_header = ['ID', '学年', '漢字', '画数', '音読み', '訓読み', 'ヒント音読み', 'ヒント訓読み']
        if header != expected_header:
            errors.append(f"ヘッダーが不正です: {header}")
        
        # 各行を検証
        for line_num, row in enumerate(reader, start=2):  # ヘッダーが1行目なので2から開始
            try:
                id_value = int(row[0])
                
                # ID範囲のチェック（2002-2050のみ）
                if 2002 <= id_value <= 2050:
                    data_list.append((line_num, row))
                    
                    # カラム数チェック
                    if len(row) != 8:
                        errors.append(f"行{line_num} (ID:{row[0]}): カラム数が{len(row)}です（期待値:8）")
                        continue
                    
                    # 必須項目チェック
                    if not row[0]:
                        errors.append(f"行{line_num}: IDが空です")
                    if not row[1]:
                        errors.append(f"行{line_num} (ID:{row[0]}): 学年が空です")
                    if not row[2]:
                        errors.append(f"行{line_num} (ID:{row[0]}): 漢字が空です")
                    if not row[3]:
                        errors.append(f"行{line_num} (ID:{row[0]}): 画数が空です")
                    if not row[4]:
                        errors.append(f"行{line_num} (ID:{row[0]}): 音読みが空です")
                    
                    # データ型チェック
                    try:
                        grade = int(row[1])
                        if grade not in [1, 2, 3, 4, 5, 6]:
                            warnings.append(f"行{line_num} (ID:{row[0]}): 学年が1-6の範囲外です: {grade}")
                    except ValueError:
                        errors.append(f"行{line_num} (ID:{row[0]}): 学年が数値ではありません: {row[1]}")
                    
                    try:
                        stroke_count = int(row[3])
                        if stroke_count < 1 or stroke_count > 30:
                            warnings.append(f"行{line_num} (ID:{row[0]}): 画数が異常です: {stroke_count}")
                    except ValueError:
                        errors.append(f"行{line_num} (ID:{row[0]}): 画数が数値ではありません: {row[3]}")
                    
                    # 訓読みが空の場合の警告
                    if not row[5]:
                        warnings.append(f"行{line_num} (ID:{row[0]}, 漢字:{row[2]}): 訓読みが空です")
                    
                    # 漢字の長さチェック
                    if len(row[2]) != 1:
                        errors.append(f"行{line_num} (ID:{row[0]}): 漢字フィールドが1文字ではありません: '{row[2]}'")
                    
            except (ValueError, IndexError) as e:
                errors.append(f"行{line_num}: データ解析エラー: {e}")
    
    # 結果出力
    print("=" * 80)
    print("データ構造検証結果（ID: 2002～2050）")
    print("=" * 80)
    print(f"検証対象行数: {len(data_list)}行")
    print()
    
    if errors:
        print(f"【エラー】 {len(errors)}件")
        for error in errors:
            print(f"  ❌ {error}")
    else:
        print("✅ エラーなし")
    
    if warnings:
        print(f"\n【警告】 {len(warnings)}件")
        for warning in warnings:
            print(f"  ⚠️  {warning}")
    else:
        print("\n✅ 警告なし")
    
    print("\n" + "=" * 80)
    
    # IDの連続性チェック
    print("IDの連続性チェック:")
    ids = sorted([int(row[0]) for _, row in data_list])
    missing_ids = []
    for i in range(2002, 2051):
        if i not in ids:
            missing_ids.append(i)
    
    if missing_ids:
        print(f"  ⚠️  欠落しているID: {missing_ids}")
    else:
        print("  ✅ ID 2002～2050 まで連続しています")
    
    # 重複IDチェック
    id_counts = {}
    for _, row in data_list:
        id_val = row[0]
        id_counts[id_val] = id_counts.get(id_val, 0) + 1
    
    duplicates = [id_val for id_val, count in id_counts.items() if count > 1]
    if duplicates:
        print(f"  ❌ 重複しているID: {duplicates}")
    else:
        print("  ✅ 重複IDなし")
    
    print("=" * 80)
    print("検証完了")
    print("=" * 80)
    
    return len(errors) == 0 and len(missing_ids) == 0 and len(duplicates) == 0

if __name__ == "__main__":
    success = check_csv_structure()
    exit(0 if success else 1)
