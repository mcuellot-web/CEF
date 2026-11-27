import React, {useEffect, useState} from 'react';
import {Minus, Plus} from 'lucide-react';
import {clampGrade, formatGrade, parseGradeInput} from '../utils/calculations';

interface GradeInputRowProps {
  lineNumber: number;
  variableName: 'pd1' | 'pd2' | 'pd3';
  label: string;
  weightPercent: number;
  value: number;
  weightedContribution: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (nextValue: number) => void;
  onFocusChange: (focused: boolean) => void;
}

export const GradeInputRow: React.FC<GradeInputRowProps> = ({
  lineNumber,
  variableName,
  label,
  weightPercent,
  value,
  weightedContribution,
  inputRef,
  onChange,
  onFocusChange,
}) => {
  const [draft, setDraft] = useState<string>(formatGrade(value));
  const [isFocused, setIsFocused] = useState(false);
  const [hasRangeWarning, setHasRangeWarning] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatGrade(value));
      setHasRangeWarning(false);
    }
  }, [value, isFocused]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    const parsed = parseGradeInput(raw);
    if (parsed === null) return;
    if (parsed < 0 || parsed > 5) {
      setHasRangeWarning(true);
      onChange(clampGrade(parsed));
    } else {
      setHasRangeWarning(false);
      onChange(Math.round(parsed * 100) / 100);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange(false);
    const parsed = parseGradeInput(draft);
    const finalValue = parsed === null ? value : clampGrade(parsed);
    onChange(finalValue);
    setDraft(formatGrade(finalValue));
    setHasRangeWarning(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange(true);
  };

  const stepValue = (delta: number) => {
    const next = clampGrade(value + delta);
    onChange(next);
    setDraft(formatGrade(next));
    setHasRangeWarning(false);
  };

  return (
    <div
      className="group grid grid-cols-[2.25rem_1fr] border-b last:border-b-0 transition-colors"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: isFocused ? 'var(--bg-elevated)' : 'transparent',
      }}
    >
      {/* Vim Gutter Line Number */}
      <div
        className="flex items-start justify-end pr-3 pt-4 text-xs font-mono-tabular select-none"
        style={{
          color: isFocused ? 'var(--accent)' : 'var(--text-gutter)',
        }}
        aria-hidden="true"
      >
        {lineNumber}
      </div>

      {/* Editor Line Content */}
      <div className="py-3.5 pr-4 pl-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <label
                htmlFor={`input-${variableName}`}
                className="font-mono-tabular font-semibold cursor-pointer"
                style={{color: 'var(--cyan)'}}
              >
                {variableName}
              </label>
              <span style={{color: 'var(--text-gutter)'}} aria-hidden="true">
                ·
              </span>
              <span style={{color: 'var(--text-primary)'}}>{label}</span>
              <span style={{color: 'var(--text-gutter)'}} aria-hidden="true">
                ·
              </span>
              <span className="font-mono-tabular text-xs" style={{color: 'var(--text-muted)'}}>
                {weightPercent}%
              </span>
            </div>
            <p className="text-xs mt-0.5 font-mono-tabular" style={{color: 'var(--text-muted)'}}>
              Aporte actual: +{formatGrade(weightedContribution)} pts de 1.00
            </p>
          </div>

          {/* Numeric Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => stepValue(-0.1)}
              aria-label={`Restar 0.1 a ${variableName}`}
              className="h-10 w-10 flex items-center justify-center rounded border transition-colors cursor-pointer focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              id={`input-${variableName}`}
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-label={`Nota ${label} (${variableName}) de 0 a 5`}
              className="h-10 w-24 px-2.5 text-center text-base font-semibold font-mono-tabular rounded border focus-visible:outline-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: hasRangeWarning
                  ? 'var(--status-warn)'
                  : isFocused
                    ? 'var(--accent)'
                    : 'var(--border-color)',
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent)',
              }}
            />

            <button
              type="button"
              onClick={() => stepValue(0.1)}
              aria-label={`Sumar 0.1 a ${variableName}`}
              className="h-10 w-10 flex items-center justify-center rounded border transition-colors cursor-pointer focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Range Slider with Scale Ticks */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={5}
            step={0.05}
            value={value}
            onChange={(e) => {
              const next = clampGrade(Number(e.target.value));
              onChange(next);
              setDraft(formatGrade(next));
              setHasRangeWarning(false);
            }}
            aria-label={`Deslizador de nota ${variableName}`}
            className="lazy-slider"
          />
          <div
            className="flex justify-between text-[11px] font-mono-tabular select-none"
            style={{color: 'var(--text-gutter)'}}
          >
            <span>0.0</span>
            <span>1.0</span>
            <span>2.0</span>
            <span>3.0</span>
            <span>4.0</span>
            <span>5.0</span>
          </div>
        </div>

        {hasRangeWarning && (
          <p className="text-xs font-mono-tabular" style={{color: 'var(--status-warn)'}}>
            Escala válida de 0.00 a 5.00; el valor se ajustó al límite permitido.
          </p>
        )}
      </div>
    </div>
  );
};
