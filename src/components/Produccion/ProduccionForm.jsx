import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Importar iconos

const ProduccionForm = ({ item, idLote, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    idProd: '',
    cantCajas: '0',
    cantCartones: '0',
    cantSueltos: '0',
    defectuosos: '',
    fechaRegistroP: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        fechaRegistroP: item.fechaRegistroP ? item.fechaRegistroP.split('T')[0] : ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Validación para evitar números negativos
    if (parseInt(value, 10) < 0) {
      setErrors((prev) => ({ ...prev, [name]: 'El valor no puede ser negativo.' }));
      return; // No actualiza el estado si el valor es negativo
    }
  
    // Validación específica para `cantSueltos` y `cantCartones`
    if (name === 'defectuosos' && value > 29) {
      setErrors((prev) => ({ ...prev, defectuosos: 'No puede ser mayor a 29.' }));
      return;
    }

    if (name === 'cantSueltos' && value > 29) {
      setErrors((prev) => ({ ...prev, cantSueltos: 'No puede ser mayor a 29.' }));
      return;
    }
  
    if (name === 'cantCartones' && value > 11) {
      setErrors((prev) => ({ ...prev, cantCartones: 'No puede ser mayor a 11.' }));
      return;
    }
    // Elimina errores si el valor vuelve a ser válido
    setErrors((prev) => ({ ...prev, [name]: '' }));
  
    // Actualiza el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  

  const validateForm = () => {
    const newErrors = {};
    if (formData.cantCajas === '') newErrors.cantCajas = 'Este campo es obligatorio.';
    if (formData.cantCartones === '') newErrors.cantCartones = 'Este campo es obligatorio.';
    if (formData.cantSueltos === '') newErrors.cantSueltos = 'Este campo es obligatorio.';
    if (formData.defectuosos === '') newErrors.defectuosos = 'Este campo es obligatorio.';
    if (!formData.fechaRegistroP) newErrors.fechaRegistroP = 'Este campo es obligatorio.';
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
      if (formData.idProd) {
        await axiosInstance.put('/updproduccion', {
          IdProd: formData.idProd,
          CantCajas: parseInt(formData.cantCajas),
          CantCartones: parseInt(formData.cantCartones),
          CantSueltos: parseInt(formData.cantSueltos),
          IdLote: idLote,
          Defectuosos: parseInt(formData.defectuosos),
          FechaRegistroP: formData.fechaRegistroP ? new Date(formData.fechaRegistroP).toISOString() : null
        });
        alert('Producción actualizada exitosamente.');
      } else {
        await axiosInstance.post('/postproduccion', {
          CantCajas: parseInt(formData.cantCajas),
          CantCartones: parseInt(formData.cantCartones),
          CantSueltos: parseInt(formData.cantSueltos),
          IdLote: idLote,
          Defectuosos: formData.defectuosos ? parseInt(formData.defectuosos) : null,
          FechaRegistroP: formData.fechaRegistroP ? new Date(formData.fechaRegistroP).toISOString() : null
        });
        alert('Producción registrada exitosamente.');
      }
      setFormData({
        idProd: '',
        cantCajas: '',
        cantCartones: '',
        cantSueltos: '',
        defectuosos: '',
        fechaRegistroP: '',
      });
      onClose();
      refreshData();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Error al registrar producción: ${error.response.data.message || 'Error desconocido.'}`);
      } else {
        alert('Error al registrar producción.');
      }
      console.error('Error al registrar producción:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-900">
        {formData.idProd ? 'Actualizar Producción' : 'Agregar Producción'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Input de Cajas */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Cajas</label>
            <input
              type="number"
              name="cantCajas"
              value={formData.cantCajas}
              onChange={handleChange}
              placeholder="Cajas"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              min="0"
            />
            {errors.cantCajas && <p className="text-xs mt-1 text-red-600">{errors.cantCajas}</p>}
          </div>

          {/* Input de Cartones */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Cartones</label>
            <input
              type="number"
              name="cantCartones"
              value={formData.cantCartones}
              onChange={handleChange}
              placeholder="Cartones"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              min="0"
            />
            {errors.cantCartones && <p className="text-xs mt-1 text-red-600">{errors.cantCartones}</p>}
          </div>

          {/* Input de Sueltos */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Sueltos</label>
            <input
              type="number"
              name="cantSueltos"
              value={formData.cantSueltos}
              onChange={handleChange}
              placeholder="Sueltos"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              min="0"
            />
            {errors.cantSueltos && <p className="text-xs mt-1 text-red-600">{errors.cantSueltos}</p>}
          </div>

          {/* Input de Defectuosos */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Defectuosos</label>
            <input
              type="number"
              name="defectuosos"
              value={formData.defectuosos}
              onChange={handleChange}
              placeholder="Defectuosos"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              min="0"
            />
            {errors.defectuosos && <p className="text-xs mt-1 text-red-600">{errors.defectuosos}</p>}
          </div>

          {/* Input de Fecha de Registro */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-blue-900">Fecha de Registro</label>
            <input
              type="date"
              name="fechaRegistroP"
              value={formData.fechaRegistroP}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.fechaRegistroP && <p className="text-xs mt-1 text-red-600">{errors.fechaRegistroP}</p>}
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
            {formData.idProd ? 'Actualizar' : 'Agregar'}
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
              cantCajas: '',
              cantCartones: '',
              cantSueltos: '',
              defectuosos: '',
              fechaRegistroP: ''
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

export default ProduccionForm;
