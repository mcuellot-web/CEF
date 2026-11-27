'use strict';

(function () {
  var STORAGE_KEYS = {
    courses: 'lazygrade_courses_v2',
    activeCourseId: 'lazygrade_active_course_v2',
    themeId: 'lazygrade_theme_v1',
    scanlines: 'lazygrade_scanlines_v1',
  };

  var THEMES = [
    {
      id: 'tokyonight',
      name: 'Tokyo Night',
      vimCommand: 'colorscheme tokyonight-storm',
      variant: 'Oscuro',
      description: 'Tema predeterminado de LazyVim con azul eléctrico y alto contraste.',
      colors: {
        bgCanvas: '#161720',
        bgSurface: '#1e202e',
        bgElevated: '#26293b',
        bgHighlight: '#2f334a',
        border: '#343952',
        textPrimary: '#d4dcff',
        textMuted: '#9aa5ce',
        textGutter: '#6b759c',
        accent: '#7aa2f7',
        accentFg: '#11131c',
        ok: '#9ece6a',
        warn: '#e0af68',
        danger: '#f7768e',
        secondary: '#bb9af7',
        cyan: '#7dcfff',
      },
    },
    {
      id: 'gruvbox',
      name: 'Gruvbox Retro',
      vimCommand: 'colorscheme gruvbox',
      variant: 'Oscuro',
      description: 'Paleta cálida vintage de terminal clásica con naranja quemado y crema.',
      colors: {
        bgCanvas: '#1a1c1d',
        bgSurface: '#242424',
        bgElevated: '#302e2c',
        bgHighlight: '#3c3836',
        border: '#4a4440',
        textPrimary: '#f2e5bc',
        textMuted: '#bdae93',
        textGutter: '#928374',
        accent: '#fe8019',
        accentFg: '#1a1c1d',
        ok: '#b8bb26',
        warn: '#fabd2f',
        danger: '#fb4934',
        secondary: '#d3869b',
        cyan: '#8ec07c',
      },
    },
    {
      id: 'retro-amber',
      name: 'Amber CRT 1984',
      vimCommand: 'colorscheme amber-crt',
      variant: 'Oscuro',
      description: 'Monitor monocromático de fósforo ámbar con estética retro de laboratorio.',
      colors: {
        bgCanvas: '#120e08',
        bgSurface: '#1a140c',
        bgElevated: '#241c11',
        bgHighlight: '#2f2416',
        border: '#47361f',
        textPrimary: '#ffd57a',
        textMuted: '#c89e52',
        textGutter: '#967236',
        accent: '#ffb000',
        accentFg: '#120e08',
        ok: '#a3d95b',
        warn: '#ffd54f',
        danger: '#ff6e4a',
        secondary: '#ffa040',
        cyan: '#7fd8be',
      },
    },
    {
      id: 'catppuccin',
      name: 'Catppuccin Mocha',
      vimCommand: 'colorscheme catppuccin-mocha',
      variant: 'Oscuro',
      description: 'Tonos pastel relajados sobre carbón profundo con acento lavanda.',
      colors: {
        bgCanvas: '#181825',
        bgSurface: '#1e1e2e',
        bgElevated: '#29293e',
        bgHighlight: '#313244',
        border: '#3e4058',
        textPrimary: '#cdd6f4',
        textMuted: '#a6adc8',
        textGutter: '#7f849c',
        accent: '#cba6f7',
        accentFg: '#11111b',
        ok: '#a6e3a1',
        warn: '#f9e2af',
        danger: '#f38ba8',
        secondary: '#89b4fa',
        cyan: '#94e2d5',
      },
    },
    {
      id: 'nord',
      name: 'Nord Frost',
      vimCommand: 'colorscheme nord',
      variant: 'Oscuro',
      description: 'Escala ártica azulada fría y limpia inspirada en terminales nórdicas.',
      colors: {
        bgCanvas: '#242933',
        bgSurface: '#2e3440',
        bgElevated: '#373e4c',
        bgHighlight: '#434c5e',
        border: '#4c566a',
        textPrimary: '#eceff4',
        textMuted: '#b8c2d1',
        textGutter: '#8190a8',
        accent: '#88c0d0',
        accentFg: '#1e222a',
        ok: '#a3be8c',
        warn: '#ebcb8b',
        danger: '#d96c75',
        secondary: '#b48ead',
        cyan: '#8fbcbb',
      },
    },
    {
      id: 'everforest-light',
      name: 'Everforest Papel',
      vimCommand: 'colorscheme everforest-light',
      variant: 'Claro',
      description: 'Tema claro sobre papel crema retro con verde oliva y tinta oscura.',
      colors: {
        bgCanvas: '#f3ecd8',
        bgSurface: '#fbf6e8',
        bgElevated: '#efe8d3',
        bgHighlight: '#e6dec5',
        border: '#cbc2a8',
        textPrimary: '#2f3a36',
        textMuted: '#57635d',
        textGutter: '#7e8982',
        accent: '#5f7d00',
        accentFg: '#fbf6e8',
        ok: '#2f7d44',
        warn: '#9e6300',
        danger: '#c23632',
        secondary: '#8f4875',
        cyan: '#26728c',
      },
    },
  ];

  var SCENARIO_TARGETS = [
    {label: 'Aprobar mínimo', targetGrade: 3.0},
    {label: 'Desempeño sólido', targetGrade: 3.5},
    {label: 'Sobresaliente', targetGrade: 4.0},
    {label: 'Excelencia', targetGrade: 4.5},
    {label: 'Nota perfecta', targetGrade: 5.0},
  ];

  function createDefaultCourses() {
    return [
      {
        id: 'materia-1',
        name: 'Materia 1',
        pd1: 0,
        pd2: 0,
        pd3: 0,
        target: 3.0,
      },
    ];
  }

  function loadCourses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEYS.courses);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return createDefaultCourses();
  }

  function loadString(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  var state = {
    courses: loadCourses(),
    activeCourseId: loadString(STORAGE_KEYS.activeCourseId, 'materia-1'),
    themeId: loadString(STORAGE_KEYS.themeId, 'tokyonight'),
    scanlines: loadString(STORAGE_KEYS.scanlines, 'false') === 'true',
    vimMode: 'NORMAL',
    isRenaming: false,
    themeQuery: '',
    highlightedThemeIdx: 0,
    isThemeModalOpen: false,
    isWhichKeyOpen: false,
  };

  function getActiveCourse() {
    for (var i = 0; i < state.courses.length; i++) {
      if (state.courses[i].id === state.activeCourseId) return state.courses[i];
    }
    state.activeCourseId = state.courses[0].id;
    return state.courses[0];
  }

  function getActiveTheme() {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === state.themeId) return THEMES[i];
    }
    return THEMES[0];
  }

  function clampGrade(val) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return Math.min(5, Math.max(0, Math.round(val * 100) / 100));
  }

  function fmt(val) {
    return Number(val).toFixed(2);
  }

  function parseGrade(raw) {
    var norm = String(raw).trim().replace(',', '.');
    if (norm === '') return 0;
    var num = Number(norm);
    if (isNaN(num) || !isFinite(num)) return null;
    return num;
  }

  function slugify(name) {
    var s = String(name || 'materia')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return (s || 'materia') + '.grd';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(state.courses));
      localStorage.setItem(STORAGE_KEYS.activeCourseId, state.activeCourseId);
      localStorage.setItem(STORAGE_KEYS.themeId, state.themeId);
      localStorage.setItem(STORAGE_KEYS.scanlines, String(state.scanlines));
    } catch (e) {}
  }

  function computeCalc(course) {
    var pd1 = clampGrade(course.pd1);
    var pd2 = clampGrade(course.pd2);
    var pd3 = clampGrade(course.pd3);
    var target = clampGrade(course.target);

    var w1 = pd1 * 0.2;
    var w2 = pd2 * 0.2;
    var w3 = pd3 * 0.2;
    var acc = w1 + w2 + w3;
    var accPct = (acc / 3.0) * 100;

    var rawNeeded = (target - acc) / 0.4;
    var maxFinal = acc + 5.0 * 0.4;
    var minFinal = acc;
    var missing = Math.max(0, target - acc);

    var status = 'achievable';
    var statusLabel = 'Meta alcanzable';
    var statusDetail =
      'Necesitas ' +
      fmt(rawNeeded) +
      ' en el Examen (40%) para llegar a ' +
      fmt(target) +
      '.';
    var colorVar = 'var(--accent)';
    var headline = fmt(rawNeeded);

    if (rawNeeded <= 0) {
      status = 'approved';
      statusLabel = 'Materia ya aprobada';
      statusDetail =
        'Con ' +
        fmt(acc) +
        ' acumulados ya superas ' +
        fmt(target) +
        ' incluso sacando 0.00 en el Examen.';
      colorVar = 'var(--status-ok)';
      headline = '0.00';
    } else if (rawNeeded > 5.0) {
      status = 'impossible';
      statusLabel = 'Fuera de rango (> 5.00)';
      statusDetail =
        'Necesitarías ' +
        fmt(rawNeeded) +
        ' en el Examen. Con 5.00 alcanzarías máximo ' +
        fmt(maxFinal) +
        '.';
      colorVar = 'var(--status-danger)';
    } else if (rawNeeded >= 4.0) {
      status = 'challenging';
      statusLabel = 'Exige puntaje alto';
      statusDetail =
        'Debes sacar al menos ' +
        fmt(rawNeeded) +
        ' de 5.00 en el Examen final para lograr ' +
        fmt(target) +
        '.';
      colorVar = 'var(--status-warn)';
    }

    return {
      w1: w1,
      w2: w2,
      w3: w3,
      acc: acc,
      accPct: accPct,
      rawNeeded: rawNeeded,
      maxFinal: maxFinal,
      minFinal: minFinal,
      missing: missing,
      status: status,
      statusLabel: statusLabel,
      statusDetail: statusDetail,
      colorVar: colorVar,
      headline: headline,
    };
  }

  function applyTheme() {
    var theme = getActiveTheme();
    var c = theme.colors;
    var root = document.documentElement;
    root.style.setProperty('--bg-canvas', c.bgCanvas);
    root.style.setProperty('--bg-surface', c.bgSurface);
    root.style.setProperty('--bg-elevated', c.bgElevated);
    root.style.setProperty('--bg-highlight', c.bgHighlight);
    root.style.setProperty('--border-color', c.border);
    root.style.setProperty('--text-primary', c.textPrimary);
    root.style.setProperty('--text-muted', c.textMuted);
    root.style.setProperty('--text-gutter', c.textGutter);
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--accent-fg', c.accentFg);
    root.style.setProperty('--status-ok', c.ok);
    root.style.setProperty('--status-warn', c.warn);
    root.style.setProperty('--status-danger', c.danger);
    root.style.setProperty('--secondary', c.secondary);
    root.style.setProperty('--cyan', c.cyan);

    var themeBtnLabel = document.getElementById('theme-btn-label');
    if (themeBtnLabel) themeBtnLabel.textContent = 'Tema: ' + theme.name;

    var lualineTheme = document.getElementById('lualine-theme-cmd');
    if (lualineTheme) lualineTheme.textContent = ':' + theme.vimCommand;

    var crtEl = document.getElementById('crt-overlay');
    if (crtEl) crtEl.classList.toggle('hidden', !state.scanlines);
  }

  function setVimMode(mode) {
    state.vimMode = mode;
    var badges = document.querySelectorAll('[data-vim-mode]');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = mode;
      badges[i].classList.toggle('insert', mode === 'INSERT');
    }
  }

  function updateResultAndScenarios() {
    var course = getActiveCourse();
    var calc = computeCalc(course);

    // Update partial contribution subtitles
    document.getElementById('contrib-pd1').textContent = 'Aporte actual: +' + fmt(calc.w1) + ' pts de 1.00';
    document.getElementById('contrib-pd2').textContent = 'Aporte actual: +' + fmt(calc.w2) + ' pts de 1.00';
    document.getElementById('contrib-pd3').textContent = 'Aporte actual: +' + fmt(calc.w3) + ' pts de 1.00';

    // Update focal result box
    var resultBox = document.getElementById('result-box');
    resultBox.style.borderColor = calc.colorVar;

    var scoreEl = document.getElementById('result-score');
    scoreEl.textContent = calc.headline;
    scoreEl.style.color = calc.colorVar;

    var statusWrap = document.getElementById('result-status');
    statusWrap.style.color = calc.colorVar;
    document.getElementById('result-status-text').textContent = calc.statusLabel;

    document.getElementById('result-detail').textContent = calc.statusDetail;

    // 4-metric breakdown
    document.getElementById('metric-acc').innerHTML =
      fmt(calc.acc) + '<span class="metric-unit">/ 3.00</span>';
    document.getElementById('metric-missing').innerHTML =
      fmt(calc.missing) + '<span class="metric-unit">pts</span>';
    document.getElementById('metric-min').textContent = fmt(calc.minFinal);

    var maxEl = document.getElementById('metric-max');
    maxEl.textContent = fmt(calc.maxFinal);
    maxEl.style.color =
      calc.maxFinal >= course.target ? 'var(--status-ok)' : 'var(--status-danger)';

    // Progress bar
    var pct = Math.min(100, Math.max(0, Math.round(calc.accPct)));
    document.getElementById('progress-pct').textContent = pct + '% obtenido';
    document.getElementById('progress-fill').style.width = pct + '%';

    // Lualine
    document.getElementById('lualine-file').textContent = slugify(course.name);
    document.getElementById('lualine-acc').textContent = 'Acum: ' + fmt(calc.acc) + ' / 3.00';

    // Target presets active highlight
    var presetBtns = document.querySelectorAll('[data-preset]');
    for (var p = 0; p < presetBtns.length; p++) {
      var pv = Number(presetBtns[p].getAttribute('data-preset'));
      presetBtns[p].classList.toggle('active', Math.abs(course.target - pv) < 0.001);
    }

    // Sidebar course meta update
    var sidebarMetas = document.querySelectorAll('[data-course-meta]');
    for (var s = 0; s < sidebarMetas.length; s++) {
      var cid = sidebarMetas[s].getAttribute('data-course-meta');
      for (var j = 0; j < state.courses.length; j++) {
        if (state.courses[j].id === cid) {
          var cCalc = computeCalc(state.courses[j]);
          sidebarMetas[s].textContent =
            'Examen nec: ' + (cCalc.rawNeeded <= 0 ? '0.00' : fmt(cCalc.rawNeeded));
        }
      }
    }

    // Scenarios table
    document.getElementById('scenarios-acc-label').textContent =
      'Acumulado actual: ' + fmt(calc.acc) + ' / 3.00';

    var tbody = document.getElementById('scenarios-tbody');
    tbody.innerHTML = SCENARIO_TARGETS.map(function (row) {
      var needed = (row.targetGrade - calc.acc) / 0.4;
      var alreadyMet = needed <= 0;
      var achievable = needed <= 5.0 + 1e-9;
      var isCurrent = Math.abs(course.target - row.targetGrade) < 0.001;

      var valColor = alreadyMet
        ? 'var(--status-ok)'
        : achievable
          ? 'var(--text-primary)'
          : 'var(--status-danger)';
      var statusColor = alreadyMet
        ? 'var(--status-ok)'
        : achievable
          ? 'var(--accent)'
          : 'var(--status-danger)';
      var statusText = alreadyMet
        ? 'Ya superado'
        : achievable
          ? 'Alcanzable'
          : 'Supera 5.00';

      return (
        '<tr class="' +
        (isCurrent ? 'active' : '') +
        '" data-scenario-target="' +
        row.targetGrade +
        '">' +
        '<td>' +
        escapeHtml(row.label) +
        '</td>' +
        '<td class="text-right mono">' +
        fmt(row.targetGrade) +
        '</td>' +
        '<td class="text-right mono" style="font-weight:600;color:' +
        valColor +
        '">' +
        (alreadyMet ? '0.00' : fmt(needed)) +
        '</td>' +
        '<td class="text-right mono" style="font-size:0.75rem;color:' +
        statusColor +
        '">' +
        statusText +
        '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderCourseNavigation() {
    var course = getActiveCourse();

    // Buffer tabs
    var tabsEl = document.getElementById('buffer-tabs');
    tabsEl.innerHTML =
      state.courses
        .map(function (c) {
          var isActive = c.id === course.id;
          return (
            '<button type="button" class="buffer-tab ' +
            (isActive ? 'active' : '') +
            '" data-select-course="' +
            escapeHtml(c.id) +
            '">' +
            '<span>' +
            escapeHtml(slugify(c.name)) +
            '</span>' +
            '</button>'
          );
        })
        .join('') +
      '<button type="button" id="btn-tab-new" class="buffer-add">+ Nueva materia</button>';

    // Sidebar courses
    document.getElementById('course-count').textContent = String(state.courses.length);
    var listEl = document.getElementById('course-list');
    listEl.innerHTML = state.courses
      .map(function (c) {
        var isActive = c.id === course.id;
        var cCalc = computeCalc(c);
        var deleteBtn =
          state.courses.length > 1
            ? '<button type="button" class="course-delete-btn" data-delete-course="' +
              escapeHtml(c.id) +
              '" aria-label="Eliminar ' +
              escapeHtml(c.name) +
              '" title="Eliminar materia">✕</button>'
            : '';

        return (
          '<div class="course-item ' +
          (isActive ? 'active' : '') +
          '">' +
          '<button type="button" class="course-select-btn" data-select-course="' +
          escapeHtml(c.id) +
          '">' +
          '<div class="course-item-name">' +
          escapeHtml(c.name) +
          '</div>' +
          '<div class="course-item-meta" data-course-meta="' +
          escapeHtml(c.id) +
          '">Examen nec: ' +
          (cCalc.rawNeeded <= 0 ? '0.00' : fmt(cCalc.rawNeeded)) +
          '</div>' +
          '</button>' +
          deleteBtn +
          '</div>'
        );
      })
      .join('');

    // Course header title or rename form
    var titleEl = document.getElementById('course-title');
    titleEl.textContent = course.name;
  }

  function syncInputsFromCourse() {
    var course = getActiveCourse();
    ['pd1', 'pd2', 'pd3'].forEach(function (key) {
      var input = document.getElementById('input-' + key);
      var slider = document.getElementById('slider-' + key);
      if (input) input.value = fmt(course[key]);
      if (slider) slider.value = String(course[key]);
      var warnEl = document.getElementById('warn-' + key);
      if (warnEl) warnEl.classList.add('hidden');
      if (input) input.classList.remove('warn');
    });

    var targetInput = document.getElementById('input-target');
    if (targetInput) targetInput.value = fmt(course.target);
  }

  function renderFullWorkspace() {
    renderCourseNavigation();
    syncInputsFromCourse();
    updateResultAndScenarios();
  }

  function selectCourse(id) {
    state.activeCourseId = id;
    state.isRenaming = false;
    toggleRenameUI(false);
    saveState();
    renderFullWorkspace();
  }

  function createCourse() {
    var nextNum = state.courses.length + 1;
    var newCourse = {
      id: 'materia-' + Date.now(),
      name: 'Materia ' + nextNum,
      pd1: 0,
      pd2: 0,
      pd3: 0,
      target: 3.0,
    };
    state.courses.push(newCourse);
    state.activeCourseId = newCourse.id;
    saveState();
    renderFullWorkspace();
    startRename();
  }

  function deleteCourse(id) {
    if (state.courses.length <= 1) return;
    state.courses = state.courses.filter(function (c) {
      return c.id !== id;
    });
    if (state.activeCourseId === id) {
      state.activeCourseId = state.courses[0].id;
    }
    saveState();
    renderFullWorkspace();
  }

  function toggleRenameUI(show) {
    state.isRenaming = show;
    document.getElementById('course-title-wrap').classList.toggle('hidden', show);
    document.getElementById('rename-form').classList.toggle('hidden', !show);
  }

  function startRename() {
    var course = getActiveCourse();
    var input = document.getElementById('rename-input');
    input.value = course.name;
    toggleRenameUI(true);
    input.focus();
    input.select();
  }

  function commitRename() {
    if (!state.isRenaming) return;
    var input = document.getElementById('rename-input');
    var trimmed = input.value.trim();
    if (trimmed) {
      getActiveCourse().name = trimmed;
      saveState();
    }
    toggleRenameUI(false);
    setVimMode('NORMAL');
    renderCourseNavigation();
    updateResultAndScenarios();
  }

  function updateGradeField(key, nextVal) {
    var course = getActiveCourse();
    course[key] = clampGrade(nextVal);
    saveState();
    updateResultAndScenarios();
  }

  function resetActiveGrades() {
    var course = getActiveCourse();
    course.pd1 = 0;
    course.pd2 = 0;
    course.pd3 = 0;
    saveState();
    syncInputsFromCourse();
    updateResultAndScenarios();
  }

  function loadExampleGrades() {
    var course = getActiveCourse();
    course.pd1 = 2.6;
    course.pd2 = 3.1;
    course.pd3 = 2.9;
    course.target = 3.0;
    saveState();
    syncInputsFromCourse();
    updateResultAndScenarios();
  }

  // Telescope Theme Modal
  function getFilteredThemes() {
    var q = state.themeQuery.trim().toLowerCase();
    if (!q) return THEMES;
    return THEMES.filter(function (t) {
      return (
        t.name.toLowerCase().indexOf(q) !== -1 ||
        t.vimCommand.toLowerCase().indexOf(q) !== -1 ||
        t.description.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function renderThemeList() {
    var listEl = document.getElementById('theme-list');
    var filtered = getFilteredThemes();
    if (filtered.length === 0) {
      listEl.innerHTML =
        '<div style="padding:28px 16px;text-align:center;color:var(--text-muted);" class="mono">No se encontraron temas.</div>';
      return;
    }

    listEl.innerHTML = filtered
      .map(function (t, idx) {
        var isHighlighted = idx === state.highlightedThemeIdx;
        var isSelected = t.id === state.themeId;
        var swatches = [
          t.colors.bgSurface,
          t.colors.accent,
          t.colors.ok,
          t.colors.warn,
          t.colors.danger,
        ]
          .map(function (hex) {
            return '<span class="swatch" style="background:' + hex + '"></span>';
          })
          .join('');

        return (
          '<button type="button" class="theme-option ' +
          (isHighlighted ? 'highlighted' : '') +
          '" data-theme-id="' +
          t.id +
          '" data-theme-idx="' +
          idx +
          '">' +
          '<div style="min-width:0">' +
          '<div style="display:flex;align-items:center;gap:8px;font-size:0.875rem;font-weight:600">' +
          '<span class="mono" style="color:' +
          (isHighlighted ? 'var(--accent)' : 'var(--text-primary)') +
          '">' +
          escapeHtml(t.name) +
          '</span>' +
          '<span style="color:var(--text-gutter)">·</span>' +
          '<span class="mono" style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">' +
          escapeHtml(t.variant) +
          '</span>' +
          '</div>' +
          '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">' +
          escapeHtml(t.description) +
          '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:12px;flex-shrink:0">' +
          '<div class="swatches">' +
          swatches +
          '</div>' +
          '<span class="mono" style="width:16px;text-align:right;color:var(--status-ok)">' +
          (isSelected ? '✓' : '') +
          '</span>' +
          '</div>' +
          '</button>'
        );
      })
      .join('');
  }

  function openThemeModal() {
    state.isThemeModalOpen = true;
    state.themeQuery = '';
    var idx = 0;
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === state.themeId) idx = i;
    }
    state.highlightedThemeIdx = idx;
    var search = document.getElementById('theme-search');
    search.value = '';
    document.getElementById('btn-crt-toggle').textContent =
      'Efecto CRT retro: ' + (state.scanlines ? 'Activado' : 'Desactivado');
    renderThemeList();
    document.getElementById('theme-modal').classList.remove('hidden');
    search.focus();
  }

  function closeThemeModal() {
    state.isThemeModalOpen = false;
    document.getElementById('theme-modal').classList.add('hidden');
  }

  function openWhichKeyModal() {
    state.isWhichKeyOpen = true;
    document.getElementById('whichkey-modal').classList.remove('hidden');
  }

  function closeWhichKeyModal() {
    state.isWhichKeyOpen = false;
    document.getElementById('whichkey-modal').classList.add('hidden');
  }

  function bindEvents() {
    // Delegate buffer tab and sidebar clicks
    document.addEventListener('click', function (e) {
      var target = e.target;
      var selectBtn = target.closest('[data-select-course]');
      if (selectBtn) {
        selectCourse(selectBtn.getAttribute('data-select-course'));
        return;
      }

      var deleteBtn = target.closest('[data-delete-course]');
      if (deleteBtn) {
        deleteCourse(deleteBtn.getAttribute('data-delete-course'));
        return;
      }

      if (target.closest('#btn-tab-new') || target.closest('#btn-sidebar-add')) {
        createCourse();
        return;
      }

      var presetBtn = target.closest('[data-preset]');
      if (presetBtn) {
        var val = Number(presetBtn.getAttribute('data-preset'));
        getActiveCourse().target = clampGrade(val);
        saveState();
        document.getElementById('input-target').value = fmt(val);
        updateResultAndScenarios();
        return;
      }

      var scenarioRow = target.closest('[data-scenario-target]');
      if (scenarioRow) {
        var sVal = Number(scenarioRow.getAttribute('data-scenario-target'));
        getActiveCourse().target = clampGrade(sVal);
        saveState();
        document.getElementById('input-target').value = fmt(sVal);
        updateResultAndScenarios();
        return;
      }

      var stepBtn = target.closest('[data-step-key]');
      if (stepBtn) {
        var key = stepBtn.getAttribute('data-step-key');
        var delta = Number(stepBtn.getAttribute('data-step-delta'));
        var course = getActiveCourse();
        var next = clampGrade(course[key] + delta);
        updateGradeField(key, next);
        document.getElementById('input-' + key).value = fmt(next);
        document.getElementById('slider-' + key).value = String(next);
        return;
      }

      var themeBtn = target.closest('[data-theme-id]');
      if (themeBtn) {
        state.themeId = themeBtn.getAttribute('data-theme-id');
        saveState();
        applyTheme();
        closeThemeModal();
      }
    });

    // Grade inputs & sliders
    ['pd1', 'pd2', 'pd3'].forEach(function (key) {
      var input = document.getElementById('input-' + key);
      var slider = document.getElementById('slider-' + key);
      var line = document.getElementById('line-' + key);
      var warn = document.getElementById('warn-' + key);

      input.addEventListener('focus', function () {
        setVimMode('INSERT');
        line.classList.add('focused');
      });

      input.addEventListener('input', function () {
        var parsed = parseGrade(input.value);
        if (parsed === null) return;
        if (parsed < 0 || parsed > 5) {
          warn.classList.remove('hidden');
          input.classList.add('warn');
        } else {
          warn.classList.add('hidden');
          input.classList.remove('warn');
        }
        var clamped = clampGrade(parsed);
        slider.value = String(clamped);
        updateGradeField(key, clamped);
      });

      input.addEventListener('blur', function () {
        setVimMode('NORMAL');
        line.classList.remove('focused');
        var parsed = parseGrade(input.value);
        var finalVal = parsed === null ? getActiveCourse()[key] : clampGrade(parsed);
        updateGradeField(key, finalVal);
        input.value = fmt(finalVal);
        slider.value = String(finalVal);
        warn.classList.add('hidden');
        input.classList.remove('warn');
      });

      slider.addEventListener('input', function () {
        var next = clampGrade(Number(slider.value));
        input.value = fmt(next);
        warn.classList.add('hidden');
        input.classList.remove('warn');
        updateGradeField(key, next);
      });
    });

    // Target input
    var targetInput = document.getElementById('input-target');
    var lineTarget = document.getElementById('line-target');
    targetInput.addEventListener('focus', function () {
      setVimMode('INSERT');
      lineTarget.classList.add('focused');
    });
    targetInput.addEventListener('input', function () {
      var parsed = parseGrade(targetInput.value);
      if (parsed === null) return;
      getActiveCourse().target = clampGrade(parsed);
      saveState();
      updateResultAndScenarios();
    });
    targetInput.addEventListener('blur', function () {
      setVimMode('NORMAL');
      lineTarget.classList.remove('focused');
      var parsed = parseGrade(targetInput.value);
      var clamped = parsed === null ? getActiveCourse().target : clampGrade(parsed);
      getActiveCourse().target = clamped;
      saveState();
      targetInput.value = fmt(clamped);
      updateResultAndScenarios();
    });

    // Rename form
    document.getElementById('btn-rename').addEventListener('click', startRename);
    document.getElementById('rename-input').addEventListener('focus', function () {
      setVimMode('INSERT');
    });
    document.getElementById('rename-input').addEventListener('blur', commitRename);
    document.getElementById('rename-form').addEventListener('submit', function (e) {
      e.preventDefault();
      commitRename();
    });

    // Action buttons
    document.getElementById('btn-example').addEventListener('click', loadExampleGrades);
    document.getElementById('btn-reset').addEventListener('click', resetActiveGrades);
    document.getElementById('btn-copy').addEventListener('click', function () {
      var course = getActiveCourse();
      var calc = computeCalc(course);
      var neededText =
        calc.rawNeeded <= 0
          ? '0.00 (Ya aprobada)'
          : calc.rawNeeded > 5
            ? fmt(calc.rawNeeded) + ' (No alcanzable, máx ' + fmt(calc.maxFinal) + ')'
            : fmt(calc.rawNeeded);

      var text = [
        'Materia: ' + course.name,
        'pd1 (20%): ' + fmt(course.pd1) + ' -> +' + fmt(calc.w1),
        'pd2 (20%): ' + fmt(course.pd2) + ' -> +' + fmt(calc.w2),
        'pd3 (20%): ' + fmt(course.pd3) + ' -> +' + fmt(calc.w3),
        'Acumulado (60%): ' + fmt(calc.acc) + ' / 3.00',
        'Meta final: ' + fmt(course.target) + ' / 5.00',
        'Necesitas en Examen (40%): ' + neededText,
      ].join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          var btn = document.getElementById('btn-copy');
          btn.textContent = '✓ Copiado';
          btn.style.color = 'var(--status-ok)';
          setTimeout(function () {
            btn.textContent = 'Copiar';
            btn.style.color = '';
          }, 1800);
        });
      }
    });

    // Theme & Which-Key triggers
    document.getElementById('btn-open-themes').addEventListener('click', openThemeModal);
    document.getElementById('lualine-theme-cmd').addEventListener('click', openThemeModal);
    document.getElementById('btn-close-themes').addEventListener('click', closeThemeModal);
    document.getElementById('theme-modal').addEventListener('click', function (e) {
      if (e.target === this) closeThemeModal();
    });

    document.getElementById('btn-nav-whichkey').addEventListener('click', openWhichKeyModal);
    document.getElementById('lualine-whichkey').addEventListener('click', openWhichKeyModal);
    document.getElementById('btn-close-whichkey').addEventListener('click', closeWhichKeyModal);
    document.getElementById('whichkey-modal').addEventListener('click', function (e) {
      if (e.target === this) closeWhichKeyModal();
    });

    document.getElementById('theme-search').addEventListener('input', function (e) {
      state.themeQuery = e.target.value;
      state.highlightedThemeIdx = 0;
      renderThemeList();
    });

    document.getElementById('btn-crt-toggle').addEventListener('click', function () {
      state.scanlines = !state.scanlines;
      saveState();
      applyTheme();
      this.textContent = 'Efecto CRT retro: ' + (state.scanlines ? 'Activado' : 'Desactivado');
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', function (e) {
      if (state.isThemeModalOpen) {
        var filtered = getFilteredThemes();
        if (e.key === 'Escape') {
          e.preventDefault();
          closeThemeModal();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (filtered.length > 0) {
            state.highlightedThemeIdx = (state.highlightedThemeIdx + 1) % filtered.length;
            renderThemeList();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (filtered.length > 0) {
            state.highlightedThemeIdx =
              (state.highlightedThemeIdx - 1 + filtered.length) % filtered.length;
            renderThemeList();
          }
        } else if (e.key === 'Enter' && filtered[state.highlightedThemeIdx]) {
          e.preventDefault();
          state.themeId = filtered[state.highlightedThemeIdx].id;
          saveState();
          applyTheme();
          closeThemeModal();
        }
        return;
      }

      if (state.isWhichKeyOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeWhichKeyModal();
        }
        return;
      }

      var activeEl = document.activeElement;
      var isInput =
        activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (e.key === 'Escape' && isInput) {
        activeEl.blur();
        setVimMode('NORMAL');
        return;
      }

      if (isInput) return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        var el = document.getElementById('input-pd' + e.key);
        if (el) {
          el.focus();
          el.select();
        }
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        openThemeModal();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetActiveGrades();
      } else if (e.key === '?') {
        e.preventDefault();
        openWhichKeyModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme();
    renderFullWorkspace();
    bindEvents();
  });
})();
