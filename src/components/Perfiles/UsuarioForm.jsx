import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance.jsx';
import { FaTimes, FaSave, FaBroom, FaEye, FaEyeSlash } from 'react-icons/fa';

const UsuarioForm = ({ usuarioData, isEditing, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        id: usuarioData?.id || '',
        nombreUser: usuarioData?.nombreUser || '',
        email: usuarioData?.email || '',
        contrasena: '',  // Inicializamos la contraseña vacía
        roleId: usuarioData?.roleId || 0,
    });

    const [roles, setRoles] = useState([]); // Estado para almacenar los roles
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // Estado para visualizar contraseña

    useEffect(() => {
        // Si estamos editando, llenamos el formulario con los datos del usuario
        if (usuarioData) {
            setFormData({
                id: usuarioData.id,
                nombreUser: usuarioData.nombreUser,
                email: usuarioData.email,
                contrasena: '',  // Inicializamos vacío al cargar datos existentes
                roleId: usuarioData.roleId || 0,
            });
        }

        // Función para obtener los roles del backend
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get('/api/usuarios/roles');
                setRoles(response.data);
            } catch (error) {
                console.error('Error al obtener los roles:', error);
            }
        };

        fetchRoles();
    }, [usuarioData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombreUser || formData.nombreUser.trim() === '') {
            newErrors.nombreUser = 'El nombre de usuario es obligatorio.';
        }
        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'El correo electrónico es obligatorio.';
        }
        if (!formData.roleId || formData.roleId <= 0) {
            newErrors.roleId = 'El rol es obligatorio.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const payload = {
                    nombreUser: formData.nombreUser,
                    email: formData.email,
                    roleId: parseInt(formData.roleId, 10),
                    ...(formData.contrasena && { contrasena: formData.contrasena }),  // Solo incluye la contraseña si está presente
                };

                console.log("Payload enviado:", payload);  // Verifica lo que se está enviando

                const url = isEditing ? `/api/usuarios/update/${formData.id}` : '/api/usuarios/register';
                const method = isEditing ? 'put' : 'post';

                await axiosInstance[method](url, payload);

                alert(`Usuario ${isEditing ? 'actualizado' : 'registrado'} exitosamente`);
                if (onSubmit) {
                    onSubmit();
                }
            } catch (error) {
                console.error('Error en la respuesta del servidor:', error.response?.data || error);
                alert(`Error al ${isEditing ? 'actualizar' : 'registrar'} el usuario. Intenta nuevamente.`);
            }
        }
    };




    const handleClear = () => {
        setFormData({
            id: '',
            nombreUser: '',
            email: '',
            contrasena: '',
            roleId: 0,
        });
        setErrors({});
    };

    // Alternar visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Nombre de Usuario</label>
                    <input
                        type="text"
                        name="nombreUser"
                        value={formData.nombreUser}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre de Usuario"
                    />
                    {errors.nombreUser && <p className="text-red-500 text-xs mt-2">{errors.nombreUser}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Correo Electrónico"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Contraseña"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-4 py-2"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Rol</label>
                    <select
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="0">Seleccionar Rol</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.nombre}</option>
                        ))}
                    </select>
                    {errors.roleId && <p className="text-red-500 text-xs mt-2">{errors.roleId}</p>}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                    type="button"
                    onClick={handleClear}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 flex items-center justify-center"
                >
                    <FaBroom className="mr-2" /> Limpiar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-400 hover:to-red-500 transition-all duration-300 flex items-center justify-center"
                >
                    <FaTimes className="mr-2" /> Cancelar
                </button>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                >
                    <FaSave className="mr-2" /> {isEditing ? 'Actualizar' : 'Registrar'}
                </button>
            </div>
        </form>
    );
};

export default UsuarioForm;
