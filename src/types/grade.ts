export type ThemeId =
  | 'tokyonight'
  | 'catppuccin'
  | 'gruvbox'
  | 'retro-amber'
  | 'nord'
  | 'everforest-light';

export interface LazyTheme {
  id: ThemeId;
  name: string;
  vimCommand: string;
  variant: 'dark' | 'light';
  description: string;
  colors: {
    bgCanvas: string;
    bgSurface: string;
    bgElevated: string;
    bgHighlight: string;
    border: string;
    textPrimary: string;
    textMuted: string;
    textGutter: string;
    accent: string;
    accentFg: string;
    ok: string;
    warn: string;
    danger: string;
    secondary: string;
    cyan: string;
  };
}

export interface CourseBuffer {
  id: string;
  name: string;
  pd1: number;
  pd2: number;
  pd3: number;
  target: number;
  updatedAt: number;
}

export type EvalStatus = 'approved' | 'achievable' | 'challenging' | 'impossible';

export interface ScenarioRow {
  label: string;
  targetGrade: number;
  neededExam: number;
  achievable: boolean;
  alreadyMet: boolean;
}

export interface GradeCalculation {
  pd1Weighted: number;
  pd2Weighted: number;
  pd3Weighted: number;
  accumulated: number;
  accumulatedPercentOfMax: number;
  rawNeededExam: number;
  clampedNeededExam: number;
  status: EvalStatus;
  statusLabel: string;
  statusDetail: string;
  maxPossibleFinal: number;
  minPossibleFinal: number;
  scenarios: ScenarioRow[];
}
