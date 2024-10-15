import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Importar iconos

const LoteForm = ({ loteData, lotes, isEditing, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    idLote: '',
    numLote: '',
    cantidadG: '',
    idRaza: '',
    fechaAdq: '',
    idCorral: '',
  });
  const [razas, setRazas] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [errors, setErrors] = useState({});
  const [estadoLoteExists, setEstadoLoteExists] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(loteData || {
      idLote: '',
      numLote: '',
      cantidadG: '',
      idRaza: '',
      fechaAdq: '',
      idCorral: '',
    });

    // Función para obtener los corrales habilitados
    const fetchCorrales = async () => {
      try {
        const response = await axiosInstance.get('/getcorral');
        const corralesHabilitados = response.data.filter(corral => corral.estado === true);
        setCorrales(corralesHabilitados);
      } catch (error) {
        console.error('Error al obtener corrales:', error);
      }
    };

    // Función para obtener las razas activas
    const fetchRazas = async () => {
      try {
        const response = await axiosInstance.get('/api/razaG/getrazaG');
        const razasActivas = response.data.filter(raza => raza.estado);  // Filtra razas activas
        setRazas(razasActivas);
      } catch (error) {
        console.error('Error al obtener razas:', error);
      }
    };

    // Función para obtener el estado del lote
    const fetchEstadoLote = async () => {
      if (loteData && loteData.idLote) {  // Solo se ejecuta si estamos editando un lote existente
        try {
          const response = await axiosInstance.get(`/getestadolote?idLote=${loteData.idLote}`);
          if (Array.isArray(response.data) && response.data.length > 0) {
            setEstadoLoteExists(true);
          } else {
            setEstadoLoteExists(false);
          }
        } catch (error) {
          console.error('Error al obtener EstadoLote:', error);
          setEstadoLoteExists(false);
        }
      }
    };

    fetchCorrales(); // Llama a la función para obtener corrales
    fetchRazas(); // Llama a la función para obtener razas

    if (loteData && loteData.idLote) {
      fetchEstadoLote();
    }
  }, [loteData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      numLote: '',
      cantidadG: '',
      idRaza: '',
      fechaAdq: '',
      idCorral: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const regexLetters = /^[a-zA-Z\s]*$/;

    if (!formData.numLote) {
      newErrors.numLote = 'Este campo es obligatorio.';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.numLote)) {
      newErrors.numLote = 'El campo solo debe contener letras y números.';
    }

    if (formData.cantidadG === '' || parseInt(formData.cantidadG) <= 0) {
      newErrors.cantidadG = 'El campo debe ser un número positivo.';
    }

    if (!formData.idRaza) {
      newErrors.idRaza = 'Este campo es obligatorio.';
    }

    if (!formData.fechaAdq) {
      newErrors.fechaAdq = 'Este campo es obligatorio.';
    }

    if (!formData.idCorral) {
      newErrors.idCorral = 'Este campo es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (validateForm()) {
      onSubmit(formData);
    }
    setLoading(false);
  };

  const isCorralInUse = (corralId) => {
    return lotes.some(lote => lote.idCorral === corralId);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg shadow-lg mb-3">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        {formData.idLote ? 'Actualizar Lote' : 'Crear Nuevo Lote'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Lote</label>
            <input
              type="text"
              name="numLote"
              value={formData.numLote}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {errors.numLote && <p className="text-red-500 text-xs mt-1">{errors.numLote}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad de Gallinas</label>
            <input
              type="number"
              name="cantidadG"
              value={formData.cantidadG}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={estadoLoteExists}
            />
            {errors.cantidadG && <p className="text-red-500 text-xs mt-1">{errors.cantidadG}</p>}
            {estadoLoteExists && (
              <p className="text-yellow-500 text-xs mt-1">No se puede modificar la cantidad de gallinas porque ya existe registro del estado del lote.</p>
            )}
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
            <select
              name="idRaza"
              value={formData.idRaza}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Seleccione una raza</option>
              {razas.map((raza) => (
                <option key={raza.idRaza} value={raza.idRaza}>
                  {raza.raza}
                </option>
              ))}
            </select>
            {errors.idRaza && <p className="text-red-500 text-xs mt-1">{errors.idRaza}</p>}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Adquisición</label>
            <input
              type="date"
              name="fechaAdq"
              value={formData.fechaAdq}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {errors.fechaAdq && <p className="text-red-500 text-xs mt-1">{errors.fechaAdq}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Corral</label>
            <select
              name="idCorral"
              value={formData.idCorral}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Seleccione un corral</option>
              {corrales
                .map((corral) => (
                  <option
                    key={corral.idCorral}
                    value={corral.idCorral}
                    disabled={isCorralInUse(corral.idCorral) && corral.idCorral !== formData.idCorral}
                  >
                    {corral.numCorral} {isCorralInUse(corral.idCorral) ? '(En uso)' : ''}
                  </option>
                ))}
            </select>
            {errors.idCorral && <p className="text-red-500 text-xs mt-1">{errors.idCorral}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-start mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <FaTimes className="mr-2" /> {/* Ícono de cancelar */}
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            <FaBroom className="mr-2" /> {/* Ícono de limpiar */}
            Limpiar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            <FaSave className="mr-2" /> {/* Ícono de guardar */}
            {isEditing ? 'Actualizar Lote' : 'Crear Lote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoteForm;
