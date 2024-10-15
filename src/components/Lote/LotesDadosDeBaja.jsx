import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { FaArrowUp, FaBoxOpen, FaSpinner } from 'react-icons/fa';
import { IoIosAlert } from "react-icons/io";

const LotesDadosDeBaja = ({ reloadFlag, triggerReload }) => {
    const [lotesDadosDeBaja, setLotesDadosDeBaja] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Unificado el estado de carga
    const navigate = useNavigate();
    const { roles } = useContext(AuthContext);
    const isAdmin = roles.includes('Admin');
    const isUser = roles.includes('User');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true); // Mostrar el spinner
                const response = await axiosInstance.get('/api/lotes?dadosDeBaja=true');
                setLotesDadosDeBaja(response.data || []);
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error.message);
            } finally {
                setIsLoading(false); // Ocultar el spinner
            }
        };

        fetchData();
    }, [reloadFlag]);

    const handleSelectionChange = (idLote, value) => {
        const selectedLote = lotesDadosDeBaja.find(lote => lote.idLote === idLote);

        if (!selectedLote) {
            alert('Lote no encontrado. Por favor, selecciona un lote válido.');
            return;
        }

        navigate(`/${value}/${idLote}`, { state: { estadoBaja: selectedLote.estadoBaja } });
    };

    const handleDarDeAlta = async (idLote) => {
        if (window.confirm("¿Estás seguro de que deseas dar de alta este lote?")) {
            try {
                await axiosInstance.put(`/api/lotes/putLoteBaja?idLote=${idLote}`, { estadoBaja: false });
                setLotesDadosDeBaja(lotesDadosDeBaja.filter(lote => lote.idLote !== idLote));
                alert('Lote dado de alta correctamente');
                triggerReload();
            } catch (error) {
                console.error('Error al dar de alta el lote:', error);
                alert('Error al dar de alta el lote');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-red-500 text-6xl" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gradient-to-r from-red-100 to-gray-200 shadow-lg rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
                <h2 className="text-4xl font-extrabold tracking-wider text-red-800">Lotes Dados de Baja</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lotesDadosDeBaja.map((lote) => (
                    <div
                        key={lote.idLote}
                        className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-extrabold text-red-800">{lote.numLote}</h3>
                            <IoIosAlert className="text-red-600 text-3xl" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                                <p className="text-sm font-semibold text-gray-700">Cantidad</p>
                                <p className="text-lg font-bold text-gray-600">{lote.cantidadG}</p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                                <p className="text-sm font-semibold text-gray-700">Fecha de Adquisición</p>
                                <p className="text-lg font-bold text-gray-600">
                                    {new Date(lote.fechaAdq).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-gray-800 mt-6">Acciones</label>
                        <select
                            value=""
                            onChange={(e) => handleSelectionChange(lote.idLote, e.target.value)}
                            className="w-full mt-2 border-gray-300 rounded-lg shadow-md focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            {(isAdmin || isUser) && <option value="produccionG">Producción</option>}
                            {isAdmin && <option value="clasificacion">Clasificación</option>}
                            {isAdmin && <option value="estado">Estado</option>}
                        </select>

                        {isAdmin && (
                            <div className="flex flex-col mt-6 space-y-3">
                                <button
                                    onClick={() => handleDarDeAlta(lote.idLote)}
                                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition"
                                >
                                    <FaArrowUp /> <span>Dar de Alta</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LotesDadosDeBaja;
