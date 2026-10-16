# Guía de Contribución y Pull Requests (JusticIA WhatsApp v2.5)

¡Gracias por contribuir a **JusticIA WhatsApp** (Agenda Antioquia 2040 · Cátedra G8)! Este repositorio acepta **Pull Requests (PRs)** tanto para el **Motor Jurídico & Backend Agéntico** (`src/`, `data/`, `tests/`) como para el **Sitio Web & Estudio Jurídico en Vivo (Frontend)** (`public/`).

---

## 1. Estructura del Proyecto para Colaboradores

```text
justicia-whatsapp/
├── src/
│   ├── legal-subsunction-engine.js    # Motor formal S(K) = <H, E, T, V>, 9 especialidades y Ψ(E)
│   ├── analytics-manager.js           # Ledger atómico CRM/Kanban, SLA alerts y telemetría
│   ├── api-server.js                  # Servidor HTTP/REST sin dependencias externas (Puerto 3090)
│   ├── harness-engine.js              # Máquina de estados determinista y orquestación WhatsApp
│   ├── pdf-generator.js               # Compilador PDF con capítulo de Pruebas de Oficio (Art. 19)
│   ├── docx-generator.js              # Compilador Word (.docx) nativo es-CO (OOXML)
│   ├── voice-intent-parser.js         # Parser de notas de voz coloquiales y directivas de tono
│   ├── non-pathologizing-lexicon.js   # Curador de lenguaje digno (Ley 1616/13) y filtro Anti-Slop
│   └── page-budget-engine.js          # Validador de presupuesto de ≤ 3 páginas y peticiones
├── public/                            # FRONTEND WEB (Palo Alto × Crystal-Clear × Antioquia)
│   ├── index.html                     # Landing 3D, Pipeline S(K), Estudio en Vivo y Simulador WA
│   ├── styles.css                     # Sistema de diseño Crystal-Clear y responsividad móvil
│   ├── app.js                         # Topología holográfica 3D, Studio multi-pestaña y despliegue
│   ├── legal-engine-browser.js        # Motor S(K) autónomo en navegador (fallback sin backend)
│   └── data/                          # Réplica sincronizada de directorios JSON para modo estático
├── data/
│   ├── antioquia_directory.json       # Directorio judicial de los 125 municipios de Antioquia
│   ├── antioquia_universities_directory.json # Directorio normativo de las 8 universidades G8
│   └── cases_ledger.json              # Base de datos JSON de expedientes y telemetría
└── tests/
    └── legal_subsunction_and_analytics.test.js # Suite de verificación automatizada (Node.js)
```

---

## 2. Flujo de Trabajo para Enviar un Pull Request (PR)

1. **Haz un Fork** del repositorio `https://github.com/DOMINUSBABEL/justicia-whatsapp` y clónalo localmente:
   ```bash
   git clone https://github.com/<TU_USUARIO>/justicia-whatsapp.git
   cd justicia-whatsapp
   npm install
   ```
2. **Crea una rama descriptiva** según el módulo que vayas a mejorar:
   - Mejoras al Frontend / Sitio Web: `git checkout -b feat/frontend-nueva-vista` o `fix/frontend-responsive`
   - Mejoras al Motor Jurídico `S(K)`: `git checkout -b feat/legal-nueva-especialidad`
   - Actualización de Directorios (125 municipios / G8): `git checkout -b data/actualizacion-juzgados`
3. **Ejecuta las pruebas y verifica el servidor web localmente**:
   ```bash
   # Ejecutar suite de pruebas del motor jurídico y analítico
   node tests/legal_subsunction_and_analytics.test.js

   # Levantar el servidor web y API en http://localhost:3090
   npm run web
   ```
4. **Sincronización de Datos (`data/` ↔ `public/data/`)**:
   Si modificas archivos en `data/antioquia_directory.json` o `data/antioquia_universities_directory.json`, copia los cambios también a `public/data/` para mantener la paridad del modo autónomo estático en producción (`https://babylonias.com/justicia-whatsapp/`).
5. **Envía tu Pull Request** hacia la rama `main` describiendo:
   - El problema jurídico, analítico o de interfaz que resuelve.
   - Capturas de pantalla (escritorio y móvil) si el cambio toca `public/index.html`, `public/styles.css` o `public/app.js`.
   - Resultado de la suite de pruebas (`tests/legal_subsunction_and_analytics.test.js`).
