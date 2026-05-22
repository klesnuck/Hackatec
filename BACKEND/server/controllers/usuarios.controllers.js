import { pool } from "../db.js";

export const getUsuario = async (req,res) => {
    try {
        console.log("Valor del email: ", req.body.email)
        const [result] = await pool.query("select id_usuario, nombre, apellido_paterno, apellido_materno, datos_faciales, id_departamento, id_rol from usuarios where email = ? and password = ?", [req.body.email,req.body.password]);

        if (result.length <= 0) {
            return res.status(400).json({message : "Usuario o Contraseña Incorrectos" });
        }

        res.json(result)
    } catch (error) {
    console.log("ERROR REAL EN LOGIN:", error);
    return res.status(500).json({ message: "Error de Conexion" });
}
    
}

 const existeEmail = async (email) => {
    console.log("Valor de email en funcion existeEmail", email);
    const [result] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[email]);
    console.log("Longitud de result: ",result.length)
    if (result.length > 0) {
        return true
    }
    return false
}

export const createUsuario = async (req,res) =>{
    try {
        const {nombre,email,password,apellido_paterno,apellido_materno} = req.body;

        const emailExiste = await existeEmail(email);

        if(emailExiste){
            console.log("va a regresar que el email Ya esiste", email);
            return res.status(400).json({message: "Ya existe el email"})
        }
        const [result] = await pool.query('INSERT INTO usuarios (nombre, email, password, idtipousuario, idestatus, apellido_paterno, apellido_materno) VALUES (?, ?, ?, 2, 1, ?, ?)',
  [nombre,email, password, apellido_paterno, apellido_materno]);

    res.json({ insertID: result.insertId });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error al registrar el Usuario"})
    }
}

export const getEmpleadosFaciales = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT
                id_usuario AS id,
                nombre,
                apellido_paterno,
                apellido_materno,
                datos_faciales AS descriptores_faciales,
                id_departamento,
                id_rol
            FROM usuarios
            WHERE datos_faciales IS NOT NULL
        `);

        res.json(result);
    } catch (error) {
        console.log("Error en getEmpleadosFaciales:", error);
        res.status(500).json({ message: "Error al obtener empleados" });
    }
};

export const createEmpleadoFacial = async (req, res) => {
    try {
        const { nombre, departamento, descriptores_faciales } = req.body;

        if (!nombre || !descriptores_faciales) {
            return res.status(400).json({ message: "Nombre y datos faciales son requeridos" });
        }

        const partesNombre = nombre.trim().split(/\s+/);
        const primerNombre = partesNombre[0] || "Empleado";
        const apellidoPaterno = partesNombre[1] || "SinApellido";
        const apellidoMaterno = partesNombre.slice(2).join(" ") || null;

        let idDepartamento = null;

        if (departamento) {
            const [departamentos] = await pool.query(
                "SELECT id_departamento FROM departamentos WHERE nombre_departamento = ?",
                [departamento]
            );

            if (departamentos.length > 0) {
                idDepartamento = departamentos[0].id_departamento;
            }
        }

        const email = `empleado_${Date.now()}@roocel.local`;
        const password = "";
        const idRolEmpleado = 2;

        const [result] = await pool.query(
            `
            INSERT INTO usuarios (
                nombre,
                apellido_paterno,
                apellido_materno,
                email,
                password,
                datos_faciales,
                id_departamento,
                id_rol
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                primerNombre,
                apellidoPaterno,
                apellidoMaterno,
                email,
                password,
                descriptores_faciales,
                idDepartamento,
                idRolEmpleado
            ]
        );

        res.status(201).json({
            status: "success",
            id: result.insertId,
            nombre: primerNombre
        });
    } catch (error) {
        console.log("Error en createEmpleadoFacial:", error);
        res.status(500).json({ message: "Error al registrar empleado" });
    }
};

