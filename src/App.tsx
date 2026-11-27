import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileCode2,
  FolderOpen,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  XCircle,
} from 'lucide-react';
import {GradeInputRow} from './components/GradeInputRow';
import {TelescopeThemeModal} from './components/TelescopeThemeModal';
import {WhichKeyModal} from './components/WhichKeyModal';
import {DEFAULT_THEME_ID, getThemeById, LAZY_THEMES} from './data/themes';
import {CourseBuffer, ThemeId} from './types/grade';
import {
  buildSummaryText,
  calculateGradeMetrics,
  clampGrade,
  formatGrade,
  parseGradeInput,
} from './utils/calculations';

const STORAGE_KEYS = {
  courses: 'lazygrade_courses_v1',
  activeCourseId: 'lazygrade_active_course_v1',
  themeId: 'lazygrade_theme_v1',
  scanlines: 'lazygrade_scanlines_v1',
};

const INITIAL_COURSES: CourseBuffer[] = [
  {
    id: 'calculo-diferencial',
    name: 'Cálculo Diferencial',
    pd1: 3.2,
    pd2: 2.8,
    pd3: 3.5,
    target: 3.0,
    updatedAt: Date.now(),
  },
  {
    id: 'estructuras-datos',
    name: 'Estructuras de Datos',
    pd1: 4.1,
    pd2: 3.9,
    pd3: 4.2,
    target: 3.0,
    updatedAt: Date.now(),
  },
];

function slugifyCourseName(name: string): string {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${clean || 'materia'}.grd`;
}

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.themeId) as ThemeId | null;
      if (saved && LAZY_THEMES.some((t) => t.id === saved)) return saved;
    } catch {
      // Ignore storage access errors
    }
    return DEFAULT_THEME_ID as ThemeId;
  });

  const [crtScanlines, setCrtScanlines] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.scanlines) === 'true';
    } catch {
      return false;
    }
  });

  const [courses, setCourses] = useState<CourseBuffer[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.courses);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial courses
    }
    return INITIAL_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.activeCourseId);
      if (saved) return saved;
    } catch {
      // Ignore storage access errors
    }
    return INITIAL_COURSES[0].id;
  });

  const [vimMode, setVimMode] = useState<'NORMAL' | 'INSERT'>('NORMAL');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isWhichKeyOpen, setIsWhichKeyOpen] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [isRenamingCourse, setIsRenamingCourse] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [targetDraft, setTargetDraft] = useState('3.00');

  const pd1Ref = useRef<HTMLInputElement>(null);
  const pd2Ref = useRef<HTMLInputElement>(null);
  const pd3Ref = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeTheme = useMemo(() => getThemeById(themeId), [themeId]);

  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === activeCourseId) ?? courses[0];
  }, [courses, activeCourseId]);

  useEffect(() => {
    if (activeCourse && activeCourse.id !== activeCourseId) {
      setActiveCourseId(activeCourse.id);
    }
  }, [activeCourse, activeCourseId]);

  useEffect(() => {
    setTargetDraft(formatGrade(activeCourse.target));
  }, [activeCourse.id, activeCourse.target]);

  // Apply active theme tokens to CSS custom properties and html.dark class
  useEffect(() => {
    const root = document.documentElement;
    const c = activeTheme.colors;
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

    if (activeTheme.variant === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeTheme]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEYS.activeCourseId, activeCourse.id);
      localStorage.setItem(STORAGE_KEYS.themeId, themeId);
      localStorage.setItem(STORAGE_KEYS.scanlines, String(crtScanlines));
    } catch {
      // Ignore storage quota errors
    }
  }, [courses, activeCourse.id, themeId, crtScanlines]);

  const updateActiveCourse = useCallback(
    (patch: Partial<CourseBuffer>) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === activeCourse.id
            ? {...course, ...patch, updatedAt: Date.now()}
            : course
        )
      );
    },
    [activeCourse.id]
  );

  const handleCreateCourse = () => {
    const nextNum = courses.length + 1;
    const newCourse: CourseBuffer = {
      id: `materia-${Date.now()}`,
      name: `Materia ${nextNum}`,
      pd1: 0,
      pd2: 0,
      pd3: 0,
      target: 3.0,
      updatedAt: Date.now(),
    };
    setCourses((prev) => [...prev, newCourse]);
    setActiveCourseId(newCourse.id);
    setRenameDraft(newCourse.name);
    setIsRenamingCourse(true);
    requestAnimationFrame(() => renameInputRef.current?.focus());
  };

  const handleDeleteCourse = (idToDelete: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => {
      const remaining = prev.filter((c) => c.id !== idToDelete);
      if (activeCourse.id === idToDelete && remaining.length > 0) {
        setActiveCourseId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleResetGrades = useCallback(() => {
    updateActiveCourse({pd1: 0, pd2: 0, pd3: 0});
  }, [updateActiveCourse]);

  const handleLoadExample = () => {
    updateActiveCourse({pd1: 2.6, pd2: 3.1, pd3: 2.9, target: 3.0});
  };

  const calc = useMemo(
    () =>
      calculateGradeMetrics(
        activeCourse.pd1,
        activeCourse.pd2,
        activeCourse.pd3,
        activeCourse.target
      ),
    [activeCourse]
  );

  const handleCopySummary = async () => {
    const summary = buildSummaryText(
      activeCourse.name,
      activeCourse.pd1,
      activeCourse.pd2,
      activeCourse.pd3,
      activeCourse.target,
      calc
    );
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const commitRename = () => {
    const trimmed = renameDraft.trim();
    if (trimmed) {
      updateActiveCourse({name: trimmed});
    }
    setIsRenamingCourse(false);
    setVimMode('NORMAL');
  };

  // Global LazyVim Normal-mode keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isThemeModalOpen || isWhichKeyOpen) return;

      const targetEl = e.target as HTMLElement | null;
      const isEditingInput =
        targetEl &&
        (targetEl.tagName === 'INPUT' ||
          targetEl.tagName === 'TEXTAREA' ||
          targetEl.isContentEditable);

      if (e.key === 'Escape' && isEditingInput) {
        targetEl.blur();
        setVimMode('NORMAL');
        return;
      }

      if (isEditingInput) return;

      if (e.key === '1') {
        e.preventDefault();
        pd1Ref.current?.focus();
        pd1Ref.current?.select();
      } else if (e.key === '2') {
        e.preventDefault();
        pd2Ref.current?.focus();
        pd2Ref.current?.select();
      } else if (e.key === '3') {
        e.preventDefault();
        pd3Ref.current?.focus();
        pd3Ref.current?.select();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsThemeModalOpen(true);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetGrades();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsWhichKeyOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThemeModalOpen, isWhichKeyOpen, handleResetGrades]);

  const statusVisual = useMemo(() => {
    switch (calc.status) {
      case 'approved':
        return {
          color: 'var(--status-ok)',
          Icon: CheckCircle2,
          headline: '0.00',
        };
      case 'impossible':
        return {
          color: 'var(--status-danger)',
          Icon: XCircle,
          headline: formatGrade(calc.rawNeededExam),
        };
      case 'challenging':
        return {
          color: 'var(--status-warn)',
          Icon: AlertTriangle,
          headline: formatGrade(calc.rawNeededExam),
        };
      default:
        return {
          color: 'var(--accent)',
          Icon: Target,
          headline: formatGrade(calc.rawNeededExam),
        };
    }
  }, [calc.status, calc.rawNeededExam]);

  const StatusIcon = statusVisual.Icon;
  const pointsMissing = Math.max(0, activeCourse.target - calc.accumulated);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-150"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Optional subtle CRT scanline overlay */}
      {crtScanlines && (
        <div
          className="fixed inset-0 pointer-events-none z-40 crt-scanlines opacity-65"
          aria-hidden="true"
        />
      )}

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#calculadora"
            className="text-lg font-bold tracking-tight font-mono-tabular whitespace-nowrap shrink-0"
            style={{color: 'var(--accent)'}}
          >
            LazyGrade
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
            style={{color: 'var(--text-muted)'}}
          >
            <a
              href="#calculadora"
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
              style={{color: 'var(--text-primary)'}}
            >
              Calculadora
            </a>
            <a
              href="#escenarios"
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
            >
              Escenarios
            </a>
            <button
              type="button"
              onClick={() => setIsWhichKeyOpen(true)}
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              Atajos
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="h-10 px-4 rounded border inline-flex items-center gap-2 text-xs font-medium font-mono-tabular whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
                borderColor: 'var(--accent)',
              }}
            >
              <Palette className="w-4 h-4" />
              <span>Tema: {activeTheme.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main LazyVim Workspace */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Intro Hero Header */}
        <section
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b"
          style={{borderColor: 'var(--border-color)'}}
        >
          <div className="space-y-2 max-w-2xl">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{textWrap: 'balance', color: 'var(--text-primary)'}}
            >
              Calcula cuánto necesitas en el Examen final para aprobar tu materia
            </h1>
            <p className="text-sm sm:text-base" style={{color: 'var(--text-muted)'}}>
              Ingresa tus tres notas parciales de{' '}
              <span className="font-mono-tabular font-medium" style={{color: 'var(--text-primary)'}}>
                0.00 a 5.00
              </span>{' '}
              (<span className="font-mono-tabular">pd1, pd2, pd3</span> · 20% cada una) para
              conocer la nota exacta requerida en el{' '}
              <span className="font-mono-tabular font-medium" style={{color: 'var(--accent)'}}>
                Examen (40%)
              </span>
              .
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular"
            style={{color: 'var(--text-muted)'}}
          >
            <span>Escala 0.00 – 5.00</span>
            <span aria-hidden="true">·</span>
            <span>Cortes 60% + Examen 40%</span>
            <span aria-hidden="true">·</span>
            <span>Guardado local automático</span>
          </div>
        </section>

        {/* Neovim Window Frame */}
        <section
          id="calculadora"
          className="rounded-md border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Buffer Tabline */}
          <div
            className="flex items-center justify-between gap-4 px-3 py-2 border-b overflow-x-auto"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-1 min-w-0">
              {courses.map((course) => {
                const isActive = course.id === activeCourse.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setActiveCourseId(course.id)}
                    className="h-9 px-3 rounded-sm border text-xs font-mono-tabular flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                      borderColor: isActive ? 'var(--accent)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <FileCode2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{color: isActive ? 'var(--accent)' : 'var(--text-gutter)'}}
                    />
                    <span className="max-w-[140px] truncate">{slugifyCourseName(course.name)}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleCreateCourse}
                aria-label="Agregar nueva materia"
                className="h-9 px-2.5 rounded-sm text-xs font-mono-tabular flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{color: 'var(--accent)'}}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva materia</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs font-mono-tabular">
              <span
                className="px-2 py-1 rounded-xs font-semibold"
                style={{
                  backgroundColor:
                    vimMode === 'INSERT' ? 'var(--status-ok)' : 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                {vimMode}
              </span>
            </div>
          </div>

          {/* Workspace Body: Neo-tree Sidebar + Two-Zone Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
            {/* Left Sidebar: Neo-tree Materias */}
            <aside
              aria-label="Lista de materias"
              className="border-b lg:border-b-0 lg:border-r p-3 space-y-3"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between px-1">
                <div
                  className="flex items-center gap-2 text-xs font-mono-tabular font-semibold"
                  style={{color: 'var(--text-muted)'}}
                >
                  <FolderOpen className="w-3.5 h-3.5" style={{color: 'var(--accent)'}} />
                  <span>Materias guardadas</span>
                </div>
                <span className="text-xs font-mono-tabular" style={{color: 'var(--text-gutter)'}}>
                  {courses.length}
                </span>
              </div>

              <div className="space-y-1">
                {courses.map((course) => {
                  const isActive = course.id === activeCourse.id;
                  const courseCalc = calculateGradeMetrics(
                    course.pd1,
                    course.pd2,
                    course.pd3,
                    course.target
                  );
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-1 rounded-sm px-2 py-1.5 transition-colors"
                      style={{
                        backgroundColor: isActive ? 'var(--bg-highlight)' : 'transparent',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveCourseId(course.id)}
                        className="flex-1 min-w-0 text-left py-1 cursor-pointer"
                      >
                        <div
                          className="text-xs font-medium truncate"
                          style={{
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {course.name}
                        </div>
                        <div
                          className="text-[11px] font-mono-tabular truncate mt-0.5"
                          style={{color: 'var(--text-gutter)'}}
                        >
                          Examen nec:{' '}
                          {courseCalc.rawNeededExam <= 0
                            ? '0.00'
                            : formatGrade(courseCalc.rawNeededExam)}
                        </div>
                      </button>

                      {courses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          aria-label={`Eliminar ${course.name}`}
                          className="h-8 w-8 flex items-center justify-center rounded-sm shrink-0 cursor-pointer transition-colors"
                          style={{color: 'var(--text-gutter)'}}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleCreateCourse}
                className="w-full h-10 px-3 rounded border text-xs font-mono-tabular flex items-center justify-center gap-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <Plus className="w-3.5 h-3.5" style={{color: 'var(--accent)'}} />
                <span>Agregar materia</span>
              </button>
            </aside>

            {/* Right Area: Split Inputs + Result Focal Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
              {/* Zone A: Grade Inputs (pd1, pd2, pd3 + target) */}
              <div
                className="border-b xl:border-b-0 xl:border-r flex flex-col justify-between"
                style={{borderColor: 'var(--border-color)'}}
              >
                <div>
                  {/* Active Course Title Bar */}
                  <div
                    className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3"
                    style={{borderColor: 'var(--border-color)'}}
                  >
                    {isRenamingCourse ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitRename();
                        }}
                        className="flex items-center gap-2 flex-1 min-w-[200px]"
                      >
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onFocus={() => setVimMode('INSERT')}
                          onBlur={commitRename}
                          aria-label="Nombre de la materia"
                          className="h-9 px-2.5 rounded border text-sm font-medium w-full focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-canvas)',
                            borderColor: 'var(--accent)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <button
                          type="submit"
                          className="h-9 px-3 rounded text-xs font-mono-tabular font-semibold cursor-pointer"
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--accent-fg)',
                          }}
                        >
                          Guardar
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-base font-semibold truncate">
                          {activeCourse.name}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameDraft(activeCourse.name);
                            setIsRenamingCourse(true);
                            requestAnimationFrame(() => renameInputRef.current?.focus());
                          }}
                          className="text-xs font-mono-tabular underline underline-offset-2 cursor-pointer shrink-0"
                          style={{color: 'var(--text-muted)'}}
                        >
                          Renombrar
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleLoadExample}
                        className="h-9 px-3 rounded border text-xs font-mono-tabular inline-flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ejemplo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetGrades}
                        className="h-9 px-3 rounded border text-xs font-mono-tabular inline-flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Limpiar</span>
                      </button>
                    </div>
                  </div>

                  {/* Line-numbered Grade Inputs */}
                  <div>
                    <GradeInputRow
                      lineNumber={1}
                      variableName="pd1"
                      label="Primera nota parcial"
                      weightPercent={20}
                      value={activeCourse.pd1}
                      weightedContribution={calc.pd1Weighted}
                      inputRef={pd1Ref}
                      onChange={(next) => updateActiveCourse({pd1: next})}
                      onFocusChange={(focused) => setVimMode(focused ? 'INSERT' : 'NORMAL')}
                    />
                    <GradeInputRow
                      lineNumber={2}
                      variableName="pd2"
                      label="Segunda nota parcial"
                      weightPercent={20}
                      value={activeCourse.pd2}
                      weightedContribution={calc.pd2Weighted}
                      inputRef={pd2Ref}
                      onChange={(next) => updateActiveCourse({pd2: next})}
                      onFocusChange={(focused) => setVimMode(focused ? 'INSERT' : 'NORMAL')}
                    />
                    <GradeInputRow
                      lineNumber={3}
                      variableName="pd3"
                      label="Tercera nota parcial"
                      weightPercent={20}
                      value={activeCourse.pd3}
                      weightedContribution={calc.pd3Weighted}
                      inputRef={pd3Ref}
                      onChange={(next) => updateActiveCourse({pd3: next})}
                      onFocusChange={(focused) => setVimMode(focused ? 'INSERT' : 'NORMAL')}
                    />

                    {/* Line 4: Passing Target Grade */}
                    <div
                      className="grid grid-cols-[2.25rem_1fr] border-t"
                      style={{borderColor: 'var(--border-color)'}}
                    >
                      <div
                        className="flex items-start justify-end pr-3 pt-4 text-xs font-mono-tabular select-none"
                        style={{color: 'var(--text-gutter)'}}
                        aria-hidden="true"
                      >
                        4
                      </div>
                      <div className="py-3.5 pr-4 pl-1 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <label
                              htmlFor="input-target"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <span
                                className="font-mono-tabular font-semibold"
                                style={{color: 'var(--secondary)'}}
                              >
                                meta
                              </span>
                              <span style={{color: 'var(--text-gutter)'}} aria-hidden="true">
                                ·
                              </span>
                              <span>Nota mínima para pasar</span>
                            </label>
                            <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>
                              Por defecto 3.00 sobre 5.00; puedes ajustarla si buscas beca o promedio.
                            </p>
                          </div>

                          <input
                            id="input-target"
                            type="text"
                            inputMode="decimal"
                            value={targetDraft}
                            onFocus={() => setVimMode('INSERT')}
                            onChange={(e) => {
                              setTargetDraft(e.target.value);
                              const parsed = parseGradeInput(e.target.value);
                              if (parsed !== null) {
                                updateActiveCourse({target: clampGrade(parsed)});
                              }
                            }}
                            onBlur={() => {
                              setVimMode('NORMAL');
                              const parsed = parseGradeInput(targetDraft);
                              const clamped =
                                parsed === null ? activeCourse.target : clampGrade(parsed);
                              updateActiveCourse({target: clamped});
                              setTargetDraft(formatGrade(clamped));
                            }}
                            aria-label="Nota mínima objetivo para aprobar"
                            className="h-10 w-24 px-2.5 text-center text-sm font-semibold font-mono-tabular rounded border"
                            style={{
                              backgroundColor: 'var(--bg-canvas)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-primary)',
                            }}
                          />
                        </div>

                        {/* Quick Segmented Target Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[3.0, 3.5, 4.0, 4.5].map((preset) => {
                            const isSelected = Math.abs(activeCourse.target - preset) < 0.001;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  updateActiveCourse({target: preset});
                                  setTargetDraft(formatGrade(preset));
                                }}
                                className="h-9 px-3 rounded border text-xs font-mono-tabular whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                                style={{
                                  backgroundColor: isSelected
                                    ? 'var(--bg-highlight)'
                                    : 'var(--bg-canvas)',
                                  borderColor: isSelected
                                    ? 'var(--accent)'
                                    : 'var(--border-color)',
                                  color: isSelected
                                    ? 'var(--accent)'
                                    : 'var(--text-muted)',
                                }}
                              >
                                {preset.toFixed(1)} {preset === 3.0 ? '· Mínimo' : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone B: Focal Result Panel (Examen 40% required) */}
              <div className="p-5 sm:p-6 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-xs font-mono-tabular font-medium"
                        style={{color: 'var(--text-muted)'}}
                      >
                        Resultado requerido en el Examen (40%)
                      </p>
                      <h3 className="text-lg font-semibold mt-0.5">
                        Nota necesaria en{' '}
                        <span className="font-mono-tabular" style={{color: 'var(--accent)'}}>
                          Examen
                        </span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="h-9 px-3 rounded border text-xs font-mono-tabular inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-color)',
                        color: copiedFeedback ? 'var(--status-ok)' : 'var(--text-muted)',
                      }}
                    >
                      {copiedFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dominant Focal Numeric Anchor */}
                  <div
                    className="p-5 rounded border space-y-3"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: statusVisual.color,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-4 flex-wrap">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-5xl sm:text-6xl font-bold font-mono-tabular tracking-tight"
                          style={{color: statusVisual.color}}
                        >
                          {statusVisual.headline}
                        </span>
                        <span
                          className="text-lg font-mono-tabular"
                          style={{color: 'var(--text-gutter)'}}
                        >
                          / 5.00
                        </span>
                      </div>

                      <div
                        className="inline-flex items-center gap-1.5 text-sm font-medium font-mono-tabular"
                        style={{color: statusVisual.color}}
                      >
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        <span>{calc.statusLabel}</span>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed" style={{color: 'var(--text-primary)'}}>
                      {calc.statusDetail}
                    </p>
                  </div>

                  {/* 4-Metric Tabular Breakdown (clean dividers, no nested cards) */}
                  <div
                    className="grid grid-cols-2 border rounded divide-x divide-y"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-elevated)',
                    }}
                  >
                    <div className="p-3.5" style={{borderColor: 'var(--border-color)'}}>
                      <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                        Acumulado (60%)
                      </div>
                      <div className="text-xl font-semibold font-mono-tabular mt-1">
                        {formatGrade(calc.accumulated)}
                        <span className="text-xs font-normal ml-1" style={{color: 'var(--text-gutter)'}}>
                          / 3.00
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5" style={{borderColor: 'var(--border-color)'}}>
                      <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                        Puntos faltantes
                      </div>
                      <div className="text-xl font-semibold font-mono-tabular mt-1">
                        {formatGrade(pointsMissing)}
                        <span className="text-xs font-normal ml-1" style={{color: 'var(--text-gutter)'}}>
                          pts
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5" style={{borderColor: 'var(--border-color)'}}>
                      <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                        Mínimo (Examen 0.00)
                      </div>
                      <div className="text-xl font-semibold font-mono-tabular mt-1">
                        {formatGrade(calc.minPossibleFinal)}
                      </div>
                    </div>

                    <div className="p-3.5" style={{borderColor: 'var(--border-color)'}}>
                      <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                        Máximo (Examen 5.00)
                      </div>
                      <div
                        className="text-xl font-semibold font-mono-tabular mt-1"
                        style={{
                          color:
                            calc.maxPossibleFinal >= activeCourse.target
                              ? 'var(--status-ok)'
                              : 'var(--status-danger)',
                        }}
                      >
                        {formatGrade(calc.maxPossibleFinal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accumulated Progress Bar (60% partial weight bar) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-tabular">
                    <span style={{color: 'var(--text-muted)'}}>
                      Progreso del 60% parcial
                    </span>
                    <span style={{color: 'var(--text-primary)'}}>
                      {calc.accumulatedPercentOfMax.toFixed(0)}% obtenido
                    </span>
                  </div>
                  <div
                    className="h-2.5 w-full rounded-xs overflow-hidden border"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-color)',
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(calc.accumulatedPercentOfMax)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progreso acumulado del 60 por ciento"
                  >
                    <div
                      className="h-full transition-all duration-150"
                      style={{
                        width: `${Math.min(100, Math.max(0, calc.accumulatedPercentOfMax))}%`,
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LazyVim Lualine Statusline (real workspace state only) */}
          <div
            className="px-3 py-2 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="px-2 py-0.5 rounded-xs font-semibold"
                style={{
                  backgroundColor:
                    vimMode === 'INSERT' ? 'var(--status-ok)' : 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                {vimMode}
              </span>
              <span style={{color: 'var(--text-primary)'}}>
                {slugifyCourseName(activeCourse.name)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Acum: {formatGrade(calc.accumulated)} / 3.00
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="hover:underline cursor-pointer"
                style={{color: 'var(--cyan)'}}
              >
                :{activeTheme.vimCommand}
              </button>
              <button
                type="button"
                onClick={() => setIsWhichKeyOpen(true)}
                className="hover:underline cursor-pointer"
                style={{color: 'var(--text-muted)'}}
              >
                Atajos (?)
              </button>
            </div>
          </div>
        </section>

        {/* Target Scenarios Matrix */}
        <section
          id="escenarios"
          className="rounded-md border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div
            className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3"
            style={{borderColor: 'var(--border-color)'}}
          >
            <div>
              <h2 className="text-base font-semibold">
                Escenarios de nota final objetivo
              </h2>
              <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>
                Haz clic en cualquier fila para fijar esa meta como objetivo en la calculadora.
              </p>
            </div>
            <span className="text-xs font-mono-tabular" style={{color: 'var(--text-muted)'}}>
              Acumulado actual: {formatGrade(calc.accumulated)} / 3.00
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b text-xs font-mono-tabular"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <th className="py-3 px-5 font-medium">Objetivo</th>
                  <th className="py-3 px-4 font-medium text-right">Meta definitiva</th>
                  <th className="py-3 px-4 font-medium text-right">Nota requerida en Examen (40%)</th>
                  <th className="py-3 px-5 font-medium text-right">Viabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{borderColor: 'var(--border-color)'}}>
                {calc.scenarios.map((row) => {
                  const isCurrentTarget =
                    Math.abs(activeCourse.target - row.targetGrade) < 0.001;
                  return (
                    <tr
                      key={row.targetGrade}
                      onClick={() => {
                        updateActiveCourse({target: row.targetGrade});
                        setTargetDraft(formatGrade(row.targetGrade));
                      }}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isCurrentTarget ? 'var(--bg-highlight)' : 'transparent',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <td className="py-3 px-5 font-medium">
                        {row.label}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular">
                        {formatGrade(row.targetGrade)}
                      </td>
                      <td
                        className="py-3 px-4 text-right font-mono-tabular font-semibold"
                        style={{
                          color: row.alreadyMet
                            ? 'var(--status-ok)'
                            : row.achievable
                              ? 'var(--text-primary)'
                              : 'var(--status-danger)',
                        }}
                      >
                        {row.alreadyMet ? '0.00' : formatGrade(row.neededExam)}
                      </td>
                      <td className="py-3 px-5 text-right font-mono-tabular text-xs">
                        {row.alreadyMet ? (
                          <span style={{color: 'var(--status-ok)'}}>Ya superado</span>
                        ) : row.achievable ? (
                          <span style={{color: 'var(--accent)'}}>Alcanzable</span>
                        ) : (
                          <span style={{color: 'var(--status-danger)'}}>Supera 5.00</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modals */}
      <TelescopeThemeModal
        isOpen={isThemeModalOpen}
        activeThemeId={themeId}
        crtScanlines={crtScanlines}
        onToggleScanlines={() => setCrtScanlines((prev) => !prev)}
        onSelectTheme={(id) => setThemeId(id)}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <WhichKeyModal
        isOpen={isWhichKeyOpen}
        onClose={() => setIsWhichKeyOpen(false)}
      />
    </div>
  );
}
