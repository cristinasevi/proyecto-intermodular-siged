import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const facturaId = searchParams.get("id");

    if (!facturaId) {
      return NextResponse.json(
        { error: "ID de factura no proporcionado" },
        { status: 400 }
      );
    }

    const [facturas] = await pool.query(
      `SELECT f.Ruta_pdf, f.Num_factura, p.Nombre as NombreProveedor, f.Fecha_emision 
       FROM Factura f
       JOIN Orden o ON f.idOrdenFK = o.idOrden
       JOIN Proveedor p ON o.id_ProveedorFK = p.idProveedor
       WHERE f.idFactura = ?`,
      [facturaId]
    );

    if (facturas.length === 0) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const factura = facturas[0];

    if (!factura.Ruta_pdf) {
      return NextResponse.json(
        { error: "No hay archivo PDF asociado a esta factura" },
        { status: 400 }
      );
    }

    let rutaRelativa = factura.Ruta_pdf;
    if (rutaRelativa.startsWith('/public/')) {
      rutaRelativa = rutaRelativa.substring(7);
    } else if (rutaRelativa.startsWith('public/')) {
      rutaRelativa = rutaRelativa.substring(6);
    } else if (rutaRelativa.startsWith('/')) {
      rutaRelativa = rutaRelativa.substring(1);
    }
    
    const rutaCompleta = path.join(process.cwd(), "public", rutaRelativa);
    
    console.log("Buscando archivo en:", rutaCompleta);

    if (!fs.existsSync(rutaCompleta)) {
      console.error(`Archivo no encontrado: ${rutaCompleta}`);
      return NextResponse.json(
        { 
          error: "El archivo PDF no se encuentra en el servidor",
          ruta_esperada: rutaCompleta,
          ruta_original: factura.Ruta_pdf
        },
        { status: 404 }
      );
    }

    try {
      const fileBuffer = fs.readFileSync(rutaCompleta);
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": fileBuffer.length.toString()
        },
      });
    } catch (fileError) {
      console.error("Error al leer el archivo:", fileError);
      return NextResponse.json(
        { error: "No se pudo leer el archivo PDF" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en la API de visualización de facturas:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud: " + error.message },
      { status: 500 }
    );
  }
}
