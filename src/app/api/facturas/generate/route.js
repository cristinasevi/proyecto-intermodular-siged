import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import path from "path";
import fs from "fs";

let jsPDF;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const facturaId = searchParams.get("id");

    if (!facturaId) {
      return NextResponse.json({ error: "ID de factura no proporcionado" }, { status: 400 });
    }

    if (!jsPDF) {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default;
    }

    const [facturas] = await pool.query(
      `SELECT 
        f.idFactura,
        f.Num_factura,
        f.Fecha_emision,
        f.Ruta_pdf,
        o.Num_orden,
        o.Importe,
        o.Descripcion,
        o.Cantidad,
        p.Nombre AS Proveedor,
        p.NIF,
        p.Direccion,
        p.Telefono,
        d.Nombre AS Departamento,
        e.Tipo AS Estado
      FROM Factura f
      JOIN Orden o ON f.idOrdenFK = o.idOrden
      JOIN Proveedor p ON o.id_ProveedorFK = p.idProveedor
      JOIN Departamento d ON o.id_DepartamentoFK = d.id_Departamento
      JOIN Estado e ON f.idEstadoFK = e.idEstado
      WHERE f.idFactura = ?`,
      [facturaId]
    );

    if (facturas.length === 0) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const factura = facturas[0];

    if (!factura.Ruta_pdf || factura.Ruta_pdf.trim() === '') {
      const año = new Date(factura.Fecha_emision || new Date()).getFullYear();
      const departamentoCodigo = factura.Departamento?.substring(0, 3).toLowerCase() || 'gen';
      const numeroLimpio = factura.Num_factura.toLowerCase().replace(/[^a-z0-9]/g, '');
      const rutaPdf = `/facturas/${año}/${departamentoCodigo}/fac-${numeroLimpio}.pdf`;

      await pool.query('UPDATE Factura SET Ruta_pdf = ? WHERE idFactura = ?', [rutaPdf, facturaId]);
      factura.Ruta_pdf = rutaPdf;
    }

    let rutaRelativa = factura.Ruta_pdf;
    if (rutaRelativa.startsWith('/')) rutaRelativa = rutaRelativa.substring(1);

    const rutaCompleta = path.join(process.cwd(), "public", rutaRelativa);
    const directorio = path.dirname(rutaCompleta);

    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
    }

    const success = await generateInvoicePDF(factura, rutaCompleta);

    if (!success) {
      return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "PDF generado correctamente",
      ruta: factura.Ruta_pdf,
      factura: factura.Num_factura
    });
  } catch (error) {
    console.error("Error en la API de generación de PDF:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud: " + error.message }, { status: 500 });
  }
}

async function generateInvoicePDF(facturaData, outputPath) {
  try {
    const doc = new jsPDF();

    // Cabecera
    doc.setFontSize(28);
    doc.setTextColor(30, 58, 138);
    doc.text('FACTURA', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Factura Nº: ${facturaData.Num_factura}`, 20, 45);
    doc.text(`Fecha: ${formatDate(facturaData.Fecha_emision)}`, 130, 45);

    doc.setFillColor(246, 246, 246);
    doc.setDrawColor(204, 204, 204);
    doc.rect(20, 55, 170, 25, 'FD');
    doc.setFontSize(11);
    doc.text('INFORMACIÓN DE LA FACTURA', 25, 67);
    doc.setFontSize(10);
    doc.text(`ID Factura: ${facturaData.idFactura}`, 25, 75);
    doc.text(`Departamento: ${facturaData.Departamento}`, 105, 75);

    // Proveedor
    doc.setFontSize(14);
    doc.text('Datos del Proveedor', 20, 95);
    doc.setFontSize(10);
    doc.text(`Proveedor: ${facturaData.Proveedor || 'Información no disponible'}`, 20, 110);
    doc.text(`NIF: ${facturaData.NIF || 'Información no disponible'}`, 20, 120);
    doc.text(`Dirección: ${facturaData.Direccion || 'Información no disponible'}`, 20, 130);
    doc.text(`Teléfono: ${facturaData.Telefono || 'Información no disponible'}`, 20, 140);

    // Tabla
    doc.setFontSize(14);
    doc.text('Descripción de la Orden de Compra', 20, 160);

    const tableY = 175;
    doc.setFillColor(30, 58, 138);
    doc.rect(20, tableY, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Descripción', 25, tableY + 7);
    doc.text('Cantidad', 85, tableY + 7);
    doc.text('Importe Unit.', 125, tableY + 7);
    doc.text('Importe Total', 165, tableY + 7);

    const cantidad = facturaData.Cantidad || 1;
    const importe = facturaData.Importe || 0;
    const importeUnitario = cantidad ? importe / cantidad : 0;

    doc.setFillColor(248, 249, 250);
    doc.rect(20, tableY + 10, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);

    let descripcion = facturaData.Descripcion || 'Orden de compra estándar';
    if (descripcion.length > 25) descripcion = descripcion.substring(0, 22) + '...';

    doc.text(descripcion, 25, tableY + 17);
    doc.text(cantidad.toString(), 85, tableY + 17);
    doc.text(`${importeUnitario.toFixed(2)}€`, 125, tableY + 17);
    doc.text(`${importe.toFixed(2)}€`, 165, tableY + 17);

    // Resumen económico
    doc.setFontSize(14);
    doc.text('Resumen Económico', 20, tableY + 40);

    const summaryY = tableY + 55;
    const iva = importe * 0.21;
    const total = importe + iva;

    doc.setFontSize(11);
    doc.text('Subtotal:', 130, summaryY);
    doc.text(`${importe.toFixed(2)}€`, 170, summaryY);
    doc.text('IVA (21%):', 130, summaryY + 10);
    doc.text(`${iva.toFixed(2)}€`, 170, summaryY + 10);
    doc.setDrawColor(204, 204, 204);
    doc.line(130, summaryY + 15, 190, summaryY + 15);
    doc.setFontSize(14);
    doc.setTextColor(224, 45, 57);
    doc.text('TOTAL:', 130, summaryY + 25);
    doc.text(`${total.toFixed(2)}€`, 170, summaryY + 25);

    // Estado
    if (facturaData.Estado) {
      const estadoColores = {
        'Contabilizada': [0, 128, 0],
        'Pendiente': [255, 165, 0]
      };
      const color = estadoColores[facturaData.Estado] || [255, 0, 0];
      doc.setTextColor(...color);
      doc.setFontSize(12);
      doc.text(`Estado: ${facturaData.Estado}`, 20, summaryY + 35);
    }

    // Pie de página
    doc.setTextColor(102, 102, 102);
    doc.setFontSize(9);
    doc.text('Esta factura fue generada automáticamente por el sistema de gestión.', 20, 270);
    doc.text('Sin el sello y la firma correspondiente, este documento carece de valor contable.', 20, 280);
    doc.setFontSize(8);
    doc.text(`Documento generado el: ${new Date().toLocaleString('es-ES')}`, 20, 285);
    doc.text('© 2026 Centro San Valero', 105, 290, { align: 'center' });

    const pdfBuffer = doc.output('arraybuffer');
    await fs.promises.writeFile(outputPath, Buffer.from(pdfBuffer));

    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    return false;
  }
}

function formatDate(dateString) {
  if (!dateString) return new Date().toLocaleDateString('es-ES');
  try {
    return new Date(dateString).toLocaleDateString('es-ES');
  } catch {
    return new Date().toLocaleDateString('es-ES');
  }
}
