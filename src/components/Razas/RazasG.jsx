import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import axiosInstance from '../axiosInstance';
import RazaForm from './RazasGForm';

const RazaG = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editRaza, setEditRaza] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/razaG/getrazaG');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateClick = (raza) => {
    setEditRaza(raza);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditRaza(null);
    fetchData();
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(data.length / itemsPerPage);

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

  const currentItems = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <FaPlus className="inline-block mb-2 text-green-700" /> Raza de Gallinas
      </h2>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => {
            setShowForm((prev) => !prev); // Alterna entre mostrar/ocultar el formulario
            setEditRaza(null); // Limpia la edición actual
          }}
          className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${showForm
            ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
            : 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700'
            }`}
        >
          {showForm ? (
            <>
              <FaTimes className="inline-block mr-2" /> Ocultar Formulario {/* Icono de cerrar */}
            </>
          ) : (
            <>
              <FaPlus className="inline-block mr-2" /> Agregar Nueva Raza {/* Icono de agregar */}
            </>
          )}
        </button>
      </div>

      {showForm && <RazaForm raza={editRaza} onClose={handleFormClose} />}

      {loading ? (
        <p className="text-gray-700 text-center">Cargando datos...</p>
      ) : currentItems.length > 0 ? (
        <div className="overflow-x-auto max-w-full rounded-lg shadow-lg">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white rounded-lg">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-green-600 to-green-800">
              <tr>
                <th className="px-6 py-3 text-center">Raza</th>
                <th className="px-6 py-3 text-center">Origen</th>
                <th className="px-6 py-3 text-center">Color</th>
                <th className="px-6 py-3 text-center">Color Huevo</th>
                <th className="px-6 py-3 text-center">Características Específicas</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((raza, index) => (
                <tr
                  key={raza.idRaza}
                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
                >
                  <td className="px-6 py-4 text-center">{raza.raza}</td>
                  <td className="px-6 py-4 text-center">{raza.origen}</td>
                  <td className="px-6 py-4 text-center">{raza.color}</td>
                  <td className="px-6 py-4 text-center">{raza.colorH}</td>
                  <td className="px-6 py-4 text-center">{raza.caractEspec}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleUpdateClick(raza)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg"
                    >
                      <FaEdit className="inline-block mr-2" /> Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No hay datos disponibles.</p>
      )}

      <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
    </div>
  );
};

export default RazaG;
