import React from 'react'
import { Calculator, FileText, Info, Timer } from 'lucide-react'

export default function DosisResults({ activeViaId, intervalo, resultado, onDownloadPdf, disablePdf = false }) {
  if (!resultado) {
    return (
      <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
        <Calculator size={48} className="mb-2 opacity-20" />
        <p>Ingresa datos para calcular</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-teal-500 p-6 animate-in slide-in-from-bottom-4">
      {resultado.alerta && (
        <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded mb-4 flex gap-2">
          <Info size={16} /> {resultado.alerta}
        </div>
      )}

      <div className="text-center py-4">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Dosis de Medicamento</h3>
        <div className={`text-5xl font-extrabold my-2 ${activeViaId === 1 ? 'text-teal-600' : 'text-rose-600'}`}>
          {resultado.mlPorDosis} <span className="text-xl text-slate-400">mL</span>
        </div>
        <p className="text-slate-600 font-medium text-sm">
          {resultado.goteoInfo ? `+ ${resultado.goteoInfo.diluyente} mL de diluyente` : `Cada ${intervalo} horas`}
        </p>
      </div>

      {resultado.goteoInfo && (
        <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-600 pb-2">
            <Timer className="text-rose-400" size={18} />
            <span className="font-bold text-sm">Velocidad de Infusión</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400">Normogotero (20)</div>
              <div className="text-2xl font-bold text-rose-400">
                {resultado.goteoInfo.gotasMin} <span className="text-xs text-white">gt/min</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Bomba / Micro</div>
              <div className="text-2xl font-bold text-teal-400">
                {resultado.goteoInfo.microGotasMin} <span className="text-xs text-white">mL/h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
        <div>
          Mg por toma: <span className="font-bold text-slate-700">{resultado.mgPorDosis}</span>
        </div>
        <div>
          Mg totales/día: <span className="font-bold text-slate-700">{resultado.mgTotalDia}</span>
        </div>
      </div>

      <button
        disabled={disablePdf}
        onClick={onDownloadPdf}
        className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
          disablePdf ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
        }`}
      >
        <FileText size={16} /> Descargar Reporte PDF
      </button>
    </div>
  )
}
