import {EvalStatus, GradeCalculation, ScenarioRow} from '../types/grade';

export const MIN_GRADE = 0;
export const MAX_GRADE = 5;
export const WEIGHT_PD = 0.2;
export const WEIGHT_EXAM = 0.4;

export function clampGrade(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round(value * 100) / 100));
}

export function formatGrade(value: number): string {
  return value.toFixed(2);
}

export function parseGradeInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return null;
  return parsed;
}

export function calculateGradeMetrics(
  pd1: number,
  pd2: number,
  pd3: number,
  target: number
): GradeCalculation {
  const safePd1 = clampGrade(pd1);
  const safePd2 = clampGrade(pd2);
  const safePd3 = clampGrade(pd3);
  const safeTarget = clampGrade(target);

  const pd1Weighted = safePd1 * WEIGHT_PD;
  const pd2Weighted = safePd2 * WEIGHT_PD;
  const pd3Weighted = safePd3 * WEIGHT_PD;

  const accumulated = pd1Weighted + pd2Weighted + pd3Weighted;
  const accumulatedPercentOfMax = (accumulated / 3.0) * 100;

  const rawNeededExam = (safeTarget - accumulated) / WEIGHT_EXAM;
  const clampedNeededExam = Math.min(MAX_GRADE, Math.max(MIN_GRADE, rawNeededExam));

  const maxPossibleFinal = accumulated + MAX_GRADE * WEIGHT_EXAM;
  const minPossibleFinal = accumulated;

  let status: EvalStatus = 'achievable';
  let statusLabel = 'Meta alcanzable';
  let statusDetail = `Necesitas ${formatGrade(rawNeededExam)} en el Examen (40%) para llegar a ${formatGrade(safeTarget)}.`;

  if (rawNeededExam <= 0) {
    status = 'approved';
    statusLabel = 'Materia ya aprobada';
    statusDetail = `Con ${formatGrade(accumulated)} acumulados ya superas ${formatGrade(safeTarget)} incluso sacando 0.00 en el Examen.`;
  } else if (rawNeededExam > MAX_GRADE) {
    status = 'impossible';
    statusLabel = 'Fuera de rango (> 5.00)';
    statusDetail = `Necesitarías ${formatGrade(rawNeededExam)} en el Examen. Con 5.00 alcanzarías máximo ${formatGrade(maxPossibleFinal)}.`;
  } else if (rawNeededExam >= 4.0) {
    status = 'challenging';
    statusLabel = 'Exige puntaje alto';
    statusDetail = `Debes sacar al menos ${formatGrade(rawNeededExam)} de 5.00 en el Examen final para lograr ${formatGrade(safeTarget)}.`;
  }

  const scenarioTargets = [
    {label: 'Aprobar mínimo', targetGrade: 3.0},
    {label: 'Desempeño sólido', targetGrade: 3.5},
    {label: 'Sobresaliente', targetGrade: 4.0},
    {label: 'Excelencia', targetGrade: 4.5},
    {label: 'Nota perfecta', targetGrade: 5.0},
  ];

  const scenarios: ScenarioRow[] = scenarioTargets.map((item) => {
    const needed = (item.targetGrade - accumulated) / WEIGHT_EXAM;
    return {
      label: item.label,
      targetGrade: item.targetGrade,
      neededExam: needed,
      achievable: needed <= MAX_GRADE + 1e-9,
      alreadyMet: needed <= 0,
    };
  });

  return {
    pd1Weighted,
    pd2Weighted,
    pd3Weighted,
    accumulated,
    accumulatedPercentOfMax,
    rawNeededExam,
    clampedNeededExam,
    status,
    statusLabel,
    statusDetail,
    maxPossibleFinal,
    minPossibleFinal,
    scenarios,
  };
}

export function buildSummaryText(
  courseName: string,
  pd1: number,
  pd2: number,
  pd3: number,
  target: number,
  calc: GradeCalculation
): string {
  const neededText =
    calc.rawNeededExam <= 0
      ? '0.00 (Ya aprobada)'
      : calc.rawNeededExam > MAX_GRADE
        ? `${formatGrade(calc.rawNeededExam)} (No alcanzable, máx ${formatGrade(calc.maxPossibleFinal)})`
        : formatGrade(calc.rawNeededExam);

  return [
    `Materia: ${courseName}`,
    `pd1 (20%): ${formatGrade(pd1)} -> +${formatGrade(calc.pd1Weighted)}`,
    `pd2 (20%): ${formatGrade(pd2)} -> +${formatGrade(calc.pd2Weighted)}`,
    `pd3 (20%): ${formatGrade(pd3)} -> +${formatGrade(calc.pd3Weighted)}`,
    `Acumulado (60%): ${formatGrade(calc.accumulated)} / 3.00`,
    `Meta final: ${formatGrade(target)} / 5.00`,
    `Necesitas en Examen (40%): ${neededText}`,
  ].join('\n');
}
