"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ChevronDown, X, Search, Filter, Download, FileText } from "lucide-react"
import Button from "@/app/components/ui/button"
import useNotifications from "@/app/hooks/useNotifications"
import ConfirmationDialog from "@/app/components/ui/confirmation-dialog"
import useUserDepartamento from "@/app/hooks/useUserDepartamento"

export default function InventarioClient({
  initialInventarios,
  initialDepartamentos,
  initialProveedores,
}) {
  const { departamento, isLoading: isDepartamentoLoading } = useUserDepartamento()
  const [userRole, setUserRole] = useState(null)

  const [inventarios] = useState(() =>
    initialInventarios.map((item, index) => ({
      ...item,
      _reactKey: `item-${item.idOrden}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
  );

  const [departamentos] = useState(initialDepartamentos);
  const [proveedores] = useState(initialProveedores);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("");
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterInventariable, setFilterInventariable] = useState("");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);
  const sheetJSRef = useRef(null);
  const [excelFileName, setExcelFileName] = useState("inventario");
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { addNotification, notificationComponents } = useNotifications();

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const response = await fetch('/api/getSessionUser')
        if (response.ok) {
          const data = await response.json()
          const role = data.usuario?.rol || ''
          setUserRole(role)
          if (role === "Jefe de Departamento" && departamento) {
            setFilterDepartamento(departamento)
          }
        }
      } catch (error) {
        console.error("Error obteniendo rol del usuario:", error)
      }
    }
    fetchUserRole()
  }, [departamento])

  useEffect(() => {
    setFilterProveedor("");
  }, [filterDepartamento]);

  const uniqueInventarios = useMemo(() => {
    const seen = new Map();
    return inventarios.filter(item => {
      if (seen.has(item.idOrden)) return false;
      seen.set(item.idOrden, true);
      return true;
    });
  }, [inventarios]);

  const filteredInventarios = useMemo(() => {
    return uniqueInventarios.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        (item.Descripcion && item.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDepartamento = filterDepartamento === "" || item.Departamento === filterDepartamento;
      const matchesProveedor = filterProveedor === "" || item.Proveedor === filterProveedor;
      const matchesInventariable =
        filterInventariable === "" ||
        (filterInventariable === "inventariable" && item.Inventariable === 1) ||
        (filterInventariable === "no-inventariable" && item.Inventariable === 0);
      return matchesSearch && matchesDepartamento && matchesProveedor && matchesInventariable;
    });
  }, [uniqueInventarios, searchTerm, filterDepartamento, filterProveedor, filterInventariable]);

  const proveedoresFiltrados = useMemo(() => {
    if (!filterDepartamento) return proveedores;
    return proveedores.filter(proveedor =>
      uniqueInventarios.some(item => item.Proveedor === proveedor.Nombre && item.Departamento === filterDepartamento)
    );
  }, [filterDepartamento, proveedores, uniqueInventarios]);

  const prepareExportData = () => {
    const itemsToExport = selectedItems.length > 0
      ? uniqueInventarios.filter(item => selectedItems.includes(item.idOrden))
      : filteredInventarios;

    return itemsToExport.map(item => ({
      'ID Orden': item.idOrden || '',
      'Descripción': item.Descripcion || '',
      'Proveedor': item.Proveedor || '',
      'Departamento': item.Departamento || '',
      'Cantidad': item.Cantidad || 0,
      'Inventariable': formatInventariable(item.Inventariable),
      'Fecha': formatDate(item.Fecha) || '',
      'Importe': item.Importe || 0
    }));
  };

  useEffect(() => {
    if (showExportModal && !sheetJSRef.current) {
      const loadSheetJS = async () => {
        try {
          const XLSX = await import('xlsx');
          sheetJSRef.current = XLSX;
        } catch (error) {
          console.error("Error al cargar SheetJS:", error);
          addNotification("Error al cargar las herramientas de exportación", "error");
        }
      };
      loadSheetJS();
    }
  }, [showExportModal, addNotification]);

  const generateExcel = async () => {
    try {
      setIsGeneratingExcel(true);
      if (!sheetJSRef.current) throw new Error("SheetJS no está cargado");

      const XLSX = sheetJSRef.current;
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
      worksheet['!cols'] = colWidths;

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);

      return { url, blob, filename: `${excelFileName}.xlsx` };
    } catch (error) {
      console.error("Error generando archivo Excel:", error);
      addNotification("Error al generar el archivo Excel", "error");
      return null;
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const downloadExcel = async () => {
    const excelData = await generateExcel();
    if (!excelData) return;

    const downloadLink = document.createElement('a');
    downloadLink.href = excelData.url;
    downloadLink.download = excelData.filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(excelData.url);

    setShowExportModal(false);
    addNotification("Archivo Excel descargado correctamente", "success");
  };

  const handleExportClick = () => {
    const data = prepareExportData();
    if (data.length === 0) {
      addNotification("No hay datos para exportar", "warning");
      return;
    }
    setExportData(data);

    const today = new Date();
    const formattedDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const depName = filterDepartamento ? `_${filterDepartamento}` : '';
    setExcelFileName(`inventario${depName}_${formattedDate}`);
    setShowExportModal(true);
  };

  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredInventarios.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventarios.map((i) => i.idOrden));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterProveedor("");
    setFilterInventariable("");
    if (userRole !== "Jefe de Departamento") {
      setFilterDepartamento("");
    }
    addNotification("Filtros eliminados", "info");
  };

  function formatInventariable(value) {
    if (value === 1 || value === "1" || value === true) return "Sí";
    if (value === 0 || value === "0" || value === false) return "No";
    return value || "-";
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "-";
    }
  }

  if (isDepartamentoLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 h-[calc(100vh-8rem)] flex flex-col">
      {notificationComponents}

      {/* Diálogo de confirmación */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <h2 className="text-xl text-gray-400">Departamento {departamento}</h2>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            maxLength={100}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            value={filterDepartamento}
            onChange={(e) => setFilterDepartamento(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10"
            disabled={userRole === "Jefe de Departamento"}
          >
            <option value="">Todos los departamentos</option>
            {departamentos.map((dep) => (
              <option key={dep.id_Departamento} value={dep.Nombre}>{dep.Nombre}</option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="relative">
          <select
            value={filterProveedor}
            onChange={(e) => setFilterProveedor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10"
          >
            <option value="">Selecciona Proveedor</option>
            {proveedoresFiltrados.map((proveedor, index) => (
              <option key={`${proveedor.idProveedor}-${index}`} value={proveedor.Nombre}>
                {proveedor.Nombre}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="relative">
          <select
            value={filterInventariable}
            onChange={(e) => setFilterInventariable(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10 pr-10"
          >
            <option value="">Todos (Inventariable / No Inventariable)</option>
            <option value="inventariable">Inventariable</option>
            <option value="no-inventariable">No Inventariable</option>
          </select>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-500">
        Mostrando {filteredInventarios.length} de {uniqueInventarios.length} items únicos
      </div>

      {/* Tabla de inventario */}
      <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-10">
                  {filteredInventarios.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredInventarios.length && filteredInventarios.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
                    />
                  )}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Proveedor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Departamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Cantidad</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Inventariable</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventarios.length > 0 ? (
                filteredInventarios.map((item) => (
                  <tr
                    key={item._reactKey}
                    className={`border-t border-gray-200 cursor-pointer ${selectedItems.includes(item.idOrden) ? "bg-blue-50 hover:bg-blue-100" : ""}`}
                    onClick={() => toggleSelectItem(item.idOrden)}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.idOrden)}
                        onChange={() => toggleSelectItem(item.idOrden)}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">{item.Descripcion}</td>
                    <td className="py-3 px-4">{item.Proveedor}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{item.Departamento}</span>
                    </td>
                    <td className="py-3 px-4">{item.Cantidad}</td>
                    <td className="py-3 px-4">{formatInventariable(item.Inventariable)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No se encontraron items{searchTerm || filterDepartamento || filterProveedor || filterInventariable ? " con los criterios de búsqueda actuales" : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between mt-4">
        <Button onClick={handleExportClick} disabled={isLoading || filteredInventarios.length === 0}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Exportar</span>
          </div>
        </Button>
      </div>

      {/* Modal exportar Excel */}
      {showExportModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Exportar</h2>
              <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-red-600" disabled={isGeneratingExcel}>
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-1">Nombre del archivo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={excelFileName}
                  onChange={(e) => setExcelFileName(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 flex-grow"
                  disabled={isGeneratingExcel}
                />
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
                    {exportData.length > 0 ? (
                      exportData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-200">
                          {Object.values(row).map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-4">{cell}</td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-4 text-center text-gray-500">No hay datos para exportar</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se exportarán {exportData.length} items {selectedItems.length > 0 ? 'seleccionados' : 'filtrados'}.
              </p>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
              <p className="font-medium mb-1">Información sobre la exportación:</p>
              <ul className="list-disc list-inside">
                <li>Se exportarán {exportData.length} items en formato XLSX (Excel)</li>
                <li>Las columnas se ajustarán automáticamente para mejor visualización</li>
                <li>{selectedItems.length > 0 ? `Has seleccionado ${selectedItems.length} items para exportar` : 'Se exportarán todos los items visibles según los filtros aplicados'}</li>
                <li>El archivo incluirá todos los campos mostrados en la vista previa</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                disabled={isGeneratingExcel}
              >
                Cancelar
              </button>
              <button
                onClick={downloadExcel}
                disabled={isGeneratingExcel || exportData.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isGeneratingExcel ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
