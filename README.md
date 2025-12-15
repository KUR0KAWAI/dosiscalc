DosisCalc
Calculadora educativa de dosis de medicamentos por peso, con soporte para vía Oral y Intravenosa, conversiones según presentación (mg↔mL/unidad) e integración con Supabase (PostgreSQL) para catálogos, reglas y registro de consultas.

Aviso: Este proyecto es únicamente educativo. No sustituye criterio clínico ni protocolos institucionales. La dosificación real debe ser validada por un profesional de salud y fuentes oficiales.

Características
Selección de medicamento, vía de administración y presentación.

Cálculo orientativo de dosis basada en peso:

Esquemas: mg/kg/dosis y mg/kg/día.

Conversión a volumen/unidades usando la presentación seleccionada (ej. mg por 5 mL, mg por 1 unidad).

Validación de existencia de regla para (medicamento + vía + esquema).

Historial de consultas (opcional) en base de datos.

UI simple y responsive con tabs por vía.

Generación de reporte/impresión (si está habilitado en el módulo de reportes).

Tecnologías
Frontend: React + Vite

UI/Icons: Tailwind CSS (si aplica) y lucide-react

Backend as a Service: Supabase

Base de datos: PostgreSQL

API: Supabase client (JS)

Estructura del proyecto
Ruta principal (frontend):

src/components/

DosisForm.jsx: formulario principal (selección + entradas).

DosisHeader.jsx: encabezado (logo/título).

DosisResults.jsx: salida del cálculo.

ViaTabs.jsx: tabs para cambiar de vía.

Glossary.jsx: glosario/ayuda (si aplica).

src/lib/

supabaseClient.js: inicialización del cliente de Supabase.

src/services/

pdfReport.js: generación de reporte PDF (si aplica).

public/

íconos/recursos estáticos (ej. Icon_DosisCalc.png).

index.html: favicon y meta tags.

vite.config.js: configuración de Vite.

Modelo de datos (resumen)
La app consulta principalmente:

via_administracion: catálogo (Oral/Intravenosa).

tipo_medicamento: clasificación.

esquema_dosis: mg/kg/dosis o mg/kg/día.

medicamento: genérico/comercial.

presentacion_medicamento: forma, concentración y volumen (para conversiones).

regla_dosis: rangos/intervalos/tomas por día (validación y guía).

consulta_dosis (opcional): historial de cálculos.

Notas:

Los “viales en polvo” (p. ej. ceftriaxona) se manejan como mg de producto; si se requiere guiar reconstitución/dilución, se usa preparacion_parenteral.

Requisitos
Node.js 18+ (recomendado)

Cuenta y proyecto en Supabase

Git (opcional, para contribuir)

Instalación
Clona el repositorio e instala dependencias:

bash
git clone https://github.com/KUROKAWAI/dosiscalc.git
cd dosiscalc
npm install
Variables de entorno
Crea un archivo .env en la raíz:

bash
VITE_SUPABASE_URL=TU_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
Importante:

No subas .env a GitHub (debe estar en .gitignore).

La anon key es pública para el cliente, pero igual se recomienda usar RLS/policies en Supabase si expones tablas.

Configuración de base de datos
Crea un proyecto en Supabase.

Ejecuta el SQL del esquema (tablas) en el SQL Editor.

Inserta datos iniciales (catálogos, medicamentos, presentaciones, reglas).

Sugerencia:

Mantén las reglas en regla_dosis completas; si falta una regla para un medicamento/vía, la UI mostrará el mensaje de “No existe una regla…”.

Ejecución en desarrollo
bash
npm run dev
Abre la URL que te muestra Vite (ej. http://localhost:5173).

Build de producción
bash
npm run build
npm run preview
Uso básico
Selecciona la vía (Oral o Intravenosa).

Selecciona medicamento y presentación.

Ingresa peso (kg).

Ingresa dosis prescrita según el esquema (mg/kg/dosis o mg/kg/día) y el intervalo/tomas si aplica.

Presiona Calcular.

La app:

Verifica reglas disponibles en base de datos.

Calcula dosis total (mg) y la convierte a mL/unidades usando la presentación seleccionada.

Alcance y limitaciones
Alcance actual:

Calculadora educativa por peso con reglas configurables en BD.

Conversión por presentación para administración práctica.

Historial básico de consultas.

No incluye (por ahora):

Ajustes por edad, función renal/hepática, diagnósticos específicos.

Máximos absolutos por dosis/día por fármaco.

Interacciones, contraindicaciones, alertas clínicas avanzadas.

Recomendaciones terapéuticas; solo aplica reglas cargadas.

Buenas prácticas y seguridad
Define políticas RLS en Supabase si el proyecto es público.

Separa entornos (dev/prod) si vas a desplegar.

Mantén control de versiones de tu SQL (migrations o scripts).

Documenta claramente el origen de reglas (fuentes/protocolos) si en el futuro deja de ser “educativo”.

Contribución
Haz fork del repo.

Crea una rama: git checkout -b feature/nueva-funcionalidad

Commit: git commit -m "Agrega X"

Push: git push origin feature/nueva-funcionalidad

Abre un Pull Request.

Licencia
Sin licencia definida (por defecto). Si deseas permitir uso/modificación, agrega una licencia (MIT/Apache-2.0, etc.).

Autor
KUROKAWAI