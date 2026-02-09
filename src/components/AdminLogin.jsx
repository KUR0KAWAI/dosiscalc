import React, { useState } from 'react'
import { LogIn, ShieldCheck } from 'lucide-react'

export default function AdminLogin({ onLogin }) {
    const [usuario, setUsuario] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // Mock login as requested
        onLogin()
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl border border-slate-200 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 mb-4 bg-teal-100 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-teal-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Acceso Administrativo</h1>
                    <p className="text-slate-500 text-sm">Ingrese sus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">Usuario</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                            placeholder="Nombre de usuario"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-100"
                    >
                        <LogIn className="w-5 h-5" />
                        Ingresar
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        DosisCalc © 2026 - Control Interno
                    </p>
                </div>
            </div>
        </div>
    )
}
