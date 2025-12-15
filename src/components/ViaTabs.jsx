import React from 'react'

export default function ViaTabs({ vias, activeViaId, onChangeVia }) {
  const classByVia = (viaId) => {
    if (activeViaId !== viaId) return 'text-slate-500 hover:bg-slate-50'
    if (viaId === 1) return 'bg-teal-100 text-teal-800'
    if (viaId === 2) return 'bg-rose-100 text-rose-800'
    return 'bg-indigo-100 text-indigo-800'
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex flex-wrap sm:flex-nowrap gap-1">
        {vias.map((v) => (
          <button
            key={v.id_via}
            onClick={() => onChangeVia(v.id_via)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${classByVia(v.id_via)}`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
