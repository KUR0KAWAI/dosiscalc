import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import TableManagement from './TableManagement'
import bcrypt from 'bcryptjs'
import {
    UserPlus,
    Trash2,
    Edit2,
    LogOut,
    User as UserIcon,
    Key,
    Plus,
    X,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    Database
} from 'lucide-react'

export default function AdminDashboard({ onLogout }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form state
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({ usuario: '', password: '' })
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Tab state
    const [activeTab, setActiveTab] = useState('users') // 'users' or 'tables'

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('users').select('*').order('usuario')
        if (error) setError('Error al cargar usuarios: ' + error.message)
        else setUsers(data)
        setLoading(false)
    }

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({ usuario: user.usuario, password: '' })
        } else {
            setEditingUser(null)
            setFormData({ usuario: '', password: '' })
        }
        setShowModal(true)
        setError('')
        setShowPassword(false) // Reset password visibility when opening modal
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingUser(null)
        setFormData({ usuario: '', password: '' })
        setShowPassword(false) // Reset password visibility when closing modal
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const { usuario, password } = formData
            let hashedPassword = null

            if (password) {
                const salt = await bcrypt.genSalt(10)
                hashedPassword = await bcrypt.hash(password, salt)
            }

            if (editingUser) {
                // Update
                const updateData = { usuario }
                if (hashedPassword) updateData.contraseña = hashedPassword

                const { error } = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('userid', editingUser.userid)

                if (error) throw error
                setSuccess('Usuario actualizado correctamente')
            } else {
                // Create
                if (!password) throw new Error('La contraseña es obligatoria para nuevos usuarios')

                const { error } = await supabase
                    .from('users')
                    .insert([{ usuario, contraseña: hashedPassword }])

                if (error) throw error
                setSuccess('Usuario creado correctamente')
            }

            handleCloseModal()
            fetchUsers()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (userid) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        try {
            const { error } = await supabase.from('users').delete().eq('userid', userid)
            if (error) throw error
            setSuccess('Usuario eliminado')
            fetchUsers()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 p-2 rounded-lg">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Gestion de Sistema</h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'users'
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Usuarios
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'tables'
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Tablas
                        </div>
                    </button>
                </div>
            </header>


            <main className="flex-1 max-w-5xl mx-auto w-full p-6">
                {activeTab === 'users' ? (
                    <>
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Usuarios</h2>
                                <p className="text-slate-500 text-sm">Administre las cuentas con acceso al sistema</p>
                            </div>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-teal-100 font-semibold"
                            >
                                <UserPlus className="w-4 h-4" />
                                Nuevo Usuario
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                                <Check className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{success}</p>
                            </div>
                        )}

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm">Cargando usuarios...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                                                <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No hay usuarios registrados</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.userid} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                            <UserIcon className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{user.usuario}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-slate-400">{user.userid}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(user)}
                                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.userid)}
                                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <TableManagement />
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-zoom-in">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de Usuario</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="usuario"
                                        value={formData.usuario}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        placeholder="ej: admin_central"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        required={!editingUser}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {editingUser && (
                                    <p className="mt-1 text-xs text-slate-400 italic">Deje en blanco para mantener la actual</p>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : <Check className="w-4 h-4" />}
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
