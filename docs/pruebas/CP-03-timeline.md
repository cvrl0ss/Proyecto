# CP-03 — Timeline de estados (RF2)
**Objetivo:** Validar que el cliente ve la línea de estados de su orden con evidencias.

**Precondición**
- Usuario autenticado (token mock).
- Orden con ≥3 estados y al menos 1 foto por estado (datos mock).

**Pasos**
1. Login.
2. Ir a “Inicio”.
3. Visualizar orden y las ultimas actualizaciones en la pestaña de “Inicio”.

**Resultado esperado**
- Se muestran las etapas en orden (fecha/hora).
- Cada etapa con 1 foto + descripción.
- Se ve “Última actualización” visible.

**Criterios de aceptación (resumen)**
- Orden cronológica, navegación simple, persistencia mock.

**Resultado real:** PENDIENTE  
**Evidencia esperada:** `SS-03.png`, `SS-04.png`  
**Observaciones:** Por subir capturas al cerrar la iteración.
