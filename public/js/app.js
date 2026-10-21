/**
 * EduPrompt Studio - Main Application Logic
 * UI Interactions, 0ms In-Memory Data Filtering, Real-time Prompt Sync
 */

(function () {
  'use strict';

  // 애플리케이션 상태 (Single Source of Truth)
  const state = {
    curriculum: '2022',
    school: 'm',
    subjectGroup: '',
    subject: '',
    selectedStandard: null,
    level: 'A',
    promptCategory: 'materials', // 'materials' | 'images'
    promptType: 'inquiry_worksheet',
    additionalNote: '',
    searchQuery: '',
    isLoading: false
  };

  // 인메모리 데이터 캐시
  let metaData = null;
  const standardsCache = {};
  let currentStandardsList = [];

  // 기본 폴백 데이터 (오프라인 / file:// 프로토콜 대비)
  const fallbackStandards = [
    {
      subject_group: "과학",
      subject: "과학",
      domain: "지구와 우주",
      code: "[9과01-01]",
      standard: "지구계의 구성 요소를 알고, 지권의 층상 구조와 그 특징을 설명할 수 있다.",
      grade_group: "중1~3",
      explanation: "지구계가 직권, 수권, 기권, 생물권, 외권의 상호작용으로 이루어져 있음을 이해하고 지권 내부 구조의 특징을 탐구한다.",
      levels: {
        "A": "지구계의 각 권역 간 상호작용의 구체적 사례를 분석하고, 지권의 층상 구조(지각, 맨틀, 외핵, 내핵)의 물리적 특징과 연구 방법을 논리적으로 설명할 수 있다.",
        "B": "지구계의 구성 요소를 이해하고, 지권의 층상 구조와 각 층의 주요 특징을 체계적으로 설명할 수 있다.",
        "C": "지구계의 구성 요소를 알고, 지권의 층상 구조를 구분하여 제시할 수 있다.",
        "D": "지구계의 구성 요소를 말할 수 있으며, 지권이 여러 층으로 나뉘어 있음을 안다.",
        "E": "지구계의 구성 요소 중 일부를 나열할 수 있다."
      }
    },
    {
      subject_group: "국어",
      subject: "국어",
      domain: "문학",
      code: "[9국05-01]",
      standard: "문학 작품에 드러난 인물의 삶을 바탕으로 자신의 삶을 성찰할 수 있다.",
      grade_group: "중1~3",
      explanation: "작품 속 인물의 갈등 상황과 선택을 자신의 삶의 태도와 연결 지어 성찰적인 독서를 실천하도록 지도한다.",
      levels: {
        "A": "작품 속 인물의 가치관과 삶의 방식을 사회문화적 맥락과 연관 지어 깊이 있게 평가하고, 이를 자신의 삶에 주체적으로 적용하여 성찰적 글을 완성할 수 있다.",
        "B": "문학 작품에 드러난 인물의 태도와 갈등을 파악하고, 이를 바탕으로 자신의 경험과 생각을 비교하여 성찰할 수 있다.",
        "C": "작품 속 인물의 행동과 삶의 모습을 이해하고, 자신의 생각과 견주어 볼 수 있다.",
        "D": "작품 속 인물이 처한 상황을 파악할 수 있다.",
        "E": "작품에 등장하는 인물의 이름을 말할 수 있다."
      }
    },
    {
      subject_group: "수학",
      subject: "수학",
      domain: "문자와 식",
      code: "[9수02-04]",
      standard: "일차방정식을 풀 수 있고, 이를 활용하여 실생활 문제를 해결할 수 있다.",
      grade_group: "중1~3",
      explanation: "등식의 성질을 바탕으로 일차방정식의 해를 구하고, 일상생활의 다양한 문제를 방정식으로 모델링하여 해결하는 역량을 기른다.",
      levels: {
        "A": "실생활의 복합적인 상황을 분석하여 스스로 일차방정식으로 수식화하고, 해의 적절성을 맥락에 맞게 검증 및 설명할 수 있다.",
        "B": "다양한 실생활 문제를 일차방정식으로 나타내고 정확하게 해를 구할 수 있다.",
        "C": "간단한 일차방정식을 풀고, 기초적인 실생활 문제에 적용할 수 있다.",
        "D": "등식의 성질을 이용하여 계수가 정수인 일차방정식을 풀 수 있다.",
        "E": "일차방정식의 뜻을 알고 주어진 값을 대입하여 참과 거짓을 판별할 수 있다."
      }
    }
  ];

  // DOM 요소 캐시
  const elements = {};

  // 초기화 진입점
  document.addEventListener('DOMContentLoaded', async () => {
    cacheDomElements();
    setupEventListeners();
    await loadInitialData();
  });

  function cacheDomElements() {
    elements.btnCurr2022 = document.getElementById('btn-curr-2022');
    elements.btnCurr2015 = document.getElementById('btn-curr-2015');
    elements.btnSchoolM = document.getElementById('btn-school-m');
    elements.btnSchoolH = document.getElementById('btn-school-h');
    elements.groupChipsContainer = document.getElementById('group-chips');
    elements.subjectChipsContainer = document.getElementById('subject-chips');
    elements.standardsListContainer = document.getElementById('standards-list');
    elements.standardsCount = document.getElementById('standards-count');
    elements.searchInput = document.getElementById('search-input');
    elements.levelButtonsContainer = document.getElementById('level-buttons');
    elements.levelDescBox = document.getElementById('level-desc-box');
    elements.levelDescText = document.getElementById('level-desc-text');
    
    elements.tabMaterials = document.getElementById('tab-materials');
    elements.tabImages = document.getElementById('tab-images');
    elements.typeContainer = document.getElementById('type-container');
    elements.additionalNoteInput = document.getElementById('additional-note');
    
    // Output Panel
    elements.promptTitle = document.getElementById('prompt-title');
    elements.promptEditor = document.getElementById('prompt-editor');
    elements.badgeCurriculum = document.getElementById('badge-curriculum');
    elements.badgeSubject = document.getElementById('badge-subject');
    elements.badgeStandard = document.getElementById('badge-standard');
    elements.badgeLevel = document.getElementById('badge-level');
    
    // Actions
    elements.btnCopy = document.getElementById('btn-copy');
    elements.btnDownloadTxt = document.getElementById('btn-download-txt');
    elements.btnDownloadMd = document.getElementById('btn-download-md');
    elements.btnChatGpt = document.getElementById('btn-chatgpt');
    elements.btnClaude = document.getElementById('btn-claude');
    elements.btnGemini = document.getElementById('btn-gemini');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toast-message');
    
    // Preset buttons
    elements.presetBtns = document.querySelectorAll('[data-preset]');
  }

  function setupEventListeners() {
    // Step 1: 교육과정 & 학교급 전환
    elements.btnCurr2022.addEventListener('click', () => switchCurriculum('2022'));
    elements.btnCurr2015.addEventListener('click', () => switchCurriculum('2015'));
    elements.btnSchoolM.addEventListener('click', () => switchSchool('m'));
    elements.btnSchoolH.addEventListener('click', () => switchSchool('h'));

    // Step 4: 실시간 검색
    let searchDebounceTimer;
    elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderStandardsList();
      }, 100);
    });

    // Step 6: 탭 전환 (수업 자료 vs 수업 이미지)
    elements.tabMaterials.addEventListener('click', () => switchPromptCategory('materials'));
    elements.tabImages.addEventListener('click', () => switchPromptCategory('images'));

    // 추가 요청사항 입력 시 실시간 반영
    elements.additionalNoteInput.addEventListener('input', (e) => {
      state.additionalNote = e.target.value;
      updatePromptOutput();
    });

    // 액션 버튼
    elements.btnCopy.addEventListener('click', copyPromptToClipboard);
    elements.btnDownloadTxt.addEventListener('click', () => downloadPromptFile('txt'));
    elements.btnDownloadMd.addEventListener('click', () => downloadPromptFile('md'));
    elements.btnChatGpt.addEventListener('click', () => openAiService('chatgpt'));
    elements.btnClaude.addEventListener('click', () => openAiService('claude'));
    elements.btnGemini.addEventListener('click', () => openAiService('gemini'));

    // 프리셋 버튼
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });
  }

  // 데이터 로드
  async function loadInitialData() {
    try {
      const resp = await fetch('data/meta.json');
      if (resp.ok) {
        metaData = await resp.json();
      }
    } catch (e) {
      console.warn('meta.json fetch failed, using internal metadata fallback:', e);
    }

    await loadStandardsData(state.curriculum, state.school);
  }

  async function loadStandardsData(curriculum, school) {
    const key = `${curriculum}_${school}`;
    if (!standardsCache[key]) {
      const fileName = `data/standards_${curriculum}_${school}.json`;
      try {
        const resp = await fetch(fileName);
        if (resp.ok) {
          standardsCache[key] = await resp.json();
        } else {
          standardsCache[key] = fallbackStandards;
        }
      } catch (err) {
        console.warn(`Failed to fetch ${fileName}, fallback applied:`, err);
        standardsCache[key] = fallbackStandards;
      }
    }

    currentStandardsList = standardsCache[key] || [];
    renderGroupChips();
  }

  // Step 1: 스위치 함수
  async function switchCurriculum(curr) {
    if (state.curriculum === curr) return;
    state.curriculum = curr;
    
    // 버튼 스타일 동기화
    if (curr === '2022') {
      elements.btnCurr2022.classList.add('active');
      elements.btnCurr2015.classList.remove('active');
      state.level = 'A';
    } else {
      elements.btnCurr2015.classList.add('active');
      elements.btnCurr2022.classList.remove('active');
      state.level = '상';
    }
    
    renderLevelButtons();
    await loadStandardsData(state.curriculum, state.school);
  }

  async function switchSchool(sch) {
    if (state.school === sch) return;
    state.school = sch;

    if (sch === 'm') {
      elements.btnSchoolM.classList.add('active');
      elements.btnSchoolH.classList.remove('active');
    } else {
      elements.btnSchoolH.classList.add('active');
      elements.btnSchoolM.classList.remove('active');
    }

    await loadStandardsData(state.curriculum, state.school);
  }

  // Step 2: 교과군 칩 렌더링
  function renderGroupChips() {
    const groupsSet = new Set();
    currentStandardsList.forEach(item => {
      if (item.subject_group) groupsSet.add(item.subject_group);
    });

    // 대표 교과 우선순위 정렬
    const priority = ['국어', '수학', '영어', '사회', '사회(역사/도덕 포함)', '과학', '체육', '예술(음악/미술)', '음악', '미술', '기술·가정', '기술·가정/정보', '정보', '제2외국어', '한문', '교양'];
    const groups = Array.from(groupsSet).sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, 'ko');
    });

    if (groups.length === 0) {
      groups.push('과학', '국어', '수학');
    }

    // 기본 선택
    if (!state.subjectGroup || !groups.includes(state.subjectGroup)) {
      state.subjectGroup = groups[0];
    }

    elements.groupChipsContainer.innerHTML = '';
    groups.forEach(grp => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${grp === state.subjectGroup ? 'active' : ''}`;
      btn.innerHTML = `<span>${grp}</span>`;
      btn.addEventListener('click', () => {
        state.subjectGroup = grp;
        renderGroupChips();
        renderSubjectChips();
      });
      elements.groupChipsContainer.appendChild(btn);
    });

    renderSubjectChips();
  }

  // Step 3: 과목 칩 렌더링
  function renderSubjectChips() {
    const subjectsSet = new Set();
    currentStandardsList
      .filter(item => item.subject_group === state.subjectGroup)
      .forEach(item => {
        if (item.subject) subjectsSet.add(item.subject);
      });

    const subjects = Array.from(subjectsSet).sort((a, b) => a.localeCompare(b, 'ko'));
    if (subjects.length === 0) {
      subjects.push(state.subjectGroup);
    }

    if (!state.subject || !subjects.includes(state.subject)) {
      state.subject = subjects[0];
    }

    elements.subjectChipsContainer.innerHTML = '';
    subjects.forEach(sbj => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${sbj === state.subject ? 'active' : ''}`;
      btn.textContent = sbj;
      btn.addEventListener('click', () => {
        state.subject = sbj;
        renderSubjectChips();
        renderStandardsList();
      });
      elements.subjectChipsContainer.appendChild(btn);
    });

    renderStandardsList();
  }

  // Step 4: 성취기준 목록 렌더링
  function renderStandardsList() {
    let filtered = currentStandardsList.filter(item => {
      const matchesGroup = item.subject_group === state.subjectGroup;
      const matchesSubject = item.subject === state.subject;
      return matchesGroup && matchesSubject;
    });

    // 검색어 필터링
    if (state.searchQuery) {
      filtered = filtered.filter(item => {
        const text = `${item.code} ${item.standard} ${item.domain || ''} ${item.explanation || ''}`.toLowerCase();
        return text.includes(state.searchQuery);
      });
    }

    elements.standardsCount.textContent = `${filtered.length}건`;

    elements.standardsListContainer.innerHTML = '';
    if (filtered.length === 0) {
      elements.standardsListContainer.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-sm">
          <p>선택하신 조건에 부합하는 성취기준이 없습니다.</p>
          <p class="text-xs mt-1 text-slate-300">검색어를 지우거나 다른 과목을 선택해보세요.</p>
        </div>
      `;
      state.selectedStandard = null;
      updatePromptOutput();
      return;
    }

    // 선택된 성취기준이 현재 목록에 없으면 첫 번째 선택
    const exists = state.selectedStandard && filtered.some(i => i.code === state.selectedStandard.code);
    if (!exists) {
      state.selectedStandard = filtered[0];
    }

    filtered.forEach(item => {
      const isSelected = state.selectedStandard && state.selectedStandard.code === item.code;
      const card = document.createElement('div');
      card.className = `standard-item ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}">
              ${item.code}
            </span>
            ${item.domain ? `<span class="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">${item.domain}</span>` : ''}
            ${item.grade_group ? `<span class="inline-block px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">${item.grade_group}</span>` : ''}
          </div>
          <div class="w-5 h-5 flex items-center justify-center shrink-0">
            ${isSelected ? '<span class="text-indigo-600 text-sm font-bold">✓</span>' : '<span class="text-slate-300 text-xs">○</span>'}
          </div>
        </div>
        <p class="text-sm font-medium ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'} leading-relaxed">
          ${highlightKeyword(item.standard, state.searchQuery)}
        </p>
      `;

      card.addEventListener('click', () => {
        state.selectedStandard = item;
        renderStandardsList();
        renderLevelButtons();
        updatePromptOutput();
      });

      elements.standardsListContainer.appendChild(card);
    });

    renderLevelButtons();
    updatePromptOutput();
  }

  function highlightKeyword(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-amber-100 text-amber-900 rounded px-0.5">$1</mark>');
  }

  // Step 5: 성취수준 버튼 렌더링
  function renderLevelButtons() {
    const is2022 = state.curriculum === '2022';
    const levels = is2022 ? ['A', 'B', 'C', 'D', 'E'] : ['상', '중', '하'];
    const levelLabels2022 = {
      'A': '심화·종합',
      'B': '우수·적용',
      'C': '기본·이해',
      'D': '보충',
      'E': '기초'
    };
    const levelLabels2015 = {
      '상': '심화·적용',
      '중': '기본·이해',
      '하': '보충·인지'
    };

    if (!levels.includes(state.level)) {
      state.level = levels[0];
    }

    elements.levelButtonsContainer.innerHTML = '';
    levels.forEach(lvl => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `level-btn ${lvl === state.level ? 'active' : ''}`;
      
      const subLabel = is2022 ? levelLabels2022[lvl] : levelLabels2015[lvl];
      btn.innerHTML = `
        <span class="level-tag text-base font-bold text-slate-800">${lvl}</span>
        <span class="text-[11px] text-slate-500 mt-0.5 font-medium">${subLabel}</span>
      `;

      btn.addEventListener('click', () => {
        state.level = lvl;
        renderLevelButtons();
        updatePromptOutput();
      });

      elements.levelButtonsContainer.appendChild(btn);
    });

    // 선택된 수준의 성취기준 상세 설명 표시
    updateLevelDescription();
  }

  function updateLevelDescription() {
    const std = state.selectedStandard;
    let desc = '';
    if (std && std.levels && std.levels[state.level]) {
      desc = std.levels[state.level];
    } else if (std && std.levels) {
      const available = Object.keys(std.levels);
      if (available.length > 0) {
        desc = `(해당 성취기준은 [${available.join(', ')}] 수준 기술을 제공합니다)`;
      } else {
        desc = '해당 성취기준에 명시된 상세 성취수준 정보가 없습니다.';
      }
    } else {
      desc = '성취기준을 선택하시면 수준별 상세 도달 기준이 여기에 표시됩니다.';
    }

    elements.levelDescText.textContent = desc;
  }

  // Step 6: 프롬프트 유형 및 카테고리
  function switchPromptCategory(category) {
    state.promptCategory = category;
    if (category === 'materials') {
      elements.tabMaterials.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
      elements.tabMaterials.classList.remove('text-slate-500');
      elements.tabImages.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm');
      elements.tabImages.classList.add('text-slate-500');
      state.promptType = 'inquiry_worksheet';
    } else {
      elements.tabImages.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
      elements.tabImages.classList.remove('text-slate-500');
      elements.tabMaterials.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm');
      elements.tabMaterials.classList.add('text-slate-500');
      state.promptType = 'textbook_illustration';
    }

    renderTypeCards();
    updatePromptOutput();
  }

  function renderTypeCards() {
    elements.typeContainer.innerHTML = '';

    const materialTypes = [
      { id: 'inquiry_worksheet', icon: '📄', title: '탐구 활동지', desc: '도입-전개-정리-발문 구조의 참여형 활동지' },
      { id: 'real_world_task', icon: '🌍', title: '실생활 연계 과제', desc: 'GRASPS 기반 수행평가 프로젝트 및 루브릭' },
      { id: 'discussion_question', icon: '💡', title: '생각열기 토의 발문', desc: '비판적 사고를 여는 소크라테스식 발문 세트' },
      { id: 'formative_quiz', icon: '✍️', title: '개념 형성평가 퀴즈', desc: '선다형·서술형 4문항 및 오개념 교정 피드백' },
      { id: 'student_record', icon: '📋', title: '교과세특 예시 문구', desc: '학생부 기재요령 준수 역량 기반 세특 3세트' }
    ];

    const imageTypes = [
      { id: 'textbook_illustration', icon: '🎨', title: '교과서 감성 일러스트', desc: '수채화 질감 및 깔끔한 라인 아트 교육 삽화' },
      { id: '3d_diagram', icon: '🧊', title: '3D 입체 다이어그램', desc: '클레이 & 글래스 재질의 아이소메트릭 단면도' },
      { id: 'documentary_photo', icon: '📷', title: '실사 다큐멘터리', desc: '내셔널 지오그래픽 풍 8K 초고화질 다큐 포토' },
      { id: 'student_webtoon', icon: '💬', title: '학생 친화형 웹툰/카툰', desc: '생동감 넘치는 만화 캐릭터와 학습 상황 씬' },
      { id: 'minimal_infographic', icon: '📊', title: '미니멀 인포그래픽', desc: '파스텔 컬러 코딩의 깔끔한 스위스 스타일 도식' }
    ];

    const currentList = state.promptCategory === 'materials' ? materialTypes : imageTypes;

    currentList.forEach(t => {
      const isSelected = state.promptType === t.id;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `type-card-btn ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <span class="text-2xl">${t.icon}</span>
        <div class="flex-1">
          <p class="type-title text-sm font-semibold text-slate-800">${t.title}</p>
          <p class="text-xs text-slate-500 mt-0.5">${t.desc}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        state.promptType = t.id;
        renderTypeCards();
        updatePromptOutput();
      });

      elements.typeContainer.appendChild(card);
    });
  }

  // 프롬프트 결과 실시간 생성 및 에디터 동기화
  function updatePromptOutput() {
    const std = state.selectedStandard;
    const levelDesc = (std && std.levels && std.levels[state.level]) || '선택한 성취수준 내용';

    const params = {
      curriculum: state.curriculum,
      school: state.school,
      subjectGroup: state.subjectGroup,
      subject: state.subject,
      domain: std ? std.domain : '',
      code: std ? std.code : '[성취기준]',
      standard: std ? std.standard : '성취기준을 선택해주세요.',
      gradeGroup: std ? std.grade_group : '',
      level: state.level,
      levelDesc: levelDesc,
      promptCategory: state.promptCategory,
      promptType: state.promptType,
      additionalNote: state.additionalNote
    };

    const generated = PromptEngine.generate(params);

    // 상단 뱃지 갱신
    elements.badgeCurriculum.textContent = `${state.curriculum} 개정 (${state.school === 'm' ? '중' : '고'})`;
    elements.badgeSubject.textContent = `${state.subjectGroup} > ${state.subject}`;
    elements.badgeStandard.textContent = std ? std.code : '성취기준 미선택';
    elements.badgeLevel.textContent = `수준 ${state.level}`;

    // 제목 및 프롬프트 본문 갱신
    elements.promptTitle.textContent = generated.title;
    elements.promptEditor.value = generated.text;
  }

  // 클립보드 복사
  async function copyPromptToClipboard() {
    const text = elements.promptEditor.value;
    if (!text) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        elements.promptEditor.select();
        document.execCommand('copy');
      }
      showToast('✨ 프롬프트가 클립보드에 복사되었습니다! 원하는 AI에 바로 붙여넣기(Ctrl+V)하세요.');
    } catch (err) {
      elements.promptEditor.select();
      document.execCommand('copy');
      showToast('✨ 프롬프트가 복사되었습니다!');
    }
  }

  // 파일 다운로드
  function downloadPromptFile(ext) {
    const text = elements.promptEditor.value;
    if (!text) return;

    const stdCode = (state.selectedStandard && state.selectedStandard.code) || '성취기준';
    const cleanCode = stdCode.replace(/[\[\]]/g, '');
    const filename = `EduPrompt_${state.subject}_${cleanCode}_수준${state.level}.${ext}`;

    const blob = new Blob([text], { type: ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`💾 파일이 다운로드되었습니다: ${filename}`);
  }

  // 외부 AI 서비스 바로가기
  function openAiService(service) {
    copyPromptToClipboard();
    let url = '';
    if (service === 'chatgpt') {
      url = 'https://chatgpt.com/';
    } else if (service === 'claude') {
      url = 'https://claude.ai/new';
    } else if (service === 'gemini') {
      url = 'https://gemini.google.com/app';
    }

    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);
  }

  // 토스트 메시지
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.classList.add('toast-enter');

    toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 3200);
  }

  // 퀵 프리셋 적용
  function applyPreset(presetId) {
    if (presetId === 'preset-science-m') {
      state.curriculum = '2022';
      state.school = 'm';
      state.subjectGroup = '과학';
      state.subject = '과학';
      state.level = 'A';
      state.promptCategory = 'materials';
      state.promptType = 'inquiry_worksheet';
    } else if (presetId === 'preset-korean-m') {
      state.curriculum = '2022';
      state.school = 'm';
      state.subjectGroup = '국어';
      state.subject = '국어';
      state.level = 'B';
      state.promptCategory = 'materials';
      state.promptType = 'discussion_question';
    } else if (presetId === 'preset-image-science') {
      state.curriculum = '2022';
      state.school = 'm';
      state.subjectGroup = '과학';
      state.subject = '과학';
      state.level = 'A';
      state.promptCategory = 'images';
      state.promptType = '3d_diagram';
    }

    // UI 버튼 상태 동기화
    elements.btnCurr2022.classList.toggle('active', state.curriculum === '2022');
    elements.btnCurr2015.classList.toggle('active', state.curriculum === '2015');
    elements.btnSchoolM.classList.toggle('active', state.school === 'm');
    elements.btnSchoolH.classList.toggle('active', state.school === 'h');
    
    switchPromptCategory(state.promptCategory);
    loadStandardsData(state.curriculum, state.school);
    showToast(`🎯 프리셋이 적용되었습니다: ${presetId}`);
  }

})();
