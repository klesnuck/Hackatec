import { Router } from "express";
import { createProyecciones, deleteProyecciones, getProyeccion, getProyecciones, updateProyecciones } from "../controllers/proyeccion.controllers.js";

const router = Router();

router.get("/proyecciones", getProyecciones)
router.get("/proyecciones/:idsala", getProyeccion)
router.post("/proyecciones", createProyecciones)
router.delete("/proyecciones/:idproyeccion", deleteProyecciones)
router.put("/proyecciones/:idproyeccion", updateProyecciones)

export default router;