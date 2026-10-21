/**
 * EduPrompt Studio - Prompt Orchestration Engine (2026 Standards)
 * 교과별 2022/2015 개정 성취기준 및 성취수준 기반 프롬프트 생성 엔진
 */

const PromptEngine = (function () {
  'use strict';

  // 1. 수업 자료 템플릿 생성기
  const MaterialGenerators = {
    // 1-1. 탐구 활동지 (도입-전개-정리-발문 구조)
    inquiry_worksheet: function (ctx) {
      return `당신은 ${ctx.schoolName} ${ctx.subject} 교과 교육과정 및 수업·평가 설계 전문가입니다.
아래에 제시된 ${ctx.curriculumName} 성취기준과 [성취수준 ${ctx.level}]의 도달 요건을 충족할 수 있도록 학생 참여형 '탐구 활동지(Inquiry Worksheet)'를 정교하게 제작해 주십시오.

[기본 수업 정보]
- 교육과정: ${ctx.curriculumName} (${ctx.schoolName})
- 교과(군) / 과목: ${ctx.subjectGroup} / ${ctx.subject}
- 영역 / 학년(군): ${ctx.domain || '해당 영역'} ${ctx.gradeGroup ? `(${ctx.gradeGroup})` : ''}
- 성취기준: ${ctx.code} ${ctx.standard}
- 목표 성취수준: [수준 ${ctx.level}] ${ctx.levelDesc}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}
---

[탐구 활동지 설계 가이드라인]
1. 활동지 제목: 학생들의 호기심을 자극하고 성취기준의 핵심 개념을 관통하는 매력적인 제목
2. [도입] 생각열기 (5~10분):
   - 학생들의 일상생활 경험이나 최근 사회 이슈와 연결된 도입 질문
   - 사전 지식 점검 및 학습 동기 유발 삽화/자료 설명
3. [전개] 단계별 탐구 활동 (25~30분):
   - [활동 1 - 개념 발견 및 자료 분석]: 제시된 표, 그래프, 시각 자료를 바탕으로 규칙성이나 원리를 발견하는 활동
   - [활동 2 - 모둠 협력 및 심화 탐구]: [성취수준 ${ctx.level}] 기준에 도달하기 위해 논리적 추론이나 문제 해결을 요구하는 핵심 과제
   - [활동 3 - 실생활 적용 및 대안 제시]: 탐구한 원리를 새로운 상황이나 실생활 문제에 적용해보는 과제
4. [정리 및 성찰] 배움 정리 (5~10분):
   - 오늘 탐구한 핵심 개념을 한 문장으로 정의하기
   - 학생 자기평가 체크리스트 (성취수준 ${ctx.level} 도달 여부를 스스로 점검할 수 있는 3개 문항)
5. [교사용 지도 팁 및 해설]:
   - 모둠 활동 시 발생할 수 있는 주요 오개념과 교사의 피드백 발문 예시
   - 수준별(디딤돌 및 도움닫기) 차별화 지도 방안`;
    },

    // 1-2. 실생활 연계 과제 & 수행평가
    real_world_task: function (ctx) {
      return `당신은 역량 중심 수업 및 과정중심평가 설계 전문가입니다.
아래의 ${ctx.curriculumName} 성취기준과 [성취수준 ${ctx.level}]을 바탕으로 학생들의 실생활 맥락 속에서 문제해결력을 발휘할 수 있는 '실생활 연계 수행평가 과제 계획서'를 작성해 주십시오.

[평가 및 수업 맥락]
- 교육과정: ${ctx.curriculumName} (${ctx.schoolName})
- 과목 / 영역: ${ctx.subject} / ${ctx.domain}
- 성취기준: ${ctx.code} ${ctx.standard}
- 도달 성취수준: [수준 ${ctx.level}] ${ctx.levelDesc}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}
---

[작성 요구 항목]
1. 수행과제명: GRASPS 모델(Goal, Role, Audience, Situation, Product, Standards)에 입각한 실제적 과제명
2. 과제 상황 시나리오:
   - 학생의 역할 (예: 환경 연구원, 데이터 분석가, 시사 칼럼니스트 등)
   - 해결해야 할 현실적 문제 및 대상 청중
3. 단계별 수행 과정 (총 2~3차시 분량):
   - 1단계: 문제 정의 및 자료 수집
   - 2단계: 분석, 협력 토의 및 초안 제작
   - 3단계: 최종 산출물 완성 및 발표/상호 피드백
4. 학생 산출물 형태 (예: 정책 제안서, 인포그래픽 포스터, 실험 보고서, 캠페인 카드뉴스 등)
5. 채점 기준표 (루브릭):
   - [수준 ${ctx.level}]을 포함한 성취수준별(상/중/하 또는 A/B/C/D/E) 구체적 평가 척도 및 관찰 지표
6. 안전 및 유의점, 피드백 제공 전략`;
    },

    // 1-3. 생각열기 토의·토론 발문
    discussion_question: function (ctx) {
      return `당신은 학생들의 비판적 사고력과 질문력을 촉진하는 하브루타 및 소크라테스식 대화법 전문가입니다.
아래 성취기준과 [성취수준 ${ctx.level}]을 기반으로 수업 시작 시 또는 수업 전개 과정에서 학생들의 깊이 있는 사고를 이끌어낼 '생각열기 토의·토론 발문 세트'를 개발해 주십시오.

[수업 정보]
- 교육과정: ${ctx.curriculumName} (${ctx.schoolName})
- 과목 / 영역: ${ctx.subject} / ${ctx.domain}
- 성취기준: ${ctx.code} ${ctx.standard}
- 타깃 성취수준: [수준 ${ctx.level}] ${ctx.levelDesc}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}
---

[발문 구성 형식]
1. [도입: 사실 확인 및 호기심 발문 (Recall & Hook)] (2개)
   - 학생들의 직관적 경험과 사전 개념을 끌어내는 쉽고 흥미로운 질문
2. [전개: 개념 심화 및 분석적 발문 (Analysis & Reasoning)] (3개)
   - 현상의 원인과 결과, 상호작용을 깊이 파고드는 질문
   - [성취수준 ${ctx.level}]의 핵심 개념을 언어화할 수 있도록 돕는 질문
3. [확장: 가치 판단 및 딜레마 토론 발문 (Evaluation & Debate)] (2개)
   - 정답이 하나로 정해지지 않고 다양한 시각과 가치관이 충돌하는 찬반 논제
4. [교사용 토의 운영 팁]:
   - 학생들의 침묵을 깨는 스캐폴딩(비계) 질문
   - 편향되거나 단답형 답변이 나왔을 때 사고를 확장시켜 주는 꼬리 질문(Follow-up Questions) 예시`;
    },

    // 1-4. 개념 형성평가 & 피드백 퀴즈
    formative_quiz: function (ctx) {
      return `당신은 교육과정 평가원 출제위원급의 학교 평가 설계 전문가입니다.
아래의 성취기준 및 [성취수준 ${ctx.level}]의 도달 여부를 정확하게 진단하고 학생의 오개념을 즉각 교정할 수 있는 '형성평가 문항 세트(4문항)'를 제작해 주십시오.

[평가 대상 성취기준]
- 교육과정: ${ctx.curriculumName} (${ctx.schoolName})
- 교과 및 과목: ${ctx.subjectGroup} - ${ctx.subject} (${ctx.domain})
- 성취기준: ${ctx.code} ${ctx.standard}
- 진단 성취수준: [수준 ${ctx.level}] ${ctx.levelDesc}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}
---

[문항 제작 규격]
1. [선다형 문항 1 (기본 개념 확인형)]: 5지 선다형, 핵심 용어 및 기초 원리 검증
2. [선다형 문항 2 (자료 분석 및 상황 적용형)]: 5지 선다형, 그래프/그림/실생활 사례를 제시하고 해석하는 문항
3. [선다형 문항 3 (심화 추론 및 종합형)]: 5지 선다형, [성취수준 ${ctx.level}]의 핵심 변별 요소를 평가하는 문항
4. [서술·논술형 문항 1 (설명 및 대안 제시형)]: 성취기준의 핵심 원리를 자신의 언어로 논리적으로 설명하는 2~3문장 서술형 문항 (단계별 채점 기준 포함)

[각 문항별 필수 포함 사항]
- 정답 및 정답 인정 범위
- 출제 의도 및 관련 성취기준 분석
- 오답 매력도 분석 및 선지별 상세 해설 (왜 이 선지가 오답인지, 어떤 오개념에서 비롯되었는지)
- 학생 맞춤형 즉각 피드백 코멘트`;
    },

    // 1-5. 성취수준 기반 교과세특 문구 예시
    student_record: function (ctx) {
      return `당신은 교육부 학교생활기록부 기재요령 및 2022/2028 대입 전형 전문가입니다.
아래의 성취기준과 [성취수준 ${ctx.level}]을 바탕으로 학생의 수업 중 탐구 역량과 개별적 성장이 생생하게 드러나는 '학교생활기록부 교과세특(과목별 세부능력 및 특기사항) 예시 문구 3세트'를 작성해 주십시오.

[성취기준 및 수준 정보]
- 교육과정: ${ctx.curriculumName} (${ctx.schoolName})
- 교과 / 과목: ${ctx.subjectGroup} / ${ctx.subject}
- 성취기준: ${ctx.code} ${ctx.standard}
- 기준 성취수준: [수준 ${ctx.level}] ${ctx.levelDesc}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}
---

[작성 준수 원칙]
1. 단순 지식 습득의 나열이나 '우수함' 등의 추상적 칭찬은 지양하고, [구체적 수업 활동 계기 -> 학생의 주도적 탐구 과정 및 논리적 사고 -> 배운 점 및 실천/성장]의 인과 구조로 작성할 것.
2. 성취수준 [${ctx.level}]의 서술어와 역량 지표가 자연스럽게 문장에 녹아들도록 할 것.
3. 글자 수: 각 예시별 공백 포함 300~450자 내외.

[출력 세트 구성]
- [유형 1 - 심층 탐구 및 보고서 작성형]: 성취기준 관련 이론이나 쟁점을 스스로 깊이 파고들어 자기주도적으로 학습한 학생 사례
- [유형 2 - 실험·실습 및 모둠 협업형]: 협동 활동 및 실습 과정에서 문제해결과 지식 공유를 이끈 학생 사례
- [유형 3 - 실생활 융합 및 창의적 대안 제시형]: 배운 지식을 사회 현상이나 미래 기술과 융합하여 독창적인 아이디어를 제안한 학생 사례
- [교사용 수정 가이드]: 학생의 실제 활동에 맞게 치환할 수 있는 핵심 키워드(괄호 표기) 안내`;
    }
  };

  // 2. 수업 이미지 프롬프트 생성기 (2026 규격: Imagen 3, Midjourney v6.1, FLUX.1, DALL-E 3)
  const ImageStyles = {
    // 2-1. 교과서 감성 일러스트
    textbook_illustration: {
      name: '교과서 감성 일러스트 (Soft Watercolor & Clean Line Art)',
      positiveStyle: 'educational textbook illustration style, soft pastel watercolor texture, clean ink outline, warm and inviting atmosphere, educational diagram aesthetic, high clarity, visually balanced composition, gentle lighting, Korean textbook mood, masterwork',
      negative: 'photorealistic, low quality, messy lines, dark creepy mood, text, watermark, signature, grotesque, distorted faces, oversaturated neon colors',
      ar: '--ar 16:9',
      v: '--v 6.1 --style raw --stylize 120'
    },
    // 2-2. 3D 입체 다이어그램
    '3d_diagram': {
      name: '3D 입체 다이어그램 (Isometric Clay & Frosted Glass)',
      positiveStyle: 'isometric 3D educational cutaway diagram, cross-section view, soft pastel claymation and frosted glass material shaders, octane render 8k, soft studio softbox lighting, clean modern 3D icon style, minimalist educational visualization, beautifully arranged components, blender 3d masterpiece',
      negative: '2D flat, photographic noise, grunge, harsh shadows, text, labels, typo, blurry, oversaturated, complex clutter',
      ar: '--ar 1:1',
      v: '--v 6.1 --stylize 180'
    },
    // 2-3. 실사 다큐멘터리
    documentary_photo: {
      name: '실사 다큐멘터리 (National Geographic Hyper-Realistic Photography)',
      positiveStyle: 'National Geographic documentary photography, cinematic natural light, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, hyper-realistic, ultra-detailed textures, breathtaking scientific realism, subtle depth of field, authentic educational photography, 8k resolution',
      negative: 'cartoon, CGI, illustration, 3D render, drawing, overexposed, fake, blurry, low resolution, watermark',
      ar: '--ar 16:9',
      v: '--v 6.1 --style raw --stylize 75'
    },
    // 2-4. 학생 친화형 웹툰/카툰
    student_webtoon: {
      name: '학생 친화형 웹툰/카툰 (Modern Friendly Webtoon Character)',
      positiveStyle: 'friendly modern Korean webtoon manhwa art style, expressive cute middle/high school student characters engaging in a classroom learning scene, bright pastel palette, clean digital cel-shading, cheerful and uplifting mood, approachable educational cartoon, crisp linework',
      negative: 'dark themes, mature content, scary, photorealistic, bad anatomy, deformed limbs, messy sketch, text bubble, watermark',
      ar: '--ar 16:9',
      v: '--v 6.1 --stylize 150'
    },
    // 2-5. 미니멀 인포그래픽
    minimal_infographic: {
      name: '미니멀 인포그래픽 (Minimalist Educational Infographic)',
      positiveStyle: 'clean minimalist educational infographic visual concept, Swiss design layout, geometric hierarchy, soft pastel color coding (lavender, mint, sky blue), vector art, flat 2.0 aesthetic, elegant balance of negative space, clear visual storytelling without lettering',
      negative: 'photorealistic, 3D render, messy textures, random text, unreadable typography, cluttered layout, noisy background',
      ar: '--ar 16:9',
      v: '--v 6.1 --stylize 100'
    }
  };

  function generateImagePrompt(ctx) {
    const styleInfo = ImageStyles[ctx.promptType] || ImageStyles.textbook_illustration;
    
    // 성취기준 내용에서 주요 시각적 키워드 및 장면 추론
    const coreConcept = ctx.standard.replace(/할 수 있다\.?/g, '').trim();
    
    return `당신은 2026년 최신 생성형 AI(Imagen 3, Midjourney v6.1, FLUX.1, DALL-E 3) 프롬프트 엔지니어이자 시각 교육자료 디자인 전문가입니다.
아래의 성취기준 및 수업 목표를 가장 직관적이고 미적으로 표현할 수 있는 최적화된 이미지 생성 프롬프트를 구성했습니다.

=======================================================
🎨 [수업 시각자료 제작 개요]
=======================================================
- 교과 및 과목: ${ctx.subjectGroup} - ${ctx.subject} (${ctx.schoolName})
- 성취기준: ${ctx.code} ${ctx.standard}
- 시각화 핵심 주제: ${coreConcept}
- 선택된 시각 스타일: ${styleInfo.name}
${ctx.additionalNote ? `- 교사 추가 요청사항: ${ctx.additionalNote}\n` : ''}

=======================================================
🤖 [AI 이미지 생성기 입력용 프롬프트 (영문 최적화)]
=======================================================
아래 프롬프트 블록을 복사하여 Midjourney, Imagen 3, FLUX, ChatGPT(DALL-E)에 그대로 입력하십시오.

Positive Prompt:
-------------------------------------------------------
An educational visual depiction of "${coreConcept}" designed for Korean ${ctx.schoolName} students, ${styleInfo.positiveStyle}, highly pedagogical, focal clarity, school curriculum topic from ${ctx.subject}, safe for education ${styleInfo.ar} ${styleInfo.v}
-------------------------------------------------------

Negative Prompt (스테이블 디퓨전 / FLUX / Imagen 3용):
-------------------------------------------------------
${styleInfo.negative}
-------------------------------------------------------

=======================================================
💡 [교사용 시각자료 활용 가이드]
=======================================================
1. 수업 도입 슬라이드: 단원의 첫 차시에서 학생들의 시각적 호기심을 자극하는 대표 배너로 활용하세요.
2. 탐구 활동지 삽화: 흑백 인쇄 시에도 명암 구분이 뚜렷하도록 인쇄 전 대비(Contrast)를 조절하면 좋습니다.
3. 텍스트 삽입 팁: 생성된 이미지 자체에는 글자가 들어가지 않도록 설계되었으므로, 미리캔버스·캔바(Canva)·파워포인트에서 교사가 원하는 한글 설명 상자나 화살표를 얹어서 사용하십시오.`;
  }

  // 메인 빌더 함수
  function generate(params) {
    const ctx = {
      curriculum: params.curriculum || '2022',
      curriculumName: params.curriculum === '2022' ? '2022 개정 교육과정' : '2015 개정 교육과정',
      school: params.school || 'm',
      schoolName: params.school === 'm' ? '중학교' : '고등학교',
      subjectGroup: params.subjectGroup || '교과군 미선택',
      subject: params.subject || '과목 미선택',
      domain: params.domain || '',
      code: params.code || '[성취기준 코드]',
      standard: params.standard || '성취기준을 선택해주세요.',
      gradeGroup: params.gradeGroup || '',
      level: params.level || (params.curriculum === '2022' ? 'A' : '상'),
      levelDesc: params.levelDesc || '선택한 수준에 해당하는 성취 설명입니다.',
      promptCategory: params.promptCategory || 'materials', // 'materials' | 'images'
      promptType: params.promptType || 'inquiry_worksheet',
      additionalNote: (params.additionalNote || '').trim()
    };

    let resultPrompt = '';
    let promptTitle = '';

    if (ctx.promptCategory === 'images') {
      const style = ImageStyles[ctx.promptType] || ImageStyles.textbook_illustration;
      promptTitle = `[수업 이미지] ${ctx.subject} - ${style.name}`;
      resultPrompt = generateImagePrompt(ctx);
    } else {
      const generator = MaterialGenerators[ctx.promptType] || MaterialGenerators.inquiry_worksheet;
      const typeNames = {
        inquiry_worksheet: '탐구 활동지',
        real_world_task: '실생활 연계 과제 & 수행평가',
        discussion_question: '생각열기 토의·토론 발문',
        formative_quiz: '개념 형성평가 & 퀴즈',
        student_record: '교과세특 예시 문구'
      };
      promptTitle = `[수업 자료] ${ctx.subject} - ${typeNames[ctx.promptType] || '맞춤형 프롬프트'}`;
      resultPrompt = generator(ctx);
    }

    return {
      title: promptTitle,
      text: resultPrompt,
      context: ctx
    };
  }

  return {
    generate: generate,
    imageStyles: ImageStyles
  };
})();

// 브라우저 및 Node.js 환경 호환
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
