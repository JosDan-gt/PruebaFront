import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import LoteForm from './LoteForm';
import { AuthContext } from '../Context/AuthContext';
import { FaEdit, FaTrash, FaArrowDown, FaPlus } from 'react-icons/fa';
import { GiChicken } from "react-icons/gi";
import { FaSpinner } from 'react-icons/fa';


const LotesActivos = ({ reloadFlag, triggerReload }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true); // Usamos solo este estado de carga
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const navigate = useNavigate();

  const { roles } = useContext(AuthContext);
  const isAdmin = roles.includes('Admin');
  const isUser = roles.includes('User');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Inicia la carga
        const response = await axiosInstance.get('/api/lotes');
        setLotes(response.data || []);
      } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchData();
  }, [reloadFlag]);

  const handleSelectionChange = (idLote, value) => {
    const selectedLote = lotes.find(lote => lote.idLote === idLote);

    if (!selectedLote) {
      alert('Lote no encontrado. Por favor, selecciona un lote válido.');
      return;
    }

    navigate(`/${value}/${idLote}`, { state: { estadoBaja: selectedLote.estadoBaja } });
  };

  const handleAddNew = () => {
    setSelectedLote(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (lote) => {
    setSelectedLote({ ...lote, fechaAdq: lote.fechaAdq.split('T')[0] });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedLote(null);
    setIsEditing(false);
  };

  const handleDelete = async (idLote) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este lote?")) {
      try {
        await axiosInstance.put(`/updateestadolot?idlote=${idLote}`, { Estado: false });
        setLotes(lotes.filter(lote => lote.idLote !== idLote));
        alert('Lote eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el lote:', error);
        alert('Error al eliminar el lote');
      }
    }
  };

  const handleDarDeBaja = async (idLote) => {
    if (window.confirm("¿Estás seguro de que deseas dar de baja este lote?")) {
      try {
        await axiosInstance.put(`/api/lotes/putLoteBaja?idLote=${idLote}`, { estadoBaja: true });
        setLotes(lotes.filter(lote => lote.idLote !== idLote));
        alert('Lote dado de baja correctamente');
        triggerReload();
      } catch (error) {
        console.error('Error al dar de baja el lote:', error);
        alert('Error al dar de baja el lote');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        numLote: formData.numLote,
        cantidadG: parseInt(formData.cantidadG, 10),
        idRaza: parseInt(formData.idRaza, 10),
        fechaAdq: formData.fechaAdq,
        idCorral: parseInt(formData.idCorral, 10)
      };

      if (isEditing && formData.idLote) {
        await axiosInstance.put('/putLote', { ...payload, idLote: parseInt(formData.idLote, 10) });
        alert('Lote actualizado exitosamente');
      } else {
        await axiosInstance.post('/postLote', payload);
        alert('Lote creado exitosamente');
      }

      handleFormClose();
      triggerReload();
    } catch (error) {
      alert('Error al registrar lote.');
      console.error('Error al registrar lote:', error);
    }
  };

  if (loading) {
    return (
      <div className="col-span-2 flex justify-center items-center h-40">
        <FaSpinner className="animate-spin text-purple-500 text-5xl" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-100 shadow-lg rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <h2 className="text-4xl font-extrabold text-black tracking-wider">Lotes Activos</h2>
        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="px-5 py-2 bg-gradient-to-r from-black to-red-600 text-white font-semibold rounded-full hover:scale-105 transition-transform duration-300 flex items-center space-x-2 shadow-lg"
          >
            <FaPlus /> <span>Agregar Nuevo Lote</span>
          </button>
        )}
      </div>

      {showForm && (
        <LoteForm
          loteData={selectedLote}
          lotes={lotes}
          isEditing={isEditing}
          onCancel={handleFormClose}
          onSubmit={handleSubmit}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-purple-500 text-5xl" />
          </div>
        ) : (
          lotes.map((lote) => (
            <div
              key={lote.idLote}
              className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl text-gray-800 font-extrabold">{lote.numLote}</h3>
                <GiChicken className="text-black text-3xl" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                  <p className="text-sm font-semibold text-gray-800">Cantidad Inicial</p>
                  <p className="text-lg font-bold text-blue-600">{lote.cantidadG}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow-md">
                  <p className="text-sm font-semibold text-gray-800">Cantidad Actual</p>
                  <p className="text-lg font-bold text-green-600">{lote.cantidadGctual}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg shadow-md sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-800">Fecha de Adquisición</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {new Date(lote.fechaAdq).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mt-6">Acciones</label>
              <select
                value=""
                onChange={(e) => handleSelectionChange(lote.idLote, e.target.value)}
                className="w-full mt-2 border-gray-300 rounded-lg shadow-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="" disabled>Selecciona una opción</option>
                {(isAdmin || isUser) && <option value="produccionG">Producción</option>}
                {isAdmin && <option value="clasificacion">Clasificación</option>}
                {isAdmin && <option value="estado">Estado</option>}
              </select>

              {isAdmin && (
                <div className="flex flex-col space-y-3 md:space-y-2 md:flex-col lg:flex-row lg:space-x-3 mt-6">
                  <button
                    onClick={() => handleEdit(lote)}
                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
                  >
                    <FaEdit /> <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lote.idLote)}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transition"
                  >
                    <FaTrash /> <span>Eliminar</span>
                  </button>
                  <button
                    onClick={() => handleDarDeBaja(lote.idLote)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-600 transition"
                  >
                    <FaArrowDown /> <span>Dar de Baja</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default LotesActivos;
