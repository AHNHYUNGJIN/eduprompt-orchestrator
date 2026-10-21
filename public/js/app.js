/**
 * EduPrompt Studio - Frontend Application Controller (2026 Standards)
 * 2022/2015 개정 교육과정 성취기준·수준 기반 수업 자료 & 이미지 프롬프트 생성기
 * 
 * [수업 자료 프롬프트 vs 수업 이미지 프롬프트 완전 분리 & AI 모델 전용 파라미터 적용]
 */

(function () {
  'use strict';

  // 1. 애플리케이션 상태 (State)
  const state = {
    curriculum: '2022',       // '2022' | '2015'
    school: 'm',               // 'm' (중학교) | 'h' (고등학교)
    subjectGroup: '',          // 선택된 교과군
    subject: '',               // 선택된 과목
    selectedStandard: null,    // 선택된 성취기준 객체
    level: 'A',                // 2022: 'A'~'E', 2015: '상'~'하'
    
    // 프롬프트 설정 (독립 분리)
    promptCategory: 'materials', // 'materials' | 'images'
    materialType: 'inquiry_worksheet',
    imageStyleType: 'textbook_illustration',
    targetImageModel: 'gemini',  // 'gemini' | 'dalle' | 'claude' | 'midjourney' | 'flux'
    additionalNote: '',
    
    // 오른쪽 뷰 상태 ('material' | 'image')
    activeView: 'material',

    // 캐시된 데이터
    metaData: null,
    currentStandards: [],
    searchQuery: '',
    isDataLoaded: false
  };

  // 2. DOM 요소 참조 캐시
  const elements = {};

  // 3. 초기화
  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    cacheDomElements();
    setupEventListeners();
    await loadCurriculumMetaData();
  }

  function cacheDomElements() {
    // Step 1
    elements.btnCurr2022 = document.getElementById('btn-curr-2022');
    elements.btnCurr2015 = document.getElementById('btn-curr-2015');
    elements.btnSchoolM = document.getElementById('btn-school-m');
    elements.btnSchoolH = document.getElementById('btn-school-h');
    
    // Step 2 & 3
    elements.groupChipsContainer = document.getElementById('group-chips');
    elements.subjectChipsContainer = document.getElementById('subject-chips');
    elements.subjectCountBadge = document.getElementById('subject-count-badge');
    
    // Step 4
    elements.standardsListContainer = document.getElementById('standards-list');
    elements.standardsCount = document.getElementById('standards-count');
    elements.searchInput = document.getElementById('search-input');
    
    // Step 5
    elements.levelButtonsContainer = document.getElementById('level-buttons');
    elements.levelBadge = document.getElementById('level-badge');
    elements.levelDescBox = document.getElementById('level-desc-box');
    elements.levelDescText = document.getElementById('level-desc-text');
    
    // Step 6 (Left Builder)
    elements.tabMaterials = document.getElementById('tab-materials');
    elements.tabImages = document.getElementById('tab-images');
    elements.typeContainer = document.getElementById('type-container');
    elements.additionalNoteInput = document.getElementById('additional-note');
    
    // Output Panel (Right Header Badges)
    elements.badgeCurriculum = document.getElementById('badge-curriculum');
    elements.badgeSubject = document.getElementById('badge-subject');
    elements.badgeStandard = document.getElementById('badge-standard');
    elements.badgeLevel = document.getElementById('badge-level');
    
    // Dual View Switchers
    elements.switchViewMaterial = document.getElementById('switch-view-material');
    elements.switchViewImage = document.getElementById('switch-view-image');
    elements.viewMaterialContainer = document.getElementById('view-material-container');
    elements.viewImageContainer = document.getElementById('view-image-container');
    
    // Material View Elements
    elements.materialTitle = document.getElementById('material-title');
    elements.materialEditor = document.getElementById('material-editor');
    elements.btnCopyMaterial = document.getElementById('btn-copy-material');
    elements.btnDownloadTxtMaterial = document.getElementById('btn-download-txt-material');
    elements.btnDownloadMdMaterial = document.getElementById('btn-download-md-material');
    
    // Image View Elements
    elements.imageTitle = document.getElementById('image-title');
    elements.imageEditor = document.getElementById('image-editor');
    elements.visualTranslationDesc = document.getElementById('visual-translation-desc');
    elements.modelChips = document.querySelectorAll('.model-chip-btn');
    elements.btnCopyImage = document.getElementById('btn-copy-image');
    elements.btnDownloadTxtImage = document.getElementById('btn-download-txt-image');
    elements.btnCopyQuickPrompt = document.getElementById('btn-copy-quick-prompt');
    
    // External AI Launchers
    elements.btnChatGpt = document.getElementById('btn-chatgpt');
    elements.btnClaude = document.getElementById('btn-claude');
    elements.btnGemini = document.getElementById('btn-gemini');
    
    // Toast
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toast-message');
    
    // Quick Presets
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

    // Step 6: 왼쪽 카테고리 탭 (수업 자료 vs 이미지 스타일)
    elements.tabMaterials.addEventListener('click', () => {
      state.promptCategory = 'materials';
      updateCategoryTabs();
      renderTypeCards();
      switchOutputView('material');
      updatePromptOutput();
    });

    elements.tabImages.addEventListener('click', () => {
      state.promptCategory = 'images';
      updateCategoryTabs();
      renderTypeCards();
      switchOutputView('image');
      updatePromptOutput();
    });

    // 교사 추가 요청사항 입력
    elements.additionalNoteInput.addEventListener('input', (e) => {
      state.additionalNote = e.target.value;
      updatePromptOutput();
    });

    // 오른쪽 듀얼 뷰 스위처
    elements.switchViewMaterial.addEventListener('click', () => switchOutputView('material'));
    elements.switchViewImage.addEventListener('click', () => switchOutputView('image'));

    // 이미지 전용 AI 모델 칩 클릭 이벤트
    elements.modelChips.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetModel = btn.getAttribute('data-model');
        switchTargetImageModel(targetModel);
      });
    });

    // 독립 복사 버튼
    elements.btnCopyMaterial.addEventListener('click', () => copyText(elements.materialEditor.value, '📝 [수업 자료 프롬프트만] 클립보드에 복사되었습니다!'));
    elements.btnCopyImage.addEventListener('click', () => copyText(elements.imageEditor.value, `🎨 [${getModelDisplayName(state.targetImageModel)} 이미지 프롬프트만] 복사되었습니다!`));
    elements.btnCopyQuickPrompt.addEventListener('click', copyQuickEnglishPrompt);

    // 파일 다운로드 버튼
    elements.btnDownloadTxtMaterial.addEventListener('click', () => downloadPromptFile(elements.materialEditor.value, 'txt', '수업자료'));
    elements.btnDownloadMdMaterial.addEventListener('click', () => downloadPromptFile(elements.materialEditor.value, 'md', '수업자료'));
    elements.btnDownloadTxtImage.addEventListener('click', () => downloadPromptFile(elements.imageEditor.value, 'txt', `이미지_${state.targetImageModel}`));

    // 외부 AI 바로가기 (현재 활성화된 뷰에 맞춰 복사 후 열기)
    elements.btnChatGpt.addEventListener('click', () => launchExternalAI('https://chatgpt.com', 'ChatGPT'));
    elements.btnClaude.addEventListener('click', () => launchExternalAI('https://claude.ai/new', 'Claude'));
    elements.btnGemini.addEventListener('click', () => launchExternalAI('https://gemini.google.com/app', 'Gemini'));

    // 상단 프리셋 버튼
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        applyPreset(preset);
      });
    });
  }

  // =========================================================================
  // 4. 데이터 로드 및 초기 렌더링
  // =========================================================================
  async function loadCurriculumMetaData() {
    try {
      showToast('⏳ 교육과정 데이터베이스를 로드하고 있습니다...');
      const resp = await fetch('data/meta.json');
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      state.metaData = await resp.json();
      state.isDataLoaded = true;

      // 초기 기본값 설정: 2022 중학교 '기술·가정' 또는 '과학'
      state.curriculum = '2022';
      state.school = 'm';
      state.level = 'A';

      renderGroupChips();
      
      // 첫 번째 교과군 자동 선택 (기술·가정 우선, 없으면 첫번째)
      const availableGroups = getAvailableGroups();
      const defaultGroup = availableGroups.includes('기술·가정') ? '기술·가정' : availableGroups[0];
      selectSubjectGroup(defaultGroup);

      updateCategoryTabs();
      renderTypeCards();
      renderLevelButtons();
      switchOutputView('material');

      showToast('✨ 2022·2015 교육과정 DB 로드 완료! (0ms 렌더링 준비)');
    } catch (err) {
      console.error('Failed to load curriculum meta:', err);
      showToast('⚠️ 데이터 로드에 실패했습니다. 새로고침해 주세요.');
    }
  }

  function getAvailableGroups() {
    if (!state.metaData || !state.metaData.tree) return [];
    const currKey = state.curriculum;
    const schoolKey = state.school;
    if (state.metaData.tree[currKey] && state.metaData.tree[currKey][schoolKey]) {
      return Object.keys(state.metaData.tree[currKey][schoolKey]);
    }
    return [];
  }

  // =========================================================================
  // 5. 교과군 및 과목 렌더링
  // =========================================================================
  function renderGroupChips() {
    elements.groupChipsContainer.innerHTML = '';
    const groups = getAvailableGroups();

    groups.forEach(groupName => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${state.subjectGroup === groupName ? 'active' : ''}`;
      btn.textContent = groupName;
      btn.addEventListener('click', () => selectSubjectGroup(groupName));
      elements.groupChipsContainer.appendChild(btn);
    });
  }

  function selectSubjectGroup(groupName) {
    state.subjectGroup = groupName;
    renderGroupChips();

    // 과목 목록 갱신
    const currKey = state.curriculum;
    const schoolKey = state.school;
    const subjects = (state.metaData.tree[currKey] && state.metaData.tree[currKey][schoolKey] && state.metaData.tree[currKey][schoolKey][groupName]) || [];

    elements.subjectChipsContainer.innerHTML = '';
    elements.subjectCountBadge.textContent = `${subjects.length}과목`;

    subjects.forEach((subj, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${state.subject === subj || (idx === 0 && !state.subject) ? 'active' : ''}`;
      btn.textContent = subj;
      btn.addEventListener('click', () => selectSubject(subj));
      elements.subjectChipsContainer.appendChild(btn);
    });

    // 기본 과목 선택
    if (subjects.length > 0) {
      selectSubject(subjects[0]);
    }
  }

  async function selectSubject(subjectName) {
    state.subject = subjectName;
    
    // 과목 칩 활성화 상태 갱신
    const chipBtns = elements.subjectChipsContainer.querySelectorAll('.chip-btn');
    chipBtns.forEach(b => {
      if (b.textContent === subjectName) b.classList.add('active');
      else b.classList.remove('active');
    });

    await loadStandardsForCurrentSelection();
  }

  // =========================================================================
  // 6. 성취기준 데이터 로드 및 카드 렌더링
  // =========================================================================
  async function loadStandardsForCurrentSelection() {
    const filename = `data/standards_${state.curriculum}_${state.school}.json`;
    try {
      const resp = await fetch(filename);
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      const allStandards = await resp.json();

      // 현재 선택된 교과군 및 과목으로 필터링
      state.currentStandards = allStandards.filter(item => {
        const matchSubject = item.subject === state.subject;
        const matchGroup = !state.subjectGroup || item.group === state.subjectGroup;
        return matchSubject && matchGroup;
      });

      // 만약 과목 일치 항목이 없다면 과목명 포함으로 유연하게 검색
      if (state.currentStandards.length === 0) {
        state.currentStandards = allStandards.filter(item => item.subject.includes(state.subject));
      }

      state.searchQuery = '';
      elements.searchInput.value = '';
      renderStandardsList();

      // 첫 번째 성취기준 자동 선택
      if (state.currentStandards.length > 0) {
        selectStandard(state.currentStandards[0]);
      } else {
        state.selectedStandard = null;
        updatePromptOutput();
      }
    } catch (err) {
      console.error('Failed to load standards list:', err);
      elements.standardsListContainer.innerHTML = '<div class="p-4 text-xs text-rose-500">성취기준을 불러오지 못했습니다.</div>';
    }
  }

  function renderStandardsList() {
    elements.standardsListContainer.innerHTML = '';
    
    let filtered = state.currentStandards;
    if (state.searchQuery) {
      const q = state.searchQuery;
      filtered = state.currentStandards.filter(s => {
        return (s.code && s.code.toLowerCase().includes(q)) ||
               (s.standard && s.standard.toLowerCase().includes(q)) ||
               (s.domain && s.domain.toLowerCase().includes(q));
      });
    }

    elements.standardsCount.textContent = `${filtered.length}개 항목`;

    if (filtered.length === 0) {
      elements.standardsListContainer.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-400">
          검색 조건에 맞는 성취기준이 없습니다.
        </div>`;
      return;
    }

    filtered.forEach(std => {
      const isSelected = state.selectedStandard && state.selectedStandard.code === std.code;
      const card = document.createElement('div');
      card.className = `standard-item ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${std.code}</span>
          <span class="text-[10px] text-slate-400 truncate max-w-[150px]">${std.domain || ''}</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed font-medium">${std.standard}</p>
      `;
      card.addEventListener('click', () => selectStandard(std));
      elements.standardsListContainer.appendChild(card);
    });
  }

  function selectStandard(std) {
    state.selectedStandard = std;
    
    // 활성화 표시 갱신
    const items = elements.standardsListContainer.querySelectorAll('.standard-item');
    items.forEach(el => {
      const codeSpan = el.querySelector('span');
      if (codeSpan && codeSpan.textContent === std.code) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });

    updateLevelDesc();
    updatePromptOutput();
  }

  // =========================================================================
  // 7. 성취수준 (Step 5) 버튼 및 설명 렌더링
  // =========================================================================
  function renderLevelButtons() {
    elements.levelButtonsContainer.innerHTML = '';
    const levels = state.curriculum === '2022' ? ['A', 'B', 'C', 'D', 'E'] : ['상', '중', '하'];

    // 현재 선택된 level이 목록에 없으면 첫 번째로 리셋
    if (!levels.includes(state.level)) {
      state.level = levels[0];
    }

    levels.forEach(lvl => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = state.level === lvl;
      btn.className = `level-btn py-2 rounded-xl text-xs font-bold transition-all border ${
        isActive 
          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-transparent shadow-sm shadow-indigo-300' 
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`;
      btn.textContent = state.curriculum === '2022' ? `수준 ${lvl}` : `${lvl}`;
      btn.addEventListener('click', () => {
        state.level = lvl;
        renderLevelButtons();
        updateLevelDesc();
        updatePromptOutput();
      });
      elements.levelButtonsContainer.appendChild(btn);
    });

    elements.levelBadge.textContent = state.curriculum === '2022' ? `수준 ${state.level}` : `평가기준 [${state.level}]`;
  }

  function updateLevelDesc() {
    if (!state.selectedStandard) {
      elements.levelDescText.textContent = '성취기준을 선택해주세요.';
      return;
    }

    const std = state.selectedStandard;
    let desc = '';

    if (state.curriculum === '2022') {
      const levelKey = `level_${state.level.toLowerCase()}`;
      desc = std[levelKey] || std.levels?.[state.level] || `${state.level} 수준에 대한 기술이 없습니다.`;
    } else {
      const levelMap = { '상': 'level_high', '중': 'level_mid', '하': 'level_low' };
      const key = levelMap[state.level] || 'level_high';
      desc = std[key] || std.levels?.[state.level] || `${state.level} 평가기준 내용이 등록되지 않았습니다.`;
    }

    elements.levelDescText.textContent = desc;
  }

  // =========================================================================
  // 8. 프롬프트 유형 및 스타일 카드 (Step 6) 렌더링
  // =========================================================================
  function updateCategoryTabs() {
    if (state.promptCategory === 'materials') {
      elements.tabMaterials.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-indigo-700 bg-white shadow-sm transition-all flex items-center justify-center gap-1.5 border border-indigo-100';
      elements.tabImages.className = 'flex-1 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5';
    } else {
      elements.tabMaterials.className = 'flex-1 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5';
      elements.tabImages.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-pink-700 bg-white shadow-sm transition-all flex items-center justify-center gap-1.5 border border-pink-100';
    }
  }

  function renderTypeCards() {
    elements.typeContainer.innerHTML = '';

    if (state.promptCategory === 'materials') {
      const types = [
        { id: 'inquiry_worksheet', icon: '📝', title: '탐구 활동지', desc: '도입-전개-정리-발문 구조의 참여형 활동지' },
        { id: 'real_world_task', icon: '🌍', title: '실생활 연계 과제', desc: 'GRASPS 기반 실생활 수행평가 및 루브릭' },
        { id: 'discussion_question', icon: '💬', title: '생각열기 토의 발문', desc: '호기심-분석-딜레마 하브루타 질문 세트' },
        { id: 'formative_quiz', icon: '🎯', title: '형성평가 & 퀴즈', desc: '5지선다 3문항 + 서술형 1문항 및 오답 피드백' },
        { id: 'student_record', icon: '📋', title: '교과세특 예시 문구', desc: '성취수준 도달도 반영 학생부 관찰기록 3종' }
      ];

      types.forEach(t => {
        const isSelected = state.materialType === t.id;
        const card = document.createElement('div');
        card.className = `type-card-btn p-3 rounded-xl border cursor-pointer transition-all ${
          isSelected 
            ? 'active bg-indigo-50/70 border-indigo-400 shadow-sm ring-1 ring-indigo-400/30' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`;
        card.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">${t.icon}</span>
            <span class="text-xs font-bold ${isSelected ? 'text-indigo-800' : 'text-slate-800'}">${t.title}</span>
          </div>
          <p class="text-[10.5px] text-slate-500 leading-tight">${t.desc}</p>
        `;
        card.addEventListener('click', () => {
          state.materialType = t.id;
          renderTypeCards();
          switchOutputView('material');
          updatePromptOutput();
        });
        elements.typeContainer.appendChild(card);
      });

    } else {
      const styles = [
        { id: 'textbook_illustration', icon: '🎨', title: '교과서 감성 일러스트', desc: '부드러운 수채화 & 클린 잉크 라인아트' },
        { id: '3d_diagram', icon: '🧊', title: '3D 입체 다이어그램', desc: '클레이 & 반투명 유리 재질 8K 옥탄 렌더' },
        { id: 'documentary_photo', icon: '📸', title: '실사 다큐멘터리', desc: '내셔널 지오그래픽 감성 초정밀 실사 사진' },
        { id: 'student_webtoon', icon: '✨', title: '학생 친화형 웹툰/카툰', desc: '친근한 한국 학습만화 캐릭터 & 셀셰이딩' },
        { id: 'minimal_infographic', icon: '📊', title: '미니멀 인포그래픽', desc: '스위스 디자인 스타일 벡터 시각 도해' }
      ];

      styles.forEach(s => {
        const isSelected = state.imageStyleType === s.id;
        const card = document.createElement('div');
        card.className = `type-card-btn p-3 rounded-xl border cursor-pointer transition-all ${
          isSelected 
            ? 'active bg-pink-50/70 border-pink-400 shadow-sm ring-1 ring-pink-400/30' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`;
        card.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">${s.icon}</span>
            <span class="text-xs font-bold ${isSelected ? 'text-pink-800' : 'text-slate-800'}">${s.title}</span>
          </div>
          <p class="text-[10.5px] text-slate-500 leading-tight">${s.desc}</p>
        `;
        card.addEventListener('click', () => {
          state.imageStyleType = s.id;
          renderTypeCards();
          switchOutputView('image');
          updatePromptOutput();
        });
        elements.typeContainer.appendChild(card);
      });
    }
  }

  // =========================================================================
  // 9. 오른쪽 듀얼 뷰 스위처 & 프롬프트 동시 독립 생성
  // =========================================================================
  function switchOutputView(viewName) {
    state.activeView = viewName;

    if (viewName === 'material') {
      elements.switchViewMaterial.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white text-indigo-700 shadow-sm';
      elements.switchViewImage.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2';
      elements.viewMaterialContainer.classList.remove('hidden');
      elements.viewImageContainer.classList.add('hidden');
    } else {
      elements.switchViewMaterial.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2';
      elements.switchViewImage.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white text-pink-700 shadow-sm';
      elements.viewMaterialContainer.classList.add('hidden');
      elements.viewImageContainer.classList.remove('hidden');
    }
  }

  function switchTargetImageModel(modelName) {
    state.targetImageModel = modelName;
    elements.modelChips.forEach(chip => {
      if (chip.getAttribute('data-model') === modelName) {
        chip.className = 'model-chip-btn py-1.5 px-2 rounded-lg text-xs font-bold active';
      } else {
        chip.className = 'model-chip-btn py-1.5 px-2 rounded-lg text-xs font-medium';
      }
    });

    updatePromptOutput();
    showToast(`✨ [${getModelDisplayName(modelName)}] 전용 파라미터로 즉시 변환되었습니다.`);
  }

  function getModelDisplayName(modelKey) {
    const names = {
      gemini: 'Google Gemini',
      dalle: 'ChatGPT(DALL-E)',
      claude: 'Claude',
      midjourney: 'Midjourney',
      flux: 'FLUX.1'
    };
    return names[modelKey] || modelKey;
  }

  // 핵심 프롬프트 조립 함수
  function updatePromptOutput() {
    const std = state.selectedStandard;
    let levelDesc = '';

    if (std) {
      if (state.curriculum === '2022') {
        const key = `level_${state.level.toLowerCase()}`;
        levelDesc = std[key] || std.levels?.[state.level] || '';
      } else {
        const map = { '상': 'level_high', '중': 'level_mid', '하': 'level_low' };
        levelDesc = std[map[state.level]] || std.levels?.[state.level] || '';
      }
    }

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
      materialType: state.materialType,
      imageStyleType: state.imageStyleType,
      targetImageModel: state.targetImageModel,
      additionalNote: state.additionalNote
    };

    const generated = PromptEngine.generate(params);

    // 상단 뱃지 갱신
    elements.badgeCurriculum.textContent = `${state.curriculum} 개정 (${state.school === 'm' ? '중' : '고'})`;
    elements.badgeSubject.textContent = `${state.subjectGroup} > ${state.subject}`;
    elements.badgeStandard.textContent = std ? std.code : '성취기준 미선택';
    elements.badgeLevel.textContent = `수준 ${state.level}`;

    // 1. 수업 자료 전용 뷰 갱신
    elements.materialTitle.textContent = generated.material.title;
    elements.materialEditor.value = generated.material.text;

    // 2. 수업 이미지 전용 뷰 갱신 (Visual Translation 및 모델별 적용)
    elements.imageTitle.textContent = generated.image.title;
    elements.imageEditor.value = generated.image.text;
    elements.visualTranslationDesc.textContent = `"${generated.image.visualScene.action}" (장소: ${generated.image.visualScene.setting})`;
  }

  // =========================================================================
  // 10. 복사, 다운로드 및 외부 AI 연동
  // =========================================================================
  async function copyText(text, successMsg) {
    if (!text) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      showToast(successMsg);
    } catch (err) {
      fallbackCopy(text);
      showToast(successMsg);
    }
  }

  function fallbackCopy(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
  }

  // 단일 영문 프롬프트만 빠르게 복사
  function copyQuickEnglishPrompt() {
    const fullText = elements.imageEditor.value;
    if (!fullText) return;

    // Midjourney의 경우 /imagine 줄 추출
    if (state.targetImageModel === 'midjourney') {
      const match = fullText.match(/\/imagine prompt: [^\n]+/);
      if (match) {
        copyText(match[0], '⛵ Midjourney /imagine 명령어만 깔끔하게 복사되었습니다!');
        return;
      }
    }

    // DALL-E / Gemini / FLUX 등에서 Prompt 블록 추출
    const promptMatch = fullText.match(/--- Prompt Start ---\s*([\s\S]*?)\s*--- Prompt End ---/);
    if (promptMatch && promptMatch[1]) {
      copyText(promptMatch[1].trim(), `✨ [${getModelDisplayName(state.targetImageModel)}] 영문 프롬프트 본문만 복사되었습니다!`);
      return;
    }

    // 기본 전체 복사
    copyText(fullText, '🎨 이미지 프롬프트가 복사되었습니다!');
  }

  function downloadPromptFile(text, ext, prefix) {
    if (!text) return;

    const stdCode = (state.selectedStandard && state.selectedStandard.code) || '성취기준';
    const cleanCode = stdCode.replace(/[\[\]]/g, '');
    const filename = `EduPrompt_${prefix}_${state.subject}_${cleanCode}_수준${state.level}.${ext}`;

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

  // 외부 AI 모델 런치 (현재 보고 있는 프롬프트 자동 복사 후 새 창 열기)
  async function launchExternalAI(url, serviceName) {
    const currentText = state.activeView === 'image' 
      ? elements.imageEditor.value 
      : elements.materialEditor.value;

    await copyText(currentText, `📋 [${state.activeView === 'image' ? '이미지' : '수업자료'}] 프롬프트 복사 완료! ${serviceName} 창이 열립니다.`);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);
  }

  // 교육과정 / 학교급 전환 핸들러
  async function switchCurriculum(curr) {
    if (state.curriculum === curr) return;
    state.curriculum = curr;

    if (curr === '2022') {
      elements.btnCurr2022.classList.add('active');
      elements.btnCurr2015.classList.remove('active');
    } else {
      elements.btnCurr2015.classList.add('active');
      elements.btnCurr2022.classList.remove('active');
    }

    renderGroupChips();
    const groups = getAvailableGroups();
    selectSubjectGroup(groups[0] || '과학');
    renderLevelButtons();
  }

  async function switchSchool(school) {
    if (state.school === school) return;
    state.school = school;

    if (school === 'm') {
      elements.btnSchoolM.classList.add('active');
      elements.btnSchoolH.classList.remove('active');
    } else {
      elements.btnSchoolH.classList.add('active');
      elements.btnSchoolM.classList.remove('active');
    }

    renderGroupChips();
    const groups = getAvailableGroups();
    selectSubjectGroup(groups[0] || '과학');
    renderLevelButtons();
  }

  // 프리셋 적용
  async function applyPreset(presetKey) {
    if (!state.isDataLoaded) return;

    if (presetKey === 'preset-middle-tech') {
      await switchCurriculum('2022');
      await switchSchool('m');
      selectSubjectGroup('기술·가정');
      state.level = 'A';
      renderLevelButtons();
      state.promptCategory = 'materials';
      state.materialType = 'inquiry_worksheet';
      updateCategoryTabs();
      renderTypeCards();
      switchOutputView('material');
      showToast('🛠️ 중학 2022 기술·가정 탐구활동지 프리셋이 적용되었습니다.');
    } else if (presetKey === 'preset-middle-korean') {
      await switchCurriculum('2022');
      await switchSchool('m');
      selectSubjectGroup('국어');
      state.level = 'A';
      renderLevelButtons();
      state.promptCategory = 'materials';
      state.materialType = 'discussion_question';
      updateCategoryTabs();
      renderTypeCards();
      switchOutputView('material');
      showToast('📖 중학 2022 국어 생각열기 토의 프리셋이 적용되었습니다.');
    } else if (presetKey === 'preset-image-science') {
      await switchCurriculum('2022');
      await switchSchool('m');
      selectSubjectGroup('과학');
      state.level = 'A';
      renderLevelButtons();
      state.promptCategory = 'images';
      state.imageStyleType = '3d_diagram';
      state.targetImageModel = 'gemini';
      updateCategoryTabs();
      renderTypeCards();
      switchOutputView('image');
      switchTargetImageModel('gemini');
      showToast('🧊 중학 과학 3D 입체 다이어그램 프리셋이 적용되었습니다.');
    }
  }

  // 토스트 피드백 표시
  let toastTimer;
  function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.classList.add('toast-enter');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
      elements.toast.classList.remove('toast-enter');
    }, 2800);
  }

})();
