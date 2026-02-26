import { pool } from '@/app/api/lib/db'

export async function POST(req) {
  try {
    const data = await req.json()

    const {
      Num_orden,
      Importe,
      Fecha,
      Descripcion,
      Inventariable,
      Cantidad,
      id_DepartamentoFK,
      id_ProveedorFK,
      id_UsuarioFK,
      id_EstadoOrdenFK,
      Num_inversion,
    } = data

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [ordenResult] = await connection.query(
        `INSERT INTO Orden (
          Num_orden, id_ProveedorFK, id_DepartamentoFK, id_UsuarioFK,
          Importe, Fecha, Descripcion, Inventariable, Cantidad, id_EstadoOrdenFK, Factura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Num_orden,
          id_ProveedorFK,
          id_DepartamentoFK,
          id_UsuarioFK,
          Importe,
          Fecha,
          Descripcion,
          Inventariable,
          Cantidad,
          id_EstadoOrdenFK || 1,
          data.Factura || 0
        ]
      )

      const idOrdenNuevo = ordenResult.insertId;

      if (Num_inversion && Num_inversion.toString().trim() !== '') {
        const [bolsaInversion] = await connection.query(`
          SELECT bi.idBolsa 
          FROM Bolsa_Inversion bi 
          JOIN Bolsa b ON bi.id_BolsaFK = b.id_Bolsa 
          WHERE b.id_DepartamentoFK = ?
        `, [id_DepartamentoFK]);

        if (bolsaInversion.length === 0) {
          throw new Error(`No se encontró bolsa de inversión para el departamento ${id_DepartamentoFK}`);
        }

        await connection.query(
          `INSERT INTO Orden_Inversion (idOrden, id_InversionFK, Num_inversion) VALUES (?, ?, ?)`,
          [idOrdenNuevo, bolsaInversion[0].idBolsa, parseInt(Num_inversion)]
        );
      } else {
        const [bolsaPresupuesto] = await connection.query(`
          SELECT bp.idBolsa 
          FROM Bolsa_Presupuesto bp 
          JOIN Bolsa b ON bp.id_BolsaFK = b.id_Bolsa 
          WHERE b.id_DepartamentoFK = ?
        `, [id_DepartamentoFK]);

        if (bolsaPresupuesto.length === 0) {
          throw new Error(`No se encontró bolsa de presupuesto para el departamento ${id_DepartamentoFK}`);
        }

        await connection.query(
          `INSERT INTO Orden_Compra (idOrden, id_PresupuestoFK) VALUES (?, ?)`,
          [idOrdenNuevo, bolsaPresupuesto[0].idBolsa]
        );
      }

      await connection.commit();

      return Response.json({
        success: true,
        insertedId: idOrdenNuevo,
        isInversion: !!(Num_inversion && Num_inversion.toString().trim() !== ''),
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error("Error al crear orden:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Error al crear la orden"
    }), { status: 500 });
  }
}
