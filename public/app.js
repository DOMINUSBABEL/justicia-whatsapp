/**
 * JusticIA WhatsApp v2.5.0 — Frontend Application, 3D Holographic Topology & Live Legal Studio
 * Aesthetic Standard: Palo Alto Networks Enterprise × Crystal-Clear Glassmorphism × Colores Antioqueños
 * 100% Self-Contained Native CSS/JS (Zero External CDN Dependencies)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CRYSTAL-CLEAR FLOATING NAVBAR, MOBILE DRAWER & QUICK DOCK
  // =========================================================================
  function initNavbarScroll() {
    const navbar = document.getElementById('miaNavbar');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const dockItems = Array.from(document.querySelectorAll('.mobile-dock-item'));

    function updateNavbar() {
      if (navbar) {
        if (window.scrollY > 24) {
          navbar.classList.add('floating-nav--scrolled');
        } else {
          navbar.classList.remove('floating-nav--scrolled');
        }
      }

      // Active section scroll-spy for Mobile Quick Dock
      const scrollPos = window.scrollY + window.innerHeight * 0.34;
      let activeTarget = 'hero';
      ['hero', 'flujo', 'panel-real', 'simulador-whatsapp', 'instalacion'].forEach((id) => {
        const sec = document.getElementById(id);
        if (sec && sec.offsetTop <= scrollPos) {
          activeTarget = id;
        }
      });
      dockItems.forEach((item) => {
        item.classList.toggle('is-active', item.getAttribute('data-dock-target') === activeTarget);
      });
    }

    function closeMobileMenu() {
      if (!mobileDrawer || !mobileBtn) return;
      mobileDrawer.classList.add('is-hidden');
      mobileBtn.classList.remove('is-open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }

    mobileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!mobileDrawer) return;
      const isHidden = mobileDrawer.classList.toggle('is-hidden');
      mobileBtn.classList.toggle('is-open', !isHidden);
      mobileBtn.setAttribute('aria-expanded', String(!isHidden));
    });

    mobileDrawer?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer && !mobileDrawer.classList.contains('is-hidden')) {
        if (!navbar?.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

  // =========================================================================
  // 2. MULTIMODE 3D HOLOGRAPHIC TOPOLOGY CANVAS (#miaBrainCanvas)
  //    Palette: Verde Bandera de Antioquia, Esmeralda Palo Alto & Oro Real
  // =========================================================================
  function initBrainCanvas() {
    const canvas = document.getElementById('miaBrainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Colores Antioqueños + Palo Alto Crystal-Clear Enterprise Palette
    const PALETTE = [
      [0, 132, 61],    // Verde Bandera de Antioquia #00843D
      [0, 168, 80],    // Esmeralda Palo Alto #00A850
      [200, 150, 30],  // Oro Real del Escudo #C8961E
      [6, 78, 59],     // Bosque Profundo #064E3B
      [16, 185, 129],  // Esmeralda Cristalino #10B981
      [229, 169, 31]   // Oro Brillante #E5A91F
    ];

    const SUBREGION_HUBS = [
      { name: 'Valle de Aburrá', x: 0.0, y: 0.0, z: 0.0 },
      { name: 'Urabá', x: -0.95, y: -0.75, z: 0.35 },
      { name: 'Bajo Cauca', x: 0.75, y: -0.82, z: -0.25 },
      { name: 'Oriente', x: 0.62, y: 0.32, z: 0.45 },
      { name: 'Suroeste', x: -0.58, y: 0.68, z: 0.32 },
      { name: 'Occidente', x: -0.72, y: -0.15, z: -0.35 },
      { name: 'Norte', x: 0.05, y: -0.62, z: 0.55 },
      { name: 'Nordeste', x: 0.82, y: -0.28, z: -0.45 },
      { name: 'Magdalena Medio', x: 1.05, y: 0.48, z: -0.3 }
    ];

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const NODE_COUNT = 220;
    const nodes = [];
    const ambientTriangles = [];
    const pulses = [];

    let currentMode = 'brain'; // 'brain' | 'scales' | 'antioquia'
    let rotY = -0.35;
    let rotX = 0.16;
    let targetRotY = -0.35;
    let targetRotX = 0.16;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hoverX = -9999;
    let hoverY = -9999;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 640;
      height = rect.height || 520;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeTargetCoords(i, mode) {
      if (mode === 'scales') {
        // 4 Gyroscopic Constitutional Rings <H, E, T, V> + central golden core
        const ring = i % 4;
        const angle = (i / NODE_COUNT) * Math.PI * 2 * 4;
        const r = 1.08;
        if (ring === 0) return { tx: Math.cos(angle) * r, ty: Math.sin(angle) * r * 0.35, tz: Math.sin(angle) * r };
        if (ring === 1) return { tx: Math.cos(angle) * r * 0.35, ty: Math.sin(angle) * r, tz: Math.cos(angle) * r };
        if (ring === 2) return { tx: Math.cos(angle) * r * 0.85, ty: Math.sin(angle) * r * 0.85, tz: 0 };
        const coreR = 0.38 * Math.cbrt((i % 37) / 37);
        return {
          tx: coreR * Math.cos(angle * 2),
          ty: coreR * Math.sin(angle * 2),
          tz: coreR * Math.sin(angle)
        };
      }

      if (mode === 'antioquia') {
        // 9 Subregional Clusters connected in 3D space
        const hub = SUBREGION_HUBS[i % SUBREGION_HUBS.length];
        const spread = 0.24;
        const a1 = (i * 1.7) % (Math.PI * 2);
        const a2 = (i * 2.3) % (Math.PI * 2);
        return {
          tx: hub.x + Math.cos(a1) * Math.sin(a2) * spread,
          ty: hub.y + Math.sin(a1) * Math.sin(a2) * spread,
          tz: hub.z + Math.cos(a2) * spread
        };
      }

      // Default 'brain': Bi-hemispheric Constitutional Neural Network
      const hemisphere = i % 2 === 0 ? 1 : -1;
      const u = ((i * 137.5) % 360) * (Math.PI / 180);
      const v = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const rBase = 0.78 + 0.22 * Math.sin(i * 1.9);
      let x = rBase * Math.sin(v) * Math.cos(u) * 0.78 + hemisphere * 0.34;
      let y = rBase * Math.sin(v) * Math.sin(u) * 0.86;
      let z = rBase * Math.cos(v) * 1.14;
      y -= 0.12 * Math.cos(z * 1.4);
      return { tx: x, ty: y, tz: z };
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      const initPos = computeTargetCoords(i, 'brain');
      nodes.push({
        x: initPos.tx,
        y: initPos.ty,
        z: initPos.tz,
        tx: initPos.tx,
        ty: initPos.ty,
        tz: initPos.tz,
        size: 3.4 + (i % 5) * 0.88,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.025,
        rgb: PALETTE[i % PALETTE.length],
        energy: 0
      });
    }

    for (let i = 0; i < 28; i++) {
      ambientTriangles.push({
        x: Math.random(),
        y: Math.random(),
        size: 2.4 + Math.random() * 3.4,
        vy: -0.00035 - Math.random() * 0.0004,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        rgb: PALETTE[i % PALETTE.length]
      });
    }

    function set3DMode(mode) {
      currentMode = mode;
      nodes.forEach((n, i) => {
        const next = computeTargetCoords(i, mode);
        n.tx = next.tx;
        n.ty = next.ty;
        n.tz = next.tz;
        n.energy = 0.75;
      });

      const hudText = document.getElementById('canvasHudVectorText');
      if (hudText) {
        if (mode === 'scales') {
          hudText.textContent = 'Esfera Giroscópica: H (Hipótesis) · E (Prueba Ψ) · T (Término) · V (Vulnerabilidad)';
        } else if (mode === 'antioquia') {
          hudText.textContent = '9 Subregiones: Aburrá · Urabá · Oriente · Suroeste · Bajo Cauca · Norte · Occidente';
        } else {
          hudText.textContent = 'T-760/08 · SU-508/20 · Ley 1755/15 · Ley 1616/13 · AL 01/23';
        }
      }
    }

    document.querySelectorAll('[data-3d-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-3d-mode]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        set3DMode(btn.getAttribute('data-3d-mode'));
      });
    });

    function spawnPulse() {
      const origin = nodes[Math.floor(Math.random() * nodes.length)];
      pulses.push({
        x: origin.x,
        y: origin.y,
        z: origin.z,
        radius: 0,
        maxRadius: 2.4,
        speed: 0.03
      });
    }

    spawnPulse();
    setInterval(spawnPulse, 2800);

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      hoverX = e.clientX - rect.left;
      hoverY = e.clientY - rect.top;

      if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        targetRotY += dx * 0.007;
        targetRotX = Math.max(-0.85, Math.min(0.85, targetRotX + dy * 0.007));
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    });

    // Touch Orbiting Support for Smartphones & Tablets
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        const rect = canvas.getBoundingClientRect();
        hoverX = lastMouseX - rect.left;
        hoverY = lastMouseY - rect.top;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - lastMouseX;
        const dy = touch.clientY - lastMouseY;
        if (Math.abs(dx) > Math.abs(dy) && e.cancelable) {
          e.preventDefault();
        }
        targetRotY += dx * 0.008;
        targetRotX = Math.max(-0.85, Math.min(0.85, targetRotX + dy * 0.008));
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      isDragging = false;
      hoverX = -9999;
      hoverY = -9999;
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
      hoverX = -9999;
      hoverY = -9999;
    });

    window.addEventListener('resize', resize);
    resize();

    function drawTriangle(cx, cy, radius, angle, fillStyle) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const tx = Math.cos(a) * radius;
        const ty = Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      if (!isDragging) {
        targetRotY += 0.0036;
      }
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;

      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].radius += pulses[i].speed;
        if (pulses[i].radius > pulses[i].maxRadius) pulses.splice(i, 1);
      }

      for (const amb of ambientTriangles) {
        amb.y += amb.vy;
        amb.angle += amb.spin;
        if (amb.y < -0.05) amb.y = 1.05;
        const [r, g, b] = amb.rgb;
        drawTriangle(amb.x * width, amb.y * height, amb.size, amb.angle, `rgba(${r},${g},${b},0.22)`);
      }

      const isCompact = width < 540;
      const scale = Math.min(width, height) * (isCompact ? 0.28 : 0.275);
      const centerX = width * 0.5;
      const centerY = height * (isCompact ? 0.53 : 0.5);

      // Subtle central crystal halo
      const radGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, scale * 1.25);
      radGrad.addColorStop(0, 'rgba(0, 168, 80, 0.09)');
      radGrad.addColorStop(0.55, 'rgba(200, 150, 30, 0.04)');
      radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 1.25, 0, Math.PI * 2);
      ctx.fill();

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += (n.tx - n.x) * 0.07;
        n.y += (n.ty - n.y) * 0.07;
        n.z += (n.tz - n.z) * 0.07;
        n.angle += n.spin;

        let waveBoost = 0;
        for (const p of pulses) {
          const dist = Math.hypot(n.x - p.x, n.y - p.y, n.z - p.z);
          const diff = Math.abs(dist - p.radius);
          if (diff < 0.28) waveBoost = Math.max(waveBoost, 1 - diff / 0.28);
        }
        n.energy = Math.max(waveBoost, n.energy * 0.92);

        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        const perspective = 3.1 / (3.1 - z2 * 0.65);
        let sx = centerX + x1 * scale * perspective;
        let sy = centerY + y2 * scale * perspective;

        const mdx = sx - hoverX;
        const mdy = sy - hoverY;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < 90 && mDist > 0.1) {
          const push = (1 - mDist / 90) * 14;
          sx += (mdx / mDist) * push;
          sy += (mdy / mDist) * push;
          n.energy = Math.min(1, n.energy + 0.38);
        }

        projected.push({ sx, sy, z: z2, perspective, node: n });
      }

      projected.sort((a, b) => a.z - b.z);

      ctx.lineWidth = 0.95;
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        let connections = 0;
        for (let j = i + 1; j < projected.length && connections < 3; j++) {
          const b = projected[j];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const distSq = dx * dx + dy * dy;
          if (distSq < 3800) {
            connections++;
            const alpha = (1 - Math.sqrt(distSq) / 62) * 0.28 + (a.node.energy + b.node.energy) * 0.24;
            const [r, g, bl] = a.node.energy > 0.35 ? [0, 132, 61] : a.node.rgb;
            ctx.strokeStyle = `rgba(${r},${g},${bl},${Math.min(0.82, alpha)})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        const [r, g, b] = p.node.rgb;
        const alpha = Math.min(1, 0.56 + (p.z + 1.2) * 0.24 + p.node.energy * 0.4);
        const radius = (p.node.size + p.node.energy * 2.8) * (0.75 + p.perspective * 0.25);

        if (p.node.energy > 0.35) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius * 2.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.node.energy * 0.22})`;
          ctx.fill();
        }

        drawTriangle(p.sx, p.sy, radius, p.node.angle, `rgba(${r},${g},${b},${alpha})`);
      }

      // Draw subregion callout tags when in 'antioquia' mode
      if (currentMode === 'antioquia') {
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        for (const hub of SUBREGION_HUBS) {
          const x1 = hub.x * cosY - hub.z * sinY;
          const z1 = hub.z * cosY + hub.x * sinY;
          const y2 = hub.y * cosX - z1 * sinX;
          const z2 = z1 * cosX + hub.y * sinX;
          const persp = 3.1 / (3.1 - z2 * 0.65);
          const hx = centerX + x1 * scale * persp;
          const hy = Math.max(isCompact ? 78 : 66, Math.min(height - 68, centerY + y2 * scale * persp - 14));
          ctx.fillStyle = 'rgba(6, 47, 29, 0.85)';
          ctx.fillText(hub.name, hx, hy);
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // =========================================================================
  // 3. 3D PERSPECTIVE TILT & SPOTLIGHT CARDS
  // =========================================================================
  function init3DTiltCards() {
    const cards = document.querySelectorAll('.tilt-card-3d');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -6;
        const rotY = ((x - cx) / cx) * 6;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // =========================================================================
  // 4. ANIMATED SVG BEZIER WORKFLOW
  // =========================================================================
  function initWorkflowAnimation() {
    const spine = document.getElementById('miaWorkflowSpine');
    const pulseHalo = document.getElementById('miaPulseHalo');
    const pulseCore = document.getElementById('miaPulseCore');
    const branchPath = document.getElementById('miaWorkflowBranch');
    const branchBadge = document.getElementById('miaBranchBadge');
    const nodeEls = Array.from(document.querySelectorAll('.mia-workflow__node'));

    const WORKFLOW_METADATA = [
      {
        step: 'ESTACIÓN 01',
        title: 'Ingesta Multimodal y Parser de Notas de Voz',
        desc: 'Extrae hechos relevantes, intención jurídica, urgencia vital y directivas de tono humano directamente desde audios coloquiales o mensajes de texto en WhatsApp.',
        file: 'src/voice-intent-parser.js'
      },
      {
        step: 'ESTACIÓN 02',
        title: 'Consentimiento Habeas Data (Ley 1581/12) y Triage',
        desc: 'Registra autorización ética de tratamiento de datos, permite elegir entre Modo Sencillo/Campesino o Modo Técnico Jurídico y persiste la sesión atómicamente.',
        file: 'src/session-manager.js'
      },
      {
        step: 'ESTACIÓN 03',
        title: 'Enrutamiento en los 125 Municipios y Red G8',
        desc: 'Localiza automáticamente el Juzgado Promiscuo/Circuito, la Personería Municipal, la Comisaría de Familia o el Consejo de Facultad de las 8 universidades G8.',
        file: 'data/antioquia_directory.json'
      },
      {
        step: 'ESTACIÓN 04',
        title: 'Motor Formal de Subsunción S(K) = <H, E, T, V>',
        desc: 'Calcula la ruta constitucional entre 9 especialidades, evalúa la Suficiencia Probatoria Ψ(E), el control de términos/caducidad y activa Medidas Provisionales de 48h.',
        file: 'src/legal-subsunction-engine.js'
      },
      {
        step: 'ESTACIÓN 05',
        title: 'Curaduría Anti-Slop, Léxico No Patologizante y Tono Humano',
        desc: 'Erradica clichés de IA, reemplaza terminología psiquiátrica estigmatizante por lenguaje digno (Ley 1616/13) e inyecta autocrítica sincera cuando corresponde.',
        file: 'src/non-pathologizing-lexicon.js'
      },
      {
        step: 'ESTACIÓN 06',
        title: 'Validador de Peticiones Incondicionadas y Regla ≤ 3 Páginas',
        desc: 'Impide cláusulas de auto-suspensión académica y audita el presupuesto máximo de 1.150 palabras para garantizar lectura judicial efectiva.',
        file: 'src/page-budget-engine.js'
      },
      {
        step: 'ESTACIÓN 07',
        title: 'Compilación Dual PDF/DOCX y Despacho al Ciudadano',
        desc: 'Genera la minuta lista para firma con Capítulo de Pruebas de Oficio (Art. 19 D.2591/91), la entrega en el chat de WhatsApp y registra el caso en el Ledger Analítico.',
        file: 'src/pdf-generator.js'
      }
    ];

    function updateInspector(idx) {
      const meta = WORKFLOW_METADATA[idx] || WORKFLOW_METADATA[0];
      const stepEl = document.getElementById('wfInspectorStep');
      const titleEl = document.getElementById('wfInspectorTitle');
      const descEl = document.getElementById('wfInspectorDesc');
      const fileEl = document.getElementById('wfInspectorFile');
      if (stepEl) stepEl.textContent = meta.step;
      if (titleEl) titleEl.textContent = meta.title;
      if (descEl) descEl.textContent = meta.desc;
      if (fileEl) fileEl.textContent = meta.file;
    }

    let manualHoldUntil = 0;
    let manualIdx = 0;
    let lastSyncedIdx = -1;

    nodeEls.forEach((el, idx) => {
      el.addEventListener('click', () => {
        manualIdx = idx;
        manualHoldUntil = performance.now() + 7000;
        lastSyncedIdx = idx;
        nodeEls.forEach((n, i) => {
          n.classList.toggle('is-active', i === idx);
          n.classList.toggle('is-complete', i < idx);
        });
        const isBranchMoment = idx === 3;
        if (branchPath) branchPath.classList.toggle('is-active', isBranchMoment);
        if (branchBadge) branchBadge.classList.toggle('is-active', isBranchMoment);
        updateInspector(idx);
      });
    });

    if (!spine || !pulseHalo || !pulseCore || typeof spine.getTotalLength !== 'function') return;

    const totalLen = spine.getTotalLength();
    const DURATION_MS = 12600;
    const startTime = performance.now();

    function animatePulse(now) {
      const elapsed = (now - startTime) % DURATION_MS;
      const progress = elapsed / DURATION_MS;
      const pt = spine.getPointAtLength(progress * totalLen);

      pulseHalo.setAttribute('cx', pt.x.toFixed(1));
      pulseHalo.setAttribute('cy', pt.y.toFixed(1));
      pulseCore.setAttribute('cx', pt.x.toFixed(1));
      pulseCore.setAttribute('cy', pt.y.toFixed(1));

      const activeIdx = now < manualHoldUntil ? manualIdx : Math.min(6, Math.floor(progress * 7));
      nodeEls.forEach((el, i) => {
        el.classList.toggle('is-active', i === activeIdx);
        el.classList.toggle('is-complete', i < activeIdx);
      });

      if (activeIdx !== lastSyncedIdx) {
        lastSyncedIdx = activeIdx;
        updateInspector(activeIdx);
      }

      const isBranchMoment = activeIdx === 3;
      if (branchPath) branchPath.classList.toggle('is-active', isBranchMoment);
      if (branchBadge) branchBadge.classList.toggle('is-active', isBranchMoment);

      requestAnimationFrame(animatePulse);
    }

    requestAnimationFrame(animatePulse);
  }

  // =========================================================================
  // 5. LIVE MULTI-TAB COMMAND STUDIO
  // =========================================================================
  function initControlPanel() {
    const tabBtns = Array.from(document.querySelectorAll('.panel-tab-btn'));
    const tabContents = {
      dashboard: document.getElementById('tab-dashboard'),
      subsunction: document.getElementById('tab-subsunction'),
      kanban: document.getElementById('tab-kanban'),
      alerts: document.getElementById('tab-alerts'),
      directory: document.getElementById('tab-directory'),
      agent: document.getElementById('tab-agent')
    };

    function switchTab(tabKey) {
      tabBtns.forEach((btn) => {
        const isTarget = btn.getAttribute('data-panel-tab') === tabKey;
        btn.classList.toggle('is-active', isTarget);
        if (isTarget && window.innerWidth <= 1080 && typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
      Object.entries(tabContents).forEach(([key, el]) => {
        if (el) el.classList.toggle('is-hidden', key !== tabKey);
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-panel-tab')));
    });

    document.querySelectorAll('[data-jump-tab]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-jump-tab')));
    });

    let casesCache = [];
    let directoryCache = { municipios: {}, universidades: {} };

    async function fetchAndRenderAnalytics() {
      try {
        const [analyticsRes, casesRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/cases')
        ]);
        const analytics = await analyticsRes.json();
        const casesData = await casesRes.json();
        casesCache = casesData.cases || analytics.recentCases || [];

        renderDashboard(analytics, casesCache);
        renderKanban(casesCache);
        renderAlerts(analytics.activeAlerts || []);
      } catch (err) {
        console.warn('Error cargando analítica:', err.message);
      }
    }

    function renderDashboard(analytics, cases) {
      const kpis = analytics.kpis || {};
      const elTotal = document.getElementById('kpiTotalCases');
      const elPsi = document.getElementById('kpiAvgPsi');
      const elProv = document.getElementById('kpiProvisional');
      const elSav = document.getElementById('kpiSavings');
      const elSideCount = document.getElementById('sidebarCaseCount');
      const elSideAlert = document.getElementById('sidebarAlertCount');

      if (elTotal) elTotal.textContent = kpis.totalCases || cases.length;
      if (elPsi) elPsi.textContent = `${kpis.avgProbativeSufficiency || 87.5}%`;
      if (elProv) elProv.textContent = kpis.provisionalMeasuresTriggered || 4;
      if (elSav) {
        const millions = ((kpis.estimatedCitizenSavingsCOP || cases.length * 650000) / 1e6).toFixed(1);
        elSav.textContent = `$${millions}M COP`;
      }
      if (elSideCount) elSideCount.textContent = cases.length;
      if (elSideAlert) elSideAlert.textContent = (analytics.activeAlerts || []).length;

      // Subregion Bars (Verde Bandera de Antioquia)
      const subContainer = document.getElementById('chartSubregions');
      if (subContainer && analytics.distributions?.bySubregion) {
        const entries = Object.entries(analytics.distributions.bySubregion).sort((a, b) => b[1] - a[1]);
        const maxVal = Math.max(1, ...entries.map(e => e[1]));
        subContainer.innerHTML = entries.map(([sub, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return `
            <div class="chart-bar-row">
              <div class="chart-bar-labels">
                <span>${sub}</span>
                <span class="font-mono" style="color: var(--text-muted);">${count} exp.</span>
              </div>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${pct}%; background: linear-gradient(90deg, var(--ant-green-primary), var(--ant-green-vivid));"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Routes Bars (Oro Real Antioqueño)
      const routeContainer = document.getElementById('chartRoutes');
      if (routeContainer && analytics.distributions?.byRoute) {
        const entries = Object.entries(analytics.distributions.byRoute).sort((a, b) => b[1] - a[1]);
        const maxVal = Math.max(1, ...entries.map(e => e[1]));
        routeContainer.innerHTML = entries.map(([route, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return `
            <div class="chart-bar-row">
              <div class="chart-bar-labels">
                <span class="font-mono" style="font-size: 0.7rem;">${route}</span>
                <span class="font-mono" style="color: var(--text-muted);">${count}</span>
              </div>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${pct}%; background: linear-gradient(90deg, var(--ant-gold-primary), var(--ant-gold-vivid));"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Table
      const tbody = document.getElementById('dashboardCasesTableBody');
      if (tbody) {
        tbody.innerHTML = cases.slice(0, 8).map((c) => {
          const pillClass = c.status === 'RESUELTO'
            ? 'status-pill--resuelto'
            : c.status === 'RADICADO'
              ? 'status-pill--radicado'
              : 'status-pill--other';
          return `
            <tr>
              <td data-label="ID Expediente" class="font-mono" style="font-weight: 700;">${c.id}</td>
              <td data-label="Ciudadano / Municipio">
                <div style="font-weight: 700;">${c.citizenName}</div>
                <div style="font-size: 0.7rem; color: var(--ink-500);">${c.municipalityLabel} (${c.subregion})</div>
              </td>
              <td data-label="Ruta & Accionado">
                <div class="font-mono" style="font-size: 0.7rem; font-weight: 700; color: var(--ant-green-primary);">${c.routeId}</div>
                <div style="font-size: 0.7rem; color: var(--ink-500);">${c.targetEntity}</div>
              </td>
              <td data-label="Suficiencia Ψ(E)" class="font-mono" style="font-weight: 700;">${c.psiScore}%</td>
              <td data-label="Estado"><span class="status-pill ${pillClass}">${c.status}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    // Kanban Board
    const KANBAN_COLUMNS = [
      { id: 'TRIAGE', label: '1. Triage S(K)' },
      { id: 'BORRADOR_LISTO', label: '2. Minuta Curada' },
      { id: 'RADICADO', label: '3. Radicado' },
      { id: 'EN_TERMINO', label: '4. En Término SLA' },
      { id: 'RESUELTO', label: '5. Fallo / Resuelto' }
    ];

    function renderKanban(cases) {
      const grid = document.getElementById('kanbanBoardGrid');
      if (!grid) return;

      grid.innerHTML = KANBAN_COLUMNS.map((col, colIdx) => {
        const colCases = cases.filter(c => c.status === col.id);
        const nextCol = KANBAN_COLUMNS[colIdx + 1];

        return `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <span>${col.label}</span>
              <span class="tab-badge">${colCases.length}</span>
            </div>
            <div>
              ${colCases.map(c => `
                <div class="kanban-card">
                  <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.65rem; margin-bottom: 4px;">
                    <strong style="color: var(--ant-green-primary);">${c.id}</strong>
                    <span style="color: var(--text-muted);">Ψ ${c.psiScore}%</span>
                  </div>
                  <div class="font-display" style="font-size: 0.8rem; font-weight: 700; margin-bottom: 2px;">${c.citizenName}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">${c.municipalityLabel} · ${c.targetEntity}</div>
                  ${nextCol ? `
                    <button type="button" data-advance-id="${c.id}" data-next-status="${nextCol.id}" class="kanban-advance-btn">
                      Mover a ${nextCol.label} →
                    </button>
                  ` : `
                    <div class="font-mono" style="font-size: 0.65rem; font-weight: 700; color: var(--ant-green-primary); margin-top: 6px;">
                      ✓ Garantía Cumplida
                    </div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('.kanban-advance-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const caseId = btn.getAttribute('data-advance-id');
          const nextStatus = btn.getAttribute('data-next-status');
          await fetch('/api/cases/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId, status: nextStatus })
          });
          fetchAndRenderAnalytics();
        });
      });
    }

    function renderAlerts(alerts) {
      const container = document.getElementById('alertsListContainer');
      if (!container) return;
      if (!alerts.length) {
        container.innerHTML = `<div class="chart-card" style="text-align:center; font-size: 0.82rem; color: var(--text-muted);">No hay alertas críticas pendientes.</div>`;
        return;
      }
      container.innerHTML = alerts.map(a => `
        <div class="chart-card" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="status-pill status-pill--other">${a.urgencyLevel}</span>
              <strong class="font-mono" style="font-size: 0.78rem;">${a.caseId}</strong>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">· ${a.citizenName} (${a.municipality})</span>
            </div>
            <div style="font-size: 0.82rem; font-weight: 600;">${a.message}</div>
          </div>
          <div class="font-mono" style="font-size: 0.76rem; font-weight: 700; color: var(--ant-gold-primary);">
            SLA Restante: ${a.remainingDays} día(s) hábiles
          </div>
        </div>
      `).join('');
    }

    // Subsunction Presets
    const SUBSUNCTION_PRESETS = {
      salud: {
        name: 'María Edilma Osorio',
        mun: 'Caucasia',
        att: '2',
        text: 'Tengo 74 años, vivo en Caucasia (Bajo Cauca) y soy paciente oncológica. Savia Salud EPS se niega a entregarme el medicamento ordenado por el especialista hace 12 días y mi vida corre peligro urgente.'
      },
      academico: {
        name: 'Santiago Montoya Vélez',
        mun: 'Caldas',
        att: '2',
        text: 'Es menester señalar que soy estudiante de pregrado en Unilasallista en Caldas y tuve un cuadro clínico psiquiátrico de ansiedad y depresión hace 20 días. Solicito cancelar el semestre de forma extemporánea sin que me cobren multa ni pierda mi cupo mientras me alivio.'
      },
      agua: {
        name: 'Jairo Alonso Tuberquia',
        mun: 'Apartadó',
        att: '2',
        text: 'En nuestro hogar en Apartadó (Urabá) viven dos niños menores de edad y nos cortaron totalmente el servicio de agua potable del acueducto EPM, dejándonos sin mínimo vital.'
      },
      campesino: {
        name: 'Pedro Nel Loaiza',
        mun: 'Andes',
        att: '1',
        text: 'Soy campesino caficultor de la vereda El Cinco en el municipio de Andes. Nos notificaron una orden policiva de desalojo sobre nuestra parcela agraria familiar sin respetar el debido proceso campesino ni la Agencia Nacional de Tierras.'
      },
      datacredito: {
        name: 'Hernando de Jesús Giraldo',
        mun: 'Rionegro',
        att: '2',
        text: 'Me reportaron negativamente en Datacrédito y TransUnion en Rionegro sin haberme enviado nunca la comunicación previa de 20 días calendario que exige la Ley 1266 de 2008.'
      }
    };

    document.querySelectorAll('.subsunction-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-preset');
        const p = SUBSUNCTION_PRESETS[key];
        if (!p) return;
        document.getElementById('subCitizenName').value = p.name;
        document.getElementById('subMunicipality').value = p.mun;
        document.getElementById('subAttachments').value = p.att;
        document.getElementById('subRawText').value = p.text;
        executeSubsunction(false);
      });
    });

    async function executeSubsunction(registerCase = false) {
      const citizenName = document.getElementById('subCitizenName')?.value || 'Ciudadano';
      const municipality = document.getElementById('subMunicipality')?.value || 'Medellín';
      const attachmentsCount = Number(document.getElementById('subAttachments')?.value || 1);
      const text = document.getElementById('subRawText')?.value || '';
      const out = document.getElementById('subsunctionResultContainer');
      if (!out) return;

      try {
        const res = await fetch('/api/subsume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ citizenName, municipality, attachmentsCount, text, registerCase })
        });
        const data = await res.json();
        const s = data.subsunction;

        out.innerHTML = `
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; padding-bottom: 14px; margin-bottom: 16px; border-bottom: 1px solid var(--border-crystal);">
            <div>
              <div class="font-mono" style="font-size: 0.68rem; font-weight: 700; color: var(--ant-green-primary);">RUTA CONSTITUCIONAL SUBSUMIDA (H)</div>
              <h4 class="font-display" style="font-size: 1.15rem; font-weight: 700;">${s.route.title}</h4>
            </div>
            <span class="status-pill status-pill--resuelto">${s.route.id}</span>
          </div>

          <div class="form-grid-3" style="margin-bottom: 16px;">
            <div class="chart-card" style="padding: 14px;">
              <div class="kpi-label">SUFICIENCIA PROBATORIA Ψ(E)</div>
              <div class="kpi-value" style="font-size: 1.6rem; color: var(--ant-green-primary);">${s.probative.psiScore}/100</div>
              <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">${s.probative.sufficiencyLevel}</div>
            </div>
            <div class="chart-card" style="padding: 14px;">
              <div class="kpi-label">VULNERABILIDAD V(K)</div>
              <div class="kpi-value" style="font-size: 1.6rem; color: var(--ant-gold-primary);">${s.vulnerability.score}/100</div>
              <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">${s.vulnerability.urgencyLevel}</div>
            </div>
            <div class="chart-card" style="padding: 14px;">
              <div class="kpi-label">COMPETENCIA TERRITORIAL</div>
              <div class="font-display" style="font-size: 1rem; font-weight: 700; margin: 6px 0 4px 0;">${s.territory.municipality} (${s.territory.subregion})</div>
              <div class="font-mono" style="font-size: 0.68rem; color: var(--text-muted);">${s.territory.juzgadoEmail}</div>
            </div>
          </div>

          <div class="chart-card" style="padding: 14px; margin-bottom: 16px;">
            <div class="font-mono" style="font-size: 0.68rem; font-weight: 700; color: var(--ant-green-primary); margin-bottom: 4px;">
              ✓ RELATO DEPURADO (FILTRO ANTI-SLOP + LÉXICO NO PATOLOGIZANTE + ESTADO AFIRMATIVO)
            </div>
            <p style="font-size: 0.82rem; font-style: italic; color: var(--text-primary);">"${s.curatedFacts}"</p>
          </div>

          <div class="charts-grid" style="margin-bottom: 0;">
            <div class="chart-card" style="padding: 14px;">
              <div class="kpi-label" style="margin-bottom: 8px;">PRECEDENTES DE LA CORTE CONSTITUCIONAL</div>
              <ul style="padding-left: 16px; font-size: 0.76rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                ${s.route.jurisprudence.map(j => `<li>${j}</li>`).join('')}
              </ul>
            </div>
            <div class="chart-card" style="padding: 14px;">
              <div class="kpi-label" style="margin-bottom: 8px;">PRETENSIONES INCONDICIONADAS (${s.audits.pageBudget.estimatedPages} PÁGS)</div>
              <ul style="padding-left: 16px; font-size: 0.76rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                ${s.unconditionedPetitions.slice(0, 3).map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          </div>
          ${data.registeredCase ? `
            <div style="margin-top: 14px; padding: 12px 16px; border-radius: 12px; background: #dcfce7; color: #065f46; font-size: 0.8rem; font-weight: 700;">
              ✅ Expediente registrado en el Kanban Departamental con código ${data.registeredCase.id}.
            </div>
          ` : ''}
        `;

        if (registerCase) fetchAndRenderAnalytics();
      } catch (err) {
        out.innerHTML = `<div style="color: #dc2626; font-size: 0.8rem;">Error ejecutando subsunción: ${err.message}</div>`;
      }
    }

    document.getElementById('runSubsunctionBtn')?.addEventListener('click', () => executeSubsunction(false));
    document.getElementById('registerSubsunctionCaseBtn')?.addEventListener('click', () => executeSubsunction(true));

    // Directory 125 Municipalities + 8 G8 Universities
    async function loadDirectory() {
      try {
        const res = await fetch('/api/directory');
        directoryCache = await res.json();
        renderDirectory('');
      } catch (e) {
        console.warn('Error cargando directorio:', e.message);
      }
    }

    function renderDirectory(filterText = '') {
      const q = filterText.trim().toLowerCase();
      const uniGrid = document.getElementById('g8UniversitiesGrid');
      const munGrid = document.getElementById('municipalitiesGrid');
      const countBadge = document.getElementById('munCountBadge');

      if (uniGrid && directoryCache.universidades) {
        const unis = Object.entries(directoryCache.universidades);
        uniGrid.innerHTML = unis.map(([sigla, u]) => `
          <div class="dir-card">
            <div class="font-display" style="font-size: 0.78rem; font-weight: 700;">${u.sigla || sigla} · ${u.nombre_oficial || u.nombre}</div>
            <div class="font-mono" style="font-size: 0.66rem; color: var(--ant-green-primary); margin-top: 4px;">${u.consejo_facultad?.email || u.correoConsultorio || ''}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">${u.consultorioJuridico || u.consultorio_juridico?.nombre || ''}</div>
          </div>
        `).join('');
      }

      if (munGrid && directoryCache.municipios) {
        const allMuns = Object.entries(directoryCache.municipios).filter(([key, m]) => {
          if (!q) return true;
          const label = m.nombre_oficial || m.municipio || '';
          return (
            key.toLowerCase().includes(q) ||
            label.toLowerCase().includes(q) ||
            (m.subregion || '').toLowerCase().includes(q)
          );
        });
        if (countBadge) countBadge.textContent = allMuns.length;

        munGrid.innerHTML = allMuns.map(([key, m]) => `
          <div class="dir-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong class="font-display" style="font-size: 0.8rem;">${m.nombre_oficial || m.municipio}</strong>
              <span class="tab-badge">${m.subregion}</span>
            </div>
            <div class="font-mono" style="font-size: 0.66rem; color: var(--ant-green-primary);">⚖️ ${m.juzgado_reparto?.email || m.email_juzgado || ''}</div>
            <div class="font-mono" style="font-size: 0.66rem; color: var(--text-muted); margin-top: 2px;">🏛️ ${m.personeria?.email || m.email_personeria || ''}</div>
          </div>
        `).join('');
      }
    }

    document.getElementById('directorySearchInput')?.addEventListener('input', (e) => {
      renderDirectory(e.target.value);
    });

    // Agent Configuration & Signal Repair
    document.getElementById('saveAgentConfigBtn')?.addEventListener('click', async () => {
      const phoneNumber = document.getElementById('cfgPhoneInput')?.value;
      const pairingMethod = document.getElementById('cfgPairingSelect')?.value;
      const autoReplyMode = document.getElementById('cfgReplyModeSelect')?.value;
      const fb = document.getElementById('agentConfigFeedback');

      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, pairingMethod, autoReplyMode })
      });

      if (fb) {
        fb.textContent = `✓ Configuración guardada: +${phoneNumber} (${pairingMethod.toUpperCase()} / ${autoReplyMode.toUpperCase()})`;
        fb.classList.remove('is-hidden');
      }
      const sidePhone = document.getElementById('sidebarPhoneDisplay');
      const sideMode = document.getElementById('sidebarModeDisplay');
      if (sidePhone) sidePhone.textContent = `+${phoneNumber}`;
      if (sideMode) sideMode.textContent = `Modo: ${autoReplyMode.toUpperCase()} · ${pairingMethod.toUpperCase()}`;
    });

    async function triggerSignalRepair() {
      const res = await fetch('/api/session/repair', { method: 'POST' });
      const data = await res.json();
      const box = document.getElementById('signalHealthBox');
      if (box) {
        box.innerHTML = `
          <div style="color: #34d399; font-weight: 700;">✓ ${data.message || 'Sesión Signal purgada y sincronizada.'}</div>
          <div style="margin-top: 4px;">• Hora de purga: ${new Date().toLocaleTimeString()}</div>
        `;
      }
    }

    document.getElementById('runSignalRepairBtn')?.addEventListener('click', triggerSignalRepair);
    document.getElementById('quickRepairBtn')?.addEventListener('click', () => {
      switchTab('agent');
      triggerSignalRepair();
    });

    fetchAndRenderAnalytics();
    executeSubsunction(false);
    loadDirectory();
  }

  // =========================================================================
  // 6. REALISTIC IPHONE 16 PRO WHATSAPP SIMULATOR
  // =========================================================================
  function initWhatsAppSimulator() {
    const container = document.getElementById('waMessagesContainer');
    const form = document.getElementById('waChatForm');
    const input = document.getElementById('waChatInput');
    const resetBtn = document.getElementById('waResetChatBtn');
    if (!container || !form || !input) return;

    let sessionId = 'web-demo-' + Date.now() + '@s.whatsapp.net';

    const SCENARIO_SCRIPTS = {
      salud: [
        { role: 'user', text: '!hola', time: '10:14 AM' },
        { role: 'bot', text: '⚖️ *JUSTICIA WHATSAPP — LITIGIO ESTRATÉGICO*\n¡Hola! 👋 ¿Autoriza el tratamiento ético de sus datos (Habeas Data - Ley 1581 de 2012) para construir su estrategia constitucional?\n1️⃣ Sí, autorizo.', time: '10:14 AM' },
        { role: 'user', text: '1', time: '10:15 AM' },
        { role: 'user', text: 'Soy María Edilma Osorio en Caucasia. Savia Salud EPS me niega mi medicamento oncológico urgente hace 10 días.', time: '10:15 AM' },
        { role: 'bot', text: '🔍 *SUBSUNCIÓN S(K) COMPLETADA*\n• *Ruta:* TUTELA_SALUD (Art. 86 C.P. y Ley 1751/15)\n• *Suficiencia Ψ(E):* 92/100 (Buena Fe Art. 83 C.P.)\n• *Medida Provisional 48h:* ACTIVADA (Art. 7 D.2591/91)\n• *Reparto:* repartocaucasia@cendoj.ramajudicial.gov.co\n\n📄 _Minuta PDF de 3 páginas lista para radicación._', time: '10:15 AM' }
      ],
      academico: [
        { role: 'user', text: '!hola', time: '11:02 AM' },
        { role: 'user', text: 'Soy Santiago Montoya en Caldas (Unilasallista). Tuve una crisis fuerte de ansiedad y depresión y necesito cancelar el semestre extemporáneamente sin perder el cupo.', time: '11:03 AM' },
        { role: 'bot', text: '🔍 *SUBSUNCIÓN ACADÉMICA G8 COMPLETADA*\n• *Ruta:* CANCELACION_ACADEMICA_SALUD (Ley 1616/13, Sentencias T-441/12, T-574/17 y T-238/24)\n• *Curaduría:* Léxico despatologizado + Tono de autocrítica sincera + Peticiones 100% incondicionadas\n• *Destino:* consejo.ingenieria@unilasallista.edu.co\n\n📄 _Expediente PDF + DOCX (2.4 páginas) generado._', time: '11:03 AM' }
      ],
      agua: [
        { role: 'user', text: '!hola', time: '02:20 PM' },
        { role: 'user', text: 'En Apartadó nos cortaron el agua potable de EPM y tenemos dos niños pequeños en la casa.', time: '02:21 PM' },
        { role: 'bot', text: '🔍 *SUBSUNCIÓN MÍNIMO VITAL DE AGUA*\n• *Ruta:* TUTELA_AGUA (Sentencias T-740/11 y T-118/18)\n• *Orden Solicitada:* Reconexión inmediata de mínimo vital de 50 litros diarios por persona en 48 horas.\n• *Juzgado:* repartoapartado@cendoj.ramajudicial.gov.co', time: '02:21 PM' }
      ]
    };

    function appendBubble(role, text, timeStr, pdfFileName = null) {
      const bubble = document.createElement('div');
      const isUser = role === 'user';
      bubble.className = `wa-bubble ${isUser ? 'wa-bubble--user' : 'wa-bubble--bot'}`;

      const formatted = String(text)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');

      bubble.innerHTML = `
        <div>${formatted}</div>
        ${pdfFileName ? `
          <a href="/generated_docs/${pdfFileName}" target="_blank" style="display:flex; align-items:center; gap:6px; margin-top:8px; padding:6px 10px; border-radius:8px; background:#f0fdf4; border:1px solid var(--ant-green-primary); color:var(--ant-green-primary); font-family:var(--font-mono); font-size:0.68rem; font-weight:700;">
            <span>📄</span>
            <span>${pdfFileName}</span>
          </a>
        ` : ''}
        <div class="wa-bubble-meta">
          <span>${timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          ${isUser ? '<span style="color: #53BDEB; font-weight: 700;">✓✓</span>' : ''}
        </div>
      `;
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
    }

    function playScenario(key) {
      const script = SCENARIO_SCRIPTS[key] || SCENARIO_SCRIPTS.salud;
      container.innerHTML = '';
      script.forEach((msg, idx) => {
        setTimeout(() => {
          appendBubble(msg.role, msg.text, msg.time);
        }, idx * 240);
      });
    }

    document.querySelectorAll('.wa-scenario-card').forEach((card) => {
      card.addEventListener('click', () => {
        playScenario(card.getAttribute('data-wa-scenario'));
        if (window.innerWidth <= 1080) {
          document.querySelector('.mia-iphone-frame')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      appendBubble('user', msg);

      try {
        const res = await fetch('/api/simulate-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: msg })
        });
        const data = await res.json();
        appendBubble('bot', data.reply, null, data.pdfFileName);
      } catch (err) {
        appendBubble('bot', 'Escriba *!hola* para iniciar la asesoría constitucional.');
      }
    });

    resetBtn?.addEventListener('click', async () => {
      sessionId = 'web-demo-' + Date.now() + '@s.whatsapp.net';
      container.innerHTML = '';
      appendBubble('user', '!hola');
      const res = await fetch('/api/simulate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: '!hola' })
      });
      const data = await res.json();
      appendBubble('bot', data.reply);
    });

    playScenario('salud');
  }

  // =========================================================================
  // 7. INTERACTIVE AUTONOMOUS DEPLOYMENT SIMULATOR (#despliegue)
  // =========================================================================
  function initDeploySimulator() {
    const stepCards = Array.from(document.querySelectorAll('[data-deploy-step]'));
    const terminalBody = document.getElementById('deployTerminalBody');
    const runBtn = document.getElementById('runLiveDeploySimBtn');
    if (!terminalBody) return;

    const STEP_LOGS = [
      [
        '<span class="term-prompt">$</span> <span class="term-cmd">git clone https://github.com/DOMINUSBABEL/justicia-whatsapp.git && cd justicia-whatsapp</span>',
        '<span class="term-info">[git]</span> Clonando en \'justicia-whatsapp\'... 100% completado.',
        '<span class="term-prompt">$</span> <span class="term-cmd">npm install</span>',
        '<span class="term-ok">✓</span> @whiskeysockets/baileys@6.7.x + motor S(K) instalados sin vulnerabilidades.',
        '<span class="term-ok">✓</span> 125 municipios de Antioquia + 8 Universidades G8 verificados en <span class="term-gold">data/antioquia_directory.json</span>.'
      ],
      [
        '<span class="term-prompt">$</span> <span class="term-cmd">node index.js --pairing-code --phone=573126689962</span>',
        '<span class="term-info">[Baileys v6.7]</span> Negociando Noise_XX_25519_AESGCM_SHA256 con WhatsApp Multi-Device...',
        '<span class="term-ok">✓</span> Canal criptográfico establecido · Solicitando Pairing Code de 8 dígitos:',
        '<span class="term-gold">╔══════════════════════════════════════════════════╗</span>',
        '<span class="term-gold">║   CÓDIGO DE VINCULACIÓN WHATSAPP:  J U S T - 2 0 2 6   ║</span>',
        '<span class="term-gold">╚══════════════════════════════════════════════════╝</span>',
        '<span class="term-ok">✓</span> Dispositivo vinculado exitosamente en +57 312 668 9962 (Modo Híbrido).'
      ],
      [
        '<span class="term-prompt">$</span> <span class="term-cmd">npm run web</span>',
        '<span class="term-ok">✓</span> <span class="term-gold">JusticIA WhatsApp API & Command Studio</span> activo en <span class="term-cmd">http://localhost:3080</span>',
        '<span class="term-info">[Subsunción S(K)]</span> 9 Rutas Constitucionales cargadas · Validador ≤ 3 páginas activo.',
        '<span class="term-info">[Telemetría]</span> Ledger Analítico sincronizado con <span class="term-gold">data/cases_ledger.json</span>.',
        '<span class="term-ok">✓</span> Endpoints REST listos: /api/analytics · /api/subsume · /api/simulate-chat · /api/directory'
      ],
      [
        '<span class="term-prompt">$</span> <span class="term-cmd">pm2 start index.js --name justicia-antioquia && npm test</span>',
        '<span class="term-info">[Watchdog Signal]</span> Monitor Bad MAC / Decryption Error activo (auto-purga en ./auth_info_baileys).',
        '<span class="term-ok">✓</span> Suite de pruebas: <span class="term-gold">13/13 tests aprobados</span> (Subsunción, Léxico Ley 1616/13, API REST).',
        '<span class="term-ok">✓</span> Demonio PM2 [justicia-antioquia] ONLINE · Uptime 99.98% · Consumo RAM: 44 MB.'
      ]
    ];

    function renderStepLogs(stepIndex) {
      stepCards.forEach((c, idx) => c.classList.toggle('is-active', idx === stepIndex));
      const lines = STEP_LOGS[stepIndex] || STEP_LOGS[0];
      terminalBody.innerHTML = lines.map(line => `<div class="term-line">${line}</div>`).join('');
    }

    stepCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.copy-cmd-btn')) return;
        renderStepLogs(idx);
        if (window.innerWidth <= 1080) {
          document.querySelector('.deploy-terminal-window')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    runBtn?.addEventListener('click', () => {
      terminalBody.innerHTML = '';
      let currentStep = 0;

      function playNextStep() {
        if (currentStep >= STEP_LOGS.length) return;
        stepCards.forEach((c, idx) => c.classList.toggle('is-active', idx === currentStep));
        const lines = STEP_LOGS[currentStep];
        lines.forEach((line, lIdx) => {
          setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'term-line';
            div.innerHTML = line;
            terminalBody.appendChild(div);
            terminalBody.scrollTop = terminalBody.scrollHeight;
          }, lIdx * 150);
        });
        currentStep++;
        if (currentStep < STEP_LOGS.length) {
          setTimeout(playNextStep, lines.length * 160 + 350);
        }
      }

      playNextStep();
    });

    renderStepLogs(0);
  }

  // =========================================================================
  // 8. DUAL VIEW SWITCHER & COPY BUTTONS
  // =========================================================================
  function initDualViewAndCopy() {
    const btnCli = document.getElementById('dualBtnCli');
    const btnDoc = document.getElementById('dualBtnDoc');
    const viewCli = document.getElementById('dualViewCli');
    const viewDoc = document.getElementById('dualViewDoc');

    btnCli?.addEventListener('click', () => {
      btnCli.classList.add('is-active-teal');
      btnDoc?.classList.remove('is-active-coral');
      viewCli?.classList.remove('is-hidden');
      viewDoc?.classList.add('is-hidden');
    });

    btnDoc?.addEventListener('click', () => {
      btnDoc.classList.add('is-active-coral');
      btnCli?.classList.remove('is-active-teal');
      viewDoc?.classList.remove('is-hidden');
      viewCli?.classList.add('is-hidden');
    });

    document.querySelectorAll('.copy-cmd-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = btn.getAttribute('data-copy-cmd');
        if (cmd && navigator.clipboard) {
          navigator.clipboard.writeText(cmd);
          const orig = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(() => { btn.textContent = orig; }, 1600);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initBrainCanvas();
    init3DTiltCards();
    initWorkflowAnimation();
    initControlPanel();
    initWhatsAppSimulator();
    initDeploySimulator();
    initDualViewAndCopy();
  });
})();
