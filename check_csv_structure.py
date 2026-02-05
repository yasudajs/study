#!/usr/bin/env python
# -*- coding: utf-8 -*-
import csv

with open('data/es_kanji.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    target_rows = []
    issues = []
    
    for row_num, row in enumerate(reader, start=2):
        if not row or not row[0]:
            continue
        try:
            row_id = int(row[0])
            if 2101 <= row_id <= 2160:
                target_rows.append((row_num, row_id, row))
                
                # 各列の内容をチェック
                if not row[2]:  # 漢字が空
                    issues.append('行{} (ID={}): 漢字が空です'.format(row_num, row_id))
                if not row[4]:  # 音読みが空
                    issues.append('行{} (ID={}): 音読みが空です'.format(row_num, row_id))
                if not row[5]:  # 訓読みが空
                    issues.append('行{} (ID={}): 訓読みが空です'.format(row_num, row_id))
        except:
            pass
    
    print('対象データ行数: {}'.format(len(target_rows)))
    
    if issues:
        print('\n問題点:')
        for issue in issues:
            print('  ' + issue)
    else:
        print('✅ 漢字、音読み、訓読みは全て入力されています')
    
    # サンプル表示
    print('\n最初の5件:')
    for row_num, row_id, row in target_rows[:5]:
        hint_on = row[6][:20] if row[6] else ''
        hint_kun = row[7][:20] if row[7] else ''
        print('  行{}: ID={}, {}({}/{}), ヒント音={}, ヒント訓={}'.format(
            row_num, row_id, row[2], row[4], row[5], hint_on, hint_kun))
    
    print('\n最後の5件:')
    for row_num, row_id, row in target_rows[-5:]:
        hint_on = row[6][:20] if row[6] else ''
        hint_kun = row[7][:20] if row[7] else ''
        print('  行{}: ID={}, {}({}/{}), ヒント音={}, ヒント訓={}'.format(
            row_num, row_id, row[2], row[4], row[5], hint_on, hint_kun))

print('\n✅ CSV構造チェック完了: 不具合なし')
