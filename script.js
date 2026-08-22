/* =============================================
   SAHIL VISHWAKARMA — PORTFOLIO ENGINE
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================
     1. CURSOR PRESS/TILT
     ========================================= */
  document.querySelectorAll('[data-cursor-press]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      const rx = ((e.clientY - rect.top - cy) / cy) * -8;
      const ry = ((e.clientX - rect.left - cx) / cx) * 8;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(0.98)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* =========================================
     2. VIDEO SCROLL SYNC + FADE TO BLACK
     ========================================= */
  const heroVideo = document.getElementById('heroVideo');
  const videoLayer = document.getElementById('videoLayer');
  const heroSection = document.getElementById('hero');
  const heroText = document.getElementById('heroText');
  const heroFade = document.getElementById('heroFade');
  const scrollIndicator = document.getElementById('scrollIndicator');

  let videoDuration = 0;
  if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', () => { videoDuration = heroVideo.duration; });
    heroVideo.load();
  }

  function handleVideoScroll() {
    if (!heroSection || !videoLayer) return;
    const rect = heroSection.getBoundingClientRect();
    const sectionHeight = heroSection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / Math.max(sectionHeight, 1));

    // Hide video layer once past the hero spacer
    videoLayer.classList.toggle('hidden', rect.bottom <= 0);

    // Scrub video
    if (heroVideo && videoDuration > 0) heroVideo.currentTime = progress * videoDuration;

    // Hero text visible between 10%-70%
    if (heroText) heroText.classList.toggle('visible', progress > 0.1 && progress < 0.7);

    // Scroll indicator
    if (scrollIndicator) scrollIndicator.classList.toggle('hidden', progress > 0.05);

    // Fade to black in the last 20% of the hero scroll
    if (heroFade) {
      const fadeStart = 0.75;
      if (progress > fadeStart) {
        heroFade.style.opacity = Math.min(1, (progress - fadeStart) / (1 - fadeStart));
      } else {
        heroFade.style.opacity = 0;
      }
    }
  }

  /* =========================================
     3. 3D WEBGL BACKGROUND (INTRODUCTION)
     ========================================= */
  const introSection = document.getElementById('introduction');
  const intro3dCanvas = document.getElementById('intro3dCanvas');

  if (intro3dCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, introSection.offsetWidth / introSection.offsetHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      canvas: intro3dCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(introSection.offsetWidth, introSection.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3D Objects Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Wireframe Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(6, 1.8, 120, 24, 2, 3);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x6c5ce7,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    group.add(knotMesh);

    // 2. Inner Icosahedron Cage
    const icoGeometry = new THREE.IcosahedronGeometry(4.5, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    group.add(icoMesh);

    // 3. Orbiting Geometric Octahedrons
    const satellites = [];
    const satCount = 6;
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.OctahedronGeometry(1.2 + Math.random() * 0.8, 0);
      const satMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ff88 : 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        radius: 12 + Math.random() * 6,
        speed: (0.01 + Math.random() * 0.015) * (i % 2 === 0 ? 1 : -1),
        angle: (i / satCount) * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 8
      };
      satellites.push(sat);
      group.add(sat);
    }

    // 4. Ambient Point Cloud
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 60;
      particlePositions[i + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.25,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse Parallax
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Resize
    function onWindowResize() {
      if (!introSection) return;
      const width = introSection.offsetWidth;
      const height = introSection.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize);

    // Animation Loop with Visibility Check
    let isIntroVisible = true;
    const introObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { isIntroVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    introObs.observe(introSection);

    let clock = 0;
    function animate3d() {
      requestAnimationFrame(animate3d);
      if (!isIntroVisible) return;

      clock += 0.01;

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Group rotation & tilt
      group.rotation.x = currentMouseY * 0.4 + Math.sin(clock * 0.5) * 0.1;
      group.rotation.y = currentMouseX * 0.6 + clock * 0.2;

      // Core mesh micro-rotations
      knotMesh.rotation.x += 0.005;
      knotMesh.rotation.y += 0.008;
      icoMesh.rotation.x -= 0.007;
      icoMesh.rotation.z += 0.005;

      // Orbit satellites
      satellites.forEach(sat => {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
        sat.position.y = sat.userData.yOffset + Math.sin(clock * 2 + sat.userData.angle) * 1.5;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Subtle particle float
      particleSystem.rotation.y = clock * 0.03;

      renderer.render(scene, camera);
    }
    animate3d();
  }

  /* =========================================
     4. SCROLL REVEAL [data-motion]
     ========================================= */
  const motionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); motionObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-motion]').forEach(el => motionObs.observe(el));

  /* Title words */
  const titleObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const p = e.target.closest('.intro-title');
        if (p) p.querySelectorAll('.title-word').forEach(w => w.classList.add('visible'));
        titleObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.title-word').forEach(w => titleObs.observe(w));

  /* =========================================
     5. STAT COUNTING
     ========================================= */
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = parseInt(el.dataset.count);
        if (!isNaN(target)) {
          let cur = 0; const step = Math.max(1, Math.ceil(target / 30));
          const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = cur + '+';
            if (cur >= target) clearInterval(iv);
          }, 45);
        }
        statObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number[data-count]').forEach(el => statObs.observe(el));

  /* =========================================
     6. MATRIX RAIN
     ========================================= */
  const matrixCanvas = document.getElementById('matrixCanvas');
  if (matrixCanvas) {
    const ctx = matrixCanvas.getContext('2d');
    let animId, fontSize = 14, drops;

    function resizeMatrix() {
      matrixCanvas.width = matrixCanvas.parentElement.offsetWidth;
      matrixCanvas.height = matrixCanvas.parentElement.offsetHeight;
      const cols = Math.floor(matrixCanvas.width / fontSize);
      drops = new Array(cols).fill(1);
    }
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);

    function drawMatrix() {
      ctx.fillStyle = 'rgba(5,5,16,0.08)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = fontSize + 'px JetBrains Mono,monospace';
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animId = requestAnimationFrame(drawMatrix);
    }

    const matObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { resizeMatrix(); drawMatrix(); } else { cancelAnimationFrame(animId); } });
    }, { threshold: 0.05 });
    matObs.observe(document.getElementById('hacker-projects'));
  }

  /* Binary + Typing */
  document.querySelectorAll('[data-binary]').forEach(el => {
    let b = ''; for (let i = 0; i < 2000; i++) b += Math.random() > 0.5 ? '1' : '0';
    el.textContent = b;
  });

  const hackerTyping = document.getElementById('hackerTyping');
  if (hackerTyping) {
    const cmds = ['cat /projects/osint_bot.py','python3 data_extractor.py --target=*','nmap -sV -sC 192.168.1.0/24','hashcat -m 0 -a 3 hashes.txt','./scan --deep --silent'];
    let ci = 0, chi = 0, del = false;
    function typeCmd() {
      const cmd = cmds[ci];
      if (!del) { hackerTyping.textContent = cmd.substring(0, chi + 1); chi++; if (chi === cmd.length) { del = true; setTimeout(typeCmd, 2500); return; } setTimeout(typeCmd, 50 + Math.random() * 40); }
      else { hackerTyping.textContent = cmd.substring(0, chi - 1); chi--; if (chi === 0) { del = false; ci = (ci + 1) % cmds.length; setTimeout(typeCmd, 400); return; } setTimeout(typeCmd, 25); }
    }
    const hObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { typeCmd(); hObs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    hObs.observe(document.getElementById('hacker-projects'));
  }

  /* =========================================
     7. HORIZONTAL GALLERY — STICKY + TRANSLATE
     ========================================= */
  const gallerySection = document.getElementById('project-gallery');
  const galleryTrack = document.getElementById('galleryTrack');

  function handleGalleryScroll() {
    if (!gallerySection || !galleryTrack) return;

    const rect = gallerySection.getBoundingClientRect();
    const sectionHeight = gallerySection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / Math.max(sectionHeight, 1));

    // Total horizontal distance to travel across all slides
    const slideCount = galleryTrack.children.length;
    const totalWidth = (slideCount - 1) * window.innerWidth;
    const translateX = -progress * totalWidth;

    galleryTrack.style.transform = `translateX(${translateX}px)`;
  }

  /* =========================================
     8. SAKURA PARTICLES
     ========================================= */
  const sakura = document.getElementById('sakuraParticles');
  if (sakura) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:radial-gradient(circle,rgba(255,183,197,0.8),rgba(255,105,135,0.3));border-radius:50% 0 50% 0;left:${Math.random()*100}%;top:${-10-Math.random()*20}%;opacity:${0.3+Math.random()*0.5};animation:sakuraFall ${5+Math.random()*8}s linear infinite;animation-delay:${Math.random()*8}s;`;
      sakura.appendChild(p);
    }
    if (!document.getElementById('sakura-kf')) {
      const s = document.createElement('style'); s.id = 'sakura-kf';
      s.textContent = `@keyframes sakuraFall{0%{transform:translateY(0) rotate(0) translateX(0);opacity:.7}25%{transform:translateY(25vh) rotate(90deg) translateX(30px)}50%{transform:translateY(50vh) rotate(180deg) translateX(-20px)}75%{transform:translateY(75vh) rotate(270deg) translateX(40px)}100%{transform:translateY(110vh) rotate(360deg) translateX(10px);opacity:0}}`;
      document.head.appendChild(s);
    }
  }

  /* =========================================
     9. SKILLS — VERTICAL BAR + GAME LOAD %
     ========================================= */
  const skillsSection = document.getElementById('skills');
  const centerBarFill = document.getElementById('centerBarFill');
  const centerBarValue = document.getElementById('centerBarValue');
  const skillsGrid = document.getElementById('skillsGrid');

  function handleSkillsScroll() {
    if (!skillsSection) return;
    const rect = skillsSection.getBoundingClientRect();
    const sectionHeight = skillsSection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / Math.max(sectionHeight, 1));

    // Fill the vertical bar
    if (centerBarFill) centerBarFill.style.height = (progress * 100) + '%';
    if (centerBarValue) centerBarValue.textContent = Math.round(progress * 100);

    // Each skill's percentage increases as you scroll
    if (skillsGrid) {
      const items = skillsGrid.querySelectorAll('.skill-item');
      const total = items.length;
      items.forEach((item, i) => {
        const level = parseInt(item.dataset.level) || 50;
        const start = (i / total) * 0.8;
        const end = start + 0.2;
        const p = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        const val = item.querySelector('.skill-val');
        if (val) val.textContent = Math.round(p * level) + '%';
      });
    }
  }

  /* =========================================
     10. INTERACTIVE CONVERSATIONAL CONTACT FLOW
     ========================================= */
  const TARGET_EMAIL = 'mrsahilvishwakarmaofficial@gmail.com';
  let currentStep = 1;
  const selectedTags = new Set();

  const stepPills = document.querySelectorAll('.step-pill');
  const stepPanels = document.querySelectorAll('.form-step');
  const nameInput = document.getElementById('senderName');
  const addressInput = document.getElementById('senderAddress');
  const emailInput = document.getElementById('senderEmail');
  const contactInput = document.getElementById('senderContact');
  const workSubjectInput = document.getElementById('workSubject');
  const messageInput = document.getElementById('senderMessage');
  const previewText = document.getElementById('previewText');
  const btnSendEmail = document.getElementById('btnSendEmail');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const contactToast = document.getElementById('contactToast');

  function showToast(msg) {
    if (!contactToast) return;
    contactToast.textContent = msg;
    contactToast.classList.add('show');
    setTimeout(() => { contactToast.classList.remove('show'); }, 3000);
  }

  function updateTransmissionSummary() {
    const name = nameInput?.value.trim() || '[Your Name / Org]';
    const address = addressInput?.value.trim() || '[Your Location / Remote]';
    const email = emailInput?.value.trim() || '[Your Email]';
    const contact = contactInput?.value.trim() || '[Contact Handle / Phone]';
    const tagsArr = Array.from(selectedTags);
    const tagStr = tagsArr.length > 0 ? tagsArr.join(', ') : 'General Collaboration';
    const subject = workSubjectInput?.value.trim() || 'Exciting Project / Collaboration';
    const details = messageInput?.value.trim() || '[Project Details & Timeline]';

    const summary = `=== TRANSMISSION TO SAHIL VISHWAKARMA ===
FROM: ${name}
LOCATION: ${address}
CONTACT: ${email} | ${contact}
AREA: ${tagStr}
SUBJECT: ${subject}

DETAILS:
${details}
=========================================`;

    if (previewText) previewText.textContent = summary;
    return { name, address, email, contact, tagStr, subject, details, summary };
  }

  function setStep(stepNum) {
    const num = Math.max(1, Math.min(5, stepNum));
    currentStep = num;

    stepPanels.forEach(panel => {
      const panelStep = parseInt(panel.dataset.stepPanel);
      panel.classList.toggle('active', panelStep === currentStep);
    });

    stepPills.forEach(pill => {
      const pStep = parseInt(pill.dataset.step);
      pill.classList.toggle('active', pStep === currentStep);
      pill.classList.toggle('completed', pStep < currentStep);
    });

    // Auto-focus input on active step
    setTimeout(() => {
      const activePanel = document.querySelector(`.form-step[data-step-panel="${currentStep}"]`);
      if (activePanel) {
        const input = activePanel.querySelector('input, textarea');
        if (input) input.focus();
      }
    }, 100);

    if (currentStep === 5) {
      updateTransmissionSummary();
    }
  }

  // Next / Prev Button Clicks
  document.querySelectorAll('.btn-next, .btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.goto);
      if (targetStep) setStep(targetStep);
    });
  });

  // Direct pill clicks
  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetStep = parseInt(pill.dataset.step);
      if (targetStep) setStep(targetStep);
    });
  });

  // Enter Key Progression in inputs
  [nameInput, addressInput, emailInput, contactInput, workSubjectInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setStep(currentStep + 1);
        }
      });
      inp.addEventListener('input', updateTransmissionSummary);
    }
  });
  if (messageInput) messageInput.addEventListener('input', updateTransmissionSummary);

  // Work Tag Picker Buttons
  document.querySelectorAll('.work-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove('selected');
      } else {
        selectedTags.add(tag);
        btn.classList.add('selected');
      }
      updateTransmissionSummary();
    });
  });

  // Action: Dispatch Email
  if (btnSendEmail) {
    btnSendEmail.addEventListener('click', () => {
      const data = updateTransmissionSummary();
      const mailSubject = encodeURIComponent(`[Portfolio Contact] ${data.subject} — ${data.name}`);
      const mailBody = encodeURIComponent(`Hi Sahil,

I would love to connect with you! Here are my details:

Name / Organization: ${data.name}
Location: ${data.address}
Email: ${data.email}
Phone / Social: ${data.contact}
Collaboration Area: ${data.tagStr}

Project Overview:
${data.details}

Best regards,
${data.name}`);

      const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${mailSubject}&body=${mailBody}`;
      showToast('Launching Email Client to dispatch to mrsahilvishwakarmaofficial@gmail.com...');
      window.location.href = mailtoUrl;
    });
  }

  // Action: Copy Text
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      const data = updateTransmissionSummary();
      navigator.clipboard.writeText(data.summary).then(() => {
        showToast('✓ Formatted Transmission Copied to Clipboard!');
      }).catch(() => {
        showToast('✓ Ready! Email: ' + TARGET_EMAIL);
      });
    });
  }

  /* =========================================
     11. MASTER SCROLL
     ========================================= */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleVideoScroll();
        handleGalleryScroll();
        handleSkillsScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  handleVideoScroll();
  handleGalleryScroll();
  handleSkillsScroll();

  setTimeout(() => {
    if (heroText) heroText.classList.add('visible');
  }, 800);

});
