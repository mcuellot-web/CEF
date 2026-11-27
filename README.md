# LazyGrade

Calculadora interactiva de nota final con estética retro inspirada en **LazyVim**, diseñada para calcular exactamente cuánto necesitas sacar en el **Examen (40%)** a partir de tus tres notas parciales (**pd1**, **pd2** y **pd3**, 20% cada una) en escala de `0.00` a `5.00`.

## Fórmula de cálculo

```text
Definitiva = (pd1 × 0.20) + (pd2 × 0.20) + (pd3 × 0.20) + (Examen × 0.40)
```

Para alcanzar una nota objetivo (`meta`, por defecto `3.00`):

```text
Examen necesario = (meta - acumulado_parcial) / 0.40
```

## Funcionalidades interactivas

- **Cálculo en tiempo real:** ingresa tus notas con teclado (acepta punto o coma decimal), botones `−` / `+` o deslizadores de `0.00` a `5.00`.
- **Desglose visual de pesos:** barra segmentada que muestra cuánto aporta `pd1`, `pd2`, `pd3` y el porcentaje requerido del `Examen` sobre la escala total de `5.00`.
- **Múltiples materias:** crea, renombra, cambia o elimina materias desde el panel lateral o las pestañas superiores; todo se guarda automáticamente en `localStorage`.
- **Tabla de escenarios:** consulta cuánto necesitas en el Examen para obtener `3.00`, `3.50`, `4.00`, `4.50` o `5.00`, y haz clic en cualquier fila para fijarla como meta.
- **Selector de temas Telescope (`t`):** 6 temas de colores con vista previa en vivo (*Tokyo Night*, *Gruvbox Retro*, *Amber CRT 1984*, *Catppuccin Mocha*, *Nord Frost* y *Everforest Papel*) más interruptor de **efecto CRT retro**.
- **Línea de comandos estilo Vim (`:`):** ejecuta comandos directamente al pie del editor:
  - `:colorscheme gruvbox` (o `tokyonight`, `amber`, `catppuccin`, `nord`, `everforest`)
  - `:meta 3.5`
  - `:new Fisica`
  - `:crt`
  - `:clear`
  - `:help`

## Atajos de teclado (modo `NORMAL`)

| Tecla | Acción |
| :--- | :--- |
| `j` / `k` | Mover cursor entre líneas (`pd1`, `pd2`, `pd3`, `meta`) |
| `i` / `Enter` | Editar la línea seleccionada (cambia a modo `INSERT`) |
| `1` / `2` / `3` | Saltar directamente a `pd1`, `pd2` o `pd3` |
| `:` | Abrir la línea de comandos Vim |
| `t` | Abrir selector de temas Telescope |
| `r` | Reiniciar las notas de la materia activa a `0.00` |
| `?` | Abrir guía de atajos Which-Key |
| `Esc` | Volver a modo `NORMAL` o cerrar ventanas |

## Estructura estática para GitHub Pages

```text
├── index.html                    # Estructura principal
├── styles.css                    # Estilos y variables de temas LazyVim
├── app.js                        # Lógica interactiva en JavaScript puro
└── .github/workflows/deploy.yml  # Despliegue automático a GitHub Pages
```

## Despliegue en GitHub Pages

1. Sube estos archivos a la rama `main` de tu repositorio en GitHub.
2. Ve a **Settings > Pages > Build and deployment > Source** y selecciona **GitHub Actions**.
3. El workflow publicará automáticamente `index.html`, `styles.css` y `app.js` sin pasos de compilación externos.
