import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../axiosInstance'; // Importa la instancia de Axios configurada
import { useParams } from 'react-router-dom';
import ProduccionForm from './ProduccionForm';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { FaEgg, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { MdRealEstateAgent } from "react-icons/md";
import { LuReplace } from "react-icons/lu";
import { GiEggClutch } from "react-icons/gi";




const ProduccionG = () => {
  const { idLote } = useParams();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Elementos por página
  const [sortOrder, setSortOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const location = useLocation();
  const { estadoBaja } = location.state || {};

  const isDisabled = estadoBaja !== undefined ? estadoBaja : false;
  const { roles } = useContext(AuthContext); // Obtiene los roles del contexto de autenticación
  const isAdmin = roles.includes('Admin');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/getproduccion?IdLote=${idLote}`);
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setHistorial(sortData(data));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idLote, sortOrder]);

  const sortData = (data) => {
    return data.sort((a, b) => {
      const dateA = new Date(a.fechaRegistroP);
      const dateB = new Date(b.fechaRegistroP);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/getproduccion?IdLote=${idLote}`);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setHistorial(sortData(data));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleAddClick = () => {
    if (!isDisabled) {
      setCurrentItem(null);
      setShowForm(true);
    }
  };

  // Cálculo de los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historial.slice(indexOfFirstItem, indexOfLastItem);

  // Cambio de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(historial.length / itemsPerPage);

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
      <div className="flex justify-start mb-6 text-lg items-center">
        {isAdmin && (
          <Link
            to={`/clasificacion/${idLote}`}
            state={{ estadoBaja }}
            className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2"
          >
            <LuReplace className="text-blue-700" />
            <span>Clasificación</span>
          </Link>
        )}
        <span className="mx-2 text-blue-700">/</span>
        {isAdmin && (
          <Link
            to={`/estado/${idLote}`}
            state={{ estadoBaja }}
            className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2"
          >
            <MdRealEstateAgent className="text-blue-700" /> {/* Ícono de calendario */}
            <span>Estado Lote</span>
          </Link>
        )}
      </div>

      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <GiEggClutch className="inline-block mb-2 text-blue-700" /> {/* Icono en el título */}
        Historial de Producción
      </h2>

      <div className="flex justify-center mb-4">
        <button
          disabled={isDisabled}  // Deshabilitando el botón si el lote está dado de baja
          onClick={handleAddClick}
          className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${isDisabled
              ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            }`}
        >
          <FaEgg className="inline-block mr-2" /> {/* Ícono en el botón */}
          Agregar Producción
        </button>
      </div>

      {showForm && (
        <ProduccionForm
          item={currentItem}
          idLote={idLote}
          onClose={() => {
            setShowForm(false);
            setCurrentItem(null);
            refreshData();
          }}
          refreshData={refreshData}
          isEditing={!!currentItem}
        />
      )}

      <div className="overflow-x-auto max-w-full rounded-lg shadow-lg">
        <table className="w-full text-sm text-left text-gray-700 bg-white rounded-lg">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-800">
            <tr>
              <th className="px-6 py-3 text-center">Fecha</th>
              <th className="px-6 py-3 text-center">Cajas</th>
              <th className="px-6 py-3 text-center">Cartones</th>
              <th className="px-6 py-3 text-center">Sueltos</th>
              <th className="px-6 py-3 text-center">Defectuosos</th>
              <th className="px-6 py-3 text-center">Total</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : currentItems.length ? (
              currentItems.map((item) => (
                <tr key={item.idProd} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">{formatDate(item.fechaRegistroP)}</td>
                  <td className="px-6 py-4 text-center">{item.cantCajas}</td>
                  <td className="px-6 py-4 text-center">{item.cantCartones}</td>
                  <td className="px-6 py-4 text-center">{item.cantSueltos}</td>
                  <td className="px-6 py-4 text-center">{item.defectuosos}</td>
                  <td className="px-6 py-4 text-center">{item.cantTotal}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      disabled={isDisabled}  // Deshabilitando el botón de editar si está dado de baja
                      onClick={() => handleEditClick(item)}
                      className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 ${isDisabled
                          ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500'
                        }`}
                    >
                      <FaEdit className="inline-block mr-2" /> {/* Ícono de editar */}
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No hay registros de producción disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
    </div>
  );
};

export default ProduccionG;
