import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../axiosInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  Interaction
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // Importar plugin de zoom

// Registrar componentes y plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  zoomPlugin
);

const ProduccionGrafica = ({ idLote, period }) => {
  const [productionData, setProductionData] = useState([]);
  const productionChartRef = useRef(null);

  useEffect(() => {
    if (idLote) {
      axiosInstance
        .get(`/api/dashboard/produccion/${idLote}/${period}`)
        .then((response) => setProductionData(response.data))
        .catch((error) =>
          console.error('Error fetching production data:', error)
        );
    }
  }, [idLote, period]);

  const productionChart = {
    labels: productionData.map((d) => d.fechaRegistro),
    datasets: [
      {
        label: 'Producción',
        data: productionData.map((d) => d.produccion),
        borderColor: 'rgba(0, 123, 255, 1)',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: false,
        tension: 0,
      },
      {
        label: 'Defectuosos',
        data: productionData.map((d) => d.defectuosos),
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        fill: false,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `Producción y Defectuosos (${period.charAt(0).toUpperCase() + period.slice(1)})`,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Permitir paneo solo en el eje X
        },
        zoom: {
          wheel: {
            enabled: true, // Zoom con la rueda del mouse
          },
          pinch: {
            enabled: true, // Zoom con gestos táctiles
          },
          mode: 'x', // Zoom en el eje X
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Fecha',
        },
        ticks: {
          maxTicksLimit: 10, // Limitar la cantidad de ticks visibles en el eje X
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad',
        },
        grid: {
          color: 'rgba(108, 117, 125, 0.1)',
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-green-600">
      <h2 className="text-lg font-bold mb-4 text-center text-green-800">Producción</h2>
      <div className="w-full h-64">
        <Line ref={productionChartRef} data={productionChart} options={options} />
      </div>
    </div>
  );
};

export default ProduccionGrafica;
