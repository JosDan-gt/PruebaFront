import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '20%',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
  },
  tableCell: {
    fontSize: 10,
  },
});

// Documento PDF para Ventas por Cliente
const VentasPorClientePDF = ({ ventas, detallesVentas, clientes, productos }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Reporte de Ventas por Cliente</Text>
      
      {clientes.map((cliente, index) => {
        const ventasCliente = ventas.filter(v => v.clienteId === cliente.clienteId);

        return ventasCliente.length > 0 ? (
          <View key={index} style={styles.section}>
            <Text>Cliente: {cliente.nombreCliente}</Text>
            {ventasCliente.map((venta, ventaIndex) => {
              const detalles = detallesVentas[venta.ventaId] || [];

              return (
                <View key={ventaIndex}>
                  <Text>Fecha de Venta: {new Date(venta.fechaVenta).toLocaleDateString()}</Text>
                  <Text>Total Venta: Q{venta.totalVenta}</Text>

                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCol, styles.tableCell]}>Producto</Text>
                      <Text style={[styles.tableCol, styles.tableCell]}>Tipo Empaque</Text>
                      <Text style={[styles.tableCol, styles.tableCell]}>Tamaño Huevo</Text>
                      <Text style={[styles.tableCol, styles.tableCell]}>Cantidad</Text>
                      <Text style={[styles.tableCol, styles.tableCell]}>Total</Text>
                    </View>
                    {detalles.map((detalle, detalleIndex) => {
                      const producto = productos.find(p => p.productoId === detalle.productoId);
                      return (
                        <View key={detalleIndex} style={styles.tableRow}>
                          <Text style={[styles.tableCol, styles.tableCell]}>{producto ? producto.nombreProducto : 'Desconocido'}</Text>
                          <Text style={[styles.tableCol, styles.tableCell]}>{detalle.tipoEmpaque}</Text>
                          <Text style={[styles.tableCol, styles.tableCell]}>{detalle.tamanoHuevo}</Text>
                          <Text style={[styles.tableCol, styles.tableCell]}>{detalle.cantidadVendida}</Text>
                          <Text style={[styles.tableCol, styles.tableCell]}>Q{detalle.total}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null;
      })}
    </Page>
  </Document>
);

export default VentasPorClientePDF;
