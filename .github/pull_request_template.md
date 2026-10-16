## 📋 Descripción del Pull Request

Describe brevemente qué cambios introduce este PR y por qué son necesarios.

## 🧩 Módulo Afectado

Marca con una `x` los componentes modificados:

- [ ] 🌐 **Frontend & Sitio Web (`public/index.html`, `public/styles.css`, `public/app.js`, `public/legal-engine-browser.js`)**
- [ ] ⚖️ **Motor de Subsunción Jurídica $\mathcal{S}(\mathcal{K})$ (`src/legal-subsunction-engine.js`, `src/harness-engine.js`)**
- [ ] 📊 **Analítica, CRM Kanban & API (`src/analytics-manager.js`, `src/api-server.js`)**
- [ ] 📄 **Compiladores Documentales (`src/pdf-generator.js`, `src/docx-generator.js`)**
- [ ] 🗺️ **Directorios Territoriales Antioquia / Red G8 (`data/` y `public/data/`)**
- [ ] 📚 **Documentación & Investigación (`README.md`, `docs/`)**

## ✅ Lista de Verificación antes de Integrar (Merge)

- [ ] La suite de pruebas `node tests/legal_subsunction_and_analytics.test.js` pasa al 100% (`8/8 PASSED`).
- [ ] Si se modificó el Frontend (`public/`), se verificó la visualización sin solapamientos (*overlappings*) tanto en escritorio (`1280px+`) como en dispositivos móviles (`320px–820px`).
- [ ] Si se modificaron archivos en `data/`, se sincronizaron con `public/data/`.
- [ ] Se respeta el filtro Anti-Slop, el Léxico No Patologizante (Ley 1616/13) y la Regla de Presupuesto de $\le 3$ páginas.
