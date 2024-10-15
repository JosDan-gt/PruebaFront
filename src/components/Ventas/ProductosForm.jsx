import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Íconos de FontAwesome

const ProductoForm = ({ onCancel, onSubmit, producto }) => {
  const [formData, setFormData] = useState({
    nombreProducto: '',
    descripcion: '',
  });

  const [errors, setErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombreProducto: producto.nombreProducto,
        descripcion: producto.descripcion,
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let formIsValid = true;
    let errors = {};

    if (!formData.nombreProducto.trim()) {
      formIsValid = false;
      errors.nombreProducto = 'El nombre del producto es requerido.';
    }

    if (!formData.descripcion.trim()) {
      formIsValid = false;
      errors.descripcion = 'La descripción es requerida.';
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
      if (producto) {
        // Actualizar producto existente
        await axiosInstance.put('api/Ventas/updProducto', { productoId: producto.productoId, ...formData });
      } else {
        // Insertar nuevo producto
        await axiosInstance.post('api/Ventas/InsertarProducto', formData);
      }
      onSubmit(); // Llamar a la función onSubmit pasada como prop
    } catch (error) {
      console.error('Error al insertar o actualizar el producto:', error);
    } finally {
      setIsDisabled(false);
    }
  };

  const handleClear = () => {
    setFormData({
      nombreProducto: '',
      descripcion: '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Nombre del Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input
            type="text"
            name="nombreProducto"
            value={formData.nombreProducto}
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Ingrese el nombre del producto"
          />
          {errors.nombreProducto && <p className="text-xs mt-1 text-red-500">{errors.nombreProducto}</p>}
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Ingrese la descripción"
            rows="3"
          />
          {errors.descripcion && <p className="text-xs mt-1 text-red-500">{errors.descripcion}</p>}
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
          <FaSave className="inline-block mr-2" /> {producto ? 'Actualizar Producto' : 'Insertar Producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductoForm;
