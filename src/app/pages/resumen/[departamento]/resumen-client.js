"use client"

import { useState, useMemo } from "react"
import { Calendar, Info, Plus, Pencil } from "lucide-react"
import Link from "next/link"
import useBolsasData from "@/app/hooks/useBolsasData"
import useNotifications from "@/app/hooks/useNotifications"
import useUserDepartamento from "@/app/hooks/useUserDepartamento"

export default function ResumenClient({
    departamento,
    departamentoId,
    resumenprep,
    resumeninv,
    resumenord
}) {
    const [error, setError] = useState('');
    const { userRole } = useUserDepartamento();

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const mesActual = meses[new Date().getMonth()];
    const añoActual = new Date().getFullYear();

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        cantidadPresupuesto: '',
        cantidadInversion: '',
        año: añoActual,
        departamentoId: '',
    });

    const [datosPresupuesto, setDatosPresupuesto] = useState(resumenprep);
    const [datosInversion, setDatosInversion] = useState(resumeninv);
    const [isLoading, setIsLoading] = useState(false);
    const [existingYears, setExistingYears] = useState([]);

    const { fetchBolsasData, getExistingYears } = useBolsasData();
    const { addNotification, notificationComponents } = useNotifications();

    const canAddBolsa = userRole && userRole !== "Contable";

    const presupuestoTotal = useMemo(() =>
        datosPresupuesto?.[0]?.total_presupuesto || 0,
        [datosPresupuesto]);

    const inversionTotal = useMemo(() =>
        datosInversion?.[0]?.total_inversion || 0,
        [datosInversion]);

    const gastoPresupuestoDelAñoActual = useMemo(() => {
        if (!resumenord || resumenord.length === 0) return 0;
        return resumenord
            .filter(orden => {
                if (orden.Num_inversion || !orden.Fecha) return false;
                return new Date(orden.Fecha).getFullYear() === añoActual;
            })
            .reduce((total, orden) => total + (parseFloat(orden.Importe) || 0), 0);
    }, [resumenord, añoActual]);

    const presupuestoActual = presupuestoTotal - gastoPresupuestoDelAñoActual;

    const gastoInversionDelAño = useMemo(() => {
        if (!resumenord || resumenord.length === 0) return 0;
        return resumenord
            .filter(orden => {
                if (!orden.Num_inversion || !orden.Fecha) return false;
                return new Date(orden.Fecha).getFullYear() === añoActual;
            })
            .reduce((total, orden) => total + (parseFloat(orden.Importe) || 0), 0);
    }, [resumenord, añoActual]);

    const inversionActual = inversionTotal - gastoInversionDelAño;

    const getIndicatorColor = (actual, total) => {
        if (!total) return "bg-gray-400";
        const porcentaje = (actual / total) * 100;
        if (porcentaje < 25) return "bg-red-500";
        if (porcentaje < 50) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getTextColorClass = (valor) => valor < 0 ? "text-red-600" : "";

    const filteredOrdenes = useMemo(() => {
        if (!resumenord || resumenord.length === 0) return [];
        return resumenord.filter(orden => {
            if (!orden.Fecha) return false;
            const date = new Date(orden.Fecha);
            return meses[date.getMonth()] === mesActual && date.getFullYear() === añoActual;
        });
    }, [resumenord, mesActual, añoActual, meses]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch {
            return "-";
        }
    };

    const refreshData = async () => {
        if (!departamentoId) return;
        try {
            const result = await fetchBolsasData(departamentoId, añoActual);
            if (result?.presupuesto) setDatosPresupuesto([result.presupuesto]);
            if (result?.inversion) setDatosInversion([result.inversion]);
        } catch (error) {
            console.error("Error al actualizar datos:", error);
        }
    };

    const handleOpenModal = async (e) => {
        e.preventDefault();
        if (!departamentoId) return;

        setShowModal(true);
        setFormData({
            cantidadPresupuesto: '',
            cantidadInversion: '',
            año: añoActual,
            departamentoId: departamentoId
        });

        try {
            const years = await getExistingYears(departamentoId);
            setExistingYears(Array.isArray(years) ? years : []);
        } catch {
            setExistingYears([]);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError('');
        setFormData({
            cantidadPresupuesto: '',
            cantidadInversion: '',
            año: añoActual,
            departamentoId: departamentoId
        });
    };

    const handleInputChange = async (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: Boolean(checked) }));
            return;
        }

        if (name === 'cantidadPresupuesto' || name === 'cantidadInversion') {
            if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return;
            if (parseFloat(value.replace(',', '.') || 0) > 200000) return;
        }

        if (name === 'año' && value) {
            const nuevoAño = parseInt(value);
            if (existingYears.includes(nuevoAño)) {
                try {
                    setIsLoading(true);
                    const response = await fetch(`/api/getBolsasByYear?departamentoId=${departamentoId}&year=${nuevoAño}`);
                    if (response.ok) {
                        const data = await response.json();
                        let nuevoCantidadPresupuesto = '';
                        let nuevoCantidadInversion = '';
                        data?.bolsas?.forEach(bolsa => {
                            if (bolsa.tipo === 'presupuesto') nuevoCantidadPresupuesto = bolsa.cantidad.toString();
                            else if (bolsa.tipo === 'inversion') nuevoCantidadInversion = bolsa.cantidad.toString();
                        });
                        setFormData(prev => ({
                            ...prev,
                            año: nuevoAño,
                            cantidadPresupuesto: nuevoCantidadPresupuesto,
                            cantidadInversion: nuevoCantidadInversion,
                        }));
                        return;
                    }
                } catch (error) {
                    console.error('Error al obtener cantidades existentes:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.departamentoId) return setError('Debe seleccionar un departamento');
        if (!formData.año) return setError('Debe ingresar un año');

        const isEditing = existingYears.includes(parseInt(formData.año));
        const cantidadPresupuesto = formData.cantidadPresupuesto ? parseFloat(formData.cantidadPresupuesto.replace(',', '.')) : 0;
        const cantidadInversion = formData.cantidadInversion ? parseFloat(formData.cantidadInversion.replace(',', '.')) : 0;

        if (cantidadPresupuesto === 0 && cantidadInversion === 0) {
            return setError("Debe ingresar una cantidad válida para presupuesto y/o inversión");
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/createBolsas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departamentoId: Number(formData.departamentoId),
                    año: Number(formData.año),
                    cantidadPresupuesto,
                    cantidadInversion,
                    esActualizacion: isEditing
                })
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 403 && result.tieneOrdenes) {
                    const total = result.totalOrdenes.presupuesto + result.totalOrdenes.inversion;
                    return setError(`No se pueden modificar bolsas que ya tienen ${total} orden(es) asociada(s).`);
                }
                throw new Error(result.error || 'Error al procesar las bolsas');
            }

            addNotification(isEditing ? 'Bolsas actualizadas correctamente' : 'Bolsas creadas correctamente', 'success');
            setShowModal(false);
            setFormData({ cantidadPresupuesto: '', cantidadInversion: '', año: añoActual, departamentoId });
            refreshData();

        } catch (error) {
            console.error('Error procesando bolsas:', error);
            setError(error.message || 'Ocurrió un error al procesar las bolsas');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            {notificationComponents}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Resumen</h1>
                    <h2 className="text-xl text-gray-400">Departamento {departamento}</h2>
                </div>
            </div>

            <div className="flex justify-end my-2 gap-6">
                {canAddBolsa && (
                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-900 opacity-80 flex items-center gap-2 text-white px-4 py-3 rounded-md hover:bg-blue-800 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" size={18} />
                        <span>Añadir bolsa</span>
                    </button>
                )}
                <div className="appearance-none bg-gray-100 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{`${mesActual} ${añoActual}`}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="col-span-1">
                    <div className="grid gap-5">
                        {/* Presupuesto */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="w-1/2 pr-4">
                                    <h3 className="text-gray-500 mb-2 text-xl">Presupuesto total anual</h3>
                                    <div className="text-4xl font-bold text-gray-400">
                                        {presupuestoTotal?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                                <div className="w-1/2 pl-4">
                                    <h3 className="text-gray-500 mb-2 text-xl">Presupuesto actual</h3>
                                    <div className={`text-4xl font-bold ${getTextColorClass(presupuestoActual)}`}>
                                        {presupuestoActual.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-5">
                                <div className="w-full">
                                    <h3 className="text-gray-500 text-mb">Gasto en presupuesto acumulado {añoActual}</h3>
                                    <div className={`text-2xl font-bold ${gastoPresupuestoDelAñoActual > 0 ? "text-red-600" : "text-gray-900"}`}>
                                        {gastoPresupuestoDelAñoActual?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full ${getIndicatorColor(presupuestoActual, presupuestoTotal)}`}></div>
                            </div>
                        </div>

                        {/* Inversión */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="w-1/2 pr-4">
                                    <h3 className="text-gray-500 mb-2 text-xl">Inversión total anual</h3>
                                    <div className="text-4xl font-bold text-gray-400">
                                        {inversionTotal?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                                <div className="w-1/2 pl-4">
                                    <h3 className="text-gray-500 mb-2 text-xl">Inversión actual</h3>
                                    <div className={`text-4xl font-bold ${getTextColorClass(inversionActual)}`}>
                                        {inversionActual.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-5">
                                <div className="w-full">
                                    <h3 className="text-gray-500 text-mb">Inversión acumulada {añoActual}</h3>
                                    <div className={`text-2xl font-bold ${gastoInversionDelAño > 0 ? "text-red-600" : "text-gray-900"}`}>
                                        {gastoInversionDelAño?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full ${getIndicatorColor(inversionActual, inversionTotal)}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Órdenes */}
                <div className="col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">ÓRDENES</h3>
                            <Link href="/pages/ordenes-compra/">
                                <button className="bg-black text-white text-sm px-3 py-1 rounded-md cursor-pointer">Ver detalles</button>
                            </Link>
                        </div>
                        <div className="overflow-hidden max-h-[470px] overflow-y-auto">
                            <table className="w-full table-fixed">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr>
                                        <th className="pb-2 font-normal text-gray-500 text-left w-1/4 px-3">Número</th>
                                        <th className="pb-2 font-normal text-gray-500 text-left w-2/5 px-3">Descripción</th>
                                        <th className="pb-2 font-normal text-gray-500 text-left w-1/4 px-3">Fecha</th>
                                        <th className="pb-2 font-normal text-gray-500 text-right w-1/5 px-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrdenes?.length > 0 ? (
                                        filteredOrdenes.map((item) => (
                                            <tr key={item.idOrden} className="border-t border-gray-200">
                                                <td className="py-3 px-3 text-left w-1/4">
                                                    <div className="flex items-center gap-2">
                                                        <span>{item.Num_orden}</span>
                                                        {item.Num_inversion && (
                                                            <div className="relative group">
                                                                <Info className="w-4 h-4 text-blue-500" />
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 rounded p-3 shadow-lg whitespace-nowrap z-50">
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
                                                <td className="py-3 px-3 text-left w-2/5">
                                                    <div className="truncate" title={item.Descripcion}>{item.Descripcion || "-"}</div>
                                                </td>
                                                <td className="py-3 px-3 text-left w-1/4">{formatDate(item.Fecha)}</td>
                                                <td className="py-3 px-3 text-right w-1/5">
                                                    {parseFloat(item.Importe).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 px-3 text-center text-gray-400">
                                                No hay órdenes para {mesActual} {añoActual}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(2px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Añadir Nueva Bolsa</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                <p className="font-medium">Error:</p>
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Año *</label>
                                    <div className="relative">
                                        <select
                                            name="año"
                                            value={formData.año}
                                            onChange={handleInputChange}
                                            className="appearance-none border border-gray-300 rounded px-3 py-2 w-full pr-8"
                                            required
                                        >
                                            {Array.from({ length: 6 }, (_, i) => añoActual + i).map(year => (
                                                <option key={year} value={year}>
                                                    {year} {existingYears.includes(year) ? "(tiene bolsas)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7l3 3 3-3" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {existingYears.includes(parseInt(formData.año))
                                            ? "Este año ya tiene bolsas. Al guardar, se actualizarán los valores existentes."
                                            : "Selecciona el año para la nueva bolsa."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Departamento</label>
                                    <input
                                        type="text"
                                        value={departamento}
                                        className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Cantidad Presupuesto (€) *</label>
                                    <input
                                        name="cantidadPresupuesto"
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.cantidadPresupuesto}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                        placeholder="0.00"
                                        maxLength={9}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Dejar en blanco si no se quiere crear bolsa de presupuesto</p>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Cantidad Inversión (€) *</label>
                                    <input
                                        name="cantidadInversion"
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.cantidadInversion}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                        placeholder="0.00"
                                        maxLength={9}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Dejar en blanco si no se quiere crear bolsa de inversión</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-900 opacity-80 flex items-center gap-2 text-white px-4 py-3 rounded-md hover:bg-blue-800 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {existingYears.includes(parseInt(formData.año)) ? 'Modificando...' : 'Guardando...'}
                                        </>
                                    ) : existingYears.includes(parseInt(formData.año)) ? (
                                        <><Pencil className="w-5 h-5" size={18} /><span>Modificar</span></>
                                    ) : (
                                        <><Plus className="w-5 h-5" size={18} /><span>Guardar</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
