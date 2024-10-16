import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import ClienteForm from '../Ventas/ClientesForm';
import { FaUserEdit, FaTrashAlt, FaPlus, FaSortAlphaDown, FaSortAlphaUp, FaTimes } from 'react-icons/fa';

const ClientesActivos = () => {
  const [clientes, setClientes] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [expanded, setExpanded] = useState(null); // Controla cuál fila está expandida
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = () => {
    axiosInstance.get('/api/Ventas/ClientesActivos')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Error fetching data:', error));
  };

  const handleSortByName = () => {
    const sortedClientes = [...clientes].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.nombreCliente.localeCompare(b.nombreCliente);
      }
      return b.nombreCliente.localeCompare(a.nombreCliente);
    });
    setClientes(sortedClientes);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleFormSubmit = () => {
    fetchClientes();
    setShowForm(false);
    setEditingCliente(null);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleDeleteCliente = async (clienteId) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este cliente?");
    if (confirmed) {
      try {
        await axiosInstance.put(`/updateestadocli?idCli=${clienteId}`, { estado: false });
        fetchClientes();
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
      }
    }
  };

  const handleToggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = clientes.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 hover:bg-blue-200'
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
        <FaUserEdit className="inline-block mb-2 text-blue-700" /> {/* Icono en el título */}
        Clientes Activos
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => { setShowForm(!showForm); setEditingCliente(null); }}
          className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${showForm
            ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            }`}
        >
          {showForm ? (
            <>
              <FaTimes className="inline-block mr-2" /> Ocultar Formulario
            </>
          ) : (
            <>
              <FaPlus className="inline-block mr-2" /> Agregar Nuevo Cliente
            </>
          )}
        </button>
      </div>

      {showForm && (
        <ClienteForm
          onCancel={() => { setShowForm(false); setEditingCliente(null); }}
          onSubmit={handleFormSubmit}
          cliente={editingCliente}
        />
      )}

      {clientes.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <tr>
                  <th
                    className="py-3 px-6 text-center text-sm font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={handleSortByName}
                  >
                    Nombre {sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                  </th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Dirección</th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Teléfono</th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentItems.map((cliente) => (
                  <tr
                    key={cliente.clienteId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 text-center">{cliente.nombreCliente}</td>
                    <td className="py-3 px-6 text-center max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                      <div
                        style={{ maxWidth: '200px', whiteSpace: expanded === cliente.clienteId ? 'normal' : 'nowrap', overflow: expanded === cliente.clienteId ? 'visible' : 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {cliente.direccion}
                      </div>
                      {cliente.direccion.length > 50 && (
                        <button
                          onClick={() => handleToggleExpand(cliente.clienteId)}
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {expanded === cliente.clienteId ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">{cliente.telefono}</td>
                    <td className="py-3 px-6 text-center flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEditCliente(cliente)}
                        className="px-3 py-1 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors duration-300 flex items-center"
                      >
                        <FaUserEdit className="mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCliente(cliente.clienteId)}
                        className="px-3 py-1 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
                      >
                        <FaTrashAlt className="mr-2" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination totalPages={totalPages} currentPage={currentPage} paginate={setCurrentPage} />
        </>
      ) : (
        <p className="text-gray-700 text-lg text-center">No hay clientes activos disponibles.</p>
      )}
    </div>
  );
};

export default ClientesActivos;
