import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

BOT_TOKEN = "8634011693:AAE7ZoVOZ5fhqnDu3i6tpQO-zPmpYUkqYf8"
CHAT_ID = 8543805671
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def send_telegram_notification(repo_url, vercel_url, summary_text):
    text = (
        "✨ *[에듀 프롬프트 오케스트레이터(EduPrompt Studio) 배포 완료]*\n\n"
        "선생님을 위한 2022·2015 개정 교육과정 성취기준 및 성취수준 기반 "
        "수업 자료 & AI 이미지 프롬프트 생성 웹 앱이 성공적으로 구축 및 배포되었습니다! 🎉\n\n"
        "🌐 *라이브 서비스 (Vercel):*\n"
        f"{vercel_url}\n\n"
        "💻 *GitHub 리포지토리:*\n"
        f"{repo_url}\n\n"
        "🎨 *주요 기능 요약:*\n"
        f"{summary_text}\n\n"
        f"📅 배포 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        "🤖 Antigravity Multi-Agent Orchestration 완료"
    )

    url = f"{BASE_URL}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print(f"Telegram notification sent successfully: {res_data.get('ok')}")
            return res_data
    except Exception as e:
        print(f"Error sending telegram notification: {e}")
        return None

if __name__ == "__main__":
    repo = sys.argv[1] if len(sys.argv) > 1 else "https://github.com/AHNHYUNGJIN/eduprompt-orchestrator"
    vercel = sys.argv[2] if len(sys.argv) > 2 else "https://eduprompt-orchestrator.vercel.app"
    summary = sys.argv[3] if len(sys.argv) > 3 else (
        "• 은은한 파스텔 톤 UI & 단계별 버튼형 프롬프트 빌더\n"
        "• 2022/2015 개정 중·고등학교 전 교과 성취기준 및 성취수준(A~E, 상중하) 탑재\n"
        "• 탐구활동지, 실생활과제, 토의발문, 형성평가, 교과세특 문구 자동 생성\n"
        "• 2026 Imagen 3 / Midjourney 규격 교과서 맞춤형 이미지 프롬프트(5대 스타일)\n"
        "• 1-Click 복사, ChatGPT/Claude/Gemini 연동 바로가기"
    )
    send_telegram_notification(repo, vercel, summary)
