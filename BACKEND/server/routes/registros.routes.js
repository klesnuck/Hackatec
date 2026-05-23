import { Router } from "express";
import {
    createAsistencia,
    getDashboardReporte,
    getRegistros
} from "../controllers/registros.controller.js"

const router = Router();

router.get("/registros", getRegistros)
router.get("/reportes/dashboard", getDashboardReporte)
router.post("/api/asistencia", createAsistencia)

export default router;
