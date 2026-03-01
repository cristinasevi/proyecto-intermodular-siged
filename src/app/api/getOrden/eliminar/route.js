import { pool } from '@/app/api/lib/db'

export async function POST(req) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { success: false, error: "Se requiere un array de IDs" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const placeholders = ids.map(() => '?').join(',');

      await connection.query(`DELETE FROM Factura WHERE idOrdenFK IN (${placeholders})`, ids);
      await connection.query(`DELETE FROM Orden_Inversion WHERE idOrden IN (${placeholders})`, ids);
      await connection.query(`DELETE FROM Orden_Compra WHERE idOrden IN (${placeholders})`, ids);

      const [result] = await connection.query(
        `DELETE FROM Orden WHERE idOrden IN (${placeholders})`,
        ids
      );

      await connection.commit();

      return Response.json({
        success: true,
        deletedCount: result.affectedRows,
        message: `${result.affectedRows} orden(es) eliminada(s) correctamente`
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error("Error al eliminar órdenes:", err);
    return Response.json(
      { success: false, error: err.message || "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
