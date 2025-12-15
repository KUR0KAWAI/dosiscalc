# DosisCalc
Calculadora **educativa** de dosis de medicamentos por peso, con soporte para vía **Oral** e **Intravenosa**, conversión según presentación (mg ↔ mL/unidad) e integración con **Supabase (PostgreSQL)** para catálogos, reglas y registro de consultas.
> Aviso: Proyecto únicamente educativo. No sustituye criterio clínico ni protocolos institucionales.
---
## Características
- Selección de medicamento, vía de administración y presentación.
- Cálculo orientativo basado en peso:
  - `mg/kg/dosis` (por toma).
  - `mg/kg/día` (por día fraccionado).
- Conversión a volumen/unidades usando la presentación (ej. mg por 5 mL, mg por 1 unidad).
- Validación de reglas configuradas para (medicamento + vía + esquema).
- Historial de consultas (opcional) en base de datos.
- UI simple y responsive con tabs por vía.
- Reporte/impresión (si el módulo está habilitado).
---
## Tecnologías
- **Frontend:** React + Vite
- **UI/Icons:** Tailwind CSS (si aplica) + lucide-react
- **Backend as a Service:** Supabase
- **Base de datos:** PostgreSQL
---
## Estructura del proyecto
calculadora-dosis/
  public/
    appstore.png
    Icon_DosisCalc.png
  src/
    assets/
    components/
      DosisForm.jsx
      DosisHeader.jsx
      DosisResults.jsx
      Glossary.jsx
      ViaTabs.jsx
    lib/
      supabaseClient.js
    services/
      pdfReport.js
    App.css
    App.jsx
    index.css
    main.jsx
  .env
  .gitignore
  eslint.config.js
  index.html
  package-lock.json
  package.json
  README.md
  vite.config.js


---
## Requisitos
- Node.js 18+ (recomendado)
- Proyecto creado en Supabase y tablas/datos cargados (vías, medicamentos, presentaciones y reglas)
---
## Instalación
git clone https://github.com/KUROKAWAI/dosiscalc.git
cd dosiscalc
npm install

---
## Variables de entorno
Crea un archivo `.env` en la raíz:
VITE_SUPABASE_URL=TU_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY

> No subas `.env` al repositorio (debe estar en `.gitignore`).
---
## Configuración de base de datos (Supabase)
1. Crear proyecto en Supabase.
2. Ejecutar el SQL del esquema (tablas).
3. Insertar datos iniciales (vías, tipos, medicamentos, presentaciones y reglas).
---
## Ejecutar en desarrollo
npm run dev
---
## Build de producción
npm run build
npm run preview
---
## Alcance y limitaciones
- La app calcula en base a reglas cargadas en `regla_dosis`; si no existe regla para un medicamento/vía, el sistema lo indica.
- No incluye ajustes clínicos avanzados (edad, función renal/hepática, diagnósticos, contraindicaciones).
- Los resultados son orientativos y dependen de que los datos en Supabase estén correctos y completos.
---
## Licencia
Sin licencia definida por el momento.
