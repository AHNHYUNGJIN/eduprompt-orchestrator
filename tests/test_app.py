import os
import sys
import json
import subprocess
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

    def test_02_html_structure_separation(self):
        """수업 자료 프롬프트와 이미지 프롬프트의 완전 분리 뷰 확인"""
        content = (PUBLIC_DIR / "index.html").read_text(encoding="utf-8")
        self.assertIn("EduPrompt", content)
        self.assertIn("Pretendard", content)
        # 듀얼 뷰 스위처 및 독립 에디터 확인
        self.assertIn("switch-view-material", content)
        self.assertIn("switch-view-image", content)
        self.assertIn("material-editor", content)
        self.assertIn("image-editor", content)
        self.assertIn("btn-copy-material", content)
        self.assertIn("btn-copy-image", content)
        # AI 모델 칩 확인
        self.assertIn("data-model=\"gemini\"", content)
        self.assertIn("data-model=\"dalle\"", content)
        self.assertIn("data-model=\"claude\"", content)
        self.assertIn("data-model=\"midjourney\"", content)
        self.assertIn("data-model=\"flux\"", content)

    def test_03_prompt_engine_node_execution(self):
        """Node.js 환경에서 PromptEngine 실행 및 Visual Translation, 모델별 분리 검증"""
        node_script = """
        const PromptEngine = require('./public/js/prompt_engine.js');
        
        // 1. 중학교 기술·가정 자아존중감 테스트 케이스
        const res = PromptEngine.generate({
            curriculum: '2022',
            school: 'm',
            subjectGroup: '기술·가정',
            subject: '기술·가정',
            code: '[9기가01-01]',
            standard: '청소년기 자아 존중감을 형성하고 바람직한 성 정체성을 발달시킬 수 있다.',
            level: 'A',
            materialType: 'inquiry_worksheet',
            imageStyleType: 'student_webtoon',
            targetImageModel: 'gemini'
        });

        // 수업 자료 검증
        if (!res.material || !res.material.text.includes('탐구 활동지')) {
            throw new Error('수업 자료 프롬프트 미생성');
        }

        // 이미지 Visual Translation 검증: 한국어 따옴표 문장이 없어야 하고 visualAction이 포함되어야 함
        if (!res.image || !res.image.visualScene || !res.image.visualScene.action) {
            throw new Error('Visual Translation 실패');
        }
        
        // DALL-E에 미드저니 파라미터가 없어야 함
        const dallePrompt = res.image.promptsByModel.dalle;
        if (dallePrompt.includes('--ar') || dallePrompt.includes('--v 6.1')) {
            throw new Error('DALL-E 프롬프트에 미드저니 파라미터 오염');
        }

        // Midjourney에는 --ar 파라미터가 있어야 함
        const mjPrompt = res.image.promptsByModel.midjourney;
        if (!mjPrompt.includes('--ar 16:9') || !mjPrompt.includes('/imagine prompt:')) {
            throw new Error('Midjourney 프롬프트 문법 오류');
        }

        console.log('PROMPT_ENGINE_TEST_SUCCESS');
        """
        
        result = subprocess.run(
            ["node", "-e", node_script],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0, f"Node script error: {result.stderr}")
        self.assertIn("PROMPT_ENGINE_TEST_SUCCESS", result.stdout)

    def test_04_data_files_valid(self):
        """데이터 파이프라인에서 추출한 JSON 파일들의 무결성 검증"""
        meta_file = DATA_DIR / "meta.json"
        self.assertTrue(meta_file.exists(), "meta.json이 생성되어 있어야 합니다.")
        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)
            self.assertIsInstance(meta, dict, "meta는 JSON 객체여야 합니다.")

    def test_05_standards_count(self):
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

    def test_06_telegram_script(self):
        """텔레그램 발송 스크립트 존재 및 토큰 무결성 확인"""
        tg_script = BASE_DIR / "scripts" / "send_telegram.py"
        self.assertTrue(tg_script.exists())
        content = tg_script.read_text(encoding="utf-8")
        self.assertIn("8634011693", content)
        self.assertIn("8543805671", content)

if __name__ == "__main__":
    unittest.main()
