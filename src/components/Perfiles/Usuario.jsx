import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import UsuarioForm from './UsuarioForm';
import { FaEdit, FaUserPlus, FaTimes, FaUser } from 'react-icons/fa';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/usuarios/users');
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleUpdate = (usuario) => {
    setSelectedUsuario(usuario); // Guardamos el usuario seleccionado
    setIsEditing(true); // Indicamos que estamos en modo edición
    setShowForm(true); // Mostramos el formulario
  };

  const handleAddNew = () => {
    setSelectedUsuario(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUsuario(null);
    setIsEditing(false);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedUsuario(null);
    setIsEditing(false);
    axiosInstance.get('/api/usuarios/users')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error('Error al refrescar los usuarios:', error));
  };

  const handleStatusChange = async (usuario, newState) => {
    const confirmChange = window.confirm(`¿Estás seguro de que deseas ${newState ? 'habilitar' : 'deshabilitar'} este usuario?`);
    if (confirmChange) {
      try {
        if (newState) {
          await axiosInstance.put(`/api/usuarios/enable/${usuario.id}`);
          alert('Usuario habilitado exitosamente');
        } else {
          await axiosInstance.put(`/api/usuarios/disable/${usuario.id}`);
          alert('Usuario deshabilitado exitosamente');
        }
        handleFormSubmit();
      } catch (error) {
        console.error(`Error al ${newState ? 'habilitar' : 'deshabilitar'} el usuario:`, error.response?.data || error.message);
        alert(`Error al ${newState ? 'habilitar' : 'deshabilitar'} el usuario`);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombreUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsuarios = filteredUsuarios.filter(usuario => usuario.estado);
  const inactiveUsuarios = filteredUsuarios.filter(usuario => !usuario.estado);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeUsuarios.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = ({ totalPages, currentPage, paginate }) => {
    const maxPageVisibles = 3
    const pageNumbers = [];

    const inicioPage = Math.max(1, currentPage - Math.floor(maxPageVisibles / 2));
    const finPage = Math.min(totalPages, inicioPage + maxPageVisibles - 1);

    for (let i = inicioPage; i <= finPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-wider text-center sm:text-left">
          <FaUser className="inline-block mb-2 text-blue-700 mr-2" />
          Lista de Usuarios
        </h2>

        <button
          onClick={() => setShowForm((prev) => !prev)} // Alterna entre mostrar/ocultar formulario
          className={`px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ${showForm
            ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            } flex items-center`}
        >
          {showForm ? (
            <>
              <FaTimes className="mr-2" /> Ocultar Formulario {/* Icono de cerrar */}
            </>
          ) : (
            <>
              <FaUserPlus className="mr-2" /> Agregar Nuevo Usuario {/* Icono de agregar */}
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 w-full sm:max-w-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Buscar usuario"
        />
      </div>

      {showForm && (
        <UsuarioForm
          usuarioData={selectedUsuario}  // Pasamos el usuario seleccionado al formulario
          isEditing={isEditing}          // Pasamos si estamos en modo edición
          onSubmit={handleFormSubmit}    // Actualiza la lista después de crear/editar
          onCancel={handleFormClose}     // Cierra el formulario sin guardar
        />
      )}

      {/* Tabla de usuarios activos */}
      <div className="w-full overflow-x-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Usuarios Activos</h3>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden text-center">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">Nombre de Usuario</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Correo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Rol</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-3 px-4 text-center">Cargando...</td>
              </tr>
            ) : currentItems.length ? (
              currentItems.map((usuario) => (
                <tr key={usuario.id} className="border-b border-gray-300">
                  <td className="py-3 px-4">{usuario.nombreUser}</td>
                  <td className="py-3 px-4">{usuario.email}</td>
                  <td className="py-3 px-4">{usuario.role}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleUpdate(usuario)} // Al hacer clic, pasamos el usuario al formulario
                      className="mr-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
                    >
                      <FaEdit className="mr-2" />
                      Actualizar
                    </button>
                    <select
                      onChange={(e) => handleStatusChange(usuario, e.target.value === 'habilitar')}
                      value={usuario.estado ? 'habilitar' : 'deshabilitar'}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-400 hover:to-red-500 transition-all duration-300"
                    >
                      <option value="habilitar">Habilitado</option>
                      <option value="deshabilitar">Deshabilitar</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-3 px-4 text-center">No hay usuarios activos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla de usuarios deshabilitados */}
      <div className="w-full overflow-x-auto mt-8">
        <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
          <FaUser className="inline-block mb-2 text-blue-700" />
          Usuarios Deshabilitados
        </h3>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden text-center">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">Nombre de Usuario</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Correo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Rol</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {inactiveUsuarios.length ? (
              inactiveUsuarios.map((usuario) => (
                <tr key={usuario.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{usuario.nombreUser}</td>
                  <td className="py-3 px-4">{usuario.email}</td>
                  <td className="py-3 px-4">{usuario.role}</td>
                  <td className="py-3 px-4">
                    <select
                      onChange={(e) => handleStatusChange(usuario, e.target.value === 'habilitar')}
                      value="deshabilitar"
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-400 hover:to-red-500 transition-all duration-300"
                    >
                      <option value="habilitar">Habilitar</option>
                      <option value="deshabilitar" disabled>Deshabilitado</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">No hay usuarios deshabilitados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center mt-6">
        {Array.from({ length: Math.ceil(activeUsuarios.length / itemsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-4 py-2 text-white font-semibold rounded-lg shadow-md ${currentPage === index + 1
              ? 'bg-blue-800'
              : 'bg-blue-600 hover:bg-blue-500 transition-all duration-300'
              }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

    </div>
  );
};

export default Usuarios;
