# VMotion Talleres
**Web app responsiva** para que clientes de talleres mecánicos puedan **seguir el estado de reparación** de sus vehículos, ver **evidencias** (fotos + descripciones), recibir **notificaciones** por hitos y **registrar reclamos** con seguimiento.

## Stack
- Frontend: React (SPA)
- Backend: Node.js + Express (servicios mock)
- Datos: Modelo lógico en MongoDB (no productivo en esta fase)
- Gestión: GitHub Issues/Projects, Conventional Commits

## Cómo correr (prototipo)
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend mock (si aplica) — en otra terminal
cd backend
npm install
npm run dev

## Estado del proyecto
- Entrega actual: prototipo navegable con datos **mock** (WIP).
- Avance estimado: **~50%**. Meta de la entrega: **80%**.
- Artefactos publicados: **backlog**, **trazabilidad**, **CPs** y **changelog**.
- Limitaciones: notificaciones simuladas; sin persistencia real en esta iteración.
