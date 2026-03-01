"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { X, Download } from "lucide-react"
import useUserDepartamento from "@/app/hooks/useUserDepartamento"
import useNotifications from "@/app/hooks/useNotifications"
import Image from 'next/image'

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const PRIMARY_COLOR = { r: 30, g: 58, b: 138 }

export default function Informes({ initialDepartamentos = [] }) {
  const { departamento: userDepartamento, isLoading: isDepartamentoLoading, userRole } = useUserDepartamento()
  const { addNotification, notificationComponents } = useNotifications()

  const jsPDFRef = useRef(null)
  const autoTableRef = useRef(null)

  const [departamentos] = useState(initialDepartamentos)
  const [selectedDepartamento, setSelectedDepartamento] = useState("")
  const [departamentoId, setDepartamentoId] = useState(null)

  const [ordenes, setOrdenes] = useState([])
  const [isLoadingOrdenes, setIsLoadingOrdenes] = useState(false)

  const [financialData, setFinancialData] = useState({
    presupuestoTotal: 0,
    presupuestoGastado: 0,
    inversionTotal: 0,
    inversionGastada: 0
  })

  const [mes, setMes] = useState("")
  const [ano, setAno] = useState("")

  const [showInformeModal, setShowInformeModal] = useState(false)
  const [informeData, setInformeData] = useState(null)
  const [generatingInforme, setGeneratingInforme] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false)

  // Preseleccionar departamento del usuario cuando cargue
  useEffect(() => {
    if (!userDepartamento || !departamentos.length) return
    const depInfo = departamentos.find(d => d.Nombre === userDepartamento)
    if (depInfo) {
      setSelectedDepartamento(depInfo.Nombre)
      setDepartamentoId(depInfo.id_Departamento)
    }
  }, [userDepartamento, departamentos])

  // Cargar órdenes cuando cambie el departamento
  useEffect(() => {
    if (!departamentoId) return

    async function fetchOrdenes() {
      setIsLoadingOrdenes(true)
      try {
        const res = await fetch(`/api/getOrdenByDepartamento?id=${departamentoId}`)
        if (res.ok) {
          const data = await res.json()
          const normalizadas = data.map(orden => ({
            ...orden,
            Importe: typeof orden.Importe === 'string'
              ? parseFloat(orden.Importe.replace(/,/g, '.'))
              : orden.Importe,
            Fecha: orden.Fecha ? new Date(orden.Fecha).toISOString().split('T')[0] : null
          }))
          setOrdenes(normalizadas)
        } else {
          const fallback = await fetch('/api/getOrden')
          if (fallback.ok) {
            const all = await fallback.json()
            setOrdenes(all.filter(o => o.Departamento === selectedDepartamento))
          }
        }
      } catch (error) {
        console.error("Error obteniendo órdenes:", error)
        addNotification("Error cargando órdenes", "error")
      } finally {
        setIsLoadingOrdenes(false)
      }
    }

    fetchOrdenes()
  }, [departamentoId])

  // Cargar datos financieros reales cuando cambie departamento o año
  useEffect(() => {
    if (!departamentoId) return

    async function fetchFinancialData() {
      try {
        const yearParam = ano ? `&year=${ano}` : `&year=${new Date().getFullYear()}`
        const res = await fetch(`/api/getBolsasRecientes?departamentoId=${departamentoId}&type=all${yearParam}`)
        if (!res.ok) return

        const data = await res.json()
        setFinancialData({
          presupuestoTotal: data.presupuesto?.total_presupuesto || 0,
          presupuestoGastado: data.gastoPresupuesto || 0,
          inversionTotal: data.inversion?.total_inversion || 0,
          inversionGastada: data.gastoInversion || 0
        })
      } catch (error) {
        console.error("Error obteniendo datos financieros:", error)
      }
    }

    fetchFinancialData()
  }, [departamentoId, ano])

  useEffect(() => {
    if (!showInformeModal || pdfLibsLoaded) return

    async function loadPdfLibs() {
      try {
        const jsPDFModule = await import('jspdf')
        jsPDFRef.current = jsPDFModule.default
        const autoTableModule = await import('jspdf-autotable')
        autoTableRef.current = autoTableModule.default
        setPdfLibsLoaded(true)
      } catch (error) {
        console.error("Error cargando bibliotecas PDF:", error)
        addNotification("Error cargando herramientas para generar PDF", "error")
      }
    }

    loadPdfLibs()
  }, [showInformeModal, pdfLibsLoaded])

  const handleChangeDepartamento = (e) => {
    const nombre = e.target.value
    const depInfo = departamentos.find(d => d.Nombre === nombre)
    setSelectedDepartamento(nombre)
    setDepartamentoId(depInfo?.id_Departamento || null)
    setMes("")
    setAno("")
    setOrdenes([])
  }

  // Órdenes filtradas por departamento
  const ordenesFiltradas = useMemo(() => {
    if (!selectedDepartamento || !ordenes.length) return []
    return ordenes.filter(o => o.Departamento === selectedDepartamento)
  }, [selectedDepartamento, ordenes])

  // Años disponibles según órdenes
  const anosFiltrados = useMemo(() => {
    const set = new Set()
    set.add(new Date().getFullYear().toString())
    let base = ordenesFiltradas
    if (mes) {
      const mesIdx = MESES.indexOf(mes)
      base = base.filter(o => o.Fecha && new Date(o.Fecha).getMonth() === mesIdx)
    }
    base.forEach(o => {
      if (o.Fecha) set.add(new Date(o.Fecha).getFullYear().toString())
    })
    return Array.from(set).sort()
  }, [ordenesFiltradas, mes])

  // Meses disponibles según órdenes y año seleccionado
  const mesesFiltrados = useMemo(() => {
    const set = new Set()
    set.add(MESES[new Date().getMonth()])
    let base = ordenesFiltradas
    if (ano) {
      base = base.filter(o => o.Fecha && new Date(o.Fecha).getFullYear().toString() === ano)
    }
    base.forEach(o => {
      if (o.Fecha) set.add(MESES[new Date(o.Fecha).getMonth()])
    })
    return Array.from(set).sort((a, b) => MESES.indexOf(a) - MESES.indexOf(b))
  }, [ordenesFiltradas, ano])

  // Reset mes si ya no está disponible tras cambio de año
  useEffect(() => {
    if (mes && mesesFiltrados.length > 0 && !mesesFiltrados.includes(mes)) setMes("")
  }, [mesesFiltrados])

  // Reset año si ya no está disponible tras cambio de mes
  useEffect(() => {
    if (ano && anosFiltrados.length > 0 && !anosFiltrados.includes(ano)) setAno("")
  }, [anosFiltrados])

  const handleGenerarInforme = async () => {
    if (!selectedDepartamento || !mes || !ano) {
      addNotification("Selecciona departamento, mes y año", "warning")
      return
    }

    setGeneratingInforme(true)
    try {
      const mesIndex = MESES.indexOf(mes)
      const ordenesDelPeriodo = ordenesFiltradas.filter(o => {
        if (!o.Fecha) return false
        const fecha = new Date(o.Fecha)
        return fecha.getMonth() === mesIndex && fecha.getFullYear().toString() === ano
      })

      if (ordenesDelPeriodo.length === 0) {
        addNotification(`No se encontraron órdenes para ${mes} ${ano}`, "warning")
        return
      }

      setInformeData({
        titulo: `Informe ${selectedDepartamento} - ${mes} ${ano}`,
        departamento: selectedDepartamento,
        fechaGeneracion: new Date().toLocaleDateString('es-ES'),
        presupuestoTotal: financialData.presupuestoTotal,
        presupuestoGastado: financialData.presupuestoGastado,
        inversionTotal: financialData.inversionTotal,
        inversionGastada: financialData.inversionGastada,
        ordenes: ordenesDelPeriodo.map(o => ({
          id: o.idOrden,
          numero: o.Num_orden,
          fecha: new Date(o.Fecha).toLocaleDateString('es-ES'),
          descripcion: o.Descripcion || 'Sin descripción',
          importe: parseFloat(o.Importe) || 0
        }))
      })

      setShowInformeModal(true)
    } catch (error) {
      console.error("Error generando informe:", error)
      addNotification("Error al generar el informe", "error")
    } finally {
      setGeneratingInforme(false)
    }
  }

  const handleDescargarInforme = async () => {
    if (!informeData || !pdfLibsLoaded) return

    setGeneratingPDF(true)
    try {
      const doc = new jsPDFRef.current({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      doc.setFont("helvetica")

      let logoBase64 = null
      try {
        logoBase64 = await getBase64Image('/images/logo.jpg')
      } catch {}

      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 20, 10, 25, 25)
        doc.setFontSize(20)
        doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
        doc.text(informeData.titulo, 50, 25)
      } else {
        doc.setFontSize(20)
        doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
        doc.text(informeData.titulo, 20, 20)
      }

      const lineY = logoBase64 ? 40 : 25
      doc.setDrawColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
      doc.setLineWidth(0.5)
      doc.line(20, lineY, 190, lineY)

      const infoY = lineY + 10
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Departamento: ${informeData.departamento}`, 20, infoY)
      doc.text(`Fecha generación: ${informeData.fechaGeneracion}`, 20, infoY + 7)

      const presY = infoY + 20
      doc.setFontSize(14)
      doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
      doc.text('Presupuesto', 20, presY)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text('Total asignado:', 25, presY + 8)
      doc.text(`${informeData.presupuestoTotal.toLocaleString()} €`, 100, presY + 8)
      doc.text('Gastado:', 25, presY + 15)
      doc.text(`${informeData.presupuestoGastado.toLocaleString()} €`, 100, presY + 15)
      doc.text('Restante:', 25, presY + 22)
      doc.text(`${(informeData.presupuestoTotal - informeData.presupuestoGastado).toLocaleString()} €`, 100, presY + 22)

      const invY = presY + 35
      doc.setFontSize(14)
      doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
      doc.text('Inversión', 20, invY)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text('Total asignado:', 25, invY + 8)
      doc.text(`${informeData.inversionTotal.toLocaleString()} €`, 100, invY + 8)
      doc.text('Gastado:', 25, invY + 15)
      doc.text(`${informeData.inversionGastada.toLocaleString()} €`, 100, invY + 15)
      doc.text('Restante:', 25, invY + 22)
      doc.text(`${(informeData.inversionTotal - informeData.inversionGastada).toLocaleString()} €`, 100, invY + 22)

      const ordY = invY + 35
      doc.setFontSize(14)
      doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b)
      doc.text('Órdenes de Compra', 20, ordY)

      const totalImporte = informeData.ordenes.reduce((sum, o) => sum + o.importe, 0)
      const tableRows = [
        ...informeData.ordenes.map(o => [o.numero, o.fecha, o.descripcion, `${o.importe.toLocaleString()} €`]),
        ['', '', 'TOTAL', `${totalImporte.toLocaleString()} €`]
      ]

      autoTableRef.current(doc, {
        startY: ordY + 5,
        head: [['Nº Orden', 'Fecha', 'Descripción', 'Importe']],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b], textColor: [255, 255, 255] },
        margin: { top: 20 }
      })

      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' })
        doc.text('Centro San Valero - SIGED', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' })
      }

      doc.save(`Informe_${selectedDepartamento}_${mes}_${ano}.pdf`)
      addNotification("Informe descargado correctamente", "success")
    } catch (error) {
      console.error("Error generando PDF:", error)
      addNotification("Error al generar el PDF", "error")
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getBase64Image = (imgUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = imgUrl
    })
  }

  const selectClass = `w-full bg-white px-4 py-3 pr-10 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer appearance-none`
  const selectStyle = {
    backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M4 6l4 4 4-4'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "16px"
  }

  if (isDepartamentoLoading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6">
      {notificationComponents}

      {/* Encabezado */}
      <div className="mb-16">
        <h1 className="text-3xl font-bold">Informes</h1>
        <h2 className="text-xl text-gray-400">Departamento {selectedDepartamento}</h2>
      </div>

      <div className="flex items-center justify-center my-8">
        <div className="w-full max-w-md p-10 bg-gray-50 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="relative w-8 h-8">
              <Image src="/images/logo-sanvalero.png" alt="Logo San Valero" fill className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-600">Período Informe</h2>
          </div>

          <div className="space-y-6">
            {/* Selector departamento (admin/contable) */}
            {userRole !== "Jefe de Departamento" && (
              <div>
                <label className="block text-gray-700 mb-2">Departamento</label>
                <select value={selectedDepartamento} onChange={handleChangeDepartamento} className={selectClass} style={selectStyle}>
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map(dep => (
                    <option key={dep.id_Departamento} value={dep.Nombre}>{dep.Nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {!selectedDepartamento ? (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-700 font-semibold">Selecciona un departamento</p>
                <p className="text-sm text-yellow-600 mt-1">Selecciona un departamento para ver los informes disponibles.</p>
              </div>
            ) : isLoadingOrdenes ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500 text-sm">Cargando órdenes...</p>
              </div>
            ) : ordenesFiltradas.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-700 font-semibold">No hay órdenes de compra</p>
                <p className="text-sm text-yellow-600 mt-1">No se encontraron órdenes para el departamento seleccionado.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Año</label>
                  <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className={`${selectClass} ${!anosFiltrados.length ? 'opacity-50' : ''}`}
                    style={selectStyle}
                    disabled={!anosFiltrados.length}
                  >
                    <option value="">Selecciona un año</option>
                    {anosFiltrados.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Mes</label>
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className={`${selectClass} ${!ano || !mesesFiltrados.length ? 'opacity-50' : ''}`}
                    style={selectStyle}
                    disabled={!ano || !mesesFiltrados.length}
                  >
                    <option value="">Selecciona un mes</option>
                    {mesesFiltrados.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerarInforme}
                  disabled={generatingInforme || !mes || !ano}
                  className="w-full bg-gray-900 text-white py-3 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {generatingInforme ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando informe...
                    </div>
                  ) : "Generar informe"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal informe */}
      {showInformeModal && informeData && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src="/images/logo-sanvalero.png" alt="Logo San Valero" fill className="object-contain" />
                </div>
                <h2 className="text-xl font-bold">{informeData.titulo}</h2>
              </div>
              <button onClick={() => setShowInformeModal(false)} className="text-gray-500 hover:text-red-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="border-b border-gray-200 mb-4"></div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">Departamento: <span className="font-semibold">{informeData.departamento}</span></p>
                <p className="text-gray-600">Fecha generación: <span className="font-semibold">{informeData.fechaGeneracion}</span></p>
              </div>
              <button
                onClick={handleDescargarInforme}
                disabled={generatingPDF || !pdfLibsLoaded}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {generatingPDF || !pdfLibsLoaded ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {!pdfLibsLoaded ? "Cargando herramientas..." : "Generando..."}
                  </>
                ) : (
                  <><Download className="w-4 h-4" />Descargar PDF</>
                )}
              </button>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { titulo: "Presupuesto", total: informeData.presupuestoTotal, gastado: informeData.presupuestoGastado },
                { titulo: "Inversión", total: informeData.inversionTotal, gastado: informeData.inversionGastada }
              ].map(({ titulo, total, gastado }) => (
                <div key={titulo} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{titulo}</h3>
                  <div className="flex justify-between"><p className="text-gray-600">Total asignado:</p><p className="font-bold">{total.toLocaleString()} €</p></div>
                  <div className="flex justify-between"><p className="text-gray-600">Gastado:</p><p className="font-bold">{gastado.toLocaleString()} €</p></div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <p className="text-gray-600">Restante:</p>
                    <p className="font-bold text-green-600">{(total - gastado).toLocaleString()} €</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla órdenes */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Órdenes de Compra</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Nº Orden</th>
                      <th className="py-3 px-4 text-left font-medium">Fecha</th>
                      <th className="py-3 px-4 text-left font-medium">Descripción</th>
                      <th className="py-3 px-4 text-right font-medium">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informeData.ordenes.map(orden => (
                      <tr key={orden.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{orden.numero}</td>
                        <td className="py-3 px-4">{orden.fecha}</td>
                        <td className="py-3 px-4">{orden.descripcion}</td>
                        <td className="py-3 px-4 text-right">{orden.importe.toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t border-gray-200">
                      <td colSpan="3" className="py-3 px-4 text-right font-semibold">Total:</td>
                      <td className="py-3 px-4 text-right font-bold">
                        {informeData.ordenes.reduce((sum, o) => sum + o.importe, 0).toLocaleString()} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
