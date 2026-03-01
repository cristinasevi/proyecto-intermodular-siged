import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";

// GET - Obtener todos los usuarios con sus roles y permisos
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.idUsuario,
        u.DNI,
        u.Nombre,
        u.Apellidos,
        u.Telefono,
        u.Direccion,
        u.Email,
        r.Tipo AS Rol,
        CASE
          WHEN r.Tipo = 'Administrador' THEN 'Admin'
          WHEN r.Tipo = 'Contable' THEN 'Contable'
          ELSE MAX(d.Nombre)
        END AS Departamento,
        GROUP_CONCAT(
          CASE
            WHEN p.Puede_editar = 1 AND p.Puede_ver = 1 THEN 'ver y editar'
            WHEN p.Puede_ver = 1 THEN 'ver'
            ELSE 'sin permisos'
          END
          SEPARATOR ', '
        ) AS Permisos
      FROM Usuario u
      JOIN Rol r ON u.id_RolFK = r.idRol
      LEFT JOIN Permiso p ON u.idUsuario = p.id_UsuarioFK
      LEFT JOIN Departamento d ON p.id_DepFK = d.id_Departamento
      GROUP BY u.idUsuario, u.DNI, u.Nombre, u.Apellidos, u.Telefono, u.Direccion, u.Email, r.Tipo
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

// POST - Crear un nuevo usuario
export async function POST(request) {
  let connection;
  
  try {
    const userData = await request.json();
    
    // Validar datos obligatorios
    const camposObligatorios = ['DNI', 'Nombre', 'Apellidos', 'Email', 'id_RolFK'];
    for (const campo of camposObligatorios) {
      if (!userData[campo]) {
        return NextResponse.json({ 
          error: `El campo ${campo} es obligatorio` 
        }, { status: 400 });
      }
    }
    
    connection = await pool.getConnection();
    
    // Verificar duplicados
    const [existingDNI] = await connection.query('SELECT idUsuario FROM Usuario WHERE DNI = ?', [userData.DNI]);
    if (existingDNI.length > 0) {
      return NextResponse.json({ error: "Ya existe un usuario con este DNI" }, { status: 400 });
    }
    
    const [existingEmail] = await connection.query('SELECT idUsuario FROM Usuario WHERE Email = ?', [userData.Email]);
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 });
    }
    
    // Verificar que el rol existe
    const [rolCheck] = await connection.query('SELECT Tipo FROM Rol WHERE idRol = ?', [userData.id_RolFK]);
    if (rolCheck.length === 0) {
      return NextResponse.json({ error: "El rol especificado no existe" }, { status: 400 });
    }

    await connection.beginTransaction();
    
    await connection.beginTransaction();

    try {
      const insertData = {
        DNI: userData.DNI,
        Nombre: userData.Nombre,
        Apellidos: userData.Apellidos,
        Email: userData.Email,
        id_RolFK: userData.id_RolFK,
        Telefono: userData.Telefono || null,
        Direccion: userData.Direccion || null
      };
      
      if (userData.Contrasena && userData.Contrasena.trim() !== '') {
        insertData.Contrasena = userData.Contrasena;
      }
      
      const campos = Object.keys(insertData);
      const valores = Object.values(insertData);
      const placeholders = campos.map(() => '?').join(', ');
      
      const [result] = await connection.query(
        `INSERT INTO Usuario (${campos.join(', ')}) VALUES (${placeholders})`,
        valores
      );
      const userId = result.insertId;
      const rolTipo = rolCheck[0].Tipo;

      // Asignar permisos según el rol
      if (rolTipo === 'Administrador') {
        const [depts] = await connection.query('SELECT id_Departamento FROM Departamento');
        for (const dept of depts) {
          await connection.query(
            `INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion) VALUES (?, ?, 1, 1, CURDATE())`,
            [userId, dept.id_Departamento]
          );
        }
      } else if (rolTipo === 'Contable') {
        const [depts] = await connection.query('SELECT id_Departamento FROM Departamento');
        for (const dept of depts) {
          await connection.query(
            `INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion) VALUES (?, ?, 0, 1, CURDATE())`,
            [userId, dept.id_Departamento]
          );
        }
      } else if (rolTipo === 'Jefe de Departamento' && userData.Departamento) {
        const [deptResult] = await connection.query(
          'SELECT id_Departamento FROM Departamento WHERE Nombre = ?',
          [userData.Departamento]
        );
        if (deptResult.length > 0) {
          await connection.query(
            `INSERT INTO Permiso (id_UsuarioFK, id_DepFK, Puede_editar, Puede_ver, Fecha_asignacion) VALUES (?, ?, 1, 1, CURDATE())`,
            [userId, deptResult[0].id_Departamento]
          );
        }
      }

      await connection.commit();
      
      return NextResponse.json({ id: userId, message: "Usuario creado exitosamente" });

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    console.error("Error en POST usuarios:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('DNI')) {
        return NextResponse.json({ error: "Ya existe un usuario con este DNI" }, { status: 400 });
      } else if (error.message.includes('Email')) {
        return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 });
      }
      return NextResponse.json({ error: "Ya existe un usuario con estos datos" }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Error interno: " + (error.message || "Error desconocido")
    }, { status: 500 });
    
  } finally {
    if (connection) connection.release();
  }
}

// DELETE - Eliminar uno o varios usuarios
export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de IDs de usuarios" }, { status: 400 });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query('DELETE FROM Permiso WHERE id_UsuarioFK IN (?)', [ids]);
      const [result] = await connection.query('DELETE FROM Usuario WHERE idUsuario IN (?)', [ids]);
      await connection.commit();
      
      return NextResponse.json({ 
        deletedCount: result.affectedRows,
        message: `${result.affectedRows} usuario(s) eliminado(s) exitosamente` 
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
    return NextResponse.json({ error: "Error al eliminar usuarios: " + error.message }, { status: 500 });
  }
}
