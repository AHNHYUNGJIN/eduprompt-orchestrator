import os
import sys
import json
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_DIR = PUBLIC_DIR / "data"

class TestEduPromptStudio(unittest.TestCase):
    def test_01_public_files_exist(self):
        """기본 정적 파일(index.html, style.css, js 파일) 존재 확인"""
        self.assertTrue((PUBLIC_DIR / "index.html").exists(), "index.html이 존재해야 합니다.")
        self.assertTrue((PUBLIC_DIR / "css" / "style.css").exists(), "style.css가 존재해야 합니다.")
        self.assertTrue((PUBLIC_DIR / "js" / "prompt_engine.js").exists(), "prompt_engine.js가 존재해야 합니다.")
        self.assertTrue((PUBLIC_DIR / "js" / "app.js").exists(), "app.js가 존재해야 합니다.")

    def test_02_html_structure(self):
        """index.html 내 핵심 UI 요소 및 파스텔톤 클래스 확인"""
        content = (PUBLIC_DIR / "index.html").read_text(encoding="utf-8")
        self.assertIn("EduPrompt", content)
        self.assertIn("Pretendard", content)
        # 단계별 버튼 또는 칩 ID 확인
        self.assertTrue("curriculum" in content.lower() or "step" in content.lower())

    def test_03_data_files_valid(self):
        """데이터 파이프라인에서 추출한 JSON 파일들의 무결성 검증"""
        meta_file = DATA_DIR / "meta.json"
        if not meta_file.exists():
            meta_file = DATA_DIR / "curriculum_meta.json"
        
        self.assertTrue(meta_file.exists(), "meta.json이 생성되어 있어야 합니다.")
        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)
            self.assertIsInstance(meta, dict, "meta는 JSON 객체여야 합니다.")

    def test_04_standards_count(self):
        """2022 및 2015 성취기준 데이터 로드 및 건수 확인"""
        found_any = False
        for fname in ["standards_2022_m.json", "standards_2022_h.json", "standards_2015_m.json", "standards_2015_h.json"]:
            fpath = DATA_DIR / fname
            if fpath.exists():
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.assertIsInstance(data, list)
                    self.assertGreater(len(data), 0, f"{fname}에 데이터가 존재해야 합니다.")
                    found_any = True
        self.assertTrue(found_any, "최소 1개 이상의 성취기준 JSON이 유효해야 합니다.")

    def test_05_telegram_script(self):
        """텔레그램 발송 스크립트 존재 및 토큰 무결성 확인"""
        tg_script = BASE_DIR / "scripts" / "send_telegram.py"
        self.assertTrue(tg_script.exists())
        content = tg_script.read_text(encoding="utf-8")
        self.assertIn("8634011693", content)
        self.assertIn("8543805671", content)

if __name__ == "__main__":
    unittest.main()
