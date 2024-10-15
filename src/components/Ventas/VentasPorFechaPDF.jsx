import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  tableHeader: { fontWeight: 'bold', marginBottom: 4 },
  tableRow: { flexDirection: 'row', marginBottom: 4 },
  tableCell: { flex: 1, fontSize: 10, textAlign: 'left' },
});

const VentasPorFechaPDF = ({ ventas, detallesVentas, clientes, productos, fechaInicio, fechaFin }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.section}>Reporte de Ventas por Fechas</Text>
        <Text style={styles.section}>
          Rango de Fechas: {fechaInicio ? fechaInicio.toLocaleDateString() : 'No especificado'} -{' '}
          {fechaFin ? fechaFin.toLocaleDateString() : 'No especificado'}
        </Text>
        <View>
          {ventas.map((venta) => (
            <View key={venta.ventaId} style={styles.section}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Fecha de Venta:</Text>
                <Text style={styles.tableCell}>
                  {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : 'Sin fecha'}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Cliente:</Text>
                <Text style={styles.tableCell}>
                  {clientes.find((cliente) => cliente.clienteId === venta.clienteId)?.nombreCliente || 'Desconocido'}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Total Venta:</Text>
                <Text style={styles.tableCell}>{venta.totalVenta}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Detalles:</Text>
              </View>
              {detallesVentas[venta.ventaId]?.map((detalle, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    Producto: {productos.find((prod) => prod.productoId === detalle.productoId)?.nombreProducto || 'Desconocido'}
                  </Text>
                  <Text style={styles.tableCell}>Cantidad: {detalle.cantidadVendida}</Text>
                  <Text style={styles.tableCell}>Precio: {detalle.precioUnitario}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default VentasPorFechaPDF;
