import { pool } from "../db.js";

const tiposRegistro = ["entrada", "salida_comida", "regreso_comida", "salida"];

export const getRegistros = async (req, res) => {
  try {
    const {
      empleado,
      fecha,
      fechaInicio,
      fechaFin,
      departamento,
      rol,
      tipo
    } = req.query;

    let sql = `
      SELECT 
        r.id_registro,
        r.fecha,
        r.hora,
        r.tipo,
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        d.id_departamento,
        d.nombre_departamento,
        ro.id_rol,
        ro.nombre_rol
      FROM registros r
      INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      LEFT JOIN rol ro ON u.id_rol = ro.id_rol
      WHERE 1 = 1
    `;

    const params = [];

    if (empleado) {
      sql += " AND u.id_usuario = ?";
      params.push(empleado);
    }

    if (fecha) {
      sql += " AND r.fecha = ?";
      params.push(fecha);
    }

    if (fechaInicio && fechaFin) {
      sql += " AND r.fecha BETWEEN ? AND ?";
      params.push(fechaInicio, fechaFin);
    }

    if (departamento) {
      sql += " AND d.id_departamento = ?";
      params.push(departamento);
    }

    if (rol) {
      sql += " AND ro.id_rol = ?";
      params.push(rol);
    }

    if (tipo) {
      sql += " AND r.tipo = ?";
      params.push(tipo);
    }

    sql += " ORDER BY r.fecha DESC, r.hora DESC";

    const [result] = await pool.query(sql, params);

    res.json(result);
  } catch (error) {
    console.log("Error en getRegistros:", error);
    res.status(500).json({ message: "Error al obtener registros" });
  }
};

export const createAsistencia = async (req, res) => {
  try {
    const idUsuario = req.body.id_usuario || req.body.empleadoId;

    if (!idUsuario) {
      return res.status(400).json({ message: "id_usuario es requerido" });
    }

    const [usuarios] = await pool.query(
      `
      SELECT id_usuario, nombre, apellido_paterno
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [idUsuario]
    );

    if (usuarios.length <= 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const [registrosHoy] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM registros
      WHERE id_usuario = ?
        AND fecha = CURDATE()
      `,
      [idUsuario]
    );

    const total = registrosHoy[0].total;

    if (total >= tiposRegistro.length) {
      return res.status(400).json({
        message: "El empleado ya completó sus registros del día"
      });
    }

    const tipo = tiposRegistro[total];

    const [result] = await pool.query(
      `
      INSERT INTO registros (id_usuario, fecha, hora, tipo)
      VALUES (?, CURDATE(), CURTIME(), ?)
      `,
      [idUsuario, tipo]
    );

    res.status(201).json({
      status: "success",
      message: "Asistencia registrada correctamente",
      id_registro: result.insertId,
      id_usuario: Number(idUsuario),
      nombre: usuarios[0].nombre,
      tipo
    });
  } catch (error) {
    console.log("Error en createAsistencia:", error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};
