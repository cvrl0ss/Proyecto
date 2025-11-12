# Plan de Pruebas – VMotion

| ID     | RF  | Objetivo                                | Precondiciones          | Pasos (resumen)                           | Esperado                           | Real   | Evidencia                           | Estado |
|--------|-----|------------------------------------------|-------------------------|-------------------------------------------|------------------------------------|--------|--------------------------------------|--------|
| CP-01  | RF1 | Validar login OK (cliente)               | Usuario registrado      | Ir a /login → email/pass válidos → Enviar | Redirige a /cuenta con token       | Igual  | SS-01a_login_ok_cliente.png          | OK     |
| CP-02  | RF1 | Rechazo de credenciales (401)            | Usuario no válido       | /login → credenciales malas               | 401 + mensaje de error             | Igual  | SS-02_login_401.png                  | OK     |
| CP-09  | RF6 | Listado de talleres                      | API GET /shops operativo| /talleres → cargar                        | Cards con nombre/ciudad            | Igual  | SS-09_listado_talleres.png           | OK     |
| CP-09a | RF6 | Formulario “Cotizar”                     | Lista visible           | Click “Cotizar” → rellenar → Enviar       | Modal envía solicitud              | Igual  | SS-09a_modal_cotizar.png             | OK     |
| CP-09b | RF6 | Adjuntar fotos en cotización             | Modal abierto           | Adjuntar archivos → Enviar                | Sube archivos                      | Igual  | SS-09b_adjuntos_cotizar.png          | OK     |
| CP-11  | RF8 | Editar perfil                            | Usuario autenticado     | Ir a /cuenta/editar → guardar             | Toast “Guardado”                   | Igual  | SS-11_editar_perfil_ok.png           | OK     |
| CP-12  | RF8 | Cambiar contraseña / Vehículos           | Usuario autenticado     | Formulario → enviar                        | Éxito                               | Igual  | SS-12_cambio_password_ok.png         | OK     |
| CP-03  | RF2 | Ver detalle de orden                     | Orden mock creada       | /orden/:id                                 | Render estado + ETA + timeline     | —      | —                                    | PEND.  |
| CP-04  | RF2 | Timeline de eventos por orden            | events[] disponibles    | /historial (orden)                         | Lista cronológica                  | —      | —                                    | PEND.  |
| CP-05  | RF3 | Ver presupuesto/ETA                      | datos ETA disponibles   | /orden/:id                                 | Campo Presupuesto/ETA visible      | —      | —                                    | PEND.  |
| CP-06  | RF4 | Polling/notificaciones                    | endpoint updates listo  | Simular updateAt → ver badge/refresh      | UI muestra aviso                   | —      | —                                    | PEND.  |
| CP-08  | RF5 | Enviar review                            | Orden cerrada           | POST /orders/:id/reviews                   | Guarda review                      | —      | —                                    | PEND.  |
