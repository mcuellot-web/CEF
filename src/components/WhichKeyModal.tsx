import React, {useEffect} from 'react';
import {Keyboard, X} from 'lucide-react';

interface WhichKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {keys: '1 / 2 / 3', action: 'Enfocar campo de nota pd1, pd2 o pd3 (en modo NORMAL)'},
  {keys: 't', action: 'Abrir selector de temas Telescope (:colorscheme)'},
  {keys: 'r', action: 'Reiniciar notas de la materia activa a 0.00'},
  {keys: '?', action: 'Mostrar u ocultar esta guía de atajos Which-Key'},
  {keys: 'Esc', action: 'Salir del modo INSERT a NORMAL o cerrar ventana'},
];

export const WhichKeyModal: React.FC<WhichKeyModalProps> = ({isOpen, onClose}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.65)'}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whichkey-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-md border overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--accent)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-mono-tabular font-semibold">
            <Keyboard className="w-4 h-4" style={{color: 'var(--accent)'}} />
            <h2 id="whichkey-title">Atajos de teclado LazyVim</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de atajos"
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

        <div className="divide-y" style={{borderColor: 'var(--border-color)'}}>
          {SHORTCUTS.map((item) => (
            <div
              key={item.keys}
              className="px-4 py-3 flex items-center justify-between gap-4 text-sm"
              style={{borderColor: 'var(--border-color)'}}
            >
              <span style={{color: 'var(--text-primary)'}}>{item.action}</span>
              <kbd
                className="px-2.5 py-1 rounded border text-xs font-mono-tabular whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--accent)',
                }}
              >
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div
          className="px-4 py-3 border-t text-xs font-mono-tabular"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          Fórmula aplicada: Definitiva = pd1(0.20) + pd2(0.20) + pd3(0.20) + Examen(0.40)
        </div>
      </div>
    </div>
  );
};
