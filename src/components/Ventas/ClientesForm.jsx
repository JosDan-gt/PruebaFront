import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Íconos de FontAwesome

const ClienteForm = ({ onCancel, onSubmit, cliente }) => {
  const [formData, setFormData] = useState({
    nombreCliente: '',
    direccion: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombreCliente: cliente.nombreCliente,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let formIsValid = true;
    let errors = {};

    if (!formData.nombreCliente.trim()) {
      formIsValid = false;
      errors.nombreCliente = 'El nombre del cliente es requerido.';
    }

    if (!formData.telefono.trim()) {
      formIsValid = false;
      errors.telefono = 'El teléfono es requerido.';
    }

    if (!formData.direccion.trim()) {
      formIsValid = false;
      errors.direccion = 'La dirección es requerida.';
    }

    setErrors(errors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsDisabled(true);

    try {
      if (cliente) {
        // Actualizar cliente existente
        await axiosInstance.put('/api/Ventas/updCliente', { clienteId: cliente.clienteId, ...formData });
      } else {
        // Insertar nuevo cliente
        await axiosInstance.post('/api/Ventas/insertCliente', formData);
      }
      onSubmit(); // Llamar a la función onSubmit pasada como prop
    } catch (error) {
      console.error('Error al insertar o actualizar el cliente:', error);
    } finally {
      setIsDisabled(false);
    }
  };

  const handleClear = () => {
    setFormData({
      nombreCliente: '',
      direccion: '',
      telefono: ''
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Cliente */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
          <input
            type="text"
            name="nombreCliente"
            value={formData.nombreCliente}
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Ingrese el nombre del cliente"
          />
          {errors.nombreCliente && <p className="text-xs mt-1 text-red-500">{errors.nombreCliente}</p>}
        </div>
  
        {/* Teléfono */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={(e) => {
              if (e.target.value.length <= 8) {
                handleChange(e);
              }
            }}
            disabled={isDisabled}
            inputMode="numeric"
            pattern="\d{8}"
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Ingrese el teléfono"
          />
          {errors.telefono && <p className="text-xs mt-1 text-red-500">{errors.telefono}</p>}
        </div>
  
        {/* Dirección */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Ingrese la dirección"
            rows="3"
          />
          {errors.direccion && <p className="text-xs mt-1 text-red-500">{errors.direccion}</p>}
        </div>
      </div>
  
      {/* Acciones del Formulario */}
      <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDisabled}
          className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500 ${isDisabled ? 'cursor-not-allowed' : ''}`}
        >
          <FaTimes className="inline-block mr-2" /> Cancelar
        </button>
  
        <button
          type="button"
          onClick={handleClear}
          disabled={isDisabled}
          className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 ${isDisabled ? 'cursor-not-allowed' : ''}`}
        >
          <FaBroom className="inline-block mr-2" /> Limpiar
        </button>
  
        <button
          type="submit"
          disabled={isDisabled}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500 ${isDisabled ? 'cursor-not-allowed' : ''}`}
        >
          <FaSave className="inline-block mr-2" /> {cliente ? 'Actualizar Cliente' : 'Insertar Cliente'}
        </button>
      </div>
    </form>
  );
  
};

export default ClienteForm;
