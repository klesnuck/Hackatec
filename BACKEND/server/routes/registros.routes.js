import { Router } from "express";
import { createAsistencia, getRegistros } from "../controllers/registros.controller.js"

const router = Router();

router.get("/registros", getRegistros)
router.post("/api/asistencia", createAsistencia)

export default router;
