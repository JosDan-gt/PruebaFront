import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'; // Importar íconos

const LoteSelector = ({ onSelectLote }) => {
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState('');
  const [dadosDeBaja, setDadosDeBaja] = useState(false); // Para manejar el estado de lotes dados de baja o no

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axiosInstance.get(`/api/lotes?dadosDeBaja=${dadosDeBaja}`);
        console.log(response.data); // Revisa la estructura de los datos

        
        // Verificar que el campo estado esté presente y sea diferente de 0
        const filteredLotes = response.data.filter(lote => {
          // Asegurarse de que lote.estado sea distinto de 0
          return lote.estado !== false;
        });

        setLotes(filteredLotes);
        if (filteredLotes.length > 0) {
          const firstLote = filteredLotes[0].idLote;
          setSelectedLote(firstLote); // Establece el primer lote en el estado
          onSelectLote(firstLote); // Selecciona el primer lote automáticamente
        } else {
          setSelectedLote(''); // No selecciona ningún lote si no hay disponibles
          onSelectLote(''); // No selecciona ningún lote si no hay disponibles
        }
      } catch (error) {
        console.error('Error fetching lotes:', error);
      }
    };

    fetchLotes();
  }, [dadosDeBaja, onSelectLote]);

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedLote(selectedValue);
    onSelectLote(selectedValue);
  };

  const toggleLotes = () => {
    setDadosDeBaja(prevState => !prevState); // Cambia entre lotes activos y dados de baja
  };

  return (
    <div className="mb-8 flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 shadow-xl rounded-xl">
      <div className="w-full md:w-1/2">
        <label htmlFor="loteSelect" className="block text-3xl font-extrabold text-blue-700 text-center mb-4">Selecciona un Lote</label>
        <select 
          id="loteSelect" 
          value={selectedLote}
          onChange={handleSelectChange} 
          className="mt-1 block w-full px-4 py-3 text-base border border-blue-500 bg-yellow-100 text-yellow-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-md transition duration-300"
        >
          <option value="">Seleccione un Lote...</option>
          {lotes.map(lote => (
            <option key={lote.idLote} value={lote.idLote}>
              {lote.numLote}
            </option>
          ))}
        </select>
      </div>
      <button 
        onClick={toggleLotes} 
        className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-full shadow-lg hover:from-green-500 hover:to-green-600 transition-all duration-300 flex items-center space-x-2"
      >
        {dadosDeBaja ? <FaArrowUp className="mr-2" /> : <FaArrowDown className="mr-2" />}
        {dadosDeBaja ? 'Mostrar Activos' : 'Mostrar Dados de Baja'}
      </button>
    </div>
  );
};

export default LoteSelector;
