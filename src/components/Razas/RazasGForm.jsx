import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Importar iconos

const RazaForm = ({ raza, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    idRaza: '',
    raza: '',
    origen: '',
    color: '',
    colorH: '',
    caractEspec: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (raza) {
      setFormData({
        ...raza,
      });
    }
  }, [raza]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.raza) newErrors.raza = 'Este campo es obligatorio.';
    if (!formData.origen) newErrors.origen = 'Este campo es obligatorio.';
    if (!formData.color) newErrors.color = 'Este campo es obligatorio.';
    if (!formData.colorH) newErrors.colorH = 'Este campo es obligatorio.';
    if (!formData.caractEspec) newErrors.caractEspec = 'Este campo es obligatorio.';
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
      if (formData.idRaza) {
        await axiosInstance.put('/api/razaG/putraza', {
          idRaza: formData.idRaza,
          raza: formData.raza,
          origen: formData.origen,
          color: formData.color,
          colorH: formData.colorH,
          caractEspec: formData.caractEspec
        });
        alert('Raza actualizada exitosamente.');
      } else {
        await axiosInstance.post('/api/razaG/postraza', {
          raza: formData.raza,
          origen: formData.origen,
          color: formData.color,
          colorH: formData.colorH,
          caractEspec: formData.caractEspec
        });
        alert('Raza registrada exitosamente.');
      }
      setFormData({
        idRaza: '',
        raza: '',
        origen: '',
        color: '',
        colorH: '',
        caractEspec: ''
      });
      onClose();
      refreshData();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Error al registrar raza: ${error.response.data.message || 'Error desconocido.'}`);
      } else {
        alert('Error al registrar raza.');
      }
      console.error('Error al registrar raza:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-900">
        {formData.idRaza ? 'Actualizar Raza' : 'Agregar Raza'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Input de Raza */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Raza</label>
            <input
              type="text"
              name="raza"
              value={formData.raza}
              onChange={handleChange}
              placeholder="Raza"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.raza && <p className="text-xs mt-1 text-red-600">{errors.raza}</p>}
          </div>

          {/* Input de Origen */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Origen</label>
            <input
              type="text"
              name="origen"
              value={formData.origen}
              onChange={handleChange}
              placeholder="Origen"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.origen && <p className="text-xs mt-1 text-red-600">{errors.origen}</p>}
          </div>

          {/* Input de Color */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Color"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.color && <p className="text-xs mt-1 text-red-600">{errors.color}</p>}
          </div>

          {/* Input de Color Huevo */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Color Huevo</label>
            <input
              type="text"
              name="colorH"
              value={formData.colorH}
              onChange={handleChange}
              placeholder="Color Huevo"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.colorH && <p className="text-xs mt-1 text-red-600">{errors.colorH}</p>}
          </div>

          {/* Input de Características Específicas */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-blue-900">Características Específicas</label>
            <textarea
              name="caractEspec"
              value={formData.caractEspec}
              onChange={handleChange}
              placeholder="Características Específicas"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="4"
            />
            {errors.caractEspec && <p className="text-xs mt-1 text-red-600">{errors.caractEspec}</p>}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
            disabled={loading}
          >
            <FaSave className="mr-2" /> {/* Ícono de guardar */}
            {formData.idRaza ? 'Actualizar' : 'Agregar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center"
          >
            <FaTimes className="mr-2" /> {/* Ícono de cancelar */}
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              raza: '',
              origen: '',
              color: '',
              colorH: '',
              caractEspec: ''
            })}
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition-all duration-300 flex items-center justify-center"
          >
            <FaBroom className="mr-2" /> {/* Ícono de limpiar */}
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );

};

export default RazaForm;
