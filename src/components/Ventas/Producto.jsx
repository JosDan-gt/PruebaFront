import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import ProductoForm from './ProductosForm'; // Importa el componente de formulario
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Importando íconos

const ProductosActivos = () => {
  const [productos, setProductos] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [expanded, setExpanded] = useState(null); // Controla qué fila está expandida
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = () => {
    axiosInstance.get('/api/Ventas/ProductosActivos')
      .then(response => setProductos(response.data))
      .catch(error => console.error('Error fetching data:', error));
  };

  const handleSortByName = () => {
    const sortedProductos = [...productos].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.nombreProducto.localeCompare(b.nombreProducto);
      }
      return b.nombreProducto.localeCompare(a.nombreProducto);
    });
    setProductos(sortedProductos);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleFormSubmit = () => {
    fetchProductos();
    setShowForm(false);
    setEditingProducto(null);
  };

  const handleEditProducto = (producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleDeleteProducto = async (productoId) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (confirmed) {
      try {
        await axiosInstance.put(`https://localhost:7249/updateestadoprod?idProd=${productoId}`, {
          estado: false
        });
        fetchProductos(); // Refresca la lista de productos después de eliminar uno
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    }
  };

  const handleToggleExpand = (id) => {
    setExpanded(expanded === id ? null : id); // Alternar la expansión de la descripción
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...'; // Corta hasta la última palabra completa
  };

  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = productos.slice(startIndex, startIndex + itemsPerPage);

  const Pagination = ({ totalPages, currentPage, paginate }) => {
    const maxPageVisibles = 3
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
              ? 'bg-blue-700 text-white'
              : 'bg-white text-blue-700 hover:bg-blue-200'
              }`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl max-w-full w-full">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <FaPlus className="inline-block mb-2 text-blue-700" /> {/* Icono en el título */}
        Productos Activos
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => { setShowForm(!showForm); setEditingProducto(null); }}
          className="px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700"
        >
          <FaPlus className="inline-block mr-2" /> {/* Icono de agregar */}
          {showForm ? 'Ocultar Formulario' : 'Agregar Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <ProductoForm
          onCancel={() => { setShowForm(false); setEditingProducto(null); }}
          onSubmit={handleFormSubmit}
          producto={editingProducto}
        />
      )}

      {productos.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto mx-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <tr>
                  <th
                    className="py-3 px-6 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700"
                    onClick={handleSortByName}
                  >
                    Nombre {sortDirection === 'asc' ? '▲' : '▼'}
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold">Descripción</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentItems.map((producto) => (
                  <tr
                    key={producto.productoId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 whitespace-nowrap">{producto.nombreProducto}</td>
                    <td className="py-3 px-6 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis" style={{ minHeight: '50px' }}>
                      <div
                        style={{
                          maxWidth: '200px',
                          whiteSpace: expanded === producto.productoId ? 'normal' : 'nowrap',
                          overflow: expanded === producto.productoId ? 'visible' : 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '20px',
                        }}
                      >
                        {expanded === producto.productoId
                          ? producto.descripcion // Mostrar toda la descripción si está expandida
                          : truncateText(producto.descripcion, 30)} {/* Truncar sin cortar palabras */}
                      </div>
                      {producto.descripcion.length > 30 && (  // Mostrar "Ver más" si la descripción supera los 30 caracteres
                        <button
                          onClick={() => handleToggleExpand(producto.productoId)}
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {expanded === producto.productoId ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-6 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => handleEditProducto(producto)}
                        className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 flex items-center"
                      >
                        <FaEdit className="mr-2" /> {/* Icono de editar */}
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProducto(producto.productoId)}
                        className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-500 hover:to-red-600 transition-all duration-300 flex items-center"
                      >
                        <FaTrashAlt className="mr-2" /> {/* Icono de eliminar */}
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
        <p className="text-gray-700 text-lg text-center">No hay productos activos disponibles.</p>
      )}
    </div>
  );
};

export default ProductosActivos;
