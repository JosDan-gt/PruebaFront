import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useParams, Link, useLocation } from 'react-router-dom';
import EstadoLoteForm from './EstadoLoteForm';
import { FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { GiEggClutch } from 'react-icons/gi';
import { LuReplace } from 'react-icons/lu';
import { MdRealEstateAgent } from "react-icons/md";
import { TbBuildingEstate } from "react-icons/tb";
import { FaSpinner } from 'react-icons/fa';

const EstadoLote = () => {
  const { idLote } = useParams();
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState('desc');
  const [isLoteBaja, setIsLoteBaja] = useState(false);
  const location = useLocation();
  const { estadoBaja } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [estadoLote, setEstadoLote] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isDisabled = estadoBaja !== undefined ? estadoBaja : false;

  useEffect(() => {
    const fetchEstadoLote = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/getestadolote?idLote=${idLote}`);
        const sortedData = response.data.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
        setEstadoLote(sortedData);
      } catch (error) {
        console.error('Error fetching estadoLote:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEtapas = async () => {
      try {
        const response = await axiosInstance.get('/getetapas');
        setEtapas(response.data);
      } catch (error) {
        console.error('Error fetching etapas:', error);
      }
    };

    const fetchLoteStatus = async () => {
      try {
        const response = await axiosInstance.get(`/getlote?idLote=${idLote}`);
        setIsLoteBaja(response.data.estadoBaja);
      } catch (error) {
        console.error('Error fetching lote status:', error);
      }
    };

    if (idLote) {
      fetchEstadoLote();
      fetchLoteStatus();
      fetchEtapas();
    }
  }, [idLote]);

  const handleAddNew = () => {
    setSelectedEstado(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (estado) => {
    setSelectedEstado(estado);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedEstado(null);
  };

  const handleSortByDate = () => {
    const sortedData = [...estadoLote].sort((a, b) => {
      return sortDirection === 'asc' ? new Date(a.fechaRegistro) - new Date(b.fechaRegistro) : new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
    });
    setEstadoLote(sortedData);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (idEstado) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este estado?");
    if (confirmDelete) {
      try {
        await axiosInstance.put(`/api/estadolote/updateestado/${idEstado}`, { estado: false });
        alert('Estado eliminado exitosamente');
        handleFormSubmit();
      } catch (error) {
        console.error('Error al eliminar el estado del lote:', error.response?.data || error.message);
        alert('Error al eliminar el estado del lote');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedEstado(null);
    const fetchEstadoLote = async () => {
      try {
        const response = await axiosInstance.get(`/getestadolote?idLote=${idLote}`);
        const sortedData = response.data.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
        setEstadoLote(sortedData);
      } catch (error) {
        console.error('Error fetching estadoLote:', error);
      }
    };
    fetchEstadoLote();
  };

  const handleFilterByDate = () => {
    const filteredData = estadoLote.filter((estado) => {
      const fecha = new Date(estado.fechaRegistro);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return (!startDate || fecha >= start) && (!endDate || fecha <= end);
    });
    setEstadoLote(filteredData);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(estadoLote.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = estadoLote.slice(indexOfFirstItem, indexOfLastItem);

  const isMostRecent = (estado) => {
    const mostRecent = estadoLote[0]; // El primer elemento tras ordenar es el más reciente
    return mostRecent && estado.idEstado === mostRecent.idEstado;
  };

  const Pagination = ({ totalPages, currentPage, paginate }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-4 space-x-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none ${currentPage === number
              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
              : 'bg-white text-blue-700 border border-gray-300 hover:bg-blue-100 hover:text-blue-900'
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
        <Link to={`/produccionG/${idLote}`} state={{ estadoBaja }} className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2">
          <GiEggClutch className="text-blue-700" />
          <span>Producción</span>
        </Link>
        <span className="mx-2 text-blue-700">/</span>
        <Link to={`/clasificacion/${idLote}`} state={{ estadoBaja }} className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2">
          <LuReplace className="text-blue-700" />
          <span>Clasificación</span>
        </Link>
      </div>

      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <MdRealEstateAgent className="inline-block mb-2 text-blue-700" /> Estado del Lote
      </h2>



      {!isLoteBaja && (
        <div className="flex justify-center mb-6">
          <button
            disabled={isDisabled}
            onClick={handleAddNew}
            className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'}`}
          >
            <TbBuildingEstate className="inline-block mr-2" size={25} />
            {showForm ? 'Ocultar Formulario' : 'Agregar Nuevo Estado'}
          </button>
        </div>
      )}

      {showForm && (
        <EstadoLoteForm
          key={selectedEstado ? selectedEstado.idEstado : 'new'}
          estadoData={selectedEstado}
          isEditing={isEditing}
          idLote={idLote}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      )}


      {/* Filtros por rango de fecha */}
      <div className=" mb-6 flex space-x-4 justify-center">
        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-900">Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-32 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" // Ajuste de ancho
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-900">Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-32 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" // Ajuste de ancho
          />
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <button
          onClick={handleFilterByDate}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Filtrar por Fecha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-blue-500 text-5xl" />
          </div>
        ) : currentItems.length ? (
          currentItems.map((estado) => {
            const etapa = etapas.find((e) => e.idEtapa === estado.idEtapa);
            const nombreEtapa = etapa ? etapa.nombre : 'Etapa desconocida';

            return (
              <div key={estado.idEstado} className="p-4 bg-white rounded-lg shadow-lg transition hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-700">Estado: {nombreEtapa}</h3>
                  <div className="text-gray-500">
                    <FaCalendarAlt className="inline-block mr-1" />
                    {new Date(estado.fechaRegistro).toLocaleDateString()}
                  </div>
                </div>

                {/* Sección para la información de cantidad y bajas en dos columnas */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center bg-blue-100 text-blue-700 p-2 rounded-lg">
                    <p className="text-sm">Cantidad de Gallinas</p>
                    <p className="font-semibold text-xl">{estado.cantidadG}</p>
                  </div>
                  <div className="text-center bg-red-100 text-red-700 p-2 rounded-lg">
                    <p className="text-sm">Bajas</p>
                    <p className="font-semibold text-xl">{estado.bajas}</p>
                  </div>
                </div>

                {/* Sección para Semana en una fila */}
                <div className="mt-4 text-center bg-green-100 text-green-700 p-2 rounded-lg">
                  <p className="text-sm">Semana</p>
                  <p className="font-semibold text-xl">{estado.semana}</p>
                </div>

                {/* Sección para Descripción destacada */}
                <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-sm font-semibold text-gray-800">Descripción</p>
                  <p className="text-gray-700 text-lg">{estado.descripcion || 'No disponible'}</p>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => handleEdit(estado)}
                    disabled={!isMostRecent(estado) || isDisabled}
                    className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-colors duration-300 ${!isMostRecent(estado) || isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                  >
                    <FaEdit className="inline-block mr-1" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(estado.idEstado)}
                    disabled={!isMostRecent(estado) || isDisabled}
                    className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-colors duration-300 ${!isMostRecent(estado) || isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                  >
                    <FaTrash className="inline-block mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center text-gray-500">
            No hay registros de estado disponibles.
          </div>
        )}
      </div>


      <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
    </div>
  );
};

export default EstadoLote;
