import React, { useState, useEffect, useContext } from 'react';
import CorralForm from './CorralForm'; // Importa el formulario
import axiosInstance from '../axiosInstance.jsx';
import { AuthContext } from '../Context/AuthContext'; // Importa el AuthContext
import { FaEdit, FaWater, FaRulerVertical, FaRulerHorizontal, FaUtensils, FaTint, FaLayerGroup, FaArrowLeft, FaArrowRight, FaHome, FaCheck, FaPlus } from 'react-icons/fa';

const Corral = () => {
    const [corrales, setCorrales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState('asc');
    const [showForm, setShowForm] = useState(false);
    const [selectedCorral, setSelectedCorral] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lotes, setLotes] = useState([]);

    const { roles } = useContext(AuthContext); // Obtén los roles del usuario
    const isUser = roles.includes('User');
    const isAdmin = roles.includes('Admin');

    
    useEffect(() => {
        const fetchCorrales = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/getcorral');
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setCorrales(sortData(data));
            } catch (error) {
                console.error('Error fetching corrales:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLotes = async () => {
            try {
                const response = await axiosInstance.get('/api/lotes');
                setLotes(response.data);
            } catch (error) {
                console.error('Error fetching lotes:', error);
            }
        };

        fetchCorrales();
        fetchLotes();
    }, [sortOrder]);

    const sortData = (data) => {
        return data.sort((a, b) => {
            const numA = parseInt(a.numCorral, 10);
            const numB = parseInt(b.numCorral, 10);
            return sortOrder === 'asc' ? numA - numB : numB - numA;
        });
    };

    const isCorralInUse = (corralId) => {
        return lotes.some(lote => lote.idCorral === corralId && !lote.estadoBaja);
    };

    const formatBoolean = (value) => {
        return value ? 'Sí' : 'No';
    };

    const handleSortChange = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleUpdate = (corral) => {
        setSelectedCorral(corral);
        setIsEditing(true); // Modo edición
        setShowForm(true);
    };

    const handleAddNew = () => {
        setSelectedCorral(null);
        setIsEditing(false); // Modo creación
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedCorral(null);
        setIsEditing(false);
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        setSelectedCorral(null);
        setIsEditing(false);
        axiosInstance.get('/getcorral')
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setCorrales(sortData(data)); // Actualiza la lista de corrales
            })
            .catch(error => console.error('Error al refrescar los corrales:', error));
    };

    const handleStatusChange = async (corral, newState) => {
        const confirmChange = window.confirm(`¿Estás seguro de que deseas ${newState ? 'habilitar' : 'inhabilitar'} este corral?`);
        if (confirmChange) {
            try {
                await axiosInstance.put(`/updestadocorral?id=${corral.idCorral}`, {
                    estado: newState,
                });
                alert(`Corral ${newState ? 'habilitado' : 'inhabilitado'} exitosamente`);
                handleFormSubmit();
            } catch (error) {
                console.error(`Error al ${newState ? 'habilitar' : 'inhabilitar'} el corral:`, error.response?.data || error.message);
                alert(`Error al ${newState ? 'habilitar' : 'inhabilitar'} el corral`);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtra los corrales según el término de búsqueda
    const filteredCorrales = corrales.filter(corral =>
        corral.numCorral.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dividir corrales en activos e inhabilitados
    const activeCorrales = filteredCorrales.filter(corral => corral.estado);
    const inactiveCorrales = filteredCorrales.filter(corral => !corral.estado);

    // Cálculo de los elementos de la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = activeCorrales.slice(indexOfFirstItem, indexOfLastItem);

    // Cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 tracking-wider text-center sm:text-left">
                    <FaHome className="inline-block mb-2 text-blue-700 mr-2" />
                    Lista de Corrales
                </h2>

                {isAdmin && (
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 flex items-center transition-all duration-300"
                    >
                        <FaPlus className="mr-2" />
                        Agregar Nuevo Corral
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="px-4 py-2 w-full sm:max-w-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar corral"
                />
            </div>

            {showForm && (
                <CorralForm
                    isEditing={isEditing}
                    corralData={selectedCorral}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormClose}
                />
            )}


            <div className="w-full overflow-x-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Corrales Activos</h3>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden text-center">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                        <tr>
                            <th
                                className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700"
                                onClick={handleSortChange}
                            >
                                Corral {sortOrder === 'asc' ? '▲' : '▼'}
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaLayerGroup className="inline mr-2" />Capacidad</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerVertical className="inline mr-2" />Alto (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerHorizontal className="inline mr-2" />Ancho (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerHorizontal className="inline mr-2" />Largo (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaTint className="inline mr-2" />Agua</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaUtensils className="inline mr-2" />Comederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaWater className="inline mr-2" />Bebederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaCheck className="inline mr-2" />Ponederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="py-3 px-4 text-center">Cargando...</td>
                            </tr>
                        ) : currentItems.length ? (
                            currentItems.map((corral) => {
                                const inUse = isCorralInUse(corral.idCorral);
                                return (
                                    <tr
                                        key={corral.idCorral}
                                        className={`border-b border-gray-300 ${inUse ? 'bg-blue-50' : ''}`}
                                    >
                                        <td className="py-3 px-4">{corral.numCorral}</td>
                                        <td className="py-3 px-4">{corral.capacidad}</td>
                                        <td className="py-3 px-4">{corral.alto}</td>
                                        <td className="py-3 px-4">{corral.ancho}</td>
                                        <td className="py-3 px-4">{corral.largo}</td>
                                        <td className="py-3 px-4">{formatBoolean(corral.agua)}</td>
                                        <td className="py-3 px-4">{corral.comederos}</td>
                                        <td className="py-3 px-4">{corral.bebederos}</td>
                                        <td className="py-3 px-4">{corral.ponederos}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleUpdate(corral)}
                                                className="mr-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
                                            >
                                                <FaEdit className="mr-2" />
                                                Actualizar
                                            </button>
                                            <select
                                                onChange={(e) => handleStatusChange(corral, e.target.value === 'habilitar')}
                                                value={corral.estado ? 'habilitar' : 'inhabilitar'}
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-400 hover:to-red-500 transition-all duration-300"
                                                disabled={inUse}
                                            >
                                                <option value="habilitar">Habilitar</option>
                                                <option value="inhabilitar">Inhabilitar</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" className="py-3 px-4 text-center">No hay corrales disponibles.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="w-full overflow-x-auto mt-8">
                <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-wider">
                    <FaHome className="inline-block mb-2 text-blue-700" /> {/* Icono en el título */}
                    Corrales Inhabilitados
                </h3>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden text-center">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Corral</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaLayerGroup className="inline mr-2" />Capacidad</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerVertical className="inline mr-2" />Alto (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerHorizontal className="inline mr-2" />Ancho (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaRulerHorizontal className="inline mr-2" />Largo (m)</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaTint className="inline mr-2" />Agua</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaUtensils className="inline mr-2" />Comederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaWater className="inline mr-2" />Bebederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold"><FaCheck className="inline mr-2" />Ponederos</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {inactiveCorrales.length ? (
                            inactiveCorrales.map((corral) => (
                                <tr key={corral.idCorral} className="bg-white border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{corral.numCorral}</td>
                                    <td className="py-3 px-4">{corral.capacidad}</td>
                                    <td className="py-3 px-4">{corral.alto}</td>
                                    <td className="py-3 px-4">{corral.ancho}</td>
                                    <td className="py-3 px-4">{corral.largo}</td>
                                    <td className="py-3 px-4">{formatBoolean(corral.agua)}</td>
                                    <td className="py-3 px-4">{corral.comederos}</td>
                                    <td className="py-3 px-4">{corral.bebederos}</td>
                                    <td className="py-3 px-4">{corral.ponederos}</td>
                                    <td className="py-3 px-4">
                                        <select
                                            onChange={(e) => handleStatusChange(corral, e.target.value === 'habilitar')}
                                            value="inhabilitar"
                                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-400 hover:to-red-500 transition-all duration-300"
                                        >
                                            <option value="habilitar">Habilitar</option>
                                            <option value="inhabilitar" disabled>Inhabilitado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="py-4 text-center text-gray-500">
                                    No hay corrales inhabilitados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-6">
                {Array.from({ length: Math.ceil(activeCorrales.length / itemsPerPage) }, (_, index) => (
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

export default Corral;
