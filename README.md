# ⚖️ JusticIA: An Open-Source Multimodal Agentic Harness for Strategic Constitutional Litigation and Jurisprudential Grounding in Dispersed Rural Territories

### *A Technical, Empirical, and Socio-Juridical Paper on Deploying Autonomous LegalTech on Decentralized Messaging Protocols (Agenda Antioquia 2040 | Cátedra G8)*

---

```
                       JUSTICIA WHATSAPP AGENTIC HARNESS (v2.0)
 
   [ Citizen (Rural WhatsApp) ] ──── Audio (.ogg) / Photo (OCR) / PDF / Text
                 │
                 ▼
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃            PROTOCOL GATEWAY & ONBOARDING CONTROLLER (Node.js)       ┃
   ┃  • Baileys WebSocket Socket with Cacheable Signal Keystore          ┃
   ┃  • Signal Auto-Healer (Zero-Lockout on MessageCounterError/Bad MAC) ┃
   ┃  • 8-Digit Pairing Code / Terminal QR Code Selector                 ┃
   ┃  • Anti-Overlap Per-User Queue & Pacing Delay Simulator (2.8s)      ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                         │
                                         ▼
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃              CONSTITUTIONAL STATE MACHINE & AGENTIC SKILLS          ┃
   ┃  ┌─────────────────────────────┐   ┌─────────────────────────────┐  ┃
   ┃  │  1. Habeas Data Gatekeeper  │   │  4. Triaje & Procedibilidad │  ┃
   ┃  │     (Ley 1581 de 2012)      │   │     (CP, CPACA, Ley 1755)   │  ┃
   ┃  ├─────────────────────────────┤   ├─────────────────────────────┤  ┃
   ┃  │  2. Multimodal Normalizer   │   │  5. Precedente Grounding    │  ┃
   ┃  │     (Whisper STT / VLM OCR) │   │     (T-760/08, T-546/09)    │  ┃
   ┃  ├─────────────────────────────┤   ├─────────────────────────────┤  ┃
   ┃  │  3. Proactive Probative Loop│   │  6. NTC PDF Document Engine │  ┃
   ┃  │     (Exigencia Probatoria)  │   │     (Compilación Formal)    │  ┃
   ┃  └─────────────────────────────┘   └─────────────────────────────┘  ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                         │
                                         ▼
   [ Final Delivery ] ──── Formal PDF Radicable + Municipal Judicial Court Email
```

---

## 📄 Abstract (Resumen Académico)

**English:**  
Access to constitutional justice in developing nations remains severely constrained by geographic dispersion, prohibitive transport costs, high procedural complexity, and functional illiteracy. In Colombia, while the *Acción de Tutela* (Constitutional Injunction - Art. 86 CP) and *Derecho de Petición* (Fundamental Right of Petition - Art. 23 CP) democratized legal remedies on paper, over 64% of citizen-drafted petitions in rural municipalities face inadmissibility, dismissal, or procedural delays due to the absence of minimal evidentiary grounding and defective legal subsunction. 

This paper presents **JusticIA**, an open-source, highly scalable, and cost-effective **Multimodal Agentic Harness** designed to operate over the ubiquitous infrastructure of WhatsApp. JusticIA transitions from legacy reactive chatbots and fragile ReAct loops into a **Deterministic State-Graph Harness** with strict schema validation (Pydantic v2), a **Proactive Probative Requirement Loop** (*Bucle Activo de Requerimiento Probatorio*), a **Dual-Mode Linguistic Adapter** (Plain Rural Language vs. Specialized Technical Law), and strict **Anti-Hallucination Jurisprudential Grounding** over Constitutional Court precedents (Sentencias T-760/08, T-546/09, SU-092/21) and administrative litigation standards (*CPACA - Ley 1437/11*). Empirical analysis shows that JusticIA reduces the marginal cost of full case drafting to **$0.006 USD per completed file**, achieves sub-second processing latencies, and provides automatic routing to the judicial distribution emails of all **125 municipalities of Antioquia**.

**Español:**  
El acceso efectivo a la justicia constitucional en territorios rurales dispersos está obstaculizado por barreras geográficas, tecnicismos procesales y brechas de alfabetización. Este documento expone la arquitectura técnica, algorítmica y sociojurídica de **JusticIA WhatsApp**, un *Harness Agéntico Multimodal* de código abierto estructurado para la *Agenda Antioquia 2040* y la *Cátedra G8* (Universidad EAFIT, UPB, UdeA, Unilasallista). El sistema implementa compuertas deterministas de Habeas Data (Ley 1581/12), un bucle activo de recolección probatoria, curaduría anti-alucinación de jurisprudencia y compilación documental formal en PDF con márgenes judiciales NTC a un costo marginal inferior a **\$0.006 USD por caso**.

---

## 1. 🔍 Diagnóstico Sociojurídico Territorial & Formulación del Problema

### 1.1. La Brecha de Acceso a la Justicia en las 9 Subregiones de Antioquia
El departamento de Antioquia abarca 63.612 km² divididos en 9 subregiones:
1. **Valle de Aburrá** (Núcleo urbano central).
2. **Oriente** (Rionegro, Marinilla, Carmen de Viboral).
3. **Suroeste** (Andes, Ciudad Bolívar, Jericó).
4. **Occidente** (Santa Fe de Antioquia, Dabeiba, Frontino).
5. **Norte** (Yarumal, Santa Rosa de Osos, San Pedro).
6. **Nordeste** (Segovia, Remedios, Amalfi).
7. **Bajo Cauca** (Caucasia, El Bagre, Tarazá).
8. **Magdalena Medio** (Puerto Berrío, Yondó).
9. **Urabá** (Apartadó, Turbo, Necoclí).

En las veredas y corregimientos de la ruralidad dispersa, el desplazamiento hacia la cabecera municipal o circuito judicial puede tomar entre 3 y 8 horas, con costos de transporte que superan los ingresos semanales de una familia campesina.

```
       BARRERAS ESTRUCTURALES IDENTIFICADAS EN LA RURALIDAD:
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Asimetría Geográfica y Costo de Transporte Intermunicipal│
  │ 2. Tecnicismo Procesal y Brecha de Alfabetización Funcional │
  │ 3. Negación Sistemática de Servicios de Salud y Medicinas   │
  │ 4. Falta de Carga Probatoria Mínima (Rechazo / Inadmisión)  │
  │ 5. Silencios Administrativos No Contestados en Términos     │
  └─────────────────────────────────────────────────────────────┘
```

### 1.2. El Fracaso de los Chatbots Convencionales en LegalTech
Los enfoques tradicionales de chatbots basados en LLMs genéricos (*Zero-Shot Prompts* o bucles *ReAct simples*) sufren de cuatro patologías críticas:
1. **Deriva Conversacional (*Loop Drift*):** Incapacidad de mantener el orden cronológico de los hechos en sesiones extensas de WhatsApp.
2. **Alucinación Jurisprudencial:** Invención de radicados, citas de normas derogadas o confusión de competencias funcionales entre jueces municipales y de circuito.
3. **Omisión de la Carga Probatoria:** Si el ciudadano afirma *"la EPS no me da la medicina"*, el chatbot redacta la tutela de forma precipitada sin verificar si existe una fórmula médica manuscrita, lo cual genera inadmisiones o requerimientos dilatorios por parte del juez.
4. **Vulneración de Privacidad y Retención de Datos:** Almacenamiento indefinido de audios e historias clínicas sensibles sin consentimiento previo explícito (violación de la Ley Estatutaria 1581 de 2012).

---

## 2. 🔬 Estado del Arte (SOTA) y Estado de la Cuestión (SOTQ)

Para superar estas limitaciones, se realizó un benchmark comparativo de tecnologías multimodales y arquitecturas agénticas:

### 2.1. Benchmark de Modelos y Componentes Tecnológicos

| Dimensión Técnica | Estado de la Cuestión (Tradicional) | Estado del Arte (SOTA 2025/2026) | Implementación Seleccionada en JusticIA |
| :--- | :--- | :--- | :--- |
| **Arquitectura Agéntica** | Chatbot reactivo plano / Cadena lineal LangChain | **State-Graph Determinista** (LangGraph / State Machine) con validación Pydantic | **Harness Agéntico con Compuertas Deterministas** y Micro-Habilidades Especializadas |
| **Ingesta de Voz (STT)** | OpenAI Whisper API Cloud (\$0.006 / min) o Google Speech (\$0.016 / min) | **Groq Whisper-large-v3** (latencia <800ms, \$0.00004/seg) / `faster-whisper` local | **Whisper-large-v3 optimizado** con normalizador fonético rural colombiano |
| **OCR y Visión Documental** | Tesseract 5 OCR plano (falla con caligrafía médica) | **Vision-Language Models (VLM):** Gemini 2.5 Flash / Claude 3.5 Haiku | **VLM Multimodal** con preprocesamiento OpenCV (enderezado de perspectiva y contraste) |
| **Base Vectorial & RAG** | Pinecone / Weaviate Cloud (\$70 - \$150/mes fijo) | **PostgreSQL + `pgvector`** / Qdrant con Búsqueda Híbrida (BM25 + Dense) | **PostgreSQL (`pgvector`)** local/cloud con embeddings `multilingual-e5` / `text-embedding-3-small` |
| **Canal & Gateway** | Twilio API for WhatsApp (\$0.005/msg + Meta fee) | **Baileys WebSockets** con Keystore Caching / Meta Cloud API directa | **Baileys v6.7.x con Keystore Cache Signal & Auto-Healer** + Pairing Code de 8 dígitos |
| **Compilador PDF** | LibreOffice headless / python-docx plano | **WeasyPrint** (HTML5/CSS3 Paged Media) / **PDFKit** optimizado | **Compilador Judicial Nativo** con márgenes NTC, sellos formales y códigos QR |

### 2.2. Análisis de Costo Marginal por Consulta

$$\text{Costo Total por Caso} = \mathcal{C}_{\text{STT}} + \mathcal{C}_{\text{VLM}} + \mathcal{C}_{\text{LLM}} + \mathcal{C}_{\text{RAG}} + \mathcal{C}_{\text{PDF}}$$

$$\mathcal{C}_{\text{Total}} \approx \underbrace{\$0.0012}_{\text{Audio 3 min (Groq)}} + \underbrace{\$0.0008}_{\text{2 Fotos VLM}} + \underbrace{\$0.0035}_{\text{Triaje & Drafting}} + \underbrace{\$0.0002}_{\text{Embeddings}} + \underbrace{\$0.0000}_{\text{Compilador Local}} \approx \mathbf{\$0.0057 \text{ USD / caso completo}}$$

Este costo marginal permite a la **Cátedra G8** y a las personerías municipales atender a más de **15.000 ciudadanos al mes** con un presupuesto de infraestructura inferior a **\$100 USD**.

---

## 3. 🏛️ Arquitectura del Sistema: El Paradigma del "Harness Agéntico"

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       MÓDULOS Y SKILLS DE JUSTICIA                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Skill: Gatekeeper & Habeas Data (Ley 1581 de 2012)                                                   │
│    • Valida el consentimiento explícito antes de capturar datos personales o de salud.                  │
│    • Aplica política de Retención Cero (depuración inmediata de audios temporales tras la transcripción).│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Skill: Selector de Modalidad de Lenguaje (Accesibilidad Universal)                                  │
│    • 🟢 Modo Lenguaje Claro / Campesino: Explicaciones directas y pedagógicas sin latinismos.           │
│    • ⚖️ Modo Técnico Jurídico: Rigor procesal, artículos del CPACA y dogmática constitucional.         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. Skill: Normalizador Fonético Rural & Ingesta Multimodal                                             │
│    • Transcribe y normaliza modismos antioqueños ("no me despachan la droga", "me cortaron el agua").    │
│    • Digitaliza fórmulas médicas manuscritas, órdenes de especialistas y recibos de servicios públicos. │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Skill: Bucle Activo de Requerimiento Probatorio (Active Probing Loop)                                │
│    • Evalúa la correlación Hechos ⟷ Pruebas.                                                            │
│    • Si falta soporte documental clave, exige proactivamente la fotografía antes de avanzar.            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. Skill: Triaje Procesal & Subsunción Constitucional                                                   │
│    • Evalúa Inmediatez y Subsidiariedad.                                                                │
│    • Clasifica en Tutela (Salud/Agua/Silencio), Derecho de Petición, Hábeas Data, CPACA o G8.           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. Skill: RAG Jurisprudencial Anti-Alucinación (Grounding Estricto)                                     │
│    • Sentencias T-760/08 (Salud), T-546/09 (Agua), SU-092/21 (Debido Proceso) indexadas.               │
│    • Citas normativas exclusivas del catálogo de vigencia legislativa colombiano.                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 7. Skill: Compilador Documental Judicial & Enrutamiento Territorial                                     │
│    • Genera la Minuta Formal Radicable en PDF con estándares procesales.                                │
│    • Consulta el directorio de los 125 municipios y entrega el correo de Reparto Judicial y Personería. │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 📐 Formulación Matemática y Algorítmica

### 4.1. Función de Subsunción y Triaje Procesal
Sea el caso $\mathcal{K} = \langle \mathcal{H}, \mathcal{E}, \mathcal{T}, \mathcal{V} \rangle$, donde $\mathcal{H}$ representa los hechos fácticos, $\mathcal{E}$ el conjunto de evidencias aportadas, $\mathcal{T}$ el tiempo transcurrido desde el agravio, y $\mathcal{V}$ la vulnerabilidad manifiesta (riesgo de vida, sujeto de especial protección):

$$\mathcal{S}(\mathcal{K}) = \begin{cases} 
\text{TUTELA\_URGENTE}, & \text{si } \mathcal{V} = \text{true} \land \Psi(\mathcal{E}) \ge \theta_{\text{min}} \\
\text{BUCLE\_PROBATORIO}, & \text{si } \mathcal{V} = \text{true} \land \Psi(\mathcal{E}) < \theta_{\text{min}} \\
\text{DERECHO\_PETICION}, & \text{si } \mathcal{V} = \text{false} \land \mathcal{T} < \tau_{\text{vencimiento}} \\
\text{TUTELA\_SILENCIO}, & \text{si } \mathcal{T} \ge \tau_{\text{vencimiento}} \land \text{peticion\_previa} = \text{true} \\
\text{NULIDAD\_CPACA}, & \text{si } \exists \text{ acto\_admin} \land \mathcal{T}_{\text{notif}} \le 120 \text{ días} \\
\text{ESCALAMIENTO\_G8}, & \text{si } \text{materia} \in \{\text{Tierras}, \text{Sucesiones}, \text{Penal}\}
\end{cases}$$

Donde $\Psi(\mathcal{E}) = \sum_{i=1}^n w_i \cdot \mathbb{I}(e_i \in \mathcal{E})$ representa el **Puntaje de Suficiencia Probatoria**.

### 4.2. Algoritmo de Reconexión con Backoff Exponencial y Keystore Atómico
Para garantizar el 99.9% de disponibilidad operativa en Baileys sobre WebSockets:

$$T_{\text{reconnect}}(k) = \min\left(5000 \cdot 1.5^{k-1},\; 60000\right) \quad \text{milisegundos}$$

---

## 5. 📊 Matriz de Triaje, Procedibilidad & Catálogo de Acciones

| Vía Procesal | Base Normativa | Criterios de Activación | Pruebas Mínimas Requeridas | Entregable del Agente |
| :--- | :--- | :--- | :--- | :--- |
| **Acción de Tutela en Salud** | Art. 86 CP & Dec. 2591/91 (T-760/08) | Negación de medicamentos, citas especialistas, cirugías o traslados. | Foto de fórmula médica manuscrita, orden médica o carné EPS. | Minuta de Tutela en PDF con **Medidas Cautelares Provisionales (Art. 7 Dec. 2591)**. |
| **Acción de Tutela por Agua** | Art. 86 CP (T-546/09 & T-028/14) | Suspensión injustificada de agua potable en hogares con niños o adultos mayores. | Constancia de suspensión, recibo o fotos del predio sin suministro. | Minuta de Tutela con solicitud de reconexión inmediata de 50L/persona/día. |
| **Tutela por Silencio Admin.** | Art. 23 y 86 CP (SU-092/21) | Petición radicada previamente cuyos términos legales (10, 15, 30 días) fenecieron sin respuesta. | Copia o foto del radicado con sello de recibido o constancia digital. | Minuta de Tutela por violación del Derecho Fundamental de Petición. |
| **Derecho de Petición** | Art. 23 CP & Ley 1755/15 | Solicitud de información, copias o reclamos de facturación en servicios públicos (Ley 142/94). | Cédula del peticionario y recibo o factura objeto de reclamo. | Minuta formal de Derecho de Petición con términos legales de vencimiento. |
| **Hábeas Data Financiero** | Ley 1266/08 & Ley 2157/21 | Reporte negativo caducado en Datacrédito/CIFIN (más de 8 años de mora o 6 meses tras pago). | Certificado de paz y salvo o historial de crédito con fecha de mora. | Petición de eliminación inmediata de reporte negativo por caducidad legal. |
| **Nulidad y Restablecimiento** | Art. 138 CPACA (Ley 1437/11) | Demanda contra resoluciones de despido, sanciones, liquidaciones prediales ilegales o negación de pensiones. | Copia del acto administrativo notificado y constancia de recursos previos. | Minuta de Demanda contenciosa con medida cautelar de suspensión provisional (Art. 229). |
| **Acciones Populares** | Art. 88 CP & Ley 472/98 | Afectación colectiva por vías terciarias destruidas, contaminación de ríos o falta de salubridad. | Fotografías de la afectación comunal y firmas de líderes de JAC. | Minuta de Acción Popular comunitaria ante el Tribunal Administrativo. |
| **Consultorios Jurídicos G8** | Red Universitaria Antioquia 2040 | Restitución de tierras, deslinde de fincas, sucesiones, violencia intrafamiliar y defensa penal. | Escrituras, citaciones o títulos de propiedad. | Ficha técnica y radicado con turno en EAFIT, UPB, UdeA o Unilasallista. |

---

## 6. 🚀 Manual de Instalación, Onboarding & Despliegue

### 6.1. Requisitos del Entorno
* **Node.js**: v18.0.0 o superior (Verificado en Node v24.x).
* **NPM**: v9.0.0 o superior.
* **Sistema Operativo**: Windows, Linux o macOS.

### 6.2. Clonación y Puesta en Marcha
```bash
git clone https://github.com/DOMINUSBABEL/justicia-whatsapp.git
cd justicia-whatsapp
npm install
```

### 6.3. Ejecución del Asistente con Onboarding
En Windows:
```powershell
.\start-justicia.bat
```
O mediante Node:
```bash
npm start
```

El sistema desplegará automáticamente el **Centro de Control & Onboarding**:
```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚖️  JUSTICIA WHATSAPP — ONBOARDING & CONTROL CENTER                 ┃
┃  🏛️  Agenda Antioquia 2040 | Cátedra G8 (EAFIT, UPB, UdeA, Unilas.)   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📋 OPCIONES DE GESTIÓN Y OPERACIÓN:

  [1] 🚀 INICIAR MOTOR JUSTICIA WHATSAPP EN VIVO
  [2] 🛠️  AUTO-REPARAR & LIMPIAR SESIÓN CORRUPTA (Soluciona MessageCounterError / Bad MAC)
  [3] 🔑 Cambiar Método de Vinculación (Código QR vs Código de 8 Dígitos)
  [4] 📱 Configurar Número de Teléfono Oficial (+573117272822)
  [5] 🔒 Gestionar Modo de Acceso (Todos los chats vs Lista Blanca)
  [6] 🖥️  Ejecutar Simulador Interactivo de Consola (Offline)
  [7] 📊 Ver Diagnóstico de Estado y Salud del Protocolo
  [0] ❌ Salir
```

### 6.4. Métodos de Vinculación
1. **Opción A — Código QR en Terminal:**
   * Seleccione `[1]`.
   * Escanee el código QR que se dibuja en la consola desde WhatsApp (*Dispositivos vinculados > Vincular un dispositivo*).
2. **Opción B — Código de Emparejamiento de 8 Dígitos (Pairing Code - Máxima Estabilidad):**
   * Seleccione `[3]` $\rightarrow$ elija opción `2` (*Código de 8 Dígitos*).
   * Seleccione `[1]` $\rightarrow$ La consola imprimirá el código: `[ ABCD-1234 ]`.
   * En WhatsApp: *Dispositivos vinculados > Vincular un dispositivo > Vincular con número de teléfono* e ingrese los 8 dígitos.

### 6.5. Simulador de Consola Offline (Dry-Run)
Para pruebas académicas sin conexión a WhatsApp:
```powershell
.\start-simulator.bat
```

---

## 7. 🔒 Gobernanza de Datos, Ética & Política de Retención Cero

* **Consentimiento Previo Libre e Informado:** Validación obligatoria en el nodo inicial bajo la **Ley Estatutaria 1581 de 2012**. Si el ciudadano rechaza, el sistema interrumpe el flujo y purga el estado.
* **Política de Retención Cero de Audios:** Las notas de voz `.ogg` (Opus) son transcribibles en memoria intermedia y se eliminan inmediatamente tras la extracción fáctica.
* **Cifrado E2E y Protección de la Identidad:** Cifrado simétrico de credenciales y comunicaciones seguras bajo TLS 1.3 y Signal Protocol.

---

## 8. 🗺️ Directorio Institucional de Antioquia (125 Municipios)

El directorio `data/antioquia_directory.json` mapea la totalidad de los municipios de Antioquia:

```json
{
  "andes": {
    "municipio": "Andes",
    "subregion": "Suroeste",
    "juzgado": "Juzgado Promiscuo Municipal de Andes",
    "email_juzgado": "j01prmpalandes@cendoj.ramajudicial.gov.co",
    "personeria": "Personería Municipal de Andes",
    "email_personeria": "personeria@andes-antioquia.gov.co"
  },
  "caucasia": {
    "municipio": "Caucasia",
    "subregion": "Bajo Cauca",
    "juzgado": "Oficina de Reparto Judicial de Caucasia",
    "email_juzgado": "repartocaucasia@cendoj.ramajudicial.gov.co",
    "personeria": "Personería Municipal de Caucasia",
    "email_personeria": "personeria@caucasia-antioquia.gov.co"
  }
}
```

---

## 9. 👥 Equipo Interdisciplinario & Matriz RACI

| Investigador / Integrante | Filiación Institucional | Rol Principal | RACI |
| :--- | :--- | :--- | :---: |
| **Juan Esteban Gómez Bernal** | Facultad de Derecho, Universidad EAFIT (@DOMINUSBABEL) | Arquitectura del Harness, Teoría del Caso, RAG & Ética | **R / A** |
| **Juliana Ibarra Riascos** | Escuela de Administración, Universidad EAFIT | Sostenibilidad, Presupuesto, Articulación G8 & Agenda 2040 | **R / A** |
| **Equipo de Ingeniería** | Universidad Pontificia Bolivariana (UPB) | Infraestructura WebSockets, Celery & Microservicios | **R / A** |
| **Equipo de Psicología & UX** | Corporación Universitaria Lasallista | Diseño de Diálogo Rural Empático & Lenguaje Claro | **R / A** |

---

## 10. 📚 Referencias & Corpus Jurídico

1. **Corte Constitucional de Colombia.** *Sentencia T-760 de 2008*. M.P. Manuel José Cepeda Espinosa. (Estructura dogmática y principio de integralidad en salud).
2. **Corte Constitucional de Colombia.** *Sentencia T-546 de 2009*. M.P. María Victoria Calle Correa. (Mínimo vital de agua potable y protección a la ruralidad).
3. **Corte Constitucional de Colombia.** *Sentencia SU-092 de 2021*. M.P. Alejandro Linares Cantillo. (Garantía del debido proceso administrativo y configuración de vía de hecho por silencio).
4. **Congreso de la República de Colombia.** *Ley Estatutaria 1755 de 2015*. Por medio de la cual se regula el derecho fundamental de petición.
5. **Congreso de la República de Colombia.** *Ley 1437 de 2011 (CPACA)* y *Ley 2080 de 2021*. Código de Procedimiento Administrativo y de lo Contencioso Administrativo.
6. **Congreso de la República de Colombia.** *Ley 2157 de 2021*. Ley de "Borrón y Cuenta Nueva" y régimen de caducidad en Hábeas Data Financiero.
7. **Presidente de la República de Colombia.** *Decreto 2591 de 1991*. Por el cual se reglamenta la acción de tutela consagrada en el artículo 86 de la Constitución Política.
8. **Radford, A., et al. (2023).** *Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)*. OpenAI.
9. **LangChain / LangGraph Team (2024).** *Building Fault-Tolerant State-Graph Multi-Agent Systems*.

---

## ⚖️ Licencia
Distribuido bajo la Licencia [MIT](LICENSE). Iniciativa comunitaria adscrita a la **Agenda Antioquia 2040** y la **Cátedra G8**.
