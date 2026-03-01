import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import { validateNIF, validateEmail } from "@/app/utils/validations";

// POST - Crear un nuevo proveedor
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.nif || !data.departamento) {
      return NextResponse.json({
        error: "Nombre, NIF y departamento son campos obligatorios"
      }, { status: 400 });
    }

    if (data.nombre.trim().length > 100) {
      return NextResponse.json({
        error: "El nombre es demasiado largo (máximo 100 caracteres)"
      }, { status: 400 });
    }

    const nifValidation = validateNIF(data.nif);
    if (!nifValidation.valid) {
      return NextResponse.json({ error: nifValidation.error }, { status: 400 });
    }

    let emailFormatted = null;
    if (data.email && data.email.trim().length > 0) {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.valid) {
        return NextResponse.json({ error: emailValidation.error }, { status: 400 });
      }
      emailFormatted = emailValidation.formatted || null;
    }

    if (data.direccion && data.direccion.length > 200) {
      return NextResponse.json({
        error: "La dirección es demasiado larga (máximo 200 caracteres)"
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [existingNIF] = await connection.query(
        'SELECT idProveedor FROM Proveedor WHERE NIF = ?',
        [nifValidation.formatted]
      );
      if (existingNIF.length > 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Ya existe un proveedor con este NIF/CIF" }, { status: 400 });
      }

      if (emailFormatted) {
        const [existingEmail] = await connection.query(
          'SELECT idProveedor FROM Proveedor WHERE Email = ?',
          [emailFormatted]
        );
        if (existingEmail.length > 0) {
          await connection.rollback();
          return NextResponse.json({ error: "Ya existe un proveedor con este email" }, { status: 400 });
        }
      }

      const [proveedorResult] = await connection.query(`
        INSERT INTO Proveedor (Nombre, NIF, Direccion, Telefono, Email, Fecha_alta)
        VALUES (?, ?, ?, ?, ?, CURDATE())
      `, [
        data.nombre.trim(),
        nifValidation.formatted,
        data.direccion?.trim() || null,
        data.telefono?.trim() || null,
        emailFormatted
      ]);

      const proveedorId = proveedorResult.insertId;

      const [departamentoResult] = await connection.query(
        'SELECT id_Departamento FROM Departamento WHERE Nombre = ?',
        [data.departamento]
      );
      if (departamentoResult.length === 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
      }

      await connection.query(`
        INSERT INTO Proveedor_Departamento (idProveedorFK, idDepartamentoFK, Propio, Fecha_vinculacion)
        VALUES (?, ?, 1, CURDATE())
      `, [proveedorId, departamentoResult[0].id_Departamento]);

      await connection.commit();

      return NextResponse.json({ id: proveedorId, message: "Proveedor creado correctamente" }, { status: 201 });

    } catch (error) {
      await connection.rollback();

      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        if (error.message.includes('NIF')) return NextResponse.json({ error: "Ya existe un proveedor con este NIF/CIF" }, { status: 400 });
        if (error.message.includes('Email')) return NextResponse.json({ error: "Ya existe un proveedor con este email" }, { status: 400 });
        return NextResponse.json({ error: "Ya existe un proveedor con esos datos" }, { status: 400 });
      }
      if (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406) {
        return NextResponse.json({ error: "Uno de los datos introducidos es demasiado largo para la base de datos" }, { status: 400 });
      }
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json({ error: "Error al crear proveedor: " + error.message }, { status: 500 });
  }
}

// DELETE - Eliminar proveedores seleccionados
export async function DELETE(request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de IDs de proveedores" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query('DELETE FROM Proveedor_Departamento WHERE idProveedorFK IN (?)', [ids]);
      const [result] = await connection.query('DELETE FROM Proveedor WHERE idProveedor IN (?)', [ids]);
      await connection.commit();

      return NextResponse.json({
        deletedCount: result.affectedRows,
        message: `${result.affectedRows} proveedor(es) eliminado(s) exitosamente`
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error al eliminar proveedores:", error);
    return NextResponse.json({ error: "Error al eliminar proveedores: " + error.message }, { status: 500 });
  }
}

// GET - Obtener todos los proveedores
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        p.idProveedor,
        p.Nombre,
        p.NIF,
        p.Direccion,
        p.Telefono,
        p.Email,
        d.Nombre AS Departamento
      FROM Proveedor p
      JOIN Proveedor_Departamento pd ON p.idProveedor = pd.idProveedorFK
      JOIN Departamento d ON pd.idDepartamentoFK = d.id_Departamento
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 });
  }
}
