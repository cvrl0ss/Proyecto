# Product Backlog (extracto)
> Fuente: Cap. III – Ingeniería de requerimientos. Documento de trabajo; se irá refinando.

| ID  | Historia de usuario                                                                    | Criterios de aceptación (resumen)                                                                                                  |
|-----|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| RF2 | Como cliente, quiero ver la **línea de estados** de mi orden con evidencias           | 1) Etapas ordenadas con fecha/hora; 2) ≥1 foto + descripción por etapa; 3) Carga con datos **mock**; 4) Navegación simple          |
| RF3 | Como cliente, quiero ver **presupuesto** y **fecha estimada (ETA)**                   | 1) Monto en CLP; 2) ETA visible; 3) “Última actualización”; 4) Persistencia **mock**                                               |
| RF4 | Como cliente, quiero recibir **notificación simulada** al cambiar el estado           | 1) Al cambiar estado se llama `notifyMock()`; 2) Se registra LOG con `status=sent` + timestamp; 3) Verificable en **CP-06**         |
| RF7 | Como cliente, quiero **registrar reclamos** con seguimiento                           | 1) Valida campos obligatorios; 2) Asigna `ReclamoID`; 3) Aparece en listado con estado `abierto`; 4) Verificable en **CP-10**       |

### Priorización y planificación
- **Sprint 1 (documental):** setup repo, DoD, artefactos, prototipo básico.
- **Sprint 2 (en curso):** RF2, RF3, RF4 (simulada), RF7.
