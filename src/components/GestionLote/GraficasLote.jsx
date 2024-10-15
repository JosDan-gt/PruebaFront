import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import { Line } from 'react-chartjs-2';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { FaDownload, FaArrowLeft, FaArrowRight } from 'react-icons/fa';


// Estilos mejorados para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        fontFamily: 'Helvetica',
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    footer: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    section: {
        marginBottom: 20,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#eaeaea',
    },
    title: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    table: {
        display: 'table',
        width: '100%',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '33%',
        padding: 5,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderColor: '#eaeaea',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableCol: {
        width: '33%',
        padding: 5,
        borderBottomWidth: 1,
        borderColor: '#eaeaea',
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 10,
    },
    image: {
        marginBottom: 10,
        marginTop: 10,
    }
});

const ITEMS_PER_PAGE = 5;


// Componente para el encabezado de página
const PDFHeader = ({ title }) => (
    <View>
        <Text style={styles.header}>{title}</Text>
    </View>
);

// Componente para el pie de página
const PDFFooter = () => (
    <View style={styles.footer}>
        <Text>© 2024 - Granja Ares - Registro Formal de Producción</Text>
    </View>
);

// Componente de PDF para Producción
const ProductionPDFDocument = ({ productionData, productionImage }) => (
    <Document>
        <Page style={styles.page}>
            <PDFHeader title="Registro de Producción" />
            <View style={styles.section}>
                <Text style={styles.title}>Producción General</Text>
                {productionImage && <Image src={productionImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Producción</Text>
                        <Text style={styles.tableColHeader}>Defectuosos</Text>
                    </View>
                    {productionData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.produccion}</Text>
                            <Text style={styles.tableCol}>{d.defectuosos}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <PDFFooter />
        </Page>
    </Document>
);

// Componente de PDF para Clasificación
const ClassificationPDFDocument = ({ classificationData, classificationImage }) => (
    <Document>
        <Page style={styles.page}>
            <PDFHeader title="Registro de Clasificación" />
            <View style={styles.section}>
                <Text style={styles.title}>Clasificación de Tamaños</Text>
                {classificationImage && <Image src={classificationImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Tamaño</Text>
                        <Text style={styles.tableColHeader}>Total Unitaria</Text>
                    </View>
                    {classificationData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.tamano}</Text>
                            <Text style={styles.tableCol}>{d.totalUnitaria}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <PDFFooter />
        </Page>
    </Document>
);

// Componente de PDF para Estado del Lote
const EstadoLotePDFDocument = ({ estadoLoteData, estadoLoteImage }) => (
    <Document>
        <Page style={styles.page}>
            <PDFHeader title="Registro de Estado del Lote" />
            <View style={styles.section}>
                <Text style={styles.title}>Estado de las Gallinas</Text>
                {estadoLoteImage && <Image src={estadoLoteImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Cantidad Gallinas</Text>
                        <Text style={styles.tableColHeader}>Bajas</Text>
                    </View>
                    {estadoLoteData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.cantidadG}</Text>
                            <Text style={styles.tableCol}>{d.bajas}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <PDFFooter />
        </Page>
    </Document>
);

// Componente de PDF combinado para todas las secciones
const CombinedPDFDocument = ({ productionData, classificationData, estadoLoteData, productionImage, classificationImage, estadoLoteImage }) => (
    <Document>
        <Page style={styles.page}>
            <PDFHeader title="Reporte General de Producción, Clasificación y Estado del Lote" />
            <View style={styles.section}>
                <Text style={styles.title}>Producción</Text>
                {productionImage && <Image src={productionImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Producción</Text>
                        <Text style={styles.tableColHeader}>Defectuosos</Text>
                    </View>
                    {productionData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.produccion}</Text>
                            <Text style={styles.tableCol}>{d.defectuosos}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Clasificación</Text>
                {classificationImage && <Image src={classificationImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Tamaño</Text>
                        <Text style={styles.tableColHeader}>Total Unitaria</Text>
                    </View>
                    {classificationData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.tamano}</Text>
                            <Text style={styles.tableCol}>{d.totalUnitaria}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Estado del Lote</Text>
                {estadoLoteImage && <Image src={estadoLoteImage} style={styles.image} />}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Fecha</Text>
                        <Text style={styles.tableColHeader}>Cantidad Gallinas</Text>
                        <Text style={styles.tableColHeader}>Bajas</Text>
                    </View>
                    {estadoLoteData.map((d, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{d.fechaRegistro}</Text>
                            <Text style={styles.tableCol}>{d.cantidadG}</Text>
                            <Text style={styles.tableCol}>{d.bajas}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <PDFFooter />
        </Page>
    </Document>
);

export { ProductionPDFDocument, ClassificationPDFDocument, EstadoLotePDFDocument, CombinedPDFDocument };


const GraficasLote = ({ idLote }) => {
    const [productionData, setProductionData] = useState([]);
    const [classificationData, setClassificationData] = useState([]);
    const [estadoLoteData, setEstadoLoteData] = useState([]);
    const [productionImage, setProductionImage] = useState(null);
    const [classificationImage, setClassificationImage] = useState(null);
    const [estadoLoteImage, setEstadoLoteImage] = useState(null);
    const [period, setPeriod] = useState('diario');

    const [currentPageProd, setCurrentPageProd] = useState(1);
    const [currentPageClass, setCurrentPageClass] = useState(1);
    const [currentPageEstado, setCurrentPageEstado] = useState(1);

    const productionChartRef = useRef(null);
    const classificationChartRef = useRef(null);
    const estadoLoteChartRef = useRef(null);

    useEffect(() => {
        if (idLote) {
            axiosInstance.get(`/api/dashboard/produccion/${idLote}/${period}`)
                .then(response => setProductionData(response.data))
                .catch(error => console.error('Error fetching production data:', error));

            axiosInstance.get(`/api/dashboard/clasificacion/${idLote}/${period}`)
                .then(response => setClassificationData(response.data))
                .catch(error => console.error('Error fetching classification data:', error));

            axiosInstance.get(`/getestadolote?idLote=${idLote}`)
                .then(response => setEstadoLoteData(response.data))
                .catch(error => console.error('Error fetching estado lote data:', error));
        }
    }, [idLote, period]);

    useEffect(() => {
        if (productionChartRef.current && productionData.length > 0) {
            // Añade un pequeño retraso para asegurarte de que la gráfica esté completamente renderizada
            setTimeout(() => {
                const productionImageBase64 = productionChartRef.current.toBase64Image();
                setProductionImage(productionImageBase64);
            }, 1000); // 500ms debería ser suficiente, ajusta si es necesario
        }
        if (classificationChartRef.current && classificationData.length > 0) {
            setTimeout(() => {
                const classificationImageBase64 = classificationChartRef.current.toBase64Image();
                setClassificationImage(classificationImageBase64);
            }, 1000);
        }
        if (estadoLoteChartRef.current && estadoLoteData.length > 0) {
            setTimeout(() => {
                const estadoLoteImageBase64 = estadoLoteChartRef.current.toBase64Image();
                setEstadoLoteImage(estadoLoteImageBase64);
            }, 1000);
        }
    }, [productionData, classificationData, estadoLoteData]);



    const productionChart = {
        labels: productionData.map(d => d.fechaRegistro),
        datasets: [
            {
                label: 'Producción',
                data: productionData.map(d => d.produccion),
                borderColor: 'rgba(107, 142, 35, 1)', // Verde oscuro
                backgroundColor: 'rgba(107, 142, 35, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Defectuosos',
                data: productionData.map(d => d.defectuosos),
                borderColor: 'rgba(139, 69, 19, 1)', // Marrón
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const processClassificationChartData = () => {
        const labels = [...new Set(classificationData.map(d => d.fechaRegistro))]; // Extraer etiquetas únicas para las fechas
        const tamanoGroups = ['Pigui', 'Pequeño', 'Mediano', 'Grande', 'Extra Grande'];

        const datasets = tamanoGroups.map(tamano => ({
            label: tamano,
            data: labels.map(label => {
                const data = classificationData.find(d => d.fechaRegistro === label && d.tamano === tamano);
                return data ? data.totalUnitaria : 0;  // Si no hay datos para una combinación, devuelve 0
            }),
            backgroundColor: tamano === 'Pigui' ? 'rgba(139, 69, 19, 0.2)' :
                tamano === 'Pequeño' ? 'rgba(85, 107, 47, 0.2)' :
                    tamano === 'Mediano' ? 'rgba(218, 165, 32, 0.2)' :
                        tamano === 'Grande' ? 'rgba(107, 142, 35, 0.2)' :
                            'rgba(154, 205, 50, 0.2)', // Extra Grande
            borderColor: tamano === 'Pigui' ? 'rgba(139, 69, 19, 1)' :
                tamano === 'Pequeño' ? 'rgba(85, 107, 47, 1)' :
                    tamano === 'Mediano' ? 'rgba(218, 165, 32, 1)' :
                        tamano === 'Grande' ? 'rgba(107, 142, 35, 1)' :
                            'rgba(154, 205, 50, 1)', // Extra Grande
            fill: true,
            tension: 0.4,
        }));

        return {
            labels,
            datasets,
        };
    };

    const classificationChart = processClassificationChartData();

    const estadoLoteChart = {
        labels: estadoLoteData.map(d => d.fechaRegistro),
        datasets: [
            {
                label: 'Cantidad de Gallinas',
                data: estadoLoteData.map(d => d.cantidadG),
                borderColor: 'rgba(107, 142, 35, 1)', // Verde oscuro
                backgroundColor: 'rgba(107, 142, 35, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Bajas',
                data: estadoLoteData.map(d => d.bajas),
                borderColor: 'rgba(139, 69, 19, 1)', // Marrón
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const handlePageClickProd = (pageNumber) => setCurrentPageProd(pageNumber);
    const handlePageClickClass = (pageNumber) => setCurrentPageClass(pageNumber);
    const handlePageClickEstado = (pageNumber) => setCurrentPageEstado(pageNumber);

    const paginatedProductionData = productionData.slice((currentPageProd - 1) * ITEMS_PER_PAGE, currentPageProd * ITEMS_PER_PAGE);
    const paginatedClassificationData = classificationData.slice((currentPageClass - 1) * ITEMS_PER_PAGE, currentPageClass * ITEMS_PER_PAGE);
    const paginatedEstadoLoteData = estadoLoteData.slice((currentPageEstado - 1) * ITEMS_PER_PAGE, currentPageEstado * ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center space-x-2 mb-6">
                <button
                    onClick={() => setPeriod('diario')}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition duration-200 flex items-center"
                >
                    Diario
                </button>
                <button
                    onClick={() => setPeriod('semanal')}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition duration-200 flex items-center"
                >
                    Semanal
                </button>
                <button
                    onClick={() => setPeriod('mensual')}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-500 hover:to-red-600 transition duration-200 flex items-center"
                >
                    Mensual
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica de Producción */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300">
                    <h2 className="text-lg font-bold mb-4 text-center text-yellow-800">Producción</h2>
                    <div className="w-full h-64">
                        <Line ref={productionChartRef} data={productionChart} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="flex justify-center mt-4">
                        <PDFDownloadLink
                            document={<ProductionPDFDocument productionData={productionData} productionImage={productionImage} />}
                            fileName="produccion.pdf"
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-500 hover:to-red-600 transition duration-200 flex items-center"
                            disabled={!productionImage}
                        >
                            {({ loading }) => (loading ? 'Generando PDF...' : <>
                                <FaDownload className="mr-2" /> Descargar PDF de Producción
                            </>)}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* Tabla de Producción */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-orange-300 mt-4">
                    <h2 className="text-lg font-bold mb-4 text-center text-orange-800">Producción Detallada</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-orange-100">
                                <tr>
                                    <th className="px-6 py-3 text-center">Fecha</th>
                                    <th className="px-6 py-3 text-center">Producción</th>
                                    <th className="px-6 py-3 text-center">Defectuosos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProductionData.map((d, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-orange-50">
                                        <td className="px-6 py-4 text-center">{d.fechaRegistro}</td>
                                        <td className="px-6 py-4 text-center">{d.produccion}</td>
                                        <td className="px-6 py-4 text-center">{d.defectuosos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => handlePageClickProd(currentPageProd - 1)}
                            disabled={currentPageProd === 1}
                            className="px-3 py-2 bg-yellow-700 text-white text-sm rounded-md hover:bg-yellow-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <span className="text-sm text-yellow-700">
                            Página {currentPageProd} de {Math.ceil(productionData.length / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => handlePageClickProd(currentPageProd + 1)}
                            disabled={currentPageProd * ITEMS_PER_PAGE >= productionData.length}
                            className="px-3 py-2 bg-yellow-700 text-white text-sm rounded-md hover:bg-yellow-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </div>

                {/* Gráfica de Clasificación */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-green-300">
                    <h2 className="text-lg font-bold mb-4 text-center text-green-800">Clasificación</h2>
                    <div className="w-full h-64">
                        <Line ref={classificationChartRef} data={classificationChart} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="flex justify-center mt-4">
                        <PDFDownloadLink
                            document={<ClassificationPDFDocument classificationData={classificationData} classificationImage={classificationImage} />}
                            fileName="clasificacion.pdf"
                            className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition duration-200 flex items-center"
                            disabled={!classificationImage}
                        >
                            {({ loading }) => (loading ? 'Generando PDF...' : <>
                                <FaDownload className="mr-2" /> Descargar PDF de Clasificación
                            </>)}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* Tabla de Clasificación */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-red-300 mt-4">
                    <h2 className="text-lg font-bold mb-4 text-center text-red-800">Clasificación Detallada</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-red-100">
                                <tr>
                                    <th className="px-6 py-3 text-center">Fecha</th>
                                    <th className="px-6 py-3 text-center">Tamaño</th>
                                    <th className="px-6 py-3 text-center">Total Unitaria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedClassificationData.map((d, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-red-50">
                                        <td className="px-6 py-4 text-center">{d.fechaRegistroP}</td>
                                        <td className="px-6 py-4 text-center">{d.tamano}</td>
                                        <td className="px-6 py-4 text-center">{d.totalUnitaria}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => handlePageClickClass(currentPageClass - 1)}
                            disabled={currentPageClass === 1}
                            className="px-3 py-2 bg-green-700 text-white text-sm rounded-md hover:bg-green-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <span className="text-sm text-green-700">
                            Página {currentPageClass} de {Math.ceil(classificationData.length / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => handlePageClickClass(currentPageClass + 1)}
                            disabled={currentPageClass * ITEMS_PER_PAGE >= classificationData.length}
                            className="px-3 py-2 bg-green-700 text-white text-sm rounded-md hover:bg-green-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </div>

                {/* Gráfica de Estado del Lote */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-brown-300">
                    <h2 className="text-lg font-bold mb-4 text-center text-brown-800">Estado del Lote</h2>
                    <div className="w-full h-64">
                        <Line ref={estadoLoteChartRef} data={estadoLoteChart} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="flex justify-center mt-4">
                        <PDFDownloadLink
                            document={<EstadoLotePDFDocument estadoLoteData={estadoLoteData} estadoLoteImage={estadoLoteImage} />}
                            fileName="estado_lote.pdf"
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-green-600 transition duration-200 flex items-center"
                            disabled={!estadoLoteImage}
                        >
                            {({ loading }) => (loading ? 'Generando PDF...' : <>
                                <FaDownload className="mr-2" /> Descargar PDF de Estado del Lote
                            </>)}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* Tabla de Estado del Lote */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mt-4">
                    <h2 className="text-lg font-bold mb-4 text-center text-yellow-800">Estado del Lote Detallado</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
                                <tr>
                                    <th className="px-6 py-3 text-center">Fecha</th>
                                    <th className="px-6 py-3 text-center">Cantidad Gallinas</th>
                                    <th className="px-6 py-3 text-center">Bajas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEstadoLoteData.map((d, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-yellow-50">
                                        <td className="px-6 py-4 text-center">{d.fechaRegistro}</td>
                                        <td className="px-6 py-4 text-center">{d.cantidadG}</td>
                                        <td className="px-6 py-4 text-center">{d.bajas}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => handlePageClickEstado(currentPageEstado - 1)}
                            disabled={currentPageEstado === 1}
                            className="px-3 py-2 bg-yellow-700 text-white text-sm rounded-md hover:bg-yellow-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <span className="text-sm text-yellow-700">
                            Página {currentPageEstado} de {Math.ceil(estadoLoteData.length / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => handlePageClickEstado(currentPageEstado + 1)}
                            disabled={currentPageEstado * ITEMS_PER_PAGE >= estadoLoteData.length}
                            className="px-3 py-2 bg-yellow-700 text-white text-sm rounded-md hover:bg-yellow-800 transition duration-300 disabled:opacity-50 flex items-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <PDFDownloadLink
                    document={
                        <CombinedPDFDocument
                            productionData={productionData}
                            classificationData={classificationData}
                            estadoLoteData={estadoLoteData}
                            productionImage={productionImage}
                            classificationImage={classificationImage}
                            estadoLoteImage={estadoLoteImage}
                        />
                    }
                    fileName="reporte_completo.pdf"
                    className="bg-gradient-to-r from-brown-600 to-brown-700 text-white px-4 py-2 rounded-lg hover:from-brown-500 hover:to-brown-600 transition duration-200 flex items-center"
                    disabled={!productionImage || !classificationImage || !estadoLoteImage}
                >
                    {({ loading }) => (loading ? 'Generando PDF...' : <>
                        <FaDownload className="mr-2" /> Descargar PDF Completo
                    </>)}
                </PDFDownloadLink>
            </div>
        </div>
    );

};

export default GraficasLote;
