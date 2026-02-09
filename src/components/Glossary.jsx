import React from 'react'
import { BookOpen } from 'lucide-react'

export default function Glossary({ activeViaId }) {
  return (
    <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex gap-3 items-start">
      <BookOpen className="text-sky-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="text-sm">
        <h4 className="font-bold text-sky-800 mb-1">Glosario Rápido para Padres</h4>
        <ul className="space-y-1 text-sky-700 text-xs">
          <li>
            <strong className="text-sky-900">mg (Miligramos):</strong> Es el peso del medicamento "puro" (polvo).
          </li>
          <li>
            <strong className="text-sky-900">mL (Mililitros):</strong> Es la cantidad de líquido que mides en la jeringa/vaso.
          </li>
          <li>
            <strong className="text-sky-900">kg (Kilos):</strong> Peso del paciente.
          </li>
          {activeViaId === 2 && (
            <li>
              <strong className="text-sky-900">Dilución:</strong> Cantidad de suero que se añade para pasar el medicamento por la vena.
            </li>
          )}
          <li className="mt-2 text-[10px] text-sky-600 italic border-t border-sky-200 pt-1">
            * No confundir mg con mL. Si el médico receta "5 mL", es volumen. Si receta "100 mg", hay que calcular el volumen equivalente.
          </li>
        </ul>
      </div>
    </div>
  )
}
