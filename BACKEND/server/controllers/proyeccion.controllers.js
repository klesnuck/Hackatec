import { pool } from "../db.js";

export const getProyecciones = async (req, res) => {
    try {
        const [proyecciones] = await pool.query(`
             SELECT 
                p.idproyeccion,
                p.idpelicula,
                DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha,
                TIME_FORMAT(p.hora, '%H:%i') AS hora,
                pel.titulo AS titulo,
                s.idsala AS idsala,
                t.nombre AS tipo
            FROM proyeccion p
            INNER JOIN pelicula pel ON p.idpelicula = pel.idpelicula
            INNER JOIN sala s ON p.idsala = s.idsala
            INNER JOIN tipo_sala t ON s.id_tipo_sala = t.id_tipo_sala
           ORDER BY p.idproyeccion DESC
        `);



        if (proyecciones.length === 0) {
            return res.status(404).json({ message: 'No hay proyecciones disponibles' });
        }

        res.json(proyecciones);
    } catch (error) {
        console.error('Error al obtener las proyecciones:', error);
        res.status(500).json({ message: 'Error del servidor al obtener las proyecciones' });
    }
};

const existeProyeccion = async (idsala,fecha,hora)=>{
    const [result] = await pool.query("SELECT * FROM proyeccion WHERE idsala = ?  AND fecha=? AND hora=?", [idsala,fecha, hora])
    if (result.length>0) {
        return true
    } 
    return false
}

export const createProyecciones = async (req,res)=>{
    try {
        const {idsala, idpelicula, fecha, hora} = req.body;
        console.log("objeto", req.body)

        const existePro = await existeProyeccion(idsala,fecha,hora)
        
        if (existePro) {
            return res.status(400).json({message: "Ya existe la Proyeccion"})
        }

        const [result] = await pool.query("INSERT INTO proyeccion (idpelicula,idsala,fecha,hora) VALUES (?,?,?,?)", [idpelicula,idsala,fecha,hora])
        
        if (result.affectedRows <=0) {
            return res.status(400).json({message: "Error al Insertar registro"})
        }
        res.json({insertID: result.insertId})
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const deleteProyecciones = async (req,res) =>{
    try {
        const {idproyeccion} = req.params;
        const [r] = await pool.query("DELETE FROM proyeccion WHERE idproyeccion=?",[idproyeccion])

        if (r.affectedRows === 0) {
            res.status(400).json({message: "No hay Proyecciones para eliminar"})
        }
        res.json({message: "La proyeccion se elimino Correctamente"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateProyecciones = async (req,res)=>{
    try {
        const {idproyeccion} = req.params
        const {idpelicula, idsala, fecha, hora} = req.body
        const [r] = await pool.query("UPDATE proyeccion SET idpelicula=?, idsala=?, fecha=?, hora=? WHERE idproyeccion=? ", [idpelicula, idsala, fecha, hora, idproyeccion])
        if (r.affectedRows === 0) {
            return res.status(400).json({message: "No hay Salas para Actualizar"})
        }
        res.json(idproyeccion)
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const getProyeccion = async(req,res) =>{
    try {
        const {idsala} = req.params;
        const [result] = await pool.query("SELECT * FROM proyeccion WHERE idsala=?", [idsala]);

        res.json(result)
        
    } catch (error) {
        res.status(500).json({message: error})
    }
}