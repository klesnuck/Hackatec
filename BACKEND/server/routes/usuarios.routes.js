import { Router } from "express";
import {
    createEmpleadoFacial,
    createUsuario,
    getEmpleadosFaciales,
    getUsuario
} from "../controllers/usuarios.controllers.js";


const router = Router();

router.post('/login',getUsuario);
router.post('/registro', createUsuario)
router.get('/api/empleados', getEmpleadosFaciales);
router.post('/api/empleados', createEmpleadoFacial);


export default router;


