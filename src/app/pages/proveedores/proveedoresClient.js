"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Pencil, X, Search, Filter, Plus, AlertCircle } from "lucide-react";
import Button, { ButtonDelete } from "@/app/components/ui/button";
import useNotifications from "@/app/hooks/useNotifications";
import ConfirmationDialog from "@/app/components/ui/confirmation-dialog";
import useUserDepartamento from "@/app/hooks/useUserDepartamento";
import { validateNIF, validateEmail, validateProveedorForm } from "@/app/utils/validations";

// Función reutilizable para procesar y agrupar proveedores por ID
const procesarProveedores = (lista) => {
  const map = new Map();
  lista.forEach(p => {
    if (!map.has(p.idProveedor)) {
      map.set(p.idProveedor, { ...p, Departamentos: p.Departamento ? [p.Departamento] : [] });
    } else if (p.Departamento && !map.get(p.idProveedor).Departamentos.includes(p.Departamento)) {
      map.get(p.idProveedor).Departamentos.push(p.Departamento);
    }
  });
  return Array.from(map.values());
};

export default function ProveedoresClient({
  initialProveedores,
  initialDepartamentos,
}) {
  const { departamento, userRole, isLoading: isDepartamentoLoading } = useUserDepartamento();
  const canEdit = userRole !== "Contable";

  const [proveedores, setProveedores] = useState([]);
  const [departamentos] = useState(initialDepartamentos);
  const [selectedProveedores, setSelectedProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formErrors, setFormErrors] = useState({});
  const [showDepartamentosSelector, setShowDepartamentosSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("");

  const { addNotification, notificationComponents } = useNotifications();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [formularioProveedor, setFormularioProveedor] = useState({
    idProveedor: null,
    nombre: "",
    nif: "",
    direccion: "",
    telefono: "",
    email: "",
    departamento: "",
    departamentos: []
  });

  useEffect(() => {
    if (userRole === "Jefe de Departamento" && departamento) {
      setFilterDepartamento(departamento);
    }
  }, [userRole, departamento]);

  useEffect(() => {
    setProveedores(initialProveedores?.length > 0 ? procesarProveedores(initialProveedores) : []);
  }, [initialProveedores]);

  const filteredProveedores = useMemo(() => {
    return proveedores.filter((proveedor) => {
      const matchesSearch =
        searchTerm === "" ||
        (proveedor.Nombre && proveedor.Nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (proveedor.NIF && proveedor.NIF.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (proveedor.Email && proveedor.Email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartamento =
        filterDepartamento === "" ||
        (proveedor.Departamentos && proveedor.Departamentos.includes(filterDepartamento));

      return matchesSearch && matchesDepartamento;
    });
  }, [proveedores, searchTerm, filterDepartamento]);

  const toggleSelectProveedor = (proveedorId) => {
    if (selectedProveedores.includes(proveedorId)) {
      setSelectedProveedores(selectedProveedores.filter((id) => id !== proveedorId));
    } else {
      setSelectedProveedores([...selectedProveedores, proveedorId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProveedores.length === filteredProveedores.length) {
      setSelectedProveedores([]);
    } else {
      setSelectedProveedores(filteredProveedores.map((p) => p.idProveedor));
    }
  };

  const limpiarFormulario = () => {
    setFormularioProveedor({
      idProveedor: null,
      nombre: "",
      nif: "",
      direccion: "",
      telefono: "",
      email: "",
      departamento: "",
      departamentos: []
    });
    setFormErrors({});
  };

  const handleOpenAddModal = () => {
    limpiarFormulario();
    if (userRole === "Jefe de Departamento" && departamento) {
      setFormularioProveedor(prev => ({ ...prev, departamento, departamentos: [departamento] }));
    }
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEditModal = (proveedor) => {
    const departamentoPrincipal = proveedor.Departamentos?.[0] || "";
    setFormularioProveedor({
      idProveedor: proveedor.idProveedor,
      nombre: String(proveedor.Nombre || ""),
      nif: String(proveedor.NIF || ""),
      direccion: String(proveedor.Direccion || ""),
      telefono: String(proveedor.Telefono || ""),
      email: String(proveedor.Email || ""),
      departamento: departamentoPrincipal,
      departamentos: proveedor.Departamentos || []
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
    setShowDepartamentosSelector(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedForm;
    if (name === "departamento") {
      updatedForm = {
        ...formularioProveedor,
        [name]: value,
        departamentos: modalMode === "add" ? [value] :
          formularioProveedor.departamentos.includes(value)
            ? formularioProveedor.departamentos
            : [value, ...formularioProveedor.departamentos.filter(dep => dep !== value)]
      };
    } else {
      updatedForm = { ...formularioProveedor, [name]: value };
    }

    setFormularioProveedor(updatedForm);

    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }

    if (name === "nif" && value.trim().length > 0) {
      const nifValidation = validateNIF(value);
      if (!nifValidation.valid) {
        setFormErrors(prev => ({ ...prev, nif: nifValidation.error }));
      } else {
        const nifExists = proveedores.some(p =>
          p.NIF && p.NIF.toUpperCase() === nifValidation.formatted &&
          p.idProveedor !== formularioProveedor.idProveedor
        );
        if (nifExists) setFormErrors(prev => ({ ...prev, nif: "Ya existe un proveedor con este NIF/CIF" }));
      }
    }

    if (name === "email" && value.trim().length > 0) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.valid) {
        setFormErrors(prev => ({ ...prev, email: emailValidation.error }));
      } else {
        const emailExists = proveedores.some(p =>
          p.Email && p.Email.toLowerCase() === emailValidation.formatted &&
          p.idProveedor !== formularioProveedor.idProveedor
        );
        if (emailExists) setFormErrors(prev => ({ ...prev, email: "Ya existe un proveedor con este email" }));
      }
    }
  };

  const validarFormulario = () => {
    const validation = validateProveedorForm(
      formularioProveedor,
      proveedores,
      modalMode === "edit" ? formularioProveedor.idProveedor : null
    );
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      addNotification("Por favor, corrige los errores en el formulario", "error");
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleAddDepartamento = (depNombre) => {
    if (formularioProveedor.departamentos.includes(depNombre)) return;
    setFormularioProveedor(prev => ({ ...prev, departamentos: [...prev.departamentos, depNombre] }));
    setShowDepartamentosSelector(false);
  };

  const handleRemoveDepartamento = (depNombre) => {
    if (depNombre === formularioProveedor.departamento) {
      addNotification("No puedes eliminar el departamento principal. Selecciona otro primero.", "warning");
      return;
    }
    setFormularioProveedor(prev => ({
      ...prev,
      departamentos: prev.departamentos.filter(dep => dep !== depNombre)
    }));
  };

  const handleGuardarProveedor = async () => {
    if (!validarFormulario()) return;
    setIsLoading(true);

    try {
      setFormErrors({});

      const nifFormateado = validateNIF(formularioProveedor.nif).formatted;
      let emailFormateado = '';
      if (formularioProveedor.email?.trim().length > 0) {
        emailFormateado = validateEmail(formularioProveedor.email).formatted || '';
      }

      const proveedorData = {
        nombre: formularioProveedor.nombre.trim(),
        nif: nifFormateado,
        direccion: formularioProveedor.direccion.trim(),
        telefono: formularioProveedor.telefono.trim(),
        email: emailFormateado,
        departamento: formularioProveedor.departamento,
      };

      let proveedorId;

      if (modalMode === "add") {
        const response = await fetch("/api/getProveedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proveedorData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.toLowerCase().includes("ya existe")) {
            setFormErrors({ nif: errorData.error });
            addNotification(errorData.error, "error");
            return;
          }
          throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        proveedorId = data.id;
        if (!proveedorId) throw new Error("No se recibió el ID del proveedor creado");

      } else {
        proveedorId = formularioProveedor.idProveedor;

        const response = await fetch(`/api/getProveedores/${proveedorId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proveedorData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.toLowerCase().includes("ya existe")) {
            setFormErrors({ nif: errorData.error });
            addNotification(errorData.error, "error");
            return;
          }
          throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
      }

      // Añadir departamentos adicionales
      const departamentosAdicionales = formularioProveedor.departamentos.filter(
        dep => dep !== formularioProveedor.departamento
      );

      for (const depNombre of departamentosAdicionales) {
        const depInfo = departamentos.find(d => d.Nombre === depNombre);
        if (!depInfo) continue;
        await fetch("/api/proveedorDepartamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proveedorId, departamentoId: depInfo.id_Departamento, propio: 1 }),
        }).catch(() => {});
      }

      // Refrescar lista
      const updatedResponse = await fetch("/api/getProveedores/list");
      if (updatedResponse.ok) {
        const updatedProveedores = await updatedResponse.json();
        setProveedores(procesarProveedores(updatedProveedores));
      } else if (modalMode === "edit") {
        setProveedores(proveedores.map(p =>
          p.idProveedor === formularioProveedor.idProveedor
            ? { ...p, Nombre: formularioProveedor.nombre, NIF: formularioProveedor.nif, Direccion: formularioProveedor.direccion, Telefono: formularioProveedor.telefono, Email: formularioProveedor.email, Departamentos: formularioProveedor.departamentos }
            : p
        ));
      }

      addNotification(modalMode === "add" ? "Proveedor creado correctamente" : "Proveedor actualizado correctamente", "success");
      handleCloseModal();

    } catch (error) {
      console.error("Error al guardar el proveedor:", error);
      addNotification(`Error al guardar el proveedor: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarProveedores = () => {
    if (selectedProveedores.length === 0) {
      addNotification("Por favor, selecciona al menos un proveedor para eliminar", "warning");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar ${selectedProveedores.length} proveedor(es)? Esta acción no se puede deshacer.`,
      onConfirm: confirmDeleteProveedores,
    });
  };

  const confirmDeleteProveedores = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getProveedores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProveedores }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      setProveedores(proveedores.filter(p => !selectedProveedores.includes(p.idProveedor)));
      setSelectedProveedores([]);
      addNotification(`${selectedProveedores.length} proveedor(es) eliminados correctamente`, "success");
    } catch (error) {
      console.error("Error al eliminar proveedores:", error);
      addNotification(`Error al eliminar proveedores: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDepartamentoLoading) return <div className="p-6">Cargando...</div>;

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
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <h2 className="text-xl text-gray-400">Departamento {departamento}</h2>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, NIF, email..."
            value={searchTerm}
            maxLength={150}
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
            className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-10 cursor-pointer"
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
      </div>

      <div className="mb-2 text-sm text-gray-500">
        Mostrando {filteredProveedores.length} de {proveedores.length} proveedores
      </div>

      {/* Tabla de proveedores */}
      <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-10">
                  {filteredProveedores.length > 0 && canEdit && (
                    <input
                      type="checkbox"
                      checked={selectedProveedores.length === filteredProveedores.length && filteredProveedores.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
                    />
                  )}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">NIF</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Dirección</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Departamentos</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.length > 0 ? (
                filteredProveedores.map((proveedor, index) => (
                  <tr
                    key={`${proveedor.idProveedor}-${index}`}
                    className={`border-t border-gray-200 cursor-pointer ${selectedProveedores.includes(proveedor.idProveedor) ? "bg-blue-50 hover:bg-blue-100" : ""}`}
                    onClick={() => toggleSelectProveedor(proveedor.idProveedor)}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {canEdit && (
                        <input
                          type="checkbox"
                          checked={selectedProveedores.includes(proveedor.idProveedor)}
                          onChange={() => toggleSelectProveedor(proveedor.idProveedor)}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">{proveedor.Nombre}</td>
                    <td className="py-3 px-4">{proveedor.NIF}</td>
                    <td className="py-3 px-4">{proveedor.Direccion}</td>
                    <td className="py-3 px-4">{proveedor.Telefono}</td>
                    <td className="py-3 px-4">{proveedor.Email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {proveedor.Departamentos?.map((dep, i) => (
                          <span key={`${proveedor.idProveedor}-${dep}-${i}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(proveedor); }}
                          className="text-gray-500 hover:text-blue-600 cursor-pointer"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-gray-500">
                    No se encontraron proveedores{searchTerm || filterDepartamento ? " con los criterios de búsqueda actuales" : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between mt-4">
        {canEdit && <Button onClick={handleOpenAddModal}>Nuevo Proveedor</Button>}
        {canEdit && (
          <ButtonDelete
            onClick={handleEliminarProveedores}
            disabled={selectedProveedores.length === 0 || isLoading}
          >
            {isLoading ? "Procesando..." : `Eliminar ${selectedProveedores.length > 0 ? `(${selectedProveedores.length})` : ""}`}
          </ButtonDelete>
        )}
      </div>

      {/* Modal para añadir/editar proveedor */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? "Añadir Nuevo Proveedor" : "Editar Proveedor"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-red-600">
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            {Object.keys(formErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>Por favor, corrige los errores marcados en rojo</span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  maxLength={100}
                  value={formularioProveedor.nombre}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">NIF</label>
                <input
                  type="text"
                  name="nif"
                  value={formularioProveedor.nif}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 w-full uppercase ${formErrors.nif ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={20}
                />
                {formErrors.nif && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />{formErrors.nif}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  maxLength={150}
                  value={formularioProveedor.direccion}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Dirección"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formularioProveedor.telefono}
                  onChange={handleInputChange}
                  onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                  className={`border rounded px-3 py-2 w-full ${formErrors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Teléfono"
                  inputMode="numeric"
                  maxLength={9}
                />
                {formErrors.telefono && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />{formErrors.telefono}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formularioProveedor.email}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 w-full ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="usuario@dominio.com"
                  autoComplete="email"
                />
                {formErrors.email && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />{formErrors.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Departamento Principal</label>
                <div className="relative">
                  <select
                    name="departamento"
                    value={formularioProveedor.departamento}
                    onChange={handleInputChange}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 w-full pr-8 text-gray-500"
                    disabled={userRole === "Jefe de Departamento"}
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map((dep) => (
                      <option key={dep.id_Departamento} value={dep.Nombre}>{dep.Nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Sección de departamentos adicionales */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700">Departamentos Asociados</label>
                  <button
                    type="button"
                    onClick={() => setShowDepartamentosSelector(!showDepartamentosSelector)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                    disabled={userRole === "Jefe de Departamento"}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir departamento
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[80px]">
                  {formularioProveedor.departamentos?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formularioProveedor.departamentos.map((dep, i) => (
                        <div key={`dep-${i}`} className="flex items-center bg-white border border-gray-200 px-2 py-1 rounded-md">
                          <span className="text-sm mr-2">{dep}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDepartamento(dep)}
                            className="text-gray-500 hover:text-red-600"
                            disabled={userRole === "Jefe de Departamento" || dep === formularioProveedor.departamento}
                          >
                            <X className="w-4 h-4 cursor-pointer" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay departamentos asociados</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {userRole === "Jefe de Departamento"
                      ? "Como Jefe de Departamento, solo puedes asignar tu propio departamento."
                      : "El primer departamento será el principal. Puedes añadir departamentos adicionales."}
                  </p>
                </div>

                {showDepartamentosSelector && (
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="text-sm font-medium mb-2">Selecciona departamentos adicionales:</div>
                    <div className="max-h-[150px] overflow-y-auto">
                      <ul className="space-y-1">
                        {departamentos
                          .filter(dep => !formularioProveedor.departamentos.includes(dep.Nombre))
                          .map(dep => (
                            <li key={`select-${dep.id_Departamento}`}>
                              <button
                                type="button"
                                onClick={() => handleAddDepartamento(dep.Nombre)}
                                className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm flex items-center"
                              >
                                <Plus className="w-4 h-4 mr-2 text-green-600" />
                                {dep.Nombre}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {departamentos.filter(dep => !formularioProveedor.departamentos.includes(dep.Nombre)).length === 0 && (
                      <p className="text-center text-gray-500 text-sm py-2">Todos los departamentos ya están asociados</p>
                    )}
                  </div>
                )}
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
              <Button onClick={handleGuardarProveedor} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
