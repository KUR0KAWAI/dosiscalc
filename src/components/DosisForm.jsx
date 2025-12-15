import React from 'react'
import { Droplets } from 'lucide-react'

const INTERVALOS_HORAS = [
  4, 6, 8, 12, 24,
]

export default function DosisForm({
  activeViaId,
  medicamentosFiltrados,
  medicamentoActual,
  reglaActual,
  selectedMedId,
  setSelectedMedId,
  selectedPresId,
  setSelectedPresId,
  peso,
  setPeso,
  intervalo,
  setIntervalo,
  dosisInput,
  setDosisInput,
  dilucion,
  setDilucion,
  tiempoInfusion,
  setTiempoInfusion,
  onCalcular,
}) {
  // Opcional: sugerir intervalos desde la regla si existen
  const intervalosDisponibles = React.useMemo(() => {
    const a = Number(reglaActual?.int_min)
    const b = Number(reglaActual?.int_max)

    // Si no hay rango en regla, usa el catálogo fijo
    if (!reglaActual?.int_min || !reglaActual?.int_max || Number.isNaN(a) || Number.isNaN(b)) {
      return INTERVALOS_HORAS
    }

    // Filtra el catálogo fijo por el rango [min..max]
    const filtered = INTERVALOS_HORAS.filter((h) => h >= a && h <= b)
    // Si el rango no “calza” con el catálogo fijo, cae al catálogo fijo completo
    return filtered.length ? filtered : INTERVALOS_HORAS
  }, [reglaActual])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 h-fit">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase">Medicamento</label>
        <select
          className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
          value={selectedMedId}
          onChange={(e) => setSelectedMedId(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {medicamentosFiltrados.map((m) => (
            <option key={m.id_medicamento} value={m.id_medicamento}>
              {m.nombre_generico}
            </option>
          ))}
        </select>
      </div>

      <div className={!selectedMedId ? 'opacity-50 pointer-events-none' : ''}>
        <label className="text-xs font-bold text-slate-500 uppercase">Presentación</label>
        <select
          className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
          value={selectedPresId}
          onChange={(e) => setSelectedPresId(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {medicamentoActual?.presentaciones
            ?.filter((p) => Number(p.id_via) === Number(activeViaId))
            ?.map((p) => (
              <option key={p.id_presentacion} value={p.id_presentacion}>
                {p.forma} ({p.conc_cant}
                {p.conc_uni} / {p.vol_cant}
                {p.vol_uni})
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
            placeholder="0.0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
        </div>

        {/* INTERVALO COMO COMBOBOX */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Intervalo (h)</label>
          <select
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)} // queda string; en App haces Number()/parseFloat
          >
            <option value="">Seleccionar...</option>
            {intervalosDisponibles.map((h) => (
              <option key={h} value={String(h)}>
                Cada {h} horas
              </option>
            ))}
          </select>

          {/* Hint opcional si existe regla */}
          {reglaActual?.int_min && reglaActual?.int_max && (
            <div className="text-[10px] text-slate-500 mt-1">
              Rango sugerido: {reglaActual.int_min}–{reglaActual.int_max} h
            </div>
          )}
        </div>
      </div>

      {activeViaId === 2 && (
        <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 space-y-3">
          <div className="text-xs font-bold text-rose-800 flex items-center gap-1">
            <Droplets size={12} /> Configuración de Infusión (Opcional)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-rose-700 uppercase">Diluyente (mL)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border border-rose-200 rounded-lg text-sm"
                placeholder="ej. 100"
                value={dilucion}
                onChange={(e) => setDilucion(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-rose-700 uppercase">Tiempo (min)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border border-rose-200 rounded-lg text-sm"
                placeholder="ej. 60"
                value={tiempoInfusion}
                onChange={(e) => setTiempoInfusion(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Dosis Prescrita</label>
          {reglaActual && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              Sugerido: {reglaActual.min}-{reglaActual.max} {reglaActual.esquema}
            </span>
          )}
        </div>
        <input
          type="number"
          className="w-full p-2 border border-slate-300 rounded-lg"
          placeholder="Cantidad"
          value={dosisInput}
          onChange={(e) => setDosisInput(e.target.value)}
        />
      </div>

      <button
        onClick={onCalcular}
        className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${
          activeViaId === 1
            ? 'bg-teal-600 hover:bg-teal-700'
            : activeViaId === 2
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        CALCULAR
      </button>
    </div>
  )
}
