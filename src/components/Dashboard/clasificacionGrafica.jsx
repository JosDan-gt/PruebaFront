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
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // Importar plugin de zoom

// Registrar componentes y el plugin de zoom
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

const ClasificacionGrafica = ({ idLote, period }) => {
  const [classificationData, setClassificationData] = useState([]);
  const classificationChartRef = useRef(null);

  useEffect(() => {
    if (idLote) {
      axiosInstance
        .get(`/api/dashboard/clasificacion/${idLote}/${period}`)
        .then((response) => setClassificationData(response.data))
        .catch((error) =>
          console.error('Error fetching classification data:', error)
        );
    }
  }, [idLote, period]);

  const processClassificationChartData = () => {
    const labels = [...new Set(classificationData.map((d) => d.fechaRegistro))];
    const tamanoGroups = ['Pigui', 'Pequeño', 'Mediano', 'Grande', 'Extra Grande'];

    const datasets = tamanoGroups.map((tamano) => ({
      label: tamano,
      data: labels.map((label) => {
        const data = classificationData.find(
          (d) => d.fechaRegistro === label && d.tamano === tamano
        );
        return data ? data.totalUnitaria : 0;
      }),
      backgroundColor: getColorForTamano(tamano, true),
      borderColor: getColorForTamano(tamano),
      fill: true,
      tension: 0.4,
    }));

    return {
      labels,
      datasets,
    };
  };

  const getColorForTamano = (tamano, transparent = false) => {
    const colors = {
      Pigui: 'rgba(0, 123, 255, 1)',
      Pequeño: 'rgba(0, 200, 150, 1)',
      Mediano: 'rgba(255, 193, 7, 1)',
      Grande: 'rgba(40, 167, 69, 1)',
      'Extra Grande': 'rgba(220, 53, 69, 1)',
    };
    const color = colors[tamano] || 'rgba(108, 117, 125, 1)';
    return transparent ? color.replace('1)', '0.3)') : color;
  };

  const classificationChart = processClassificationChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que la gráfica se ajuste al contenedor
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Helvetica Neue', sans-serif",
            size: 12,
            color: '#333',
          },
          boxWidth: 10,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Clasificación (${period.charAt(0).toUpperCase() + period.slice(1)})`,
        font: {
          size: 18,
          family: "'Helvetica Neue', sans-serif",
          color: '#333',
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Habilitar arrastre solo en el eje X
        },
        zoom: {
          wheel: {
            enabled: true, // Habilitar zoom con rueda del mouse
          },
          pinch: {
            enabled: true, // Habilitar zoom táctil
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
          font: {
            size: 12,
            family: "'Helvetica Neue', sans-serif",
            color: '#333',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad',
          font: {
            size: 12,
            family: "'Helvetica Neue', sans-serif",
            color: '#333',
          },
        },
        grid: {
          color: 'rgba(108, 117, 125, 0.1)',
        },
      },
    },
  };

  // En el contenedor, asegúrate de que el height sea mayor
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-green-600">
      <h2 className="text-lg font-bold mb-4 text-center text-green-800">Clasificación</h2>
      <div className="w-full" style={{ height: '600px' }}> {/* Cambia el height como necesites */}
        <Line ref={classificationChartRef} data={classificationChart} options={options} />
      </div>
    </div>
  );

};

export default ClasificacionGrafica;
