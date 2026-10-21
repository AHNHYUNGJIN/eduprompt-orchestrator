/**
 * EduPrompt Studio - Prompt Orchestration Engine (2026 Standards)
 * 교과별 2022/2015 개정 성취기준 및 성취수준 기반 프롬프트 생성 엔진
 * 
 * [2026 이미지 AI 최적화 및 완전 분리 반영]
 * 1. 수업 자료 프롬프트 vs 수업 이미지 프롬프트의 완전한 물리적/논리적 분리
 * 2. 추상적 교육 목표의 구체적 시각화 (Visual Translation Engine)
 * 3. AI 모델별 전용 프롬프트 완벽 분리:
 *    - Google Gemini / Imagen 3
 *    - OpenAI ChatGPT / DALL-E 3
 *    - Anthropic Claude
 *    - Midjourney v6.1
 *    - Black Forest Labs FLUX.1
 */

const PromptEngine = (function () {
  'use strict';

  // =========================================================================
  // 1. 추상적 교육 목표 -> 구체적 시각 장면 변환 엔진 (Visual Translation)
  // =========================================================================
  const VisualTranslator = {
    // 키워드별 구체적 시각 행동, 인물, 사물, 배경 매핑 사전
    keywordsMap: [
      // 기술·가정 / 청소년 발달 / 자아존중감
      {
        patterns: [/자아\s*존중감/i, /정체성/i, /자아\s*탐색/i, /자기\s*이해/i, /발달/i],
        visualAction: 'a cheerful Korean middle school student looking at their reflection in a clean sunlit mirror with a warm confident smile, holding an open colorful growth journal, personal creative stickers on desk',
        setting: 'a bright cozy bedroom study corner, soft warm sunlight filtering through sheer curtains, gentle peaceful pastel atmosphere'
      },
      {
        patterns: [/가족/i, /식생활/i, /식사/i, /영양/i, /조리/i, /요리/i],
        visualAction: 'diverse family members happily preparing a vibrant healthy meal together in a modern kitchen, washing fresh crisp vegetables, cooking colorful dishes with smiling eye contact',
        setting: 'a well-lit modern home kitchen with wooden countertop, fresh ingredients neatly organized, inviting wholesome ambiance'
      },
      {
        patterns: [/주거/i, /공간/i, /생활용품/i, /디자인/i, /친환경/i],
        visualAction: 'students creating eco-friendly interior miniature architectural room models using light balsa wood and tiny green potted plants, measuring with wooden rulers',
        setting: 'a bright school design studio with large tables, sunny windows, clean minimalist aesthetic'
      },
      {
        patterns: [/기술\s*혁신/i, /로봇/i, /메이커/i, /수송\s*기술/i, /기계/i, /발명/i],
        visualAction: 'enthusiastic Korean students wearing safety goggles collaborating on assembling a miniature wooden solar-powered rover robot, circuit components on workbench',
        setting: 'a modern high-tech school makerspace laboratory, organized tool pegboards, warm LED desk lighting'
      },
      // 과학 교과
      {
        patterns: [/세포/i, /생명/i, /핵/i, /세포막/i, /미생물/i],
        visualAction: 'a vibrant translucent educational 3D cross-section model of a living plant cell, showing glowing green chloroplasts, smooth nucleus and layered cell wall in crystalline detail',
        setting: 'a clean futuristic biology science lab background with blurred glassware and soft studio illumination'
      },
      {
        patterns: [/지구/i, /지권/i, /암석/i, /판구조/i, /화산/i, /지진/i],
        visualAction: 'an educational 3D cutaway geological cross-section of planet Earth revealing distinct glowing layers: crust, flowing mantle, liquid outer core, and brilliant dense inner core',
        setting: 'isolated against a soft dark navy background, subtle educational studio lighting, pristine scientific clarity'
      },
      {
        patterns: [/태양계/i, /우주/i, /별/i, /은하/i, /행성/i],
        visualAction: 'an accurate scale model visualization of the solar system with rocky inner planets and gas giants with delicate rings, orbiting around a gently glowing Sun',
        setting: 'deep cosmic background filled with soft nebula dust and crisp distant stars, educational museum planetarium style'
      },
      {
        patterns: [/힘/i, /운동/i, /속력/i, /역학/i, /에너지/i],
        visualAction: 'high-speed aesthetic visualization of kinetic energy transfer with smooth multicolored acrylic spheres in motion, frictionless parabolic ramps, vector trajectory lines',
        setting: 'clean minimalist physics demonstration laboratory, softbox studio light'
      },
      // 사회 / 역사 / 도덕
      {
        patterns: [/민주/i, /선거/i, /의회/i, /정치/i, /시민/i, /참여/i],
        visualAction: 'engaged middle school students participating in a lively mock student council election, holding ballots and engaging in friendly respectful debate at a podium',
        setting: 'a bright contemporary civic debate hall, natural morning light through tall glass windows'
      },
      {
        patterns: [/역사/i, /문명/i, /조선/i, /고려/i, /유물/i, /실록/i],
        visualAction: 'historical Korean cultural artifacts, ancient hand-bound traditional paper book with brushed calligraphy and delicate blue-and-white Joseon porcelain vase gracefully displayed',
        setting: 'warm atmospheric museum exhibition gallery with dedicated soft spotlighting and wooden pedestals'
      },
      {
        patterns: [/인권/i, /평화/i, /공동체/i, /다문화/i, /배려/i],
        visualAction: 'a diverse group of cheerful students forming a supportive circle in a green school courtyard, holding hands and sharing friendly smiles under clear blue sky',
        setting: 'a lush green grassy school garden, blooming cherry blossom trees, uplifting sunny atmosphere'
      },
      // 국어 / 문학 / 언어
      {
        patterns: [/문학/i, /소설/i, /시/i, /이야기/i, /독서/i],
        visualAction: 'a contemplative student reading a beautifully bound illustrated storybook by a sunlit classroom library window, gentle breeze slightly turning pages, golden dust motes',
        setting: 'cozy wooden school library corner with bookshelves filled with colorful books, warm reading lamp'
      },
      {
        patterns: [/토의/i, /토론/i, /발표/i, /의사소통/i, /말하기/i],
        visualAction: 'students sitting around a round wooden discussion table, actively sharing ideas with polite gestures and engaged eye contact, smiling collaboratively',
        setting: 'bright open learning lounge with pastel lounge chairs and writable glass boards in background'
      },
      // 수학
      {
        patterns: [/도형/i, /기하/i, /삼각형/i, /피타고라스/i, /입체/i],
        visualAction: 'elegant translucent pastel geometric solids: icosahedron, dodecahedron, and glowing spiral golden ratio curves delicately arranged on an architect wooden drawing board',
        setting: 'minimalist design studio, architectural blueprints with clean compass and ruler in soft focus'
      },
      {
        patterns: [/함수/i, /그래프/i, /통계/i, /확률/i, /데이터/i],
        visualAction: 'aesthetic 3D floating mathematical coordinate planes with gentle pastel curved function ribbons, translucent bar charts gracefully ascending',
        setting: 'clean white infographic studio background with soft diffuse shadows'
      },
      // 정보 / 인공지능 / 소프트웨어
      {
        patterns: [/알고리즘/i, /인공지능/i, /코딩/i, /데이터/i, /프로그래밍/i, /네트워크/i],
        visualAction: 'curious students looking at a sleek monitor displaying friendly colorful block-based programming logic, building a smart digital plant watering sensor device',
        setting: 'bright modern computer science classroom, clean desk, soft teal and purple ambient lighting'
      },
      // 체육 / 보건
      {
        patterns: [/운동/i, /건강/i, /체력/i, /스포츠/i, /경기/i, /육상/i],
        visualAction: 'dynamic energetic middle school students participating in a friendly track and field relay race, passing a silver baton with focused smiling determination',
        setting: 'sunny school athletic stadium with clean red polyurethane running track, clear open sky'
      },
      // 음악 / 미술
      {
        patterns: [/음악/i, /악기/i, /연주/i, /합창/i, /리듬/i],
        visualAction: 'students joyfully playing acoustic musical instruments: classical guitar, flute, and xylophone together in an ensemble, harmonious body language',
        setting: 'acoustically treated warm wooden school music hall with grand piano in background'
      },
      {
        patterns: [/미술/i, /그림/i, /조소/i, /회화/i, /작품/i, /색채/i],
        visualAction: 'students in aprons joyfully painting vibrant pastel canvases on wooden easels, holding paint palettes and wooden brushes, creative atmosphere',
        setting: 'sun-drenched art studio with high ceilings, colorful paint splashes, creative organized shelves'
      }
    ],

    // 성취기준과 교과 텍스트를 기반으로 시각적 장면으로 번역
    translate: function (standardText, subjectGroup, subject, schoolName) {
      const fullText = `${subjectGroup} ${subject} ${standardText}`;
      
      for (const item of this.keywordsMap) {
        for (const pattern of item.patterns) {
          if (pattern.test(fullText)) {
            return {
              action: item.visualAction,
              setting: item.setting
            };
          }
        }
      }

      // 일치하는 특정 키워드가 없을 때의 정교한 기본 교육 장면
      return {
        action: `Korean ${schoolName} students actively collaborating on an engaging hands-on learning activity for ${subject}, observing educational models and charts on a clean table, enthusiastic and curious facial expressions`,
        setting: 'a modern, bright, well-organized Korean school classroom with soft morning sunlight, inspiring and warm educational atmosphere'
      };
    }
  };

  // =========================================================================
  // 2. 5대 시각 화풍 스타일 정의
  // =========================================================================
  const ImageStyles = {
    // 2-1. 교과서 감성 일러스트
    textbook_illustration: {
      name: '교과서 감성 일러스트 (Soft Watercolor & Clean Line Art)',
      shortName: '교과서 일러스트',
      positiveStyle: 'educational textbook illustration style, soft pastel watercolor texture, clean fine ink outline, warm and inviting atmosphere, educational diagram aesthetic, high visual clarity, gentle natural lighting, Korean textbook mood, masterwork',
      negative: 'photorealistic, low quality, messy lines, dark creepy mood, text, watermark, signature, grotesque, distorted anatomy, oversaturated neon colors'
    },
    // 2-2. 3D 입체 다이어그램
    '3d_diagram': {
      name: '3D 입체 다이어그램 (Isometric Clay & Frosted Glass)',
      shortName: '3D 다이어그램',
      positiveStyle: 'isometric 3D educational cutaway diagram, cross-section view, soft pastel claymation and frosted glass material shaders, octane render 8k, soft studio softbox lighting, clean modern 3D icon style, minimalist educational visualization, beautifully arranged components, blender 3d masterpiece',
      negative: '2D flat, photographic noise, grunge, harsh shadows, text, labels, typo, blurry, oversaturated, complex clutter'
    },
    // 2-3. 실사 다큐멘터리
    documentary_photo: {
      name: '실사 다큐멘터리 (National Geographic Hyper-Realistic Photography)',
      shortName: '실사 다큐멘터리',
      positiveStyle: 'National Geographic documentary photography, cinematic natural light, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, hyper-realistic, ultra-detailed textures, breathtaking scientific realism, subtle depth of field, authentic educational photography, 8k resolution',
      negative: 'cartoon, CGI, illustration, 3D render, drawing, overexposed, fake, blurry, low resolution, watermark'
    },
    // 2-4. 학생 친화형 웹툰/카툰
    student_webtoon: {
      name: '학생 친화형 웹툰/카툰 (Modern Friendly Webtoon Character)',
      shortName: '학생 친화형 웹툰',
      positiveStyle: 'friendly modern Korean webtoon manhwa art style, expressive cheerful middle and high school student characters engaging in a classroom learning scene, bright pastel palette, clean digital cel-shading, uplifting mood, approachable educational cartoon, crisp linework',
      negative: 'dark themes, mature content, scary, photorealistic, bad anatomy, deformed limbs, messy sketch, text bubble, watermark'
    },
    // 2-5. 미니멀 인포그래픽
    minimal_infographic: {
      name: '미니멀 인포그래픽 (Minimalist Educational Infographic)',
      shortName: '미니멀 인포그래픽',
      positiveStyle: 'clean minimalist educational infographic visual concept, Swiss design layout, geometric hierarchy, soft pastel color coding (lavender, mint, sky blue), vector art, flat 2.0 aesthetic, elegant balance of negative space, clear visual storytelling',
      negative: 'photorealistic, 3D render, messy textures, random text, unreadable typography, cluttered layout, noisy background'
    }
  };

  // =========================================================================
  // 3. 모델별 전용 프롬프트 생성기 (Gemini, DALL-E, Claude, Midjourney, FLUX)
  // =========================================================================
  const ModelPromptBuilders = {
    // 3-1. Google Gemini / Imagen 3
    gemini: function (ctx, style, visual) {
      return `A high-quality educational visual for a Korean ${ctx.schoolName} ${ctx.subject} lesson.
Scene: ${visual.action}.
Setting: ${visual.setting}.
Art Style: ${style.positiveStyle}.
Composition & Quality: Wide 16:9 aspect ratio, eye-level cinematic shot, vibrant yet soft pastel color palette, crystal-clear subject focus, educational clarity.
Strict Requirement: Absolutely NO text, NO labels, NO typography, NO letters, NO words, NO watermark anywhere in the image. Clean pictorial scene only.

Negative Prompt:
${style.negative}, text, letters, Korean characters, English words, typography, watermark, logo, banner, signs with words`;
    },

    // 3-2. OpenAI ChatGPT / DALL-E 3
    dalle: function (ctx, style, visual) {
      return `Please generate a wide 16:9 educational illustration for a Korean ${ctx.schoolName} ${ctx.subject} class.

Visual Description:
${visual.action}, set in ${visual.setting}.

Art Style & Aesthetic:
${style.positiveStyle}. The lighting should be gentle and bright with a warm educational mood. The colors should be soft harmonious pastels.

Critical Negative Instruction:
Please ensure this image contains zero text. Do NOT include any Korean letters, English words, labels, charts with writing, captions, or typography. The visual storytelling must be purely pictorial and wordless.`;
    },

    // 3-3. Anthropic Claude (디자인 & 교수학습자료 연계 메타 프롬프트)
    claude: function (ctx, style, visual) {
      return `당신은 대한민국 2022/2015 개정 교육과정 기반 수업 시각자료 디자인 및 교수학습 설계 전문가입니다.
현재 ${ctx.curriculumName} [${ctx.code} ${ctx.standard}] 성취기준(목표 성취수준: ${ctx.level})을 다루는 수업을 준비 중입니다.

아래 시각화 장면 기획안을 바탕으로 교수학습 방안을 완성해 주십시오:

1. 시각 자료 콘셉트:
   - 교과 / 과목: ${ctx.subjectGroup} - ${ctx.subject} (${ctx.schoolName})
   - 시각화 핵심 장면: ${visual.action}
   - 배경 및 분위기: ${visual.setting}
   - 화풍 스타일: ${style.name}

2. 요청 산출물:
   - (1) 이 시각 자료를 수업 도입(생각열기 5분)에 띄웠을 때 학생들의 흥미를 유발하는 교사의 도입 발문 3가지
   - (2) 이미지 생성 AI(Imagen 3, DALL-E 3, Midjourney)에 바로 넣을 수 있는 정교화된 영문 프롬프트 (글자 없는 순수 이미지)
   - (3) 시각 자료와 연계된 [성취수준 ${ctx.level}] 도달용 학생 모둠 탐구 과제 1개`;
    },

    // 3-4. Midjourney v6.1
    midjourney: function (ctx, style, visual) {
      return `/imagine prompt: ${visual.action}, ${visual.setting}, ${style.positiveStyle}, Korean ${ctx.schoolName} curriculum educational visual, high aesthetic, clean composition, soft pastel color grading, 8k resolution --ar 16:9 --v 6.1 --style raw --stylize 120 --no text, letters, Korean, typography, words, labels, watermark, signature, speech bubbles`;
    },

    // 3-5. Black Forest Labs FLUX.1
    flux: function (ctx, style, visual) {
      return `Prompt:
An educational masterpiece depicting ${visual.action}. Setting is ${visual.setting}. ${style.positiveStyle}. Cinematic wide angle, crisp focal details, delicate ambient lighting, balanced negative space, wordless visual narrative, clean non-commercial education illustration.

Negative Prompt:
${style.negative}, text, watermark, typography, characters, unreadable letters, messy scribbles, banner, watermark`;
    }
  };

  // =========================================================================
  // 4. 수업 자료 생성기 (순수 수업 자료만 출력)
  // =========================================================================
  const MaterialGenerators = {
    // 4-1. 탐구 활동지 (도입-전개-정리-발문 구조)
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
   - 사전 지식 점검 및 학습 동기 유발 자료 설명
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

    // 4-2. 실생활 연계 과제 & 수행평가
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

    // 4-3. 생각열기 토의·토론 발문
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

    // 4-4. 개념 형성평가 & 피드백 퀴즈
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
- 오답 매력도 분석 및 선지별 상세 해설
- 학생 맞춤형 즉각 피드백 코멘트`;
    },

    // 4-5. 성취수준 기반 교과세특 문구 예시
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

  // =========================================================================
  // 5. 프롬프트 동시 생성 (수업 자료 프롬프트 + 이미지 프롬프트 독립 객체 반환)
  // =========================================================================
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
      materialType: params.materialType || 'inquiry_worksheet',
      imageStyleType: params.imageStyleType || 'textbook_illustration',
      targetImageModel: params.targetImageModel || 'gemini', // 'gemini' | 'dalle' | 'claude' | 'midjourney' | 'flux'
      additionalNote: (params.additionalNote || '').trim()
    };

    // 1. 수업 자료 프롬프트 생성 (완전 독립)
    const materialGenerator = MaterialGenerators[ctx.materialType] || MaterialGenerators.inquiry_worksheet;
    const materialTypeNames = {
      inquiry_worksheet: '탐구 활동지',
      real_world_task: '실생활 연계 과제 & 수행평가',
      discussion_question: '생각열기 토의·토론 발문',
      formative_quiz: '개념 형성평가 & 퀴즈',
      student_record: '교과세특 예시 문구'
    };
    const materialPrompt = materialGenerator(ctx);
    const materialTitle = `[수업 자료] ${ctx.subject} - ${materialTypeNames[ctx.materialType] || '맞춤형 프롬프트'}`;

    // 2. 수업 이미지 프롬프트 생성 (Visual Translation & 모델별 완전 독립)
    const imageStyle = ImageStyles[ctx.imageStyleType] || ImageStyles.textbook_illustration;
    const visual = VisualTranslator.translate(ctx.standard, ctx.subjectGroup, ctx.subject, ctx.schoolName);
    const imageModelNames = {
      gemini: 'Google Gemini / Imagen 3',
      dalle: 'ChatGPT / DALL-E 3',
      claude: 'Anthropic Claude',
      midjourney: 'Midjourney v6.1',
      flux: 'FLUX.1'
    };
    
    // 모델별 프롬프트 사전 생성 (필요 시 즉시 전환)
    const imagePromptsByModel = {
      gemini: ModelPromptBuilders.gemini(ctx, imageStyle, visual),
      dalle: ModelPromptBuilders.dalle(ctx, imageStyle, visual),
      claude: ModelPromptBuilders.claude(ctx, imageStyle, visual),
      midjourney: ModelPromptBuilders.midjourney(ctx, imageStyle, visual),
      flux: ModelPromptBuilders.flux(ctx, imageStyle, visual)
    };

    const currentImagePrompt = imagePromptsByModel[ctx.targetImageModel] || imagePromptsByModel.gemini;
    const imageTitle = `[수업 이미지] ${ctx.subject} - ${imageStyle.shortName} (${imageModelNames[ctx.targetImageModel] || 'Gemini'})`;

    return {
      context: ctx,
      // 수업 자료 전용
      material: {
        title: materialTitle,
        text: materialPrompt,
        typeName: materialTypeNames[ctx.materialType]
      },
      // 이미지 전용
      image: {
        title: imageTitle,
        text: currentImagePrompt,
        promptsByModel: imagePromptsByModel,
        visualScene: visual,
        styleName: imageStyle.shortName,
        modelName: imageModelNames[ctx.targetImageModel]
      }
    };
  }

  return {
    generate: generate,
    imageStyles: ImageStyles,
    visualTranslator: VisualTranslator,
    modelPromptBuilders: ModelPromptBuilders
  };
})();

// 브라우저 및 Node.js 환경 호환
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
