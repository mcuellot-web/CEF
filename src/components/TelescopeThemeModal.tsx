import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Check, Monitor, Search, X} from 'lucide-react';
import {LAZY_THEMES} from '../data/themes';
import {ThemeId} from '../types/grade';

interface TelescopeThemeModalProps {
  isOpen: boolean;
  activeThemeId: ThemeId;
  crtScanlines: boolean;
  onToggleScanlines: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
  onClose: () => void;
}

export const TelescopeThemeModal: React.FC<TelescopeThemeModalProps> = ({
  isOpen,
  activeThemeId,
  crtScanlines,
  onToggleScanlines,
  onSelectTheme,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LAZY_THEMES;
    return LAZY_THEMES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.vimCommand.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const idx = LAZY_THEMES.findIndex((t) => t.id === activeThemeId);
      setHighlightedIndex(idx >= 0 ? idx : 0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, activeThemeId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredThemes.length > 0 ? (prev + 1) % filteredThemes.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredThemes.length > 0
            ? (prev - 1 + filteredThemes.length) % filteredThemes.length
            : 0
        );
      } else if (e.key === 'Enter' && filteredThemes[highlightedIndex]) {
        e.preventDefault();
        onSelectTheme(filteredThemes[highlightedIndex].id);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredThemes, highlightedIndex, onSelectTheme, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.65)'}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="telescope-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-md border overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--accent)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Telescope Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-mono-tabular font-semibold">
            <span style={{color: 'var(--accent)'}}>:Telescope colorscheme</span>
            <span style={{color: 'var(--text-gutter)'}} aria-hidden="true">
              ·
            </span>
            <h2 id="telescope-title" className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
              Selector de Temas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de temas"
            className="h-9 w-9 flex items-center justify-center rounded border cursor-pointer"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-canvas)'}}
        >
          <Search className="w-4 h-4 shrink-0" style={{color: 'var(--accent)'}} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            placeholder="Filtrar tema (gruvbox, tokyonight, amber, nord...)"
            aria-label="Filtrar temas de colores"
            className="w-full bg-transparent text-sm font-mono-tabular focus:outline-none"
            style={{color: 'var(--text-primary)'}}
          />
        </div>

        {/* Theme List */}
        <div className="max-h-80 overflow-y-auto divide-y" style={{borderColor: 'var(--border-color)'}}>
          {filteredThemes.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm font-mono-tabular" style={{color: 'var(--text-muted)'}}>
              No se encontraron temas para "{query}".
            </div>
          ) : (
            filteredThemes.map((theme, idx) => {
              const isSelected = theme.id === activeThemeId;
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isHighlighted ? 'var(--bg-highlight)' : 'transparent',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span
                        className="font-mono-tabular font-semibold"
                        style={{color: isHighlighted ? 'var(--accent)' : 'var(--text-primary)'}}
                      >
                        {theme.name}
                      </span>
                      <span style={{color: 'var(--text-gutter)'}} aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-mono-tabular" style={{color: 'var(--text-muted)'}}>
                        {theme.variant === 'dark' ? 'Oscuro' : 'Claro'}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{color: 'var(--text-muted)'}}>
                      {theme.description}
                    </p>
                  </div>

                  {/* Palette Swatches + Active Indicator */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1" aria-hidden="true">
                      {[
                        theme.colors.bgSurface,
                        theme.colors.accent,
                        theme.colors.ok,
                        theme.colors.warn,
                        theme.colors.danger,
                      ].map((hex, swatchIdx) => (
                        <span
                          key={swatchIdx}
                          className="w-3.5 h-3.5 rounded-xs border"
                          style={{
                            backgroundColor: hex,
                            borderColor: theme.colors.border,
                          }}
                        />
                      ))}
                    </div>
                    <span className="w-5 flex justify-end">
                      {isSelected && <Check className="w-4 h-4" style={{color: 'var(--status-ok)'}} />}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Retro CRT Scanline Toggle Footer */}
        <div
          className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          <button
            type="button"
            onClick={onToggleScanlines}
            className="inline-flex items-center gap-2 px-3 py-2 rounded border font-mono-tabular cursor-pointer"
            style={{
              backgroundColor: crtScanlines ? 'var(--bg-highlight)' : 'var(--bg-surface)',
              borderColor: crtScanlines ? 'var(--accent)' : 'var(--border-color)',
              color: crtScanlines ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Efecto CRT retro: {crtScanlines ? 'Activado' : 'Desactivado'}</span>
          </button>

          <span className="font-mono-tabular">
            ↑/↓ navegar · Enter aplicar · Esc cerrar
          </span>
        </div>
      </div>
    </div>
  );
};
