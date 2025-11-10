# CP-06 — Notificación por cambio de estado (Simulada) — RF4
**Objetivo:** Verificar que al cambiar el estado se dispare una “notificación” simulada y quede log.

**Precondición**
- Orden en estado “Diagnóstico”.

**Pasos**
1. Cambiar el estado de la orden a “En reparación”.
2. Disparar `notifyMock(orderId, nextStatus)` (simulado).

**Resultado esperado**
- Se registra un log con `status=sent`, `orderId`, `nextStatus` y `timestamp`.

**Resultado real:** PENDIENTE  
**Evidencia esperada:** `LOG-06.txt`  
**Observaciones:** En esta entrega la notificación es simulada.
