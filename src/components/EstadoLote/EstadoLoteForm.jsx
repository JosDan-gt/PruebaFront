import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa';

const EstadoLoteForm = ({ estadoData, isEditing, onSubmit, onCancel, idLote, isDisabled }) => {
  const [formData, setFormData] = useState({
    bajas: '',
    fechaRegistro: '',
    semana: '',
    idEtapa: '',
    descripcion: '', // Nuevo campo de descripción
  });
  const [etapas, setEtapas] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const resetFormData = () => {
    if (estadoData) {
      setFormData({
        bajas: estadoData.bajas.toString(),
        fechaRegistro: estadoData.fechaRegistro ? estadoData.fechaRegistro.split('T')[0] : '',
        semana: estadoData.semana.toString(),
        idEtapa: estadoData.idEtapa.toString(),
        descripcion: estadoData.descripcion || '', // Inicializar la descripción
      });
    }
  };

  useEffect(() => {
    const fetchEtapas = async () => {
      try {
        const response = await axiosInstance.get('/getetapas');
        setEtapas(response.data);
      } catch (error) {
        console.error('Error fetching etapas:', error);
      }
    };

    fetchEtapas();
  }, []);

  useEffect(() => {
    resetFormData();
  }, [estadoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bajas || parseInt(formData.bajas, 10) < 0) {
      newErrors.bajas = 'El campo Bajas debe ser un número no negativo.';
    }
    if (!formData.semana || parseInt(formData.semana, 10) < 0) {
      newErrors.semana = 'El campo Semana debe ser un número no negativo.';
    }
    if (!formData.idEtapa) {
      newErrors.idEtapa = 'El campo Etapa es obligatorio.';
    }
    if (!isEditing && !formData.fechaRegistro) {
      newErrors.fechaRegistro = 'El campo Fecha de Registro es obligatorio.';
    }
    if (!formData.descripcion) {
      newErrors.descripcion = 'El campo Descripción es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await axiosInstance.put('/putestadolote', {
          idEstado: estadoData.idEstado,
          bajas: parseInt(formData.bajas, 10),
          semana: parseInt(formData.semana, 10),
          idEtapa: parseInt(formData.idEtapa, 10),
          idLote: idLote,
          descripcion: formData.descripcion, // Enviar descripción al backend
        });
        alert('Estado del lote actualizado exitosamente.');
      } else {
        await axiosInstance.post('/postestadolote', {
          bajas: parseInt(formData.bajas, 10),
          fechaRegistro: formData.fechaRegistro,
          semana: parseInt(formData.semana, 10),
          idEtapa: parseInt(formData.idEtapa, 10),
          idLote: idLote,
          descripcion: formData.descripcion, // Enviar descripción al backend
        });
        alert('Estado del lote creado exitosamente.');
      }

      setFormData({
        bajas: '',
        fechaRegistro: '',
        semana: '',
        idEtapa: '',
        descripcion: '', // Resetear descripción
      });
      onCancel();
      onSubmit();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Error al registrar estado del lote: ${error.response.data.message || 'Error desconocido.'}`);
      } else {
        alert('Error al registrar estado del lote.');
      }
      console.error('Error al registrar estado del lote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-900">
        {isEditing ? 'Actualizar Estado del Lote' : 'Agregar Estado del Lote'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Bajas</label>
            <input
              type="number"
              name="bajas"
              value={formData.bajas}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ingrese el número de bajas"
              min="0"
            />
            {errors.bajas && <p className="text-xs mt-1 text-red-600">{errors.bajas}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Semana</label>
            <input
              type="number"
              name="semana"
              value={formData.semana}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ingrese la semana"
              min="0"
            />
            {errors.semana && <p className="text-xs mt-1 text-red-600">{errors.semana}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Etapa</label>
            <select
              name="idEtapa"
              value={formData.idEtapa}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="" disabled>
                Seleccione una etapa
              </option>
              {etapas.map((etapa) => (
                <option key={etapa.idEtapa} value={etapa.idEtapa}>
                  {etapa.nombre}
                </option>
              ))}
            </select>
            {errors.idEtapa && <p className="text-xs mt-1 text-red-600">{errors.idEtapa}</p>}
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-semibold mb-1 text-blue-900">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ingrese una descripción"
            />
            {errors.descripcion && <p className="text-xs mt-1 text-red-600">{errors.descripcion}</p>}
          </div>
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-blue-900">Fecha de Registro</label>
              <input
                type="date"
                name="fechaRegistro"
                value={formData.fechaRegistro}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.fechaRegistro && <p className="text-xs mt-1 text-red-600">{errors.fechaRegistro}</p>}
            </div>
          )}
          {isEditing && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-blue-900">Fecha de Registro</label>
              <input
                type="date"
                name="fechaRegistro"
                value={formData.fechaRegistro}
                disabled
                className="w-full p-2 border rounded-md text-sm bg-gray-100 focus:outline-none"
              />
              <p className="text-gray-600 text-xs mt-1">Este campo no se puede modificar.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end sm:space-x-2 mt-6 space-y-2 sm:space-y-0">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
            disabled={loading}
          >
            <FaSave className="mr-2" />
            {isEditing ? 'Actualizar' : 'Agregar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center"
          >
            <FaTimes className="mr-2" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                bajas: '',
                fechaRegistro: '',
                semana: '',
                idEtapa: '',
                descripcion: '', // Resetear descripción
              })
            }
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition-all duration-300 flex items-center justify-center"
          >
            <FaBroom className="mr-2" />
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstadoLoteForm;
