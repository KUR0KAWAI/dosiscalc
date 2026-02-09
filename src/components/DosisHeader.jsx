import React from 'react'
import { Calculator, Database } from 'lucide-react'

export default function DosisHeader({ activeViaId }) {
  return (
    <nav className={`shadow-md transition-colors ${activeViaId === 1 ? 'bg-teal-600' : 'bg-rose-700'}`}>
      <div className="max-w-3xl mx-auto px-4 py-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calculator size={24} />
          <span className="font-bold text-lg">
            DosisCalc <span className="opacity-75 font-normal">App</span>
          </span>
        </div>
        <div className="bg-black/20 px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Database size={12} /> BD: Supabase
        </div>
      </div>
    </nav>
  )
}
