# Guía de Paleta de Colores - FlashElicit

## Paleta de Colores Principal: Dark Blue

La aplicación ahora utiliza una paleta de colores consistente basada en tonos de azul oscuro (dark-blue), que funciona tanto en modo light como en modo dark.

### Variables CSS disponibles

#### Colores de la Paleta Base
```css
--dark-blue-50: #f2f3ff;
--dark-blue-100: #e8e9ff;
--dark-blue-200: #d3d4ff;
--dark-blue-300: #b0b0ff;
--dark-blue-400: #8983ff;
--dark-blue-500: #6351ff;
--dark-blue-600: #4e2dfa;
--dark-blue-700: #3f1be6;
--dark-blue-800: #3416bd;
--dark-blue-900: #2d149e;
--dark-blue-950: #180a6b;
```

#### Variables Semánticas
```css
/* Light Mode */
--color-primary: var(--dark-blue-600);
--color-primary-hover: var(--dark-blue-700);
--color-secondary: var(--dark-blue-400);
--color-accent: var(--dark-blue-300);
--color-background: #ffffff;
--color-surface: var(--dark-blue-50);
--color-text-primary: #1a202c;

/* Dark Mode (automáticamente con .dark) */
--color-primary: var(--dark-blue-400);
--color-primary-hover: var(--dark-blue-300);
--color-secondary: var(--dark-blue-600);
--color-accent: var(--dark-blue-500);
--color-background: #0f172a;
--color-surface: #1e293b;
--color-text-primary: #f8fafc;
```

## Uso en Tailwind CSS

### Clases de Tailwind disponibles

Puedes usar las clases de Tailwind con el prefijo `dark-blue-` seguido del tono:

```html
<!-- Backgrounds -->
<div class="bg-dark-blue-50 dark:bg-dark-blue-900">...</div>
<div class="bg-dark-blue-500">...</div>

<!-- Text -->
<span class="text-dark-blue-600 dark:text-dark-blue-400">...</span>

<!-- Borders -->
<div class="border-dark-blue-200 dark:border-dark-blue-800">...</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-dark-blue-500 to-dark-blue-700">...</div>
```

### Migración de colores antiguos

Reemplaza los colores antiguos con los nuevos de acuerdo a esta guía:

| Color Antiguo | Nuevo Color (Light) | Nuevo Color (Dark) |
|---------------|---------------------|-------------------|
| `blue-50` | `dark-blue-50` | `dark-blue-950` |
| `blue-100` | `dark-blue-100` | `dark-blue-900` |
| `blue-200` | `dark-blue-200` | `dark-blue-800` |
| `blue-300` | `dark-blue-300` | `dark-blue-700` |
| `blue-400` | `dark-blue-400` | `dark-blue-600` |
| `blue-500` | `dark-blue-500` | `dark-blue-500` |
| `blue-600` | `dark-blue-600` | `dark-blue-400` |
| `blue-700` | `dark-blue-700` | `dark-blue-300` |
| `blue-800` | `dark-blue-800` | `dark-blue-200` |
| `blue-900` | `dark-blue-900` | `dark-blue-100` |
| `purple-400` | `dark-blue-600` | `dark-blue-400` |
| `purple-500` | `dark-blue-700` | `dark-blue-300` |
| `purple-600` | `dark-blue-800` | `dark-blue-200` |

## Uso de Variables CSS Personalizadas

Para colores que necesitan adaptarse automáticamente al tema:

```html
<div style="background-color: var(--color-primary)">
  <h1 style="color: var(--color-text-primary)">Título</h1>
</div>
```

O usando clases de Tailwind con valores arbitrarios:

```html
<div class="bg-[var(--color-primary)]">
  <h1 class="text-[var(--color-text-primary)]">Título</h1>
</div>
```

## Colores Auxiliares

### Verde (para éxito/confirmación)
Mantener los colores green de Tailwind para indicadores de éxito:
```html
<div class="text-green-600 dark:text-green-400">✓ Éxito</div>
```

### Rojo (para errores)
Mantener los colores red de Tailwind para errores:
```html
<div class="text-red-600 dark:text-red-400">✗ Error</div>
```

### Amarillo (para advertencias)
Mantener los colores yellow/amber de Tailwind para advertencias:
```html
<div class="text-yellow-600 dark:text-yellow-400">⚠ Advertencia</div>
```

## Ejemplos de Componentes

### Botón Primario
```html
<button class="bg-dark-blue-600 hover:bg-dark-blue-700 dark:bg-dark-blue-500 dark:hover:bg-dark-blue-400 text-white px-6 py-3 rounded-lg">
  Acción Primaria
</button>
```

### Card/Tarjeta
```html
<div class="bg-white dark:bg-dark-blue-900 border border-dark-blue-200 dark:border-dark-blue-800 rounded-xl p-6">
  <h3 class="text-dark-blue-900 dark:text-dark-blue-100 font-bold">Título</h3>
  <p class="text-dark-blue-700 dark:text-dark-blue-300">Contenido</p>
</div>
```

### Badge/Etiqueta
```html
<span class="inline-flex items-center px-3 py-1 bg-dark-blue-100 dark:bg-dark-blue-900/30 text-dark-blue-700 dark:text-dark-blue-300 rounded-full text-sm">
  Etiqueta
</span>
```

### Gradiente
```html
<div class="bg-gradient-to-r from-dark-blue-600 to-dark-blue-400 text-white p-8 rounded-xl">
  Contenido con gradiente
</div>
```

## Mejores Prácticas

1. **Consistencia**: Usa siempre la paleta dark-blue para elementos principales de la UI
2. **Contraste**: Asegúrate de que el texto tenga suficiente contraste en ambos modos
3. **Semántica**: Usa variables semánticas (`--color-primary`) cuando sea posible para mayor flexibilidad
4. **Accesibilidad**: Verifica el contraste de color cumple con WCAG 2.1 AA (mínimo 4.5:1 para texto normal)
5. **Modo Dark**: Siempre define colores para ambos modos: `class="bg-dark-blue-100 dark:bg-dark-blue-900"`

## Testing

Para verificar que los colores funcionan correctamente en ambos modos:

1. Abre la aplicación
2. Alterna entre modo light y dark usando el botón de tema
3. Verifica que todos los elementos sean legibles y tengan buen contraste
4. Comprueba que los gradientes y efectos se vean bien en ambos modos
