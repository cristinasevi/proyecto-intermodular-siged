import { pool } from '@/app/api/lib/db';

export async function PUT(request, { params }) {
  try {
    const awaitedParams = await params;
    const ordenId = awaitedParams.id;
    const data = await request.json();

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
    } = data;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        `UPDATE Orden 
        SET Num_orden = ?, id_ProveedorFK = ?, id_DepartamentoFK = ?, id_UsuarioFK = ?,
            Importe = ?, Fecha = ?, Descripcion = ?, Inventariable = ?, Cantidad = ?, 
            id_EstadoOrdenFK = ?, Factura = ?
        WHERE idOrden = ?`,
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
          id_EstadoOrdenFK,
          data.Factura || 0,
          ordenId
        ]
      );

      await connection.query('DELETE FROM Orden_Inversion WHERE idOrden = ?', [ordenId]);
      await connection.query('DELETE FROM Orden_Compra WHERE idOrden = ?', [ordenId]);

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
          'INSERT INTO Orden_Inversion (idOrden, id_InversionFK, Num_inversion) VALUES (?, ?, ?)',
          [ordenId, bolsaInversion[0].idBolsa, parseInt(Num_inversion)]
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
          'INSERT INTO Orden_Compra (idOrden, id_PresupuestoFK) VALUES (?, ?)',
          [ordenId, bolsaPresupuesto[0].idBolsa]
        );
      }

      await connection.commit();

      return new Response(JSON.stringify({
        success: true,
        message: "Orden actualizada correctamente",
        updatedId: ordenId,
        isInversion: !!(Num_inversion && Num_inversion.toString().trim() !== ''),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error actualizando orden:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Error al actualizar la orden",
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
