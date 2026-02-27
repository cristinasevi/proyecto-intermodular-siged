"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, Calendar, Info } from "lucide-react"
import Link from "next/link"
import useUserDepartamento from "@/app/hooks/useUserDepartamento"
import useBolsasData from "@/app/hooks/useBolsasData"

export default function InversionClient({
  initialOrden = [],
  initialDepartamentos = [],
  inversionesPorDepartamento = {},
  mesActual = "",
}) {
  const { isLoading: isDepartamentoLoading } = useUserDepartamento()
  const { fetchBolsasData, getExistingYears } = useBolsasData()

  const [isComponentReady, setIsComponentReady] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [departamento, setDepartamento] = useState("")
  const [departamentoId, setDepartamentoId] = useState(null)
  const [inversionTotal, setInversionTotal] = useState(0)
  const [currentYearInversionTotal, setCurrentYearInversionTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [añosConBolsas, setAñosConBolsas] = useState([])

  const actualYear = new Date().getFullYear().toString()
  const [selectedMes, setSelectedMes] = useState(mesActual)
  const [selectedAño, setSelectedAño] = useState(actualYear)

  const mesesOrder = {
    "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6,
    "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
  }
  const mesesNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

  async function initializeComponent(departId) {
    if (!departId) return

    try {
      const years = await getExistingYears(departId)
      setAñosConBolsas(years || [])

      let yearToLoad = actualYear
      if (years && years.length > 0) {
        if (years.includes(parseInt(actualYear))) {
          yearToLoad = actualYear
        } else {
          const sortedYears = [...years].sort((a, b) => parseInt(b) - parseInt(a))
          yearToLoad = sortedYears[0].toString()
        }
      }

      setSelectedAño(yearToLoad)

      // Determinar mes a seleccionar
      const mesesDelAño = new Set()
      initialOrden.forEach(orden => {
        if (orden.Departamento === departamento && orden.Num_inversion) {
          const ordenDate = new Date(orden.Fecha)
          if (ordenDate.getFullYear().toString() === yearToLoad) {
            mesesDelAño.add(mesesNames[ordenDate.getMonth()])
          }
        }
      })

      let mesASeleccionar = mesActual
      if (yearToLoad !== actualYear) {
        if (mesesDelAño.size > 0) {
          if (!mesesDelAño.has(mesActual)) {
            const sortedMeses = Array.from(mesesDelAño).sort((a, b) => mesesOrder[a] - mesesOrder[b])
            mesASeleccionar = sortedMeses[sortedMeses.length - 1]
          }
        } else {
          mesASeleccionar = "Enero"
        }
      }
      setSelectedMes(mesASeleccionar)

      // Cargar datos de inversión
      const result = await fetchBolsasData(departId, parseInt(yearToLoad), 'inversion')
      if (result?.inversion) {
        setCurrentYearInversionTotal(result.inversion.total_inversion || 0)
        setInversionTotal(result.inversion.total_inversion || 0)
      } else {
        const inversionData = inversionesPorDepartamento[departId] || []
        if (inversionData.length > 0) {
          const mensual = inversionData[0]?.inversion_mensual || 0
          const total = inversionData[0]?.total_inversion || (mensual * 12)
          setInversionTotal(total)
          setCurrentYearInversionTotal(total)
        } else {
          setInversionTotal(0)
          setCurrentYearInversionTotal(0)
        }
      }

      setIsComponentReady(true)
    } catch (error) {
      console.error("Error durante la inicialización:", error)
      setIsComponentReady(true)
    }
  }

  // Inicialización al montar
  useEffect(() => {
    async function initialize() {
      try {
        const response = await fetch('/api/getSessionUser')
        if (!response.ok) { setIsComponentReady(true); return }

        const data = await response.json()
        const rol = data.usuario?.rol || ''
        const userDep = data.usuario?.departamento || ''
        setUserRole(rol)

        let selectedDep = ''
        if (rol === "Jefe de Departamento") {
          selectedDep = userDep
        } else {
          const informaticaDep = initialDepartamentos.find(dep => dep.Nombre === "Informática")
          selectedDep = informaticaDep?.Nombre || initialDepartamentos[0]?.Nombre || ''
        }

        setDepartamento(selectedDep)

        const depInfo = initialDepartamentos.find(dep => dep.Nombre === selectedDep)
        if (depInfo) {
          setDepartamentoId(depInfo.id_Departamento)
          await initializeComponent(depInfo.id_Departamento)
        } else {
          setIsComponentReady(true)
        }
      } catch (error) {
        console.error("Error en la inicialización:", error)
        setIsComponentReady(true)
      }
    }

    initialize()
  }, [])

  const handleChangeDepartamento = (newDepartamento) => {
    if (userRole === "Jefe de Departamento") return

    const depInfo = initialDepartamentos.find(dep => dep.Nombre === newDepartamento)
    if (!depInfo) return

    setDepartamento(newDepartamento)
    setDepartamentoId(depInfo.id_Departamento)
    initializeComponent(depInfo.id_Departamento)
  }

  // Cambio de año
  const handleAñoChange = async (e) => {
    const newYear = e.target.value
    setSelectedAño(newYear)

    if (!departamentoId) return
    setIsLoading(true)
    try {
      const result = await fetchBolsasData(departamentoId, parseInt(newYear), 'inversion')
      if (result?.inversion) {
        setInversionTotal(result.inversion.total_inversion || 0)
        setCurrentYearInversionTotal(result.inversion.total_inversion || 0)
      } else {
        setInversionTotal(0)
        setCurrentYearInversionTotal(0)
      }

      // Actualizar mes seleccionado para el nuevo año
      const mesesDelAño = new Set()
      initialOrden.forEach(orden => {
        if (orden.Departamento === departamento && orden.Num_inversion) {
          const ordenDate = new Date(orden.Fecha)
          if (ordenDate.getFullYear().toString() === newYear) {
            mesesDelAño.add(mesesNames[ordenDate.getMonth()])
          }
        }
      })

      if (newYear === actualYear) {
        setSelectedMes(mesActual)
      } else if (mesesDelAño.size > 0) {
        if (!mesesDelAño.has(selectedMes)) {
          const sortedMeses = Array.from(mesesDelAño).sort((a, b) => mesesOrder[a] - mesesOrder[b])
          setSelectedMes(sortedMeses[sortedMeses.length - 1])
        }
      } else {
        setSelectedMes("Enero")
      }
    } catch (error) {
      console.error(`Error cargando datos para el año ${newYear}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  // Meses y años disponibles
  const { availableMeses, availableAños } = useMemo(() => {
    const mesesSet = new Set()
    const añosSet = new Set()

    if (departamento && initialOrden.length) {
      initialOrden
        .filter(o => o.Departamento === departamento && o.Num_inversion)
        .forEach(orden => {
          const ordenDate = new Date(orden.Fecha)
          const ordenAño = ordenDate.getFullYear().toString()
          const ordenMes = mesesNames[ordenDate.getMonth()]
          if (!selectedAño || ordenAño === selectedAño) mesesSet.add(ordenMes)
          añosSet.add(ordenAño)
        })
    }

    añosConBolsas.forEach(year => añosSet.add(year.toString()))

    if (!selectedAño || selectedAño === actualYear) mesesSet.add(mesActual)
    if (mesesSet.size === 0) mesesSet.add(selectedAño === actualYear ? mesActual : "Enero")

    return {
      availableMeses: Array.from(mesesSet).sort((a, b) => mesesOrder[a] - mesesOrder[b]),
      availableAños: Array.from(añosSet).sort((a, b) => parseInt(a) - parseInt(b))
    }
  }, [departamento, initialOrden, mesActual, actualYear, añosConBolsas, selectedAño])

  // Órdenes filtradas (solo inversiones)
  const filteredOrdenes = useMemo(() => {
    if (!departamento || !initialOrden.length) return []
    return initialOrden.filter(o => {
      if (o.Departamento !== departamento || !o.Num_inversion) return false
      const ordenDate = new Date(o.Fecha)
      if (selectedAño && ordenDate.getFullYear().toString() !== selectedAño) return false
      if (selectedMes && mesesNames[ordenDate.getMonth()] !== selectedMes) return false
      return true
    })
  }, [departamento, initialOrden, selectedMes, selectedAño])

  // Gasto total del año seleccionado (inversiones)
  const gastoTotalDelAñoSeleccionado = useMemo(() => {
    if (!departamento || !initialOrden.length) return 0
    return initialOrden
      .filter(o => {
        if (o.Departamento !== departamento || !o.Num_inversion) return false
        return o.Fecha && new Date(o.Fecha).getFullYear() === parseInt(selectedAño)
      })
      .reduce((sum, o) => sum + (parseFloat(o.Importe) || 0), 0)
  }, [departamento, initialOrden, selectedAño])

  const gastoDelMes = useMemo(() =>
    filteredOrdenes.reduce((sum, o) => sum + (parseFloat(o.Importe) || 0), 0),
    [filteredOrdenes]
  )

  const inversionActual = useMemo(() =>
    inversionTotal - gastoTotalDelAñoSeleccionado,
    [inversionTotal, gastoTotalDelAñoSeleccionado]
  )

  const inversionMensualRecomendada = useMemo(() => {
    if (inversionActual <= 0) return 0
    const currentMonth = new Date().getMonth() + 1
    const selectedYearInt = parseInt(selectedAño)
    const currentYearInt = new Date().getFullYear()
    let mesesRestantes = 12
    if (selectedYearInt === currentYearInt) mesesRestantes = 12 - currentMonth + 1
    if (mesesRestantes <= 0) return 0
    return inversionActual / mesesRestantes
  }, [inversionActual, selectedAño])

  const inversionMensualDisponible = useMemo(() =>
    inversionMensualRecomendada - gastoDelMes,
    [inversionMensualRecomendada, gastoDelMes]
  )

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0,00 €"
    return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  }

  const getIndicatorColor = (actual, total) => {
    if (!total) return "bg-gray-400"
    const pct = (actual / total) * 100
    if (pct < 25) return "bg-red-500"
    if (pct < 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getTextColorClass = (valor) => valor < 0 ? "text-red-600" : ""

  if (!isComponentReady || isDepartamentoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inversión</h1>
          <h2 className="text-xl text-gray-400">Departamento {departamento}</h2>
        </div>
      </div>

      {/* Selector de fecha y botón de resumen */}
      <div className="flex justify-between mb-6 gap-4">
        <div className="flex gap-2">
          {/* Selector de departamento (solo para admin/contable) */}
          {userRole && userRole !== "Jefe de Departamento" && initialDepartamentos.length > 0 && (
            <div className="relative">
              <select
                value={departamento}
                onChange={(e) => handleChangeDepartamento(e.target.value)}
                className="appearance-none bg-gray-100 border border-gray-200 rounded-md px-4 py-2 pr-8 cursor-pointer"
              >
                {initialDepartamentos.map((dep) => (
                  <option key={dep.id_Departamento} value={dep.Nombre}>{dep.Nombre}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {/* Selector de mes */}
          <div className="relative">
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-200 rounded-md px-4 py-2 pr-8 cursor-pointer w-40"
            >
              {availableMeses.map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* Selector de año */}
          <div className="relative">
            <select
              value={selectedAño}
              onChange={handleAñoChange}
              className="appearance-none bg-gray-100 border border-gray-200 rounded-md px-4 py-2 pr-8 cursor-pointer"
            >
              {availableAños.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* Botón resumen */}
          {departamento && (
            <Link href={`/pages/resumen/${departamento}`} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
              Resumen
            </Link>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-400 animate-pulse">Actualizando datos...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="col-span-1">
          <div className="grid gap-6">
            {/* Inversión total anual */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-1/2 pr-4">
                  <h3 className="text-gray-500 mb-2 text-xl">Inversión total anual</h3>
                  <div className="text-4xl font-bold text-gray-400">{formatCurrency(inversionTotal)}</div>
                </div>
                <div className="w-1/2 pl-4">
                  <h3 className="text-gray-500 mb-2 text-xl">Inversión actual</h3>
                  <div className={`text-4xl font-bold ${getTextColorClass(inversionActual)}`}>
                    {formatCurrency(inversionActual)}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-5">
                <div className="w-full">
                  <h3 className="text-gray-500 text-mb">Gasto acumulado {selectedAño}</h3>
                  <div className={`text-2xl font-bold ${gastoTotalDelAñoSeleccionado > 0 ? "text-red-600" : "text-gray-900"}`}>
                    {formatCurrency(gastoTotalDelAñoSeleccionado)}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${getIndicatorColor(inversionActual, inversionTotal)}`}></div>
              </div>
            </div>

            {/* Inversión mensual recomendada del mes seleccionado */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-500 text-xl">Inversión mensual recomendada</h3>
                <div className="relative group">
                  <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 rounded p-3 shadow-lg z-50 w-80">
                    <div className="text-xs">
                      <p className="font-semibold mb-1">Cálculo dinámico:</p>
                      <p className="mb-2">Se divide la inversión restante entre los meses que quedan del año actual.</p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="font-mono">
                          {formatCurrency(inversionActual)} ÷ {
                            parseInt(selectedAño) === new Date().getFullYear()
                              ? `${12 - new Date().getMonth()} meses restantes`
                              : parseInt(selectedAño) > new Date().getFullYear()
                                ? "12 meses (año futuro)"
                                : "12 meses (promedio anual)"
                          } = {formatCurrency(inversionMensualRecomendada)}
                        </p>
                      </div>
                      <p className="mt-2 text-gray-600 text-xs">Esto te ayuda a planificar el gasto mensual restante.</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getTextColorClass(inversionMensualDisponible)}`}>
                  {formatCurrency(inversionMensualDisponible)}
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-2">{selectedMes} {selectedAño}</div>
              <div className="text-xs text-gray-500 mt-1">Recomendación: {formatCurrency(inversionMensualRecomendada)}/mes</div>
            </div>

            {/* Gasto del mes seleccionado */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-gray-500 mb-2 text-xl">Gasto en {selectedMes} {selectedAño}</h3>
              <div className="text-right">
                <div className={`text-5xl font-bold ${gastoDelMes > 0 ? "text-red-500" : "text-gray-900"}`}>
                  {formatCurrency(gastoDelMes)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">ÓRDENES DE COMPRA</h3>
              <Link href="/pages/ordenes-compra" className="bg-black text-white text-sm px-3 py-1 rounded">
                Ver detalles
              </Link>
            </div>
            <div className="overflow-hidden max-h-[480px] overflow-y-auto">
              <table className="w-full table-fixed">
                <thead className="bg-white sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 font-normal text-gray-500 text-left w-1/3">Número</th>
                    <th className="pb-2 font-normal text-gray-500 text-left w-1/2">Descripción</th>
                    <th className="pb-2 font-normal text-gray-500 text-right w-1/6">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrdenes.length > 0 ? (
                    filteredOrdenes.map((item, index) => (
                      <tr key={`${item.idOrden}-${index}`} className="border-t border-gray-200">
                        <td className="py-3 w-1/3">
                          <div className="flex items-center">
                            <span className="truncate max-w-[120px]" title={item.Num_orden}>{item.Num_orden}</span>
                            {item.Num_inversion && (
                              <div className="ml-2 relative group">
                                <Info className="h-4 w-4 text-blue-500" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white border border-gray-200 rounded p-3 shadow-lg whitespace-nowrap z-50">
                                  <div className="text-xs">
                                    <p className="font-semibold">Núm. Inversión:</p>
                                    <p>{item.Num_inversion}</p>
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 w-1/2">
                          <div className="truncate pr-2" title={item.Descripcion}>{item.Descripcion || "-"}</div>
                        </td>
                        <td className="py-3 text-right w-1/6">{formatCurrency(parseFloat(item.Importe || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-400">
                        {gastoTotalDelAñoSeleccionado > 0
                          ? `No hay órdenes de inversión para ${selectedMes} ${selectedAño}`
                          : inversionTotal > 0
                            ? `No hay órdenes de inversión registradas para ${selectedAño}`
                            : "No hay órdenes ni inversiones para este período"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
