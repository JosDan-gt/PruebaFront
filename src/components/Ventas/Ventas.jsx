import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import DetalleVentaForm from './DetalleVentaForm';
import { PDFDownloadLink } from '@react-pdf/renderer';
import VentasGeneralesPDF from './VentasGeneralesPDF';
import VentasPorClientePDF from './VentasPorClientePDF';
import VentasPorFechaPDF from './VentasPorFechaPDF';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaEdit, FaFileDownload, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';

const VentasActivas = () => {
  const [detallesVentas, setDetallesVentas] = useState({});
  const [detallesVisibles, setDetallesVisibles] = useState({});
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filtros
  const [selectedCliente, setSelectedCliente] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [ventas, setVentas] = useState([]);
  const [originalVentas, setOriginalVentas] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Obtener ventas activas y detalles de venta
  const fetchVentasConDetalles = async () => {
    try {
      const response = await axiosInstance.get('/api/Ventas/VentasActivas');
      const ventasData = response.data;
      const detallesData = {};

      setOriginalVentas(ventasData);
      setVentas(ventasData);

      await Promise.all(
        ventasData.map(async (venta) => {
          const detallesResponse = await axiosInstance.get(`/api/Ventas/DetallesVentaActivos/${venta.ventaId}`);
          detallesData[venta.ventaId] = detallesResponse.data;
        })
      );

      setDetallesVentas(detallesData);
    } catch (error) {
      console.error('Error fetching ventas activas y detalles:', error);
    }
  };

  // Obtener clientes y productos
  const fetchClientesYProductos = async () => {
    try {
      const clientesResponse = await axiosInstance.get('/api/Ventas/ClientesActivos');
      const productosResponse = await axiosInstance.get('/api/Ventas/ProductosActivos');
      setClientes(clientesResponse.data);
      setProductos(productosResponse.data);
    } catch (error) {
      console.error('Error fetching clientes o productos:', error);
    }
  };

  useEffect(() => {
    fetchVentasConDetalles();
    fetchClientesYProductos();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedCliente, dateRange]);

  const handleSearch = () => {
    let filteredVentas = [...originalVentas];

    if (selectedCliente) {
      filteredVentas = filteredVentas.filter(
        (venta) => String(venta.clienteId) === String(selectedCliente)
      );
    }

    const [startDate, endDate] = dateRange;

    if (startDate && endDate) {
      filteredVentas = filteredVentas.filter((venta) => {
        const ventaFecha = new Date(venta.fechaVenta);
        return ventaFecha >= startDate && ventaFecha <= endDate;
      });
    }

    setVentas(filteredVentas);
  };

  const handleAdd = () => {
    setVentaSeleccionada(null);
    setIsEditing(false);
    setMostrarFormulario(true);
  };

  const handleEdit = (venta) => {
    const fechaISO = venta.fechaVenta ? new Date(venta.fechaVenta).toISOString().split('T')[0] : '';

    setVentaSeleccionada({
      ...venta,
      fechaVenta: fechaISO, // Fecha en formato 'YYYY-MM-DD'
      detallesVenta: detallesVentas[venta.ventaId] || [],
    });

    setIsEditing(true);
    setMostrarFormulario(true);
  };


  const handleFormCancel = () => {
    setVentaSeleccionada(null);
    setMostrarFormulario(false);
  };

  const handleFormSubmit = () => {
    setVentaSeleccionada(null);
    setMostrarFormulario(false);
    fetchVentasConDetalles();
  };

  const getClienteNombre = (clienteId) => {
    const cliente = clientes.find((cliente) => cliente.clienteId === clienteId);
    return cliente ? cliente.nombreCliente : 'Desconocido';
  };

  const getProductoNombre = (productoId) => {
    const producto = productos.find((producto) => producto.productoId === productoId);
    return producto ? producto.nombreProducto : 'Desconocido';
  };

  const toggleDetalles = (ventaId) => {
    setDetallesVisibles((prev) => ({
      ...prev,
      [ventaId]: !prev[ventaId],
    }));
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentas = ventas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventas.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const Pagination = ({ totalPages, currentPage, paginate }) => {
    const maxPageVisibles = 3;
    const pageNumbers = [];

    const inicioPage = Math.max(1, currentPage - Math.floor(maxPageVisibles / 2));
    const finPage = Math.min(totalPages, inicioPage + maxPageVisibles - 1);

    for (let i = inicioPage; i <= finPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-4">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 mx-1 border border-gray-300 rounded-md ${currentPage === number
              ? 'bg-green-700 text-white'
              : 'bg-white text-green-700 hover:bg-green-200'
              }`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <FaSearch className="inline-block mb-2 text-blue-700" /> {/* Icono de búsqueda en el título */}
        Ventas Activas
      </h2>


      <div className="flex justify-center mb-4">
        <button
          onClick={() => setMostrarFormulario((prev) => !prev)} // Alterna entre mostrar/ocultar formulario
          className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 
      ${mostrarFormulario
              ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
              : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            }`}
        >
          {mostrarFormulario ? (
            <>
              <FaTimes className="inline-block mr-2" /> {/* Icono de cerrar */}
              Ocultar Formulario
            </>
          ) : (
            <>
              <FaPlus className="inline-block mr-2" /> {/* Icono de agregar */}
              Agregar Nueva Venta
            </>
          )}
        </button>
      </div>



      {mostrarFormulario && (
        <DetalleVentaForm
          venta={ventaSeleccionada}
          isEditing={isEditing}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Tabla de ventas */}
      <div className="overflow-x-auto max-w-full rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 text-center">Cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className=" block w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos</option>
              {clientes.map((cliente) => (
                <option key={cliente.clienteId} value={cliente.clienteId}>
                  {cliente.nombreCliente}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 text-center">Rango de Fecha</label>
            <div className="flex space-x-2">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholderText="Seleccionar rango de fechas"
                isClearable
              />
            </div>
          </div>
        </div>

        <table className="w-full text-sm text-left text-gray-700 bg-white rounded-lg">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-800">
            <tr>
              <th className="px-6 py-3 text-center">Fecha de Venta</th>
              <th className="px-6 py-3 text-center">Cliente</th>
              <th className="px-6 py-3 text-center">Total Venta</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentVentas.length ? (
              currentVentas.map((venta) => (
                <React.Fragment key={venta.ventaId}>
                  <tr className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4 text-center">{getClienteNombre(venta.clienteId)}</td>
                    <td className="px-6 py-4 text-center">
                      {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(venta.totalVenta)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleDetalles(venta.ventaId)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-400 hover:to-green-500 transition-all duration-300"
                      >
                        {detallesVisibles[venta.ventaId] ? 'Ocultar Detalles' : 'Ver Detalles'}
                      </button>
                      <button
                        onClick={() => handleEdit(venta)}
                        className="ml-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
                      >
                        <FaEdit className="inline-block mr-2" />
                        Editar
                      </button>
                    </td>
                  </tr>
                  {detallesVisibles[venta.ventaId] && detallesVentas[venta.ventaId] && (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 bg-gray-100">
                        <table className="table-auto w-full bg-gray-50 rounded-lg shadow-md">
                          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                            <tr>
                              <th className="px-4 py-2 text-left">Producto</th>
                              <th className="px-4 py-2 text-left">Tipo Empaque</th>
                              <th className="px-4 py-2 text-left">Tamaño Huevo</th>
                              <th className="px-4 py-2 text-left">Cantidad Vendida</th>
                              <th className="px-4 py-2 text-left">Precio Unitario</th>
                              <th className="px-4 py-2 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesVentas[venta.ventaId].map((detalle, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                                <td className="px-4 py-2 text-left">{getProductoNombre(detalle.productoId)}</td>
                                <td className="px-4 py-2 text-left">{detalle.tipoEmpaque}</td>
                                <td className="px-4 py-2 text-left">{detalle.tamanoHuevo}</td>
                                <td className="px-4 py-2 text-left">{detalle.cantidadVendida}</td>

                                {/* Precio Unitario formateado como dinero */}
                                <td className="px-4 py-2 text-left">
                                  {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(detalle.precioUnitario)}
                                </td>

                                {/* Total formateado como dinero */}
                                <td className="px-4 py-2 text-left">
                                  {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(detalle.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>

                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No hay registros de ventas disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botones de descarga de PDF */}
      <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0 mt-4 text-center">
        <PDFDownloadLink
          document={<VentasGeneralesPDF ventas={ventas} detallesVentas={detallesVentas} clientes={clientes} productos={productos} />}
          fileName="reporte_ventas_generales.pdf"
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600"
        >
          {({ loading }) => (
            <>
              <FaFileDownload className="inline-block mr-2" />
              {loading ? 'Generando...' : 'Descargar Generales'}
            </>
          )}
        </PDFDownloadLink>

        <PDFDownloadLink
          document={<VentasPorClientePDF ventas={ventas} detallesVentas={detallesVentas} clientes={clientes} productos={productos} />}
          fileName="reporte_ventas_por_cliente.pdf"
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600"
        >
          {({ loading }) => (
            <>
              <FaFileDownload className="inline-block mr-2" />
              {loading ? 'Generando...' : 'Descargar por Cliente'}
            </>
          )}
        </PDFDownloadLink>

        <PDFDownloadLink
          document={<VentasPorFechaPDF ventas={ventas} detallesVentas={detallesVentas} clientes={clientes} productos={productos} fechaInicio={startDate} fechaFin={endDate} />}
          fileName="reporte_ventas_por_fechas.pdf"
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600"
        >
          {({ loading }) => (
            <>
              <FaFileDownload className="inline-block mr-2" />
              {loading ? 'Generando...' : 'Descargar por Fechas'}
            </>
          )}
        </PDFDownloadLink>
      </div>
      {/* Paginación */}
      <Pagination totalPages={totalPages} currentPage={currentPage} paginate={goToPage} />
    </div>
  );
};

export default VentasActivas;
