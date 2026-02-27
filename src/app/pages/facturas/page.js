"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ChevronDown, X, Search, Filter, Eye, Calendar, Euro, Download, FileText } from "lucide-react"
import useUserDepartamento from "@/app/hooks/useUserDepartamento"
import useNotifications from "@/app/hooks/useNotifications"
import PdfViewer from "@/app/components/PdfViewer"

export default function Facturas() {
    const { departamento, isLoading: isDepartamentoLoading } = useUserDepartamento()
    const { addNotification, notificationComponents } = useNotifications()

    const [facturas, setFacturas] = useState([])
    const [userRole, setUserRole] = useState(null)
    const [filteredFacturas, setFilteredFacturas] = useState([])
    const [loading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingFactura, setUpdatingFactura] = useState(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [filterMes, setFilterMes] = useState("")
    const [filterAño, setFilterAño] = useState("")
    const [filterImporte, setFilterImporte] = useState("")
    const [filterEstado, setFilterEstado] = useState("")
    const [filterDepartamento, setFilterDepartamento] = useState("")

    const [showPdfViewer, setShowPdfViewer] = useState(false)
    const [selectedPdfUrl, setSelectedPdfUrl] = useState("")
    const [selectedPdfName, setSelectedPdfName] = useState("")

    const [showExportModal, setShowExportModal] = useState(false)
    const [exportData, setExportData] = useState([])
    const sheetJSRef = useRef(null)
    const [excelFileName, setExcelFileName] = useState("facturas")
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)


    const [departamentosList, setDepartamentosList] = useState([])
    const [selectedFacturas, setSelectedFacturas] = useState([])
    const [openDropdown, setOpenDropdown] = useState(null)

    const estadoOptions = ["Pendiente", "Contabilizada", "Anulada"]

    const handleViewPdf = async (facturaId, numFactura) => {
        try {
            setIsLoading(true)
            addNotification("Preparando PDF para visualización...", "info")

            const generateResponse = await fetch(`/api/facturas/generate?id=${facturaId}`)

            if (!generateResponse.ok) {
                const errorData = await generateResponse.json()
                if (errorData.error?.includes("No hay ruta de PDF definida")) {
                    const facturaResponse = await fetch(`/api/getFacturaById/${facturaId}`)
                    if (facturaResponse.ok) {
                        const facturaData = await facturaResponse.json()
                        const año = new Date(facturaData.Fecha_emision || new Date()).getFullYear()
                        const departamentoCodigo = facturaData.Departamento?.substring(0, 3).toLowerCase() || 'gen'
                        const numeroLimpio = facturaData.Num_factura.toLowerCase().replace(/[^a-z0-9]/g, '')
                        const rutaPdf = `/facturas/${año}/${departamentoCodigo}/fac-${numeroLimpio}.pdf`

                        const updateResponse = await fetch(`/api/facturas/updateRoute`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ facturaId, rutaPdf })
                        })

                        if (updateResponse.ok) {
                            const retryResponse = await fetch(`/api/facturas/generate?id=${facturaId}`)
                            if (!retryResponse.ok) throw new Error("Error generando PDF después de crear ruta")
                        }
                    }
                } else {
                    throw new Error(errorData.error || "Error generando PDF")
                }
            }

            setSelectedPdfUrl(`/api/facturas/viewPdf?id=${facturaId}&t=${Date.now()}`)
            setSelectedPdfName(`Factura ${numFactura}`)
            setShowPdfViewer(true)
            addNotification("PDF listo para visualización", "success")
        } catch (error) {
            addNotification(`Error: ${error.message}`, "error")
        } finally {
            setIsLoading(false)
        }
    }

    function getDateParts(dateString) {
        if (!dateString) return { mes: '', año: '' }
        try {
            const date = new Date(dateString)
            return { mes: (date.getMonth() + 1).toString(), año: date.getFullYear().toString() }
        } catch {
            return { mes: '', año: '' }
        }
    }

    const fechasFiltradas = useMemo(() => {
        const facturasFiltradas = facturas.filter(factura => {
            if (!factura.Fecha_emision) return false
            const { mes, año } = getDateParts(factura.Fecha_emision)
            if (filterMes && mes !== filterMes) return false
            if (filterAño && año !== filterAño) return false
            return true
        })
        const meses = new Set()
        const años = new Set()
        facturasFiltradas.forEach(factura => {
            const { mes, año } = getDateParts(factura.Fecha_emision)
            meses.add(mes)
            años.add(año)
        })
        return {
            meses: Array.from(meses).sort((a, b) => parseInt(a) - parseInt(b)),
            años: Array.from(años).sort((a, b) => parseInt(a) - parseInt(b))
        }
    }, [facturas, filterMes, filterAño])

    const getNombreMes = (numeroMes) => {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        return meses[parseInt(numeroMes) - 1] || numeroMes
    }

    const handleClearFilters = () => {
        setSearchTerm("")
        setFilterMes("")
        setFilterAño("")
        setFilterImporte("")
        setFilterEstado("")
        if (userRole !== "Jefe de Departamento") setFilterDepartamento("")
        addNotification("Filtros eliminados", "info")
    }

    useEffect(() => {
        if (showExportModal && !sheetJSRef.current) {
            import('xlsx').then(XLSX => {
                sheetJSRef.current = XLSX
            }).catch(() => {
                addNotification("Error al cargar las herramientas de exportación", "error")
            })
        }
    }, [showExportModal])

    useEffect(() => {
        async function fetchUserRole() {
            try {
                const response = await fetch('/api/getSessionUser')
                if (response.ok) {
                    const data = await response.json()
                    const userRol = data.usuario?.rol || ''
                    setUserRole(userRol)
                    if (userRol === "Jefe de Departamento" && departamento) {
                        setFilterDepartamento(departamento)
                    }
                }
            } catch (error) {
                console.error("Error obteniendo información del usuario:", error)
            }
        }

        async function fetchFacturas() {
            try {
                const response = await fetch('/api/getFacturas')
                const data = await response.json()
                if (Array.isArray(data) && data.length > 0) {
                    setFacturas(data)
                    setDepartamentosList([...new Set(data.map(f => f.Departamento))])
                    return data
                } else {
                    setError("No se encontraron facturas")
                    return []
                }
            } catch (error) {
                setError("Error al cargar las facturas: " + error.message)
                return []
            }
        }

        async function loadData() {
            const role = await fetchUserRole()
            const facturasData = await fetchFacturas()
            if ((role === "Jefe de Departamento" || role === "Jefe Departamento") && departamento) {
                const normalizedUserDept = departamento.trim().toLowerCase()
                setFilteredFacturas(facturasData.filter(f =>
                    (f.Departamento?.trim().toLowerCase() || '') === normalizedUserDept
                ))
            } else {
                setFilteredFacturas(facturasData)
            }
            setIsLoading(false)
        }

        loadData()
    }, [departamento])

    useEffect(() => {
        if (!facturas.length) return
        const filtered = facturas.filter(factura => {
            const matchesSearch = searchTerm === "" ||
                factura.Num_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                factura.Num_orden?.toLowerCase().includes(searchTerm.toLowerCase())

            let matchesFecha = true
            if (filterMes || filterAño) {
                if (!factura.Fecha_emision) {
                    matchesFecha = false
                } else {
                    const { mes, año } = getDateParts(factura.Fecha_emision)
                    if (filterMes && mes !== filterMes) matchesFecha = false
                    if (filterAño && año !== filterAño) matchesFecha = false
                }
            }

            let matchesImporte = true
            if (filterImporte && factura.Importe !== undefined) {
                const importe = parseFloat(factura.Importe)
                if (filterImporte === "0-500") matchesImporte = importe < 500
                else if (filterImporte === "500-1000") matchesImporte = importe >= 500 && importe < 1000
                else if (filterImporte === "1000-5000") matchesImporte = importe >= 1000 && importe < 5000
                else if (filterImporte === "5000+") matchesImporte = importe >= 5000
            }

            return matchesSearch && matchesFecha && matchesImporte &&
                (filterEstado === "" || factura.Estado === filterEstado) &&
                (filterDepartamento === "" || factura.Departamento === filterDepartamento)
        })
        setFilteredFacturas(filtered)
    }, [facturas, searchTerm, filterMes, filterAño, filterImporte, filterEstado, filterDepartamento])

    function formatDate(dateString) {
        if (!dateString) return "-"
        try {
            return new Date(dateString).toLocaleDateString()
        } catch {
            return dateString
        }
    }

    function formatDateForInput(dateString) {
        if (!dateString) return ""
        try {
            return new Date(dateString).toISOString().split('T')[0]
        } catch {
            return ""
        }
    }

    const toggleSelectFactura = (facturaId) => {
        setSelectedFacturas(prev =>
            prev.includes(facturaId) ? prev.filter(id => id !== facturaId) : [...prev, facturaId]
        )
    }

    const toggleSelectAll = () => {
        setSelectedFacturas(
            selectedFacturas.length === filteredFacturas.length ? [] : filteredFacturas.map(f => f.idFactura)
        )
    }

    const prepareExportData = () => {
        const facturasToExport = selectedFacturas.length > 0
            ? filteredFacturas.filter(f => selectedFacturas.includes(f.idFactura))
            : filteredFacturas
        return facturasToExport.map(factura => ({
            'Número Factura': factura.Num_factura || '',
            'Número Orden': factura.Num_orden || '',
            'Proveedor': factura.Proveedor || '',
            'Departamento': factura.Departamento || '',
            'Fecha Emisión': formatDate(factura.Fecha_emision) || '',
            'Importe (€)': factura.Importe || 0,
            'Estado': factura.Estado || ''
        }))
    }

    const generateExcel = async () => {
        try {
            setIsGeneratingExcel(true)
            if (!sheetJSRef.current) throw new Error("La biblioteca de Excel no está cargada")
            const XLSX = sheetJSRef.current
            const workbook = XLSX.utils.book_new()
            const worksheet = XLSX.utils.json_to_sheet(exportData)
            XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas")
            worksheet['!cols'] = Object.keys(exportData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }))
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true })
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            return { url: URL.createObjectURL(blob), filename: `${excelFileName}.xlsx` }
        } catch (error) {
            addNotification("Error al generar el archivo Excel", "error")
            return null
        } finally {
            setIsGeneratingExcel(false)
        }
    }

    const downloadExcel = async () => {
        const excelData = await generateExcel()
        if (!excelData) return
        const link = document.createElement('a')
        link.href = excelData.url
        link.download = excelData.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(excelData.url)
        setShowExportModal(false)
        addNotification("Archivo Excel descargado correctamente", "success")
    }

    const handleDescargarSeleccionadas = () => {
        if (selectedFacturas.length === 0) {
            addNotification("Por favor, selecciona al menos una factura para exportar", "warning")
            return
        }
        const data = prepareExportData()
        if (data.length === 0) {
            addNotification("No hay datos para exportar", "warning")
            return
        }
        setExportData(data)
        const today = new Date()
        const formattedDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`
        const deptSuffix = filterDepartamento ? `_${filterDepartamento.toLowerCase().replace(/\s+/g, '_')}` : ''
        setExcelFileName(`facturas${deptSuffix}_${formattedDate}`)
        setShowExportModal(true)
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (openDropdown !== null && !event.target.closest('.estado-dropdown')) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [openDropdown])

    const handleUpdateEstado = async (facturaId, nuevoEstado) => {
        if (userRole !== 'Administrador' && userRole !== 'Contable') {
            addNotification("No tienes permisos para cambiar el estado de las facturas", "error")
            setOpenDropdown(null)
            return
        }
        setUpdatingFactura(facturaId)
        try {
            const response = await fetch('/api/facturas/actualizarEstado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idFactura: facturaId, nuevoEstado })
            })
            const data = response.ok ? await response.json() : null
            setFacturas(facturas.map(f => f.idFactura === facturaId ? { ...f, Estado: nuevoEstado } : f))
            addNotification(data?.message || `Estado actualizado a: ${nuevoEstado}`, "success")
        } catch {
            setFacturas(facturas.map(f => f.idFactura === facturaId ? { ...f, Estado: nuevoEstado } : f))
            addNotification("Estado actualizado localmente (la API no está disponible)", "warning")
        } finally {
            setUpdatingFactura(null)
            setOpenDropdown(null)
        }
    }

    if (loading || isDepartamentoLoading) {
        return <div className="p-6">Cargando...</div>
    }

    return (
        <div className="p-6 h-[calc(100vh-8rem)] flex flex-col">
            {notificationComponents}

            {/* Encabezado */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Facturas</h1>
                <h2 className="text-xl text-gray-400">Departamento {departamento}</h2>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            <div className="mb-4 flex justify-end">
                <button
                    onClick={handleClearFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por número de factura o orden..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative">
                    <select value={filterMes} onChange={(e) => setFilterMes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10">
                        <option value="">Todos los meses</option>
                        {fechasFiltradas.meses.map(mes => <option key={`mes-${mes}`} value={mes}>{getNombreMes(mes)}</option>)}
                    </select>
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select value={filterAño} onChange={(e) => setFilterAño(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10">
                        <option value="">Todos los años</option>
                        {fechasFiltradas.años.map(año => <option key={`año-${año}`} value={año}>{año}</option>)}
                    </select>
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select value={filterImporte} onChange={(e) => setFilterImporte(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10">
                        <option value="">Todos los importes</option>
                        <option value="0-500">Menos de 500€</option>
                        <option value="500-1000">500€ - 1,000€</option>
                        <option value="1000-5000">1,000€ - 5,000€</option>
                        <option value="5000+">Más de 5,000€</option>
                    </select>
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10">
                        <option value="">Todos los estados</option>
                        <option value="Contabilizada">Contabilizada</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Anulada">Anulada</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterDepartamento}
                        onChange={(e) => setFilterDepartamento(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10"
                        disabled={userRole === "Jefe de Departamento"}
                    >
                        <option value="">Todos los departamentos</option>
                        {departamentosList.map((dep, i) => <option key={`dep-${i}`} value={dep}>{dep}</option>)}
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            <div className="mb-2 text-sm text-gray-500">
                Mostrando {filteredFacturas.length} de {facturas.length} facturas
            </div>

            {/* Tabla */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow">
                <div className="h-full overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-3 w-12">
                                    {filteredFacturas.length > 0 && (
                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedFacturas.length === filteredFacturas.length && filteredFacturas.length > 0}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Nº Factura</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Proveedor</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Fecha emisión</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Importe</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Num Orden</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-600">Departamento</th>
                                <th className="py-3 px-4 text-center font-medium text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFacturas.length > 0 ? (
                                filteredFacturas.map(factura => (
                                    <tr
                                        key={factura.idFactura}
                                        className={`border-t border-gray-200 cursor-pointer ${selectedFacturas.includes(factura.idFactura) ? "bg-blue-50 hover:bg-blue-100" : ""}`}
                                        onClick={() => toggleSelectFactura(factura.idFactura)}
                                    >
                                        <td className="py-3 px-3 w-12" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFacturas.includes(factura.idFactura)}
                                                    onChange={() => toggleSelectFactura(factura.idFactura)}
                                                    className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">{factura.Num_factura}</td>
                                        <td className="py-3 px-4">{factura.Proveedor}</td>
                                        <td className="py-3 px-4">{formatDate(factura.Fecha_emision)}</td>
                                        <td className="py-3 px-4">{factura.Importe ? `${factura.Importe.toLocaleString()}€` : '-'}</td>
                                        <td className="py-3 px-4">{factura.Num_orden}</td>
                                        <td className="py-3 px-4">
                                            <div className="relative w-32 estado-dropdown">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === factura.idFactura ? null : factura.idFactura) }}
                                                    className={`border rounded px-3 py-1 w-full text-sm cursor-pointer ${factura.Estado === "Contabilizada" ? "bg-green-50 text-green-800" : factura.Estado === "Pendiente" ? "bg-yellow-50 text-yellow-800" : "bg-red-50 text-red-800"}`}
                                                    disabled={updatingFactura === factura.idFactura}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{updatingFactura === factura.idFactura ? "Actualizando..." : factura.Estado}</span>
                                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                </button>
                                                {openDropdown === factura.idFactura && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20">
                                                        {estadoOptions.map(estado => (
                                                            <button
                                                                key={estado}
                                                                onClick={e => { e.stopPropagation(); handleUpdateEstado(factura.idFactura, estado) }}
                                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${estado === factura.Estado ? "font-semibold bg-gray-50" : ""}`}
                                                            >
                                                                {estado}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{factura.Departamento}</span>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {factura.Ruta_pdf && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleViewPdf(factura.idFactura, factura.Num_factura) }}
                                                    className="text-blue-900 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 cursor-pointer"
                                                    title="Ver PDF"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="py-6 text-center text-gray-500">
                                        {userRole === "Jefe de Departamento"
                                            ? `No se encontraron facturas para el departamento de ${departamento}`
                                            : searchTerm || filterMes || filterAño || filterImporte || filterEstado
                                                ? "No se encontraron facturas con los criterios de búsqueda actuales"
                                                : "No se encontraron facturas."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visor de PDF */}
            {showPdfViewer && (
                <PdfViewer pdfUrl={selectedPdfUrl} fileName={selectedPdfName} onClose={() => setShowPdfViewer(false)} />
            )}

            {/* Botones de acción */}
            <div className="flex justify-between mt-4 mb-4">
                <button
                    onClick={handleDescargarSeleccionadas}
                    disabled={selectedFacturas.length === 0}
                    className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    <span>Exportar a Excel {selectedFacturas.length > 0 ? `(${selectedFacturas.length})` : ""}</span>
                </button>
            </div>

            {/* Modal exportar Excel */}
            {showExportModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}>
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Exportar a Excel</h2>
                            <button onClick={() => setShowExportModal(false)} disabled={isGeneratingExcel}>
                                <X className="w-6 h-6 text-gray-500 hover:text-red-600 cursor-pointer" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-1">Nombre del archivo</label>
                            <div className="flex gap-2">
                                <input type="text" value={excelFileName} onChange={(e) => setExcelFileName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 flex-grow" disabled={isGeneratingExcel} />
                                <span className="bg-gray-100 text-gray-600 border border-gray-200 rounded px-3 py-2">.xlsx</span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Vista previa de los datos</h3>
                            <div className="border border-gray-200 rounded overflow-x-auto max-h-96">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {exportData.length > 0 && Object.keys(exportData[0]).map(header => (
                                                <th key={header} className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exportData.length > 0 ? exportData.map((row, i) => (
                                            <tr key={i} className="border-t border-gray-200">
                                                {Object.values(row).map((cell, j) => <td key={j} className="py-2 px-4">{cell}</td>)}
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="py-4 text-center text-gray-500">No hay datos para exportar</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Se exportarán {exportData.length} facturas {selectedFacturas.length > 0 ? 'seleccionadas' : 'filtradas'}.</p>
                        </div>
                        <div className="mb-6 bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
                            <p className="font-medium mb-1">Información sobre la exportación:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Se exportarán {exportData.length} facturas en formato Excel (.xlsx)</li>
                                <li>Columnas: Número de factura, Número de orden, Proveedor, Departamento, Fecha de emisión, Importe y Estado</li>
                                <li>{selectedFacturas.length > 0 ? `Has seleccionado ${selectedFacturas.length} facturas` : 'Se exportarán todas las facturas visibles según los filtros'}</li>
                            </ul>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowExportModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer" disabled={isGeneratingExcel}>Cancelar</button>
                            <button onClick={downloadExcel} disabled={isGeneratingExcel || exportData.length === 0} className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                                {isGeneratingExcel ? (
                                    <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Procesando...</>
                                ) : (
                                    <><Download className="w-4 h-4" />Descargar Excel</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
