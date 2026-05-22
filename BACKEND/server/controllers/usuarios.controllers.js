import e from "cors";
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

