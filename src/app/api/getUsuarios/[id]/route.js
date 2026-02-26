import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";

// GET - Obtener un usuario específico
export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const userId = awaitedParams.id;

    const [rows] = await pool.query(`
      SELECT 
        u.idUsuario,
        u.DNI,
        u.Nombre,
        u.Apellidos,
        u.Telefono,
        u.Direccion,
        u.Email,
        u.id_RolFK,
        r.Tipo AS Rol,
        CASE
          WHEN r.Tipo = 'Administrador' THEN 'Admin'
          WHEN r.Tipo = 'Contable' THEN 'Contable'
          ELSE MAX(d.Nombre)
        END AS Departamento
      FROM Usuario u
      JOIN Rol r ON u.id_RolFK = r.idRol
      LEFT JOIN Permiso p ON u.idUsuario = p.id_UsuarioFK
      LEFT JOIN Departamento d ON p.id_DepFK = d.id_Departamento
      WHERE u.idUsuario = ?
      GROUP BY u.idUsuario, u.DNI, u.Nombre, u.Apellidos, u.Telefono, u.Direccion, u.Email, u.id_RolFK, r.Tipo
    `, [userId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

// PUT - Actualizar un usuario específico
export async function PUT(request, { params }) {
  let connection;
  
  try {
    const awaitedParams = await params;
    const userId = awaitedParams.id;
    const userData = await request.json();

    // Validar datos obligatorios
    const camposObligatorios = ['Nombre', 'Apellidos', 'Email', 'id_RolFK'];
    for (const campo of camposObligatorios) {
      if (!userData[campo]) {
        return NextResponse.json({ 
          error: `El campo ${campo} es obligatorio` 
        }, { status: 400 });
      }
    }

    connection = await pool.getConnection();

    // Verificar si el usuario existe
    const [userCheck] = await connection.query('SELECT idUsuario FROM Usuario WHERE idUsuario = ?', [userId]);
    if (userCheck.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar duplicados
    if (userData.DNI) {
      const [existingDNI] = await connection.query(
        'SELECT idUsuario FROM Usuario WHERE DNI = ? AND idUsuario != ?', 
        [userData.DNI, userId]
      );
      if (existingDNI.length > 0) {
        return NextResponse.json({ error: "Ya existe otro usuario con este DNI" }, { status: 400 });
      }
    }

    const [existingEmail] = await connection.query(
      'SELECT idUsuario FROM Usuario WHERE Email = ? AND idUsuario != ?', 
      [userData.Email, userId]
    );
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Ya existe otro usuario con este email" }, { status: 400 });
    }

    // Verificar que el rol existe
    const [rolCheck] = await connection.query('SELECT Tipo FROM Rol WHERE idRol = ?', [userData.id_RolFK]);
    if (rolCheck.length === 0) {
      return NextResponse.json({ error: "El rol especificado no existe" }, { status: 400 });
    }

    await connection.beginTransaction();

    try {
      // Actualizar la información del usuario
      let query = `
        UPDATE Usuario 
        SET Nombre = ?, Apellidos = ?, Telefono = ?, Direccion = ?, Email = ?, id_RolFK = ?
      `;

      let queryParams = [
        userData.Nombre,
        userData.Apellidos,
        userData.Telefono || null,
        userData.Direccion || null,
        userData.Email,
        userData.id_RolFK
      ];

      if (userData.DNI && userData.DNI.trim() !== '') {
        query = `
          UPDATE Usuario 
          SET DNI = ?, Nombre = ?, Apellidos = ?, Telefono = ?, Direccion = ?, Email = ?, id_RolFK = ?
        `;
        queryParams = [
          userData.DNI,
          userData.Nombre,
          userData.Apellidos,
          userData.Telefono || null,
          userData.Direccion || null,
          userData.Email,
          userData.id_RolFK
        ];
      }

      // Si se proporciona una contraseña, actualizarla
      if (userData.Contrasena && userData.Contrasena.trim() !== '') {
        if (userData.DNI && userData.DNI.trim() !== '') {
          query = `
            UPDATE Usuario 
            SET DNI = ?, Nombre = ?, Apellidos = ?, Telefono = ?, Direccion = ?, Email = ?, id_RolFK = ?, Contrasena = ?
          `;
          queryParams.push(userData.Contrasena);
        } else {
          query = `
            UPDATE Usuario 
            SET Nombre = ?, Apellidos = ?, Telefono = ?, Direccion = ?, Email = ?, id_RolFK = ?, Contrasena = ?
          `;
          queryParams.push(userData.Contrasena);
        }
      }

      query += ` WHERE idUsuario = ?`;
      queryParams.push(userId);

      await connection.query(query, queryParams);

      const rolTipo = rolCheck[0]?.Tipo;

      await connection.query('DELETE FROM Permiso WHERE id_UsuarioFK = ?', [userId]);

      if (rolTipo === 'Administrador') {
        // Admin tiene acceso a todos los departamentos
        const [depts] = await connection.query('SELECT id_Departamento FROM Departamento');

        for (const dept of depts) {
          await connection.query(`
            INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion)
            VALUES (?, ?, 1, 1, CURDATE())
          `, [userId, dept.id_Departamento]);
        }
      } else if (rolTipo === 'Contable') {
        // Contable puede ver todos los departamentos
        const [depts] = await connection.query('SELECT id_Departamento FROM Departamento');

        for (const dept of depts) {
          await connection.query(`
            INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion)
            VALUES (?, ?, 0, 1, CURDATE())
          `, [userId, dept.id_Departamento]);
        }
      } else if (rolTipo === 'Jefe de Departamento') {
        // Jefe tiene acceso solo a su departamento
        if (userData.Departamento) {
          const [deptResult] = await connection.query(
            'SELECT id_Departamento FROM Departamento WHERE Nombre = ?', 
            [userData.Departamento]
          );

          if (deptResult.length > 0) {
            await connection.query(`
              INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion)
              VALUES (?, ?, 1, 1, CURDATE())
            `, [userId, deptResult[0].id_Departamento]);
          }
        }
      }

      await connection.commit();

      return NextResponse.json({
        id: userId,
        message: "Usuario actualizado exitosamente"
      });

    } catch (transactionError) {
      await connection.rollback();
      console.error("Error en la transacción:", transactionError);
      throw transactionError;
    }

  } catch (error) {
    console.error("Error completo en PUT:", error);
    console.error("Stack trace:", error.stack);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error en rollback:", rollbackError);
      }
    }

    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('DNI')) {
        return NextResponse.json({ error: "Ya existe otro usuario con este DNI" }, { status: 400 });
      } else if (error.message.includes('Email')) {
        return NextResponse.json({ error: "Ya existe otro usuario con este email" }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Ya existe otro usuario con estos datos" }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: "Error interno: " + (error.message || "Error desconocido")
    }, { status: 500 });

  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error liberando conexión:", releaseError);
      }
    }
  }
}

// DELETE - Eliminar un usuario específico
export async function DELETE(request, { params }) {
  try {
    const awaitedParams = await params;
    const userId = awaitedParams.id;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query('DELETE FROM Permiso WHERE id_UsuarioFK = ?', [userId]);

      const [result] = await connection.query('DELETE FROM Usuario WHERE idUsuario = ?', [userId]);

      await connection.commit();

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Usuario eliminado exitosamente"
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error al eliminar usuario: " + error.message }, { status: 500 });
  }
}
