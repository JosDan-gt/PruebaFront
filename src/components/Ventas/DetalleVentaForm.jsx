import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { useError } from '../Error/ErrorContext'; // Importar el contexto de error
import { FaTrashAlt, FaPlus, FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Íconos de FontAwesome

const DetalleVentaForm = ({ venta, isEditing, onCancel, onSubmit }) => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [direccionCliente, setDireccionCliente] = useState('');
  const [stockHuevos, setStockHuevos] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: '',
    fechaVenta: '',
    detallesVenta: [{ productoId: '', tipoEmpaque: '', tamanoHuevo: '', cantidadVendida: 0, precioUnitario: 0 }],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const { handleError, clearError } = useError();

  useEffect(() => {
    const fetchClientesYProductosYStock = async () => {
      try {
        const clientesResponse = await axiosInstance.get('/api/Ventas/ClientesActivos');
        const productosResponse = await axiosInstance.get('/api/Ventas/ProductosActivos');
        const stockResponse = await axiosInstance.get('/api/Ventas/stockhuevos');
        setClientes(clientesResponse.data);
        setProductos(productosResponse.data);
        setStockHuevos(stockResponse.data);
      } catch (error) {
        handleError('Error al obtener los datos de clientes, productos o stock.');
      }
    };

    fetchClientesYProductosYStock();
  }, [handleError]);

  useEffect(() => {
    if (isEditing && venta) {
      setFormData({
        clienteId: venta.clienteId,
        fechaVenta: venta.fechaVenta,
        detallesVenta: venta.detallesVenta || [{ productoId: '', tipoEmpaque: '', tamanoHuevo: '', cantidadVendida: 0, precioUnitario: 0 }],
      });
      const clienteSeleccionado = clientes.find(cliente => cliente.clienteId === venta.clienteId);
      if (clienteSeleccionado) {
        setDireccionCliente(clienteSeleccionado.direccion);
      }
    }
  }, [venta, isEditing, clientes]);

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setFormData({ ...formData, clienteId });
    setFieldErrors({ ...fieldErrors, clienteId: '' });

    const clienteSeleccionado = clientes.find(cliente => cliente.clienteId === parseInt(clienteId));
    if (clienteSeleccionado) {
      setDireccionCliente(clienteSeleccionado.direccion);
    } else {
      setDireccionCliente('');
    }
  };

  const handleDetailChange = (index, field, value) => {
    const newDetallesVenta = [...formData.detallesVenta];
    newDetallesVenta[index][field] = field === 'cantidadVendida' || field === 'precioUnitario' ? parseFloat(value) : value;
    setFormData({ ...formData, detallesVenta: newDetallesVenta });
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      detallesVenta: [...formData.detallesVenta, { productoId: '', tipoEmpaque: '', tamanoHuevo: '', cantidadVendida: 0, precioUnitario: 0 }],
    });
  };

  const handleRemoveDetail = (index) => {
    // Validar que no se elimine el último detalle
    if (formData.detallesVenta.length <= 1) {
      handleError('No se puede eliminar el último detalle de venta.');
      return;
    }

    const newDetallesVenta = formData.detallesVenta.filter((_, i) => i !== index);
    setFormData({ ...formData, detallesVenta: newDetallesVenta });
  };


  const handleClearForm = () => {
    setFormData({
      clienteId: '',
      fechaVenta: '',
      detallesVenta: [{ productoId: '', tipoEmpaque: '', tamanoHuevo: '', cantidadVendida: 0, precioUnitario: 0 }],
    });
    setDireccionCliente('');
    setFieldErrors({});
  };

  const validateFields = () => {
    const errors = {};

    if (!formData.clienteId) errors.clienteId = 'Por favor, seleccione un cliente.';
    if (!formData.fechaVenta) errors.fechaVenta = 'Por favor, seleccione una fecha de venta.';

    formData.detallesVenta.forEach((detalle, index) => {
      if (!detalle.productoId) errors[`productoId_${index}`] = 'Por favor, seleccione un producto.';
      if (!detalle.tipoEmpaque) errors[`tipoEmpaque_${index}`] = 'Por favor, seleccione un tipo de empaque.';
      if (!detalle.tamanoHuevo) errors[`tamanoHuevo_${index}`] = 'Por favor, seleccione un tamaño de huevo.';
      if (!detalle.cantidadVendida || detalle.cantidadVendida <= 0) errors[`cantidadVendida_${index}`] = 'Ingrese una cantidad mayor a 0.';
      if (!detalle.precioUnitario || detalle.precioUnitario <= 0) errors[`precioUnitario_${index}`] = 'Ingrese un precio mayor a 0.';
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateFields()) {
      return;
    }

    try {
      const fechaISO = new Date(formData.fechaVenta).toISOString().split('T')[0]; // Solo fecha en formato ISO (YYYY-MM-DD)

      const ventaData = isEditing
        ? {
          ventaId: venta?.ventaId || 0,
          clienteId: parseInt(formData.clienteId),
          fechaVenta: fechaISO, // Enviar solo la fecha
          detallesVenta: formData.detallesVenta.map((detalle) => ({
            productoId: parseInt(detalle.productoId),
            tipoEmpaque: detalle.tipoEmpaque,
            tamanoHuevo: detalle.tamanoHuevo,
            cantidadVendida: parseInt(detalle.cantidadVendida),
            precioUnitario: parseFloat(detalle.precioUnitario),
          })),
        }
        : {
          venta: {
            clienteId: parseInt(formData.clienteId),
            fechaVenta: fechaISO, // Enviar solo la fecha
          },
          detallesVenta: formData.detallesVenta.map((detalle) => ({
            productoId: parseInt(detalle.productoId),
            tipoEmpaque: detalle.tipoEmpaque,
            tamanoHuevo: detalle.tamanoHuevo,
            cantidadVendida: parseInt(detalle.cantidadVendida),
            precioUnitario: parseFloat(detalle.precioUnitario),
          })),
        };

      const url = isEditing
        ? '/api/Ventas/ActualizarVenta'
        : '/api/Ventas/InsertarDetallesVenta';
      const method = isEditing ? 'put' : 'post';

      console.log('Datos enviados:', ventaData);

      await axiosInstance[method](url, ventaData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      onSubmit();
    } catch (error) {
      console.error('Error al procesar la venta:', error.response?.data || error.message);
      handleError('Error al procesar la venta.');
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Cliente y Fecha de Venta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente</label>
          <select
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            value={formData.clienteId}
            onChange={handleClienteChange}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.clienteId} value={cliente.clienteId}>
                {cliente.nombreCliente}
              </option>
            ))}
          </select>
          {fieldErrors.clienteId && <p className="text-xs mt-1 text-red-500">{fieldErrors.clienteId}</p>}
        </div>

        {direccionCliente && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg bg-gray-200 cursor-not-allowed"
              value={direccionCliente}
              readOnly
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Venta</label>
          <input
            type="date"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            value={formData.fechaVenta}
            onChange={(e) => setFormData({ ...formData, fechaVenta: e.target.value })}
          />
          {fieldErrors.fechaVenta && <p className="text-xs mt-1 text-red-500">{fieldErrors.fechaVenta}</p>}
        </div>
      </div>

      {/* Stock Disponible */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold text-center text-gray-700 mb-2">Stock Disponible</h3>
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-300 text-gray-700">
              <th className="px-4 py-2 text-center">Tamaño</th>
              <th className="px-4 py-2 text-center">Cajas</th>
              <th className="px-4 py-2 text-center">Cartones Extras</th>
              <th className="px-4 py-2 text-center">Huevos Sueltos</th>
            </tr>
          </thead>
          <tbody>
            {stockHuevos.map((stock, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <td className="px-4 py-2 text-center">{stock.tamano}</td>
                <td className={`px-4 py-2 text-center ${stock.cajas === 0 ? 'text-red-500' : ''}`}>
                  {stock.cajas}
                </td>
                <td className={`px-4 py-2 text-center ${stock.cartonesExtras === 0 ? 'text-red-500' : ''}`}>
                  {stock.cartonesExtras}
                </td>
                <td className={`px-4 py-2 text-center ${stock.huevosSueltos === 0 ? 'text-red-500' : ''}`}>
                  {stock.huevosSueltos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalles de Venta */}
      {/* Detalles de Venta */}
      <div className="space-y-4">
        {formData.detallesVenta.map((detalle, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={detalle.productoId}
                  onChange={(e) => handleDetailChange(index, 'productoId', e.target.value)}
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.productoId} value={producto.productoId}>
                      {producto.nombreProducto}
                    </option>
                  ))}
                </select>
                {fieldErrors[`productoId_${index}`] && (
                  <p className="text-xs mt-1 text-red-500">{fieldErrors[`productoId_${index}`]}</p>
                )}
              </div>

              {/* Tipo Empaque */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo Empaque</label>
                <select
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={detalle.tipoEmpaque}
                  onChange={(e) => handleDetailChange(index, 'tipoEmpaque', e.target.value)}
                >
                  <option value="">Seleccione Tipo de Empaque</option>
                  <option value="Cartón">Cartón</option>
                  <option value="Caja">Caja</option>
                  <option value="Sueltos">Sueltos</option>
                </select>
                {fieldErrors[`tipoEmpaque_${index}`] && (
                  <p className="text-xs mt-1 text-red-500">{fieldErrors[`tipoEmpaque_${index}`]}</p>
                )}
              </div>

              {/* Tamaño Huevo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tamaño Huevo</label>
                <select
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={detalle.tamanoHuevo}
                  onChange={(e) => handleDetailChange(index, 'tamanoHuevo', e.target.value)}
                >
                  <option value="">Seleccione un Tamaño</option>
                  <option value="Extra Grande">Extra Grande</option>
                  <option value="Grande">Grande</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Defectuosos">Defectuosos</option>
                </select>
                {fieldErrors[`tamanoHuevo_${index}`] && (
                  <p className="text-xs mt-1 text-red-500">{fieldErrors[`tamanoHuevo_${index}`]}</p>
                )}
              </div>

              {/* Cantidad Vendida */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad Vendida</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={detalle.cantidadVendida}
                  onChange={(e) => handleDetailChange(index, 'cantidadVendida', e.target.value)}
                />
                {fieldErrors[`cantidadVendida_${index}`] && (
                  <p className="text-xs mt-1 text-red-500">{fieldErrors[`cantidadVendida_${index}`]}</p>
                )}
              </div>

              {/* Precio Unitario */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Unitario (Q)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={detalle.precioUnitario}
                  onChange={(e) => handleDetailChange(index, 'precioUnitario', e.target.value)}
                />
                {fieldErrors[`precioUnitario_${index}`] && (
                  <p className="text-xs mt-1 text-red-500">{fieldErrors[`precioUnitario_${index}`]}</p>
                )}
              </div>

              {/* Botón para eliminar detalle */}
              <div className="flex items-center">
                <button type="button" onClick={() => handleRemoveDetail(index)} className="text-red-600">
                  <FaTrashAlt className="inline-block mr-2" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Botón para agregar un nuevo detalle */}
        {/* Botón para agregar un nuevo detalle */}
        {!isEditing && (
          <button
            type="button"
            onClick={handleAddDetail}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
          >
            <FaPlus className="inline-block mr-2" /> Agregar Detalle
          </button>
        )}

      </div>


      {/* Acciones del Formulario */}
      <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {!isEditing && (
          <button
            type="button"
            onClick={handleClearForm}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            <FaBroom className="inline-block mr-2" /> Limpiar
          </button>
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            <FaTimes className="inline-block mr-2" /> Cancelar
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <FaSave className="inline-block mr-2" /> {isEditing ? 'Actualizar Venta' : 'Agregar Venta'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DetalleVentaForm;
