import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

import DosisHeader from '../components/DosisHeader'
import ViaTabs from '../components/ViaTabs'
import DosisForm from '../components/DosisForm'
import DosisResults from '../components/DosisResults'
import Glossary from '../components/Glossary'
import ScientificArticles from '../components/ScientificArticles'

import { generarReportePDF } from '../services/pdfReport'
import { Stethoscope } from 'lucide-react'

const VIAS_UI = [
    { id_via: 1, label: 'Vía Oral', color: 'teal' },
    { id_via: 2, label: 'Intravenosa (IV)', color: 'rose' },
]

export default function CalculatorPage() {
    const [activeViaId, setActiveViaId] = useState(1)

    // Guard: si por estado viejo alguien cae en 3, vuelve a Oral
    useEffect(() => {
        if (Number(activeViaId) === 3) setActiveViaId(1)
    }, [activeViaId])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('') // error global (carga o cálculo)

    const [medicamentos, setMedicamentos] = useState([])

    // Form
    const [selectedMedId, setSelectedMedId] = useState('')
    const [selectedPresId, setSelectedPresId] = useState('')
    const [peso, setPeso] = useState('')
    const [dosisInput, setDosisInput] = useState('')
    const [intervalo, setIntervalo] = useState('')

    // Extra IV
    const [dilucion, setDilucion] = useState('')
    const [tiempoInfusion, setTiempoInfusion] = useState('')

    // Selección
    const [medicamentoActual, setMedicamentoActual] = useState(null)
    const [presentacionActual, setPresentacionActual] = useState(null)
    const [reglaActual, setReglaActual] = useState(null)

    // Resultado
    const [resultado, setResultado] = useState(null)

    // Snapshot para que INSERT y PDF usen exactamente los mismos datos
    const [pdfSnapshot, setPdfSnapshot] = useState(null)

    // Estado para deshabilitar botón y mostrar "Generando..."
    const [savingPdf, setSavingPdf] = useState(false)

    // jsPDF UMD (window.jspdf)
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        script.async = true
        document.body.appendChild(script)
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script)
        }
    }, [])

    // ==========================
    // Cargar datos Supabase
    // ==========================
    useEffect(() => {
        const normalizeEsquema = (aplicacion) => (aplicacion === 'mg/kg/dia' ? 'mg/kg/dia' : 'mg/kg/dosis')

        const cargarDatos = async () => {
            setLoading(true)
            setError('')

            const { data: meds, error: e1 } = await supabase
                .from('medicamento')
                .select(`
          id_medicamento,
          nombre_generico,
          nombre_comercial,
          tipo_medicamento (
            nombre_tipo,
            descripcion
          )
        `)
                .order('nombre_generico')

            if (e1) {
                setError(`Error cargando medicamentos: ${e1.message}`)
                setMedicamentos([])
                setLoading(false)
                return
            }

            const { data: pres, error: e2 } = await supabase
                .from('presentacion_medicamento')
                .select(`
          id_presentacion,
          id_medicamento,
          id_via,
          forma_farmaceutica,
          concentracion_cantidad,
          concentracion_unidad,
          volumen_cantidad,
          volumen_unidad
        `)
                .order('id_presentacion')

            if (e2) {
                setError(`Error cargando presentaciones: ${e2.message}`)
                setMedicamentos([])
                setLoading(false)
                return
            }

            const { data: reglas, error: e3 } = await supabase
                .from('regla_dosis')
                .select(`
          id_medicamento,
          id_via,
          dosis_min,
          dosis_max,
          intervalo_min_horas,
          intervalo_max_horas,
          tomas_por_dia_min,
          tomas_por_dia_max,
          esquema_dosis (
            aplicacion
          )
        `)
                .order('id_medicamento')

            if (e3) {
                setError(`Error cargando reglas: ${e3.message}`)
                setMedicamentos([])
                setLoading(false)
                return
            }

            // Map presentaciones por medicamento
            const presByMed = new Map()
            for (const p of pres ?? []) {
                const medId = Number(p.id_medicamento)
                if (!presByMed.has(medId)) presByMed.set(medId, [])
                presByMed.get(medId).push({
                    id_presentacion: Number(p.id_presentacion),
                    id_via: Number(p.id_via),
                    forma: p.forma_farmaceutica,
                    conc_cant: Number(p.concentracion_cantidad),
                    conc_uni: p.concentracion_unidad,
                    vol_cant: Number(p.volumen_cantidad),
                    vol_uni: p.volumen_unidad,
                })
            }

            // Map reglas por medicamento
            const reglasByMed = new Map()
            for (const r of reglas ?? []) {
                const medId = Number(r.id_medicamento)
                if (!reglasByMed.has(medId)) reglasByMed.set(medId, [])
                reglasByMed.get(medId).push({
                    id_via: Number(r.id_via),
                    min: Number(r.dosis_min),
                    max: Number(r.dosis_max),
                    esquema: normalizeEsquema(r.esquema_dosis?.aplicacion),
                    int_min: r.intervalo_min_horas ?? '',
                    int_max: r.intervalo_max_horas ?? '',
                    tomas_dia: r.tomas_por_dia_max ?? r.tomas_por_dia_min ?? null,
                })
            }

            const merged = (meds ?? []).map((m) => {
                const medId = Number(m.id_medicamento)
                return {
                    id_medicamento: medId,
                    nombre_generico: m.nombre_generico,
                    nombre_comercial: m.nombre_comercial,
                    tipo_nombre: m.tipo_medicamento?.nombre_tipo ?? '',
                    tipo_desc: m.tipo_medicamento?.descripcion ?? '',
                    presentaciones: presByMed.get(medId) ?? [],
                    reglas: reglasByMed.get(medId) ?? [],
                }
            })

            setMedicamentos(merged)
            setLoading(false)
        }

        cargarDatos()
    }, [])

    // Filtrar por vía (seguro contra strings)
    const medicamentosFiltrados = useMemo(() => {
        const via = Number(activeViaId)
        return medicamentos.filter((med) => (med.presentaciones ?? []).some((p) => Number(p.id_via) === via))
    }, [medicamentos, activeViaId])

    const noHayMedicamentosEnVia = !loading && !error && medicamentos.length > 0 && medicamentosFiltrados.length === 0

    // Reset al cambiar vía (NO borra error global)
    useEffect(() => {
        setSelectedMedId('')
        setSelectedPresId('')
        setMedicamentoActual(null)
        setPresentacionActual(null)
        setReglaActual(null)
        setDosisInput('')
        setIntervalo('')
        setDilucion('')
        setTiempoInfusion('')
        setResultado(null)

        // reset snapshot
        setPdfSnapshot(null)

        // si estaba generando por algún motivo, lo resetea
        setSavingPdf(false)
    }, [activeViaId])

    // Selección de medicamento
    useEffect(() => {
        if (!selectedMedId) return

        const med = medicamentos.find((m) => m.id_medicamento === Number(selectedMedId))
        setMedicamentoActual(med || null)

        const regla = med?.reglas?.find((r) => Number(r.id_via) === Number(activeViaId)) || null
        setReglaActual(regla)

        setSelectedPresId('')
        setPresentacionActual(null)
        setDosisInput('')
    }, [selectedMedId, activeViaId, medicamentos])

    // Selección de presentación
    useEffect(() => {
        if (!selectedPresId || !medicamentoActual) return
        const pres = (medicamentoActual.presentaciones ?? []).find((p) => p.id_presentacion === Number(selectedPresId))
        setPresentacionActual(pres || null)

        // Autocompletar con mínimo sugerido si hay regla
        if (reglaActual) {
            setDosisInput(reglaActual.min ?? '')
            setIntervalo(reglaActual.int_min ?? '')
        }
    }, [selectedPresId, medicamentoActual, reglaActual])

    // Cálculo
    const calcular = () => {
        setResultado(null)
        setPdfSnapshot(null) // invalida snapshot anterior cuando se recalcula
        setError('')

        if (noHayMedicamentosEnVia) {
            setError(`No hay medicamentos disponibles para la vía seleccionada (id_via=${activeViaId}).`)
            return
        }

        if (!medicamentoActual) return setError('Selecciona un medicamento.')
        if (!presentacionActual) return setError('Selecciona una presentación.')
        if (!reglaActual) return setError('No existe una regla de dosis configurada para este medicamento en esta vía.')

        if (!peso || Number(peso) <= 0) return setError('Ingresa un peso válido (> 0).')
        if (!intervalo || Number(intervalo) <= 0) return setError('Ingresa un intervalo válido (> 0).')
        if (!dosisInput || Number(dosisInput) <= 0) return setError('Ingresa una dosis válida (> 0).')

        // Validaciones específicas IV
        if (Number(activeViaId) === 2 && tiempoInfusion && Number(tiempoInfusion) <= 0) {
            return setError('Tiempo de infusión debe ser > 0.')
        }
        if (Number(activeViaId) === 2 && dilucion && Number(dilucion) < 0) {
            return setError('Dilución no puede ser negativa.')
        }

        const P = parseFloat(peso)
        const D = parseFloat(dosisInput)
        const I = parseFloat(intervalo)
        const ConcMg = Number(presentacionActual.conc_cant)
        const ConcVol = Number(presentacionActual.vol_cant)

        const Dil = parseFloat(dilucion) || 0
        const T_min = parseFloat(tiempoInfusion) || 0

        const esquema = reglaActual?.esquema || 'mg/kg/dosis'
        let mgPorDosis, mlPorDosis, tomasDia, mgTotalDia, mlTotalDia
        let paso1, paso2, paso3, paso4

        tomasDia = 24 / I

        // 1) mg
        if (esquema === 'mg/kg/dia') {
            mgTotalDia = P * D
            mgPorDosis = mgTotalDia / tomasDia
            paso1 = { label: 'Calculo Dosis Diaria:', math: `${P} kg x ${D} mg/kg = ${mgTotalDia.toFixed(2)} mg/dia` }
            paso2 = {
                label: 'Division por tomas:',
                math: `${mgTotalDia.toFixed(2)} mg / ${Math.round(tomasDia)} tomas = ${mgPorDosis.toFixed(2)} mg/toma`,
            }
        } else {
            mgPorDosis = P * D
            mgTotalDia = mgPorDosis * tomasDia
            paso1 = { label: 'Calculo Dosis Unica:', math: `${P} kg x ${D} mg/kg = ${mgPorDosis.toFixed(2)} mg` }
            paso2 = { label: '', math: '' }
        }

        // 2) mL
        mlPorDosis = (mgPorDosis * ConcVol) / ConcMg
        mlTotalDia = mlPorDosis * tomasDia
        paso3 = {
            label: 'Volumen del Medicamento:',
            math: `(${mgPorDosis.toFixed(2)} mg x ${ConcVol} mL) / ${ConcMg} mg = ${mlPorDosis.toFixed(2)} mL`,
        }

        // 3) goteo (solo IV)
        let goteoInfo = null
        if (Number(activeViaId) === 2 && T_min > 0) {
            const volumenTotal = mlPorDosis + Dil
            const gotasMin = (volumenTotal * 20) / T_min
            const microGotasMin = (volumenTotal * 60) / T_min

            goteoInfo = {
                volumenTotal: volumenTotal.toFixed(2),
                gotasMin: Math.round(gotasMin),
                microGotasMin: Math.round(microGotasMin),
                tiempoMin: T_min,
                diluyente: Dil,
            }

            paso4 = {
                label: 'Calculo de Goteo (Normogotero 20):',
                math: `(${volumenTotal.toFixed(2)} mL x 20 gotas) / ${T_min} min = ${Math.round(gotasMin)} gotas/min`,
            }
        }

        let alerta = null
        if (reglaActual) {
            if (D < Number(reglaActual.min)) alerta = 'Dosis debajo del rango sugerido.'
            if (D > Number(reglaActual.max)) alerta = 'Dosis supera el rango sugerido.'
        }

        const nuevoResultado = {
            mgPorDosis: mgPorDosis.toFixed(2),
            mlPorDosis: mlPorDosis.toFixed(2),
            mgTotalDia: mgTotalDia.toFixed(2),
            mlTotalDia: mlTotalDia.toFixed(2),
            tomasDia: Math.round(tomasDia),
            esquemaUsado: esquema,
            pasosCalculo: { paso1, paso2, paso3, paso4 },
            goteoInfo,
            alerta,
        }

        setResultado(nuevoResultado)

        // Snapshot: una sola fuente de verdad para INSERT + PDF
        setPdfSnapshot({
            consultaPayload: {
                id_via: Number(activeViaId),
                id_medicamento: Number(medicamentoActual.id_medicamento),
                id_presentacion: Number(presentacionActual.id_presentacion),
                peso_paciente_kg: Number(peso),
                dosis_ingresada: Number(dosisInput),
                unidad_dosis_ingresada: esquema, // 'mg/kg/dia' | 'mg/kg/dosis'
                intervalo_horas: Number(intervalo),
                numero_tomas_dia: Math.round(tomasDia),
                volumen_dilucion_ml: goteoInfo ? Number(goteoInfo.diluyente) : null,
                tiempo_administracion_min: goteoInfo ? Number(goteoInfo.tiempoMin) : null,
            },

            pdfPayload: {
                activeViaId,
                peso,
                intervalo,
                dosisInput,
                medicamentoActual,
                presentacionActual,
                reglaActual,
                resultado: nuevoResultado,
            },
        })
    }

    const onDownloadPdf = async () => {
        // Validación base (UI)
        if (!resultado || !medicamentoActual || !presentacionActual || !reglaActual) {
            setError('Primero realiza un cálculo para poder generar el PDF.')
            return
        }

        // Validación snapshot (garantiza "mismos datos" para BD y PDF)
        if (!pdfSnapshot?.consultaPayload || !pdfSnapshot?.pdfPayload) {
            setError('No hay datos listos para exportar. Vuelve a calcular e intenta nuevamente.')
            return
        }

        // Evitar doble click
        if (savingPdf) return

        try {
            setSavingPdf(true)
            setError('')

            const p = pdfSnapshot.consultaPayload

            // Validaciones necesarias para evitar NaN / inconsistencias
            const isBadNumber = (v) => v === null || v === undefined || Number.isNaN(Number(v))

            if (isBadNumber(p.id_via) || isBadNumber(p.id_medicamento) || isBadNumber(p.id_presentacion)) {
                setError('Datos incompletos (vía/medicamento/presentación). Vuelve a seleccionar y calcula otra vez.')
                return
            }
            if (isBadNumber(p.peso_paciente_kg) || Number(p.peso_paciente_kg) <= 0) {
                setError('Peso inválido para guardar/exportar.')
                return
            }
            if (isBadNumber(p.dosis_ingresada) || Number(p.dosis_ingresada) <= 0) {
                setError('Dosis inválida para guardar/exportar.')
                return
            }
            if (isBadNumber(p.intervalo_horas) || Number(p.intervalo_horas) <= 0) {
                setError('Intervalo inválido para guardar/exportar.')
                return
            }

            // Reglas IV: si hay valores opcionales, deben ser válidos
            if (Number(p.id_via) === 2) {
                if (p.tiempo_administracion_min !== null && Number(p.tiempo_administracion_min) <= 0) {
                    setError('Tiempo de infusión inválido.')
                    return
                }
                if (p.volumen_dilucion_ml !== null && Number(p.volumen_dilucion_ml) < 0) {
                    setError('Dilución inválida.')
                    return
                }
            }

            // 1) Guardar historial SOLO cuando dan PDF (INSERT sin .select()) [web:187][web:186]
            const { error: insertError } = await supabase.from('consulta_dosis').insert([p])

            if (insertError) {
                setError(`No se pudo guardar el historial: ${insertError.message}`)
                // Se mantiene el comportamiento: aún así genera el PDF con datos locales
            }

            // 2) Generar PDF con los mismos datos (sin SELECT)
            generarReportePDF(pdfSnapshot.pdfPayload)
        } finally {
            setSavingPdf(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">
            <DosisHeader activeViaId={activeViaId} />

            <main className="max-w-3xl mx-auto px-4 mt-6">
                {/* Medical Disclaimer Warning */}
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
                    <div className="flex gap-3">
                        <div className="text-amber-600 text-xl shrink-0">⚠️</div>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1">Advertencia Médica Importante</h3>
                            <p className="text-sm text-amber-800">
                                Esta calculadora es una <strong>herramienta de apoyo</strong> que debe usarse{' '}
                                <strong>únicamente bajo prescripción médica</strong>. No sustituye el criterio profesional.
                                Siempre consulte con un médico o farmacéutico antes de administrar cualquier medicamento.
                            </p>
                        </div>
                    </div>
                </div>

                <ViaTabs vias={VIAS_UI} activeViaId={activeViaId} onChangeVia={setActiveViaId} />

                {Number(activeViaId) === 2 && (
                    <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 animate-fade-in">
                        <Stethoscope className="text-rose-600 shrink-0" />
                        <div className="text-sm text-rose-800">
                            <strong>Módulo Intravenoso. Requiere dilución y control de tiempo.</strong>
                        </div>
                    </div>
                )}

                {loading && <div className="text-sm text-slate-500 mb-4">Cargando datos desde Supabase...</div>}

                {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">{error}</div>}

                {noHayMedicamentosEnVia && (
                    <div className="mb-4 text-sm text-slate-700 bg-slate-100 border border-slate-200 p-3 rounded-lg">
                        No hay medicamentos disponibles para esta vía (id_via={activeViaId}). Revisa tus registros en
                        <span className="font-mono"> presentacion_medicamento </span>
                        o que estén asociados al medicamento correcto.
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <DosisForm
                        activeViaId={activeViaId}
                        medicamentosFiltrados={medicamentosFiltrados}
                        medicamentoActual={medicamentoActual}
                        reglaActual={reglaActual}
                        selectedMedId={selectedMedId}
                        setSelectedMedId={setSelectedMedId}
                        selectedPresId={selectedPresId}
                        setSelectedPresId={setSelectedPresId}
                        peso={peso}
                        setPeso={setPeso}
                        intervalo={intervalo}
                        setIntervalo={setIntervalo}
                        dosisInput={dosisInput}
                        setDosisInput={setDosisInput}
                        dilucion={dilucion}
                        setDilucion={setDilucion}
                        tiempoInfusion={tiempoInfusion}
                        setTiempoInfusion={setTiempoInfusion}
                        onCalcular={calcular}
                        disabledAll={loading || noHayMedicamentosEnVia}
                    />

                    <DosisResults
                        activeViaId={activeViaId}
                        intervalo={intervalo}
                        resultado={resultado}
                        onDownloadPdf={onDownloadPdf}
                        disablePdf={!resultado || savingPdf}
                        loadingPdf={savingPdf}
                    />
                </div>

                <div className="mt-6">
                    <Glossary activeViaId={activeViaId} />
                </div>
            </main>

            <ScientificArticles />
        </div>
    )
}
