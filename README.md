# CVision

Análisis inteligente de CVs en PDF usando la API de Claude. Subí un currículum, opcionalmente especificás el puesto al que aplica, y obtenés un reporte estructurado con score, veredicto, puntos fuertes, débiles, mejoras concretas y keywords detectadas.

![screenshot placeholder](./public/screenshot.png)

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v3
- Anthropic SDK (`claude-sonnet-4-20250514`)
- pdf-parse para extracción de texto
- Framer Motion + lucide-react

## Instalación

1. **Cloná el repo e instalá dependencias**
   ```bash
   git clone <repo-url> cvision
   cd cvision
   npm install
   ```

2. **Configurá tu API key**
   Copiá `.env.example` a `.env.local` y completá:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Levantá el dev server**
   ```bash
   npm run dev
   ```

4. **Abrí** [http://localhost:3000](http://localhost:3000) y subí un CV.

## Cómo conseguir la API key de Claude

1. Entrá a [console.anthropic.com](https://console.anthropic.com/).
2. Creá una cuenta o iniciá sesión.
3. En **API Keys**, generá una nueva clave (empieza con `sk-ant-`).
4. Pegala en `.env.local` como `ANTHROPIC_API_KEY`.

## Deploy en Vercel

```bash
npm i -g vercel
vercel
```

Configurá la variable `ANTHROPIC_API_KEY` en el dashboard de Vercel (Project → Settings → Environment Variables) y redeployá.

## Estructura

```
cvision/
├── app/
│   ├── page.tsx                # Upload + estado de loading
│   ├── results/page.tsx        # Pantalla de resultados (lee de localStorage)
│   └── api/analyze/route.ts    # POST: PDF → texto → Claude → JSON
├── components/
│   ├── UploadZone.tsx          # Drag & drop + validación 5MB
│   ├── AnalysisResult.tsx      # Layout completo de resultados
│   ├── ScoreCard.tsx           # Score animado con arco SVG
│   └── FeedbackSection.tsx     # Strengths, weaknesses, improvements, keywords
└── lib/claude.ts               # Cliente Anthropic + validación de schema
```

## Notas

- Tamaño máximo de PDF: 5MB (validado en frontend y backend).
- PDFs escaneados sin OCR no funcionan: necesitan tener texto extraíble.
- El último análisis se guarda en `localStorage` para sobrevivir refreshes.
