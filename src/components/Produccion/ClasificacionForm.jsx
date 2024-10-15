import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../Context/AuthContext';
import { FaSave, FaTimes, FaBroom } from 'react-icons/fa'; // Importar iconos
import { FaCalendarAlt } from 'react-icons/fa';
import { FaLayerGroup, FaEgg } from 'react-icons/fa';
import { AiFillProduct } from "react-icons/ai";
import { HiBuildingStorefront } from "react-icons/hi2";
import { CgDetailsMore } from "react-icons/cg";
import { BsFillLayersFill } from "react-icons/bs";




const ClasificacionForm = ({ idLote, onClose, isUpdateMode, item, refrescarData }) => {
  const { roles } = useContext(AuthContext);
  const isAdminOrGestor = roles.includes('Admin') || roles.includes('Gestor');

  const [formData, setFormData] = useState({
    tamano: '',
    cajas: '0',
    cartonesExtras: '0',
    huevosSueltos: '0',
    fechaClaS: '',
    fechaProdu: '',
    idProd: null,
  });
  const [fechasProduccion, setFechasProduccion] = useState([]);
  const [selectedProduccion, setSelectedProduccion] = useState(null);
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchFechasProduccion = async () => {
      try {
        const responseViewStock = await axiosInstance.get(`/viewstock?idLote=${idLote}`);
        const fechasConStock = responseViewStock.data;

        let fechasFiltradas;

        if (isUpdateMode && item) {
          const responseAllFechas = await axiosInstance.get(`/getproduccion?IdLote=${idLote}`);
          const todasLasFechas = responseAllFechas.data;

          const fechasCombinadas = todasLasFechas.map(fecha => {
            const fechaConStock = fechasConStock.find(f => f.idProduccion === fecha.idProd);
            return fechaConStock || {
              idProduccion: fecha.idProd,
              fechaProdu: fecha.fechaRegistroP,
              cantidadTotalProduccion: fecha.cantidadTotalProduccion,
              stockRestante: 0,
              cajasRestantes: 0,
              cartonesRestantes: 0,
              huevosSueltosRestantes: 0,
            };
          });

          // Filtrar para que solo muestre fechas únicas
          fechasFiltradas = fechasCombinadas.reduce((acc, current) => {
            const x = acc.find(item => item.fechaProdu === current.fechaProdu);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          setFechasProduccion(fechasFiltradas);

          const produccionSeleccionada = fechasFiltradas.find(f => f.idProduccion === item.idProd);
          if (produccionSeleccionada) {
            setFormData({
              tamano: item.tamano || '',
              cajas: item.cajas?.toString() || '0',
              cartonesExtras: item.cartonesExtras?.toString() || '0',
              huevosSueltos: item.huevosSueltos?.toString() || '0',
              fechaClaS: item.fechaClaS ? new Date(item.fechaClaS).toISOString().split('T')[0] : '',
              fechaProdu: produccionSeleccionada.fechaProdu,
              idProd: produccionSeleccionada.idProduccion,
            });
            setSelectedProduccion(produccionSeleccionada);
          }
        } else {
          // Si no es modo de edición, solo mostrar fechas con stock
          fechasFiltradas = fechasConStock.reduce((acc, current) => {
            const x = acc.find(item => item.fechaProdu === current.fechaProdu);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          setFechasProduccion(fechasFiltradas);
        }
      } catch (error) {
        console.error('Error fetching fechas de producción:', error);
      }
    };
    fetchFechasProduccion();
  }, [idLote, isUpdateMode, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tamano') {
      const regex = /^[a-zA-ZñÑ\s]*$/;
      if (!regex.test(value)) return;
    }


    if (['cajas', 'cartonesExtras', 'huevosSueltos'].includes(name)) {
      const regex = /^[0-9]*$/;
      if (!regex.test(value)) return;
    }

    if (parseInt(value, 10) < 0) {
      setErrors((prev) => ({ ...prev, [name]: 'El valor no puede ser negativo.' }));
      return; // No actualiza el estado si el valor es negativo
    }

    if (name === 'huevosSueltos' && value > 29) {
      setErrors((prev) => ({ ...prev, huevosSueltos: 'No puede ser mayor a 29.' }));
      return;
    }
  
    if (name === 'cartonesExtras' && value > 11) {
      setErrors((prev) => ({ ...prev, cartonesExtras: 'No puede ser mayor a 11.' }));
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Actualizamos siempre el valor del campo, incluso si es el mismo
    }));
  };

  




  const handleFechaProduChange = (e) => {
    const fechaSeleccionada = e.target.value;
    const produccionSeleccionada = fechasProduccion.find(f => f.fechaProdu === fechaSeleccionada);
    if (produccionSeleccionada) {
      setFormData({
        ...formData,
        fechaProdu: fechaSeleccionada,
        idProd: produccionSeleccionada.idProduccion,
      });
      setSelectedProduccion(produccionSeleccionada);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const regexLetters = /^[a-zA-ZñÑ\s]*$/;

    if (!formData.tamano) {
      newErrors.tamano = 'Este campo es obligatorio.';
    } else if (!regexLetters.test(formData.tamano)) {
      newErrors.tamano = 'El campo solo debe contener letras.';
    }

    if (formData.cajas === '' || parseInt(formData.cajas) < 0) {
      newErrors.cajas = 'El campo debe ser un número positivo o 0.';
    }

    if (formData.cartonesExtras === '' || parseInt(formData.cartonesExtras) < 0) {
      newErrors.cartonesExtras = 'El campo debe ser un número positivo o 0.';
    }

    if (formData.huevosSueltos === '' || parseInt(formData.huevosSueltos) < 0) {
      newErrors.huevosSueltos = 'El campo debe ser un número positivo o 0.';
    }

    if (!formData.fechaClaS) {
      newErrors.fechaClaS = 'Este campo es obligatorio.';
    }

    if (!formData.fechaProdu) {
      newErrors.fechaProdu = 'Este campo es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({
      tamano: '',
      cajas: '',
      cartonesExtras: '',
      huevosSueltos: '',
      fechaClaS: '',
      fechaProdu: '',
      idProd: null,
    });
    setSelectedProduccion(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (!validateForm()) {
      setCargando(false);
      return;
    }

    try {
      const response = isUpdateMode
        ? await axiosInstance.put('/putclasificacion', {
          Id: item?.id,
          Tamano: formData.tamano,
          Cajas: parseInt(formData.cajas),
          CartonesExtras: parseInt(formData.cartonesExtras),
          HuevosSueltos: parseInt(formData.huevosSueltos),
          IdProd: formData.idProd,
        })
        : await axiosInstance.post('/postclasificacion', {
          Tamano: formData.tamano,
          Cajas: parseInt(formData.cajas),
          CartonesExtras: parseInt(formData.cartonesExtras),
          HuevosSueltos: parseInt(formData.huevosSueltos),
          IdProd: formData.idProd,
          FechaClaS: new Date(formData.fechaClaS).toISOString(),
        });

      alert(`Clasificación ${isUpdateMode ? 'actualizada' : 'registrada'} exitosamente.`);
      onClose();
      refrescarData();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Error al registrar clasificación: ${error.response.data.message || 'Error desconocido.'}`);
      } else {
        alert('Error al registrar clasificación.');
      }
      console.error('Error al registrar clasificación:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg shadow-md mb-5">
      {/* Formulario de Clasificación */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
          {isUpdateMode ? 'Actualizar Clasificación' : 'Registrar Clasificación'}
          <FaCalendarAlt className="ml-2 text-blue-700" /> {/* Icono en el título */}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tamaño */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tamaño Huevo</label>
              <select
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                name="tamano"
                value={formData.tamano}
                onChange={handleChange}
                disabled={!isAdminOrGestor}
              >
                <option value="">Seleccione un tamaño</option>
                <option value="Extra Grande">Extra Grande</option>
                <option value="Grande">Grande</option>
                <option value="Mediano">Mediano</option>
                <option value="Pequeño">Pequeño</option>
                <option value="Pigui">Pigui</option>
              </select>
              {errors.tamano && <p className="text-red-500 text-xs mt-1">{errors.tamano}</p>}
            </div>


            {/* Cajas */}
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">Cajas</label>
              <input
                type="number"
                name="cajas"
                value={formData.cajas}
                onChange={handleChange}
                className="w-full p-2 border border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={!isAdminOrGestor}
                min="0"
              />
              {errors.cajas && <p className="text-red-500 text-xs mt-1">{errors.cajas}</p>}
            </div>

            {/* Cartones Extras */}
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">Cartones Extras</label>
              <input
                type="number"
                name="cartonesExtras"
                value={formData.cartonesExtras}
                onChange={handleChange}
                className="w-full p-2 border border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={!isAdminOrGestor}
                min="0"
              />
              {errors.cartonesExtras && <p className="text-red-500 text-xs mt-1">{errors.cartonesExtras}</p>}
            </div>

            {/* Huevos Sueltos */}
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">Huevos Sueltos</label>
              <input
                type="number"
                name="huevosSueltos"
                value={formData.huevosSueltos}
                onChange={handleChange}
                className="w-full p-2 border border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={!isAdminOrGestor}
                min="0"
              />
              {errors.huevosSueltos && <p className="text-red-500 text-xs mt-1">{errors.huevosSueltos}</p>}
            </div>

            {/* Fecha de Clasificación */}
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">Fecha Clasificación</label>
              <input
                type="date"
                name="fechaClaS"
                value={formData.fechaClaS}
                onChange={handleChange}
                className="w-full p-2 border border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={!isAdminOrGestor}
              />
              {errors.fechaClaS && <p className="text-red-500 text-xs mt-1">{errors.fechaClaS}</p>}
            </div>

            {/* Fecha de Producción */}
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">Fecha Producción</label>
              <select
                name="fechaProdu"
                value={formData.fechaProdu}
                onChange={handleFechaProduChange}
                className="w-full p-2 border border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={!isAdminOrGestor}
              >
                <option value="">Seleccione una fecha</option>
                {fechasProduccion.map((fecha) => (
                  <option key={fecha.idProduccion} value={fecha.fechaProdu}>
                    {new Date(fecha.fechaProdu).toLocaleDateString()} - ID: {fecha.idProduccion}
                  </option>
                ))}
              </select>
              {errors.fechaProdu && <p className="text-red-500 text-xs mt-1">{errors.fechaProdu}</p>}
            </div>
          </div>

          {/* Botones de Acción */}
          {isAdminOrGestor && (
            <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              >
                <FaBroom className="mr-2" /> {/* Ícono de limpiar */}
                Limpiar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                <FaTimes className="mr-2" /> {/* Ícono de cancelar */}
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <FaSave className="mr-2" /> {/* Ícono de guardar */}
                {cargando ? 'Guardando...' : isUpdateMode ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          )}

        </form>
      </div>

      {/* Detalles de Producción */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center">
          Detalles de Producción
          <CgDetailsMore className="ml-2 text-blue-700" /> {/* Ícono en el título */}
        </h3>
        {selectedProduccion ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Fecha Producción
                <FaCalendarAlt className="ml-2 text-blue-700" /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{new Date(selectedProduccion.fechaProdu).toLocaleDateString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Cantidad Total Producción
                <AiFillProduct className="ml-2 text-blue-700" size={23} /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{selectedProduccion.cantidadTotalProduccion}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Stock Restante
                <HiBuildingStorefront className="ml-2 text-blue-700" size={23} /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{selectedProduccion.stockRestante}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Cajas Restantes
                <FaLayerGroup className="ml-2 text-blue-700" /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{selectedProduccion.cajasRestantes}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Cartones Restantes
                <BsFillLayersFill className="ml-2 text-blue-700" /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{selectedProduccion.cartonesRestantes}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                Huevos Sueltos Restantes
                <FaEgg className="ml-2 text-blue-700" /> {/* Ícono */}
              </h4>
              <p className="text-green-900">{selectedProduccion.huevosSueltosRestantes}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Seleccione una fecha de producción para ver los detalles.</p>
        )}
      </div>
    </div>
  );
};

export default ClasificacionForm;
