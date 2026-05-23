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

export const getDashboardReporte = async (req, res) => {
  try {
    const [fechaRows] = await pool.query(`
      SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS fecha_actual
    `);

    const fechaActual = fechaRows[0].fecha_actual;
    let fechaInicio = req.query.fechaInicio || fechaActual;
    let fechaFin = req.query.fechaFin || fechaInicio;

    if (fechaInicio && !fechaFin) {
      fechaFin = fechaInicio;
    }

    if (fechaFin && !fechaInicio) {
      fechaInicio = fechaFin;
    }

    const [departamentos] = await pool.query(`
      SELECT id_departamento, nombre_departamento
      FROM departamentos
      ORDER BY nombre_departamento
    `);

    const [usuarios] = await pool.query(`
      SELECT
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.datos_faciales,
        u.id_departamento,
        u.id_rol,
        d.nombre_departamento AS departamento,
        ro.nombre_rol AS rol
      FROM usuarios u
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      LEFT JOIN rol ro ON u.id_rol = ro.id_rol
      ORDER BY d.nombre_departamento, u.nombre, u.apellido_paterno
    `);

    const obtenerFechas = (inicio, fin) => {
      const fechas = [];
      const actual = new Date(`${inicio}T00:00:00`);
      const limite = new Date(`${fin}T00:00:00`);

      while (actual <= limite) {
        fechas.push(actual.toISOString().slice(0, 10));
        actual.setDate(actual.getDate() + 1);
      }

      return fechas;
    };

    const obtenerRegistros = async (inicio, fin) => {
      const [registros] = await pool.query(
        `
        SELECT
          id_registro,
          id_usuario,
          DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
          tipo,
          TIME_FORMAT(hora, '%H:%i:%s') AS hora
        FROM registros
        WHERE fecha BETWEEN ? AND ?
        ORDER BY fecha, id_usuario, hora, id_registro
        `,
        [inicio, fin]
      );

      return registros;
    };

    const obtenerEmpleadosPorDia = async (inicio, fin) => {
      const fechas = obtenerFechas(inicio, fin);
      const registros = await obtenerRegistros(inicio, fin);
      const registrosPorUsuarioFecha = new Map();

      for (const registro of registros) {
        const key = `${registro.id_usuario}-${registro.fecha}`;

        if (!registrosPorUsuarioFecha.has(key)) {
          registrosPorUsuarioFecha.set(key, []);
        }

        registrosPorUsuarioFecha.get(key).push(registro);
      }

      return fechas.flatMap((fecha) =>
        usuarios.map((usuario) => {
          const key = `${usuario.id_usuario}-${fecha}`;
          const registrosDia = registrosPorUsuarioFecha.get(key) || [];
          const buscarHora = (tipo) =>
            registrosDia.find((registro) => registro.tipo === tipo)?.hora || null;
          const ultimo = registrosDia[registrosDia.length - 1] || null;

          return {
            ...usuario,
            fecha,
            datos_faciales: Boolean(usuario.datos_faciales),
            entrada: buscarHora("entrada"),
            salida_comida: buscarHora("salida_comida"),
            regreso_comida: buscarHora("regreso_comida"),
            salida: buscarHora("salida"),
            registros: registrosDia.length,
            tiene_registro: registrosDia.length > 0,
            tiene_entrada: registrosDia.some((registro) => registro.tipo === "entrada"),
            ultimo_tipo: ultimo?.tipo || null,
            ultima_hora: ultimo?.hora || null
          };
        })
      );
    };

    const empleadosActualEstado = await obtenerEmpleadosPorDia(fechaActual, fechaActual);
    const empleadosRangoEstado = await obtenerEmpleadosPorDia(fechaInicio, fechaFin);

    const empleadosEnPlanta = empleadosActualEstado.filter(
      (empleado) => empleado.tiene_registro
    ).length;

    const retardosHoy = empleadosActualEstado.filter((empleado) => {
      if (!empleado.entrada) return false;
      return empleado.entrada > "08:10:00";
    }).length;

    const faltasHoy = empleadosActualEstado.filter(
      (empleado) => !empleado.tiene_entrada
    ).length;

    res.json({
      fechaActual,
      fechaInicio,
      fechaFin,
      metricas: {
        empleadosEnPlanta,
        retardosHoy,
        faltasHoy
      },
      departamentos,
      empleadosActual: empleadosActualEstado,
      empleados: empleadosRangoEstado
    });
  } catch (error) {
    console.log("Error en getDashboardReporte:", error);
    res.status(500).json({ message: "Error al obtener dashboard" });
  }
};
