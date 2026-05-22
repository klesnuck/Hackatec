import e from "cors";
import {pool} from "../db.js"

export const getRegistros = async (req,res) =>{

    try {

        const{
         empleado,
         fecha,
         fechaInicio,
         fechaFin,
         departamento,
         rol,
         tipo
        } = req.query;
    
        let sql =  `
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
        FROM registros R
            INNER JOIN usuarios u on r.id_usuario = u.id_usuario
            LEFT JOIN departamentos d on u.id_departamento = d.id_departamento
            LEFT JOIN rol ro on u.id_rol = ro.id_rol
            WHERE 1=1

        `;

        const params = [];

        if (empleado){
            sql += "AND u.id_usuario = ?";
            params.push(empleado);
        }
        
        if (fecha){
            sql += "AND r.fecha = ?";
            params.push(fecha);
        }

        if(fechInicio && fechaFin){
            sql += "AND r.fecha BETWEEN ? = ?";
            params.push(fechaInicio, fechaFin)
        }

        if (departamento) {
            sql +="AND d.id_departamento = ? ";
            params.push(departamento)
        }

        if(rol){
            sql +="AND ro.ir_rol = ?";
            params.push(rol)
        }

        if(tipo){
            sql +="AND r.tipo = ?";
            params.push(tipo)
        }

        sql+= "ORDER BY r.fecha DESC, r.hora DESC";

        const [result] = await pool.query(sql,params)

        res.json(result)

    } catch (error) {
        res.status(500).json({message: "Erorr"})
    }

}