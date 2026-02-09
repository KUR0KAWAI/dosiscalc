import React, { useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabaseClient'
import {
    Database,
    Table as TableIcon,
    Trash2,
    Eye,
    Plus,
    X,
    AlertCircle,
    Check,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

export default function TableManagement() {
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // View data modal state
    const [viewDataModal, setViewDataModal] = useState(false)
    const [selectedTable, setSelectedTable] = useState(null)
    const [tableData, setTableData] = useState([])
    const [tableColumns, setTableColumns] = useState([])
    const [loadingData, setLoadingData] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalRows, setTotalRows] = useState(0)
    const rowsPerPage = 20

    // Create table modal state
    const [createModal, setCreateModal] = useState(false)
    const [tableName, setTableName] = useState('')
    const [columns, setColumns] = useState([{ name: 'id', type: 'uuid', isPrimary: true, nullable: false }])
    const [creating, setCreating] = useState(false)

    const PROTECTED_TABLES = ['users', 'auth', '_migrations', '_realtime']

    useEffect(() => {
        fetchTables()
    }, [])

    const fetchTables = async () => {
        setLoading(true)
        setError('')
        try {
            // Use Supabase's schema introspection
            // Query pg_tables which is accessible with service_role
            const { data, error } = await supabaseAdmin
                .from('pg_tables')
                .select('tablename')
                .eq('schemaname', 'public')
                .order('tablename')

            if (error) {
                throw error
            }

            // Transform to match expected format
            const tables = (data || []).map(t => ({ table_name: t.tablename }))
            setTables(tables)
        } catch (err) {
            setError('Error al cargar tablas: ' + err.message + '. Asegúrese de que la clave de servicio esté configurada.')
            setTables([])
        } finally {
            setLoading(false)
        }
    }

    const handleViewData = async (tableName) => {
        setSelectedTable(tableName)
        setViewDataModal(true)
        setLoadingData(true)
        setCurrentPage(1)

        try {
            // Get total count
            const { count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true })
            setTotalRows(count || 0)

            // Get data
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .range(0, rowsPerPage - 1)

            if (error) throw error

            if (data && data.length > 0) {
                setTableColumns(Object.keys(data[0]))
                setTableData(data)
            } else {
                setTableColumns([])
                setTableData([])
            }
        } catch (err) {
            setError('Error al cargar datos: ' + err.message)
        } finally {
            setLoadingData(false)
        }
    }

    const handlePageChange = async (newPage) => {
        setLoadingData(true)
        const start = (newPage - 1) * rowsPerPage
        const end = start + rowsPerPage - 1

        try {
            const { data, error } = await supabase
                .from(selectedTable)
                .select('*')
                .range(start, end)

            if (error) throw error
            setTableData(data)
            setCurrentPage(newPage)
        } catch (err) {
            setError('Error al cargar página: ' + err.message)
        } finally {
            setLoadingData(false)
        }
    }

    const handleDeleteTable = async (tableName) => {
        // Check if protected
        const isProtected = PROTECTED_TABLES.some(protectedTable =>
            tableName.toLowerCase().includes(protectedTable.toLowerCase())
        )

        if (isProtected) {
            setError(`No se puede eliminar la tabla "${tableName}" - es una tabla del sistema protegida`)
            return
        }

        if (!confirm(`¿Estás ABSOLUTAMENTE SEGURO de eliminar la tabla "${tableName}"?\n\nEsta acción eliminará PERMANENTEMENTE la tabla y TODOS sus datos.`)) {
            return
        }

        if (!confirm(`ÚLTIMA CONFIRMACIÓN: ¿Eliminar "${tableName}" y todos sus datos?`)) {
            return
        }

        try {
            // Execute DROP TABLE using exec_sql function
            const { error } = await supabaseAdmin.rpc('exec_sql', {
                sql: `DROP TABLE IF EXISTS "${tableName}" CASCADE`
            })

            if (error) throw error

            setSuccess(`Tabla "${tableName}" eliminada correctamente`)
            fetchTables()
        } catch (err) {
            setError('Error al eliminar tabla: ' + err.message)
        }
    }

    const handleAddColumn = () => {
        setColumns([...columns, { name: '', type: 'text', isPrimary: false, nullable: true }])
    }

    const handleRemoveColumn = (index) => {
        setColumns(columns.filter((_, i) => i !== index))
    }

    const handleColumnChange = (index, field, value) => {
        const newColumns = [...columns]
        newColumns[index][field] = value
        setColumns(newColumns)
    }

    const handleCreateTable = async (e) => {
        e.preventDefault()
        setCreating(true)
        setError('')

        try {
            // Validate table name
            if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
                throw new Error('Nombre de tabla inválido. Use solo letras minúsculas, números y guiones bajos.')
            }

            // Build CREATE TABLE SQL
            const columnDefs = columns.map(col => {
                let def = `"${col.name}" ${col.type.toUpperCase()}`
                if (col.isPrimary) def += ' PRIMARY KEY'
                if (!col.nullable && !col.isPrimary) def += ' NOT NULL'
                if (col.type === 'uuid' && col.isPrimary) def += ' DEFAULT gen_random_uuid()'
                return def
            }).join(', ')

            const createSQL = `CREATE TABLE "${tableName}" (${columnDefs})`

            // Execute CREATE TABLE using exec_sql function
            const { error } = await supabaseAdmin.rpc('exec_sql', { sql: createSQL })

            if (error) throw error

            setSuccess(`Tabla "${tableName}" creada correctamente`)
            setCreateModal(false)
            setTableName('')
            setColumns([{ name: 'id', type: 'uuid', isPrimary: true, nullable: false }])
            fetchTables()
        } catch (err) {
            setError('Error al crear tabla: ' + err.message)
        } finally {
            setCreating(false)
        }
    }

    const totalPages = Math.ceil(totalRows / rowsPerPage)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tablas de Base de Datos</h2>
                    <p className="text-slate-500 text-sm">Gestione las tablas y sus datos</p>
                </div>
                <button
                    onClick={() => setCreateModal(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-teal-100 font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Tabla
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                    <button onClick={() => setSuccess('')} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tables Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                    <p className="text-slate-400">Cargando tablas...</p>
                </div>
            ) : tables.length === 0 ? (
                <div className="text-center py-12">
                    <Database className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400">No hay tablas en la base de datos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table) => {
                        const tableName = table.table_name || table.tablename || table.name
                        const isProtected = PROTECTED_TABLES.some(protectedTable =>
                            tableName.toLowerCase().includes(protectedTable.toLowerCase())
                        )

                        return (
                            <div
                                key={tableName}
                                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-teal-100 p-2 rounded-lg">
                                        <TableIcon className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-800 truncate">{tableName}</h3>
                                        {isProtected && (
                                            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                                Protegida
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewData(tableName)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver Datos
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTable(tableName)}
                                        disabled={isProtected}
                                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={isProtected ? 'Tabla protegida' : 'Eliminar tabla'}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* View Data Modal */}
            {viewDataModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewDataModal(false)}></div>
                    <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <TableIcon className="w-5 h-5 text-teal-600" />
                                <h3 className="text-lg font-bold text-slate-800">
                                    {selectedTable} ({totalRows} filas)
                                </h3>
                            </div>
                            <button onClick={() => setViewDataModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            {loadingData ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                                </div>
                            ) : tableData.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    Esta tabla no contiene datos
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                {tableColumns.map(col => (
                                                    <th key={col} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {tableData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    {tableColumns.map(col => (
                                                        <td key={col} className="px-4 py-3 text-slate-700 max-w-xs truncate">
                                                            {row[col] === null ? (
                                                                <span className="text-slate-400 italic">null</span>
                                                            ) : typeof row[col] === 'object' ? (
                                                                <span className="text-slate-400 font-mono text-xs">
                                                                    {JSON.stringify(row[col])}
                                                                </span>
                                                            ) : (
                                                                String(row[col])
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                                <p className="text-sm text-slate-600">
                                    Página {currentPage} de {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Table Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !creating && setCreateModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h3 className="text-lg font-bold text-slate-800">Crear Nueva Tabla</h3>
                            <button onClick={() => !creating && setCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTable} className="flex-1 overflow-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Tabla</label>
                                <input
                                    type="text"
                                    value={tableName}
                                    onChange={(e) => setTableName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="ej: productos"
                                    required
                                    pattern="[a-z_][a-z0-9_]*"
                                    title="Solo letras minúsculas, números y guiones bajos"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Columnas</label>
                                    <button
                                        type="button"
                                        onClick={handleAddColumn}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        + Agregar Columna
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {columns.map((col, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg">
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={col.name}
                                                    onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    placeholder="Nombre"
                                                    required
                                                />
                                                <select
                                                    value={col.type}
                                                    onChange={(e) => handleColumnChange(idx, 'type', e.target.value)}
                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="varchar">Varchar</option>
                                                    <option value="integer">Integer</option>
                                                    <option value="bigint">BigInt</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="timestamp">Timestamp</option>
                                                    <option value="date">Date</option>
                                                    <option value="uuid">UUID</option>
                                                    <option value="json">JSON</option>
                                                    <option value="jsonb">JSONB</option>
                                                </select>
                                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={col.isPrimary}
                                                        onChange={(e) => handleColumnChange(idx, 'isPrimary', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    Primary Key
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={!col.nullable}
                                                        onChange={(e) => handleColumnChange(idx, 'nullable', !e.target.checked)}
                                                        className="rounded"
                                                        disabled={col.isPrimary}
                                                    />
                                                    Not Null
                                                </label>
                                            </div>
                                            {columns.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveColumn(idx)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateModal(false)}
                                    disabled={creating}
                                    className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Crear Tabla
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
