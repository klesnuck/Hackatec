import { Router } from "express";
import { createUsuario,  getUsuario } from "../controllers/usuarios.controllers.js";


const router = Router();

router.post('/login',getUsuario);
router.post('/registro', createUsuario)


export default router;


