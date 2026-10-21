"""
Curriculum Standards Database Parser & High-Performance JSON Generator
Extracts data from curriculum-standards-db.xlsx and generates lightweight,
zero-latency JSON files for web frontends.
"""

import os
import sys
import json
from pathlib import Path
from collections import OrderedDict, defaultdict
import openpyxl

BASE_DIR = Path(r"H:\다른 컴퓨터\내 컴퓨터\학교업무 원드라이브 백업 파일 0712\코딩 공유 폴더(coding share folder)\에이전트 오케스트레이션 에듀 프롬프트")
EXCEL_PATH = BASE_DIR / "curriculum-standards-db.xlsx"
PUBLIC_DATA_DIR = BASE_DIR / "public" / "data"
ROOT_DATA_DIR = BASE_DIR / "data"

def clean_val(val):
    if val is None:
        return ""
    s = str(val).strip()
    return s

def build_data():
    print(f"Loading workbook from: {EXCEL_PATH}")
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
    
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    ROOT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    sheet_configs = [
        {
            "id": "2022_m",
            "sheet": "2022_중학교",
            "curriculum": "2022",
            "school_id": "m",
            "school_name": "중학교",
            "file_name": "standards_2022_m.json",
            "level_type": "5level"
        },
        {
            "id": "2022_h",
            "sheet": "2022_고등학교",
            "curriculum": "2022",
            "school_id": "h",
            "school_name": "고등학교",
            "file_name": "standards_2022_h.json",
            "level_type": "5level"
        },
        {
            "id": "2015_m",
            "sheet": "2015_중학교",
            "curriculum": "2015",
            "school_id": "m",
            "school_name": "중학교",
            "file_name": "standards_2015_m.json",
            "level_type": "3level"
        },
        {
            "id": "2015_h",
            "sheet": "2015_고등학교",
            "curriculum": "2015",
            "school_id": "h",
            "school_name": "고등학교",
            "file_name": "standards_2015_h.json",
            "level_type": "3level"
        }
    ]
    
    total_records = 0
    records_by_target = {}
    stats_by_target = {}
    groups_by_target = {}
    subjects_by_group_dict = {}
    subject_counts_dict = {}
    tree_dict = {"2022": {"중학교": [], "고등학교": []}, "2015": {"중학교": [], "고등학교": []}}
    
    for cfg in sheet_configs:
        sheet_name = cfg["sheet"]
        ws = wb[sheet_name]
        raw_rows = list(ws.iter_rows(values_only=True))
        header = raw_rows[0]
        data_rows = raw_rows[1:]
        
        target_id = cfg["id"]
        curriculum = cfg["curriculum"]
        school_name = cfg["school_name"]
        
        records = []
        group_subject_map = OrderedDict()
        subj_counts = OrderedDict()
        
        for r in data_rows:
            cleaned = [clean_val(c) for c in r]
            g = cleaned[0]
            s = cleaned[1]
            d = cleaned[2]
            c = cleaned[3]
            st = cleaned[4]
            
            if not c and not st:
                continue
                
            if cfg["level_type"] == "5level":
                # 2022: 교과군, 과목, 영역, 코드, 성취기준, A, B, C, D, E, 해설, 학년군, 출처ID
                l_a = cleaned[5] if len(cleaned) > 5 else ""
                l_b = cleaned[6] if len(cleaned) > 6 else ""
                l_c = cleaned[7] if len(cleaned) > 7 else ""
                l_d = cleaned[8] if len(cleaned) > 8 else ""
                l_e = cleaned[9] if len(cleaned) > 9 else ""
                exp = cleaned[10] if len(cleaned) > 10 else ""
                grd = cleaned[11] if len(cleaned) > 11 else ""
                cid = cleaned[12] if len(cleaned) > 12 else ""
                
                # levels dict
                levels = OrderedDict()
                if l_a: levels["A"] = l_a
                if l_b: levels["B"] = l_b
                if l_c: levels["C"] = l_c
                if l_d: levels["D"] = l_d
                if l_e: levels["E"] = l_e
                
                rec = OrderedDict([
                    ("subject_group", g),
                    ("subject", s),
                    ("domain", d),
                    ("code", c),
                    ("standard", st),
                    ("grade_group", grd),
                    ("explanation", exp),
                    ("levels", levels),
                    ("id", cid or c),
                    # Korean aliases for high compatibility
                    ("교과군", g),
                    ("과목", s),
                    ("영역", d),
                    ("코드", c),
                    ("성취기준", st),
                ])
            else:
                # 2015: 교과군, 과목, 영역, 코드, 성취기준, 상, 중, 하, 해설, 학년군, 출처ID
                l_h = cleaned[5] if len(cleaned) > 5 else ""
                l_m = cleaned[6] if len(cleaned) > 6 else ""
                l_l = cleaned[7] if len(cleaned) > 7 else ""
                exp = cleaned[8] if len(cleaned) > 8 else ""
                grd = cleaned[9] if len(cleaned) > 9 else ""
                cid = cleaned[10] if len(cleaned) > 10 else ""
                
                levels = OrderedDict()
                if l_h: levels["상"] = l_h
                if l_m: levels["중"] = l_m
                if l_l: levels["하"] = l_l
                
                rec = OrderedDict([
                    ("subject_group", g),
                    ("subject", s),
                    ("domain", d),
                    ("code", c),
                    ("standard", st),
                    ("grade_group", grd),
                    ("explanation", exp),
                    ("levels", levels),
                    ("id", cid or c),
                    # Korean aliases
                    ("교과군", g),
                    ("과목", s),
                    ("영역", d),
                    ("코드", c),
                    ("성취기준", st),
                ])
                
            records.append(rec)
            
            # Tree / Stats
            if g not in group_subject_map:
                group_subject_map[g] = OrderedDict()
            if s not in group_subject_map[g]:
                group_subject_map[g][s] = 0
            group_subject_map[g][s] += 1
            subj_counts[s] = subj_counts.get(s, 0) + 1
            
        records_by_target[target_id] = records
        total_records += len(records)
        
        # Build tree node
        tree_node = []
        subjects_by_group_dict[target_id] = OrderedDict()
        for grp, subs in group_subject_map.items():
            subjects_by_group_dict[target_id][grp] = list(subs.keys())
            sub_items = [{"name": s_name, "count": s_cnt} for s_name, s_cnt in subs.items()]
            tree_node.append({
                "group": grp,
                "total": sum(subs.values()),
                "subjects": sub_items
            })
            
        tree_dict[curriculum][school_name] = tree_node
        subject_counts_dict[target_id] = subj_counts
        stats_by_target[target_id] = {
            "file": f"data/{cfg['file_name']}",
            "total_standards": len(records),
            "groups_count": len(group_subject_map),
            "subjects_count": len(subj_counts)
        }
        
        # Save standards JSON to public/data and root data
        file_path = PUBLIC_DATA_DIR / cfg["file_name"]
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=None, separators=(',', ':'))
            
        root_file_path = ROOT_DATA_DIR / cfg["file_name"]
        with open(root_file_path, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=None, separators=(',', ':'))
            
        print(f"[{cfg['file_name']}] Wrote {len(records)} records ({file_path.stat().st_size / 1024 / 1024:.2f} MB)")
        
    # Build meta.json
    meta = OrderedDict([
        ("version", "2026.1"),
        ("total_standards", total_records),
        ("curriculums", [
            {
                "id": "2022",
                "name": "2022 개정 교육과정",
                "badge": "최신 고시",
                "levels": ["A", "B", "C", "D", "E"],
                "schools": [
                    {"id": "m", "name": "중학교", "file": "data/standards_2022_m.json"},
                    {"id": "h", "name": "고등학교", "file": "data/standards_2022_h.json"}
                ]
            },
            {
                "id": "2015",
                "name": "2015 개정 교육과정",
                "badge": "기존 고시",
                "levels": ["상", "중", "하"],
                "schools": [
                    {"id": "m", "name": "중학교", "file": "data/standards_2015_m.json"},
                    {"id": "h", "name": "고등학교", "file": "data/standards_2015_h.json"}
                ]
            }
        ]),
        ("tree", tree_dict),
        ("subjects_by_curriculum", subjects_by_group_dict),
        ("stats", {
            "total_records": total_records,
            "by_target": stats_by_target,
            "subject_counts": subject_counts_dict
        })
    ])
    
    meta_path = PUBLIC_DATA_DIR / "meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        
    curriculum_meta_path = PUBLIC_DATA_DIR / "curriculum_meta.json"
    with open(curriculum_meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        
    with open(ROOT_DATA_DIR / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        
    with open(ROOT_DATA_DIR / "curriculum_meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        
    print(f"[meta.json] Wrote metadata ({meta_path.stat().st_size / 1024:.2f} KB)")
    print(f"Total Standards Processed: {total_records}")
    return total_records, stats_by_target

if __name__ == "__main__":
    build_data()
