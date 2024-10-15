import React, { useState, useEffect } from 'react';
import { FaBox, FaEgg, FaLayerGroup, FaSortUp, FaSortDown, FaEdit } from 'react-icons/fa';
import axiosInstance from '../axiosInstance';
import { useParams, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClasificacionForm from './ClasificacionForm';
import { useLocation } from 'react-router-dom';
import { MdRealEstateAgent } from "react-icons/md";
import { LuReplace } from "react-icons/lu";
import { GiEggClutch } from "react-icons/gi";
import { FaSpinner } from 'react-icons/fa';


const ClasificacionH = () => {
  const { id } = useParams();
  const [clasificacion, setClasificacion] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clasPorPagina] = useState(2); // Mostrar 2 días por página
  const [ordenar, setOrdenar] = useState('desc');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [selecElemnt, setSelecElemnt] = useState(null);
  const location = useLocation();
  const { estadoBaja } = location.state || {};
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedDateType, setSelectedDateType] = useState('fechaClaS');

  const isDisabled = estadoBaja !== undefined ? estadoBaja : false;

  const refrescarData = async () => {
    setCargando(true); // Mostrar el spinner
    try {
      const response = await axiosInstance.get(`/clasific1?IdLote=${id}`);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setClasificacion(sortData(data));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setCargando(false); // Ocultar el spinner
    }
  };
  

  useEffect(() => {
    refrescarData();
  }, [id, ordenar]);

  const sortData = (data) => {
    return data.sort((a, b) => {
      const dateClasificacionA = new Date(a.fechaClaS);
      const dateClasificacionB = new Date(b.fechaClaS);
      const dateProduccionA = new Date(a.fechaRegistroP);
      const dateProduccionB = new Date(b.fechaRegistroP);

      // Comparar primero por la fecha de clasificación
      if (dateClasificacionA.getTime() !== dateClasificacionB.getTime()) {
        return ordenar === 'asc' ? dateClasificacionA - dateClasificacionB : dateClasificacionB - dateClasificacionA;
      }

      // Si las fechas de clasificación son iguales, comparar por la fecha de producción
      return ordenar === 'asc' ? dateProduccionA - dateProduccionB : dateProduccionB - dateProduccionA;
    });
  };

  const filterData = (data) => {
    return data.filter((item) => {
      const term = busqueda.toLowerCase();
      const itemFecha = new Date(item[selectedDateType]).getTime();
      const rangeStart = dateRange[0] ? dateRange[0].getTime() : null;
      const rangeEnd = dateRange[1] ? dateRange[1].getTime() : null;

      return (
        item.tamano.toLowerCase().includes(term) &&
        (!rangeStart || !rangeEnd || (itemFecha >= rangeStart && itemFecha <= rangeEnd))
      );
    });
  };

  const groupByDate = (data, key) => {
    return data.reduce((acc, item) => {
      const date = new Date(item[key]).toLocaleDateString(); // Agrupamos por fecha legible
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const paginateData = (data) => {
    const groupedByDate = groupByDate(data, 'fechaRegistroP');
    const allDates = Object.keys(groupedByDate);
    const indexOfLastItem = paginaActual * clasPorPagina;
    const indexOfFirstItem = indexOfLastItem - clasPorPagina;
    return allDates.slice(indexOfFirstItem, indexOfLastItem).reduce((acc, date) => {
      acc[date] = groupedByDate[date];
      return acc;
    }, {});
  };

  const filteredData = filterData(clasificacion);
  const paginatedData = paginateData(filteredData);
  const totalPages = Math.ceil(Object.keys(groupByDate(filteredData, 'fechaRegistroP')).length / clasPorPagina);

  const paginate = (pageNumber) => setPaginaActual(pageNumber);

  const handleAddClick = () => {
    setSelecElemnt(null);
    setMostrarForm(true);
  };

  const handleEditClick = (item) => {
    setSelecElemnt(item);
    setMostrarForm(true);
  };

  const handleCloseForm = () => {
    setMostrarForm(false);
    setSelecElemnt(null);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
  };

  const handleDateTypeChange = (e) => {
    setSelectedDateType(e.target.value);
  };

  const Paginacion = ({ totalPages, paginaActual, paginate }) => {
    const maxPageVisibles = 3
    const pageNumbers = [];

    const inicioPage = Math.max(1, paginaActual - Math.floor(maxPageVisibles / 2));
    const finPage = Math.min(totalPages, inicioPage + maxPageVisibles - 1);

    for (let i = inicioPage; i <= finPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-4 space-x-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none ${paginaActual === number
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
      <div className="flex flex-col sm:flex-row sm:justify-start sm:items-center mb-6 text-lg items-center">
        <Link
          to={`/produccionG/${id}`}
          state={{ estadoBaja }}
          className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2 mb-2 sm:mb-0"
        >
          <GiEggClutch className="text-blue-700" /> {/* Ícono de producción */}
          <span>Producción</span>
        </Link>
        <span className="mx-2 text-blue-700 hidden sm:inline">/</span>
        <Link
          to={`/estado/${id}`}
          state={{ estadoBaja }}
          className="text-blue-700 hover:text-blue-900 transition duration-300 flex items-center space-x-2"
        >
          <MdRealEstateAgent className="text-blue-700" /> {/* Ícono de estado */}
          <span>Estado Lote</span>
        </Link>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
        <LuReplace className="inline-block mb-2 text-blue-700" /> {/* Icono en el título */}
        Clasificación de Huevos
      </h2>



      <div className="flex justify-center mb-4">
        <button
          disabled={isDisabled}
          onClick={handleAddClick}
          className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${isDisabled
            ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            }`}
        >
          <FaBox className="inline-block mr-2" /> {/* Ícono en el botón */}
          Agregar Clasificación
        </button>
      </div>

      {mostrarForm && (
        <ClasificacionForm
          item={selecElemnt}
          idLote={id}
          onClose={handleCloseForm}
          refrescarData={refrescarData}
          isUpdateMode={selecElemnt !== null}
        />
      )}

      {/* Filtro de rango de fecha y tamaño */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="mb-4 sm:mb-0">
          <label className="font-semibold text-gray-700">Rango de Fechas:</label>
          <DatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={handleDateRangeChange}
            isClearable={true}
            className="ml-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Selecciona un rango de fechas"
          />
        </div>

        <div className="mb-4 sm:mb-0">
          <label className="font-semibold text-gray-700">Filtrar por Tamaño:</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="ml-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por tamaño"
          />
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      ) : (
        <div className="overflow-x-auto max-w-full rounded-lg shadow-lg">
          {Object.keys(paginatedData).map((productionDate) => (
            <div key={productionDate}>
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Fecha de Producción: {productionDate}
              </h3>
              <table className="w-full text-sm text-left text-gray-700 bg-white rounded-lg mb-6">
                <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-800">
                  <tr>
                    <th className="px-6 py-3 text-center">Tamaño</th>
                    <th className="px-6 py-3 text-center">
                      <FaBox className="inline-block mr-1" /> Cajas
                    </th>
                    <th className="px-6 py-3 text-center">
                      <FaLayerGroup className="inline-block mr-1" /> Cartones Extra
                    </th>
                    <th className="px-6 py-3 text-center">
                      <FaEgg className="inline-block mr-1" /> Huevos Sueltos
                    </th>
                    <th className="px-6 py-3 text-center">Cantidad Total</th>
                    <th className="px-6 py-3 text-center">Fecha de Clasificación</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData[productionDate].map((item, index) => (
                    <tr
                      key={index}
                      className={`bg-white border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                    >
                      <td className="px-6 py-4 text-center">{item.tamano}</td>
                      <td className="px-6 py-4 text-center">{item.cajas}</td>
                      <td className="px-6 py-4 text-center">{item.cartonesExtras}</td>
                      <td className="px-6 py-4 text-center">{item.huevosSueltos}</td>
                      <td className="px-6 py-4 text-center">{item.totalUnitaria}</td>
                      <td className="px-6 py-4 text-center">
                        {item.fechaClaS
                          ? new Date(item.fechaClaS).toLocaleDateString()
                          : 'Sin fecha'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isDisabled}
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
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <Paginacion totalPages={totalPages} paginaActual={paginaActual} paginate={paginate} />
        </div>
      )}</div>
  );
};

export default ClasificacionH;
