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
     2. VIDEO SCROLL SYNC + FADE TO BLACK (ULTRA SMOOTH LERP)
     ========================================= */
  const heroVideo = document.getElementById('heroVideo');
  const videoLayer = document.getElementById('videoLayer');
  const heroSection = document.getElementById('hero');
  const heroText = document.getElementById('heroText');
  const heroFade = document.getElementById('heroFade');
  const scrollIndicator = document.getElementById('scrollIndicator');

  let videoDuration = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let isHeroVisible = true;

  if (heroVideo) {
    heroVideo.preload = 'auto';
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    const setDuration = () => { if (heroVideo.duration) videoDuration = heroVideo.duration; };
    heroVideo.addEventListener('loadedmetadata', setDuration);
    heroVideo.addEventListener('canplaythrough', setDuration);
    heroVideo.load();
  }

  function updateVideoScrollTarget() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const sectionHeight = heroSection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    targetProgress = Math.min(1, Math.max(0, scrolled / Math.max(sectionHeight, 1)));
    isHeroVisible = rect.bottom > -50;
    if (videoLayer) videoLayer.classList.toggle('hidden', rect.bottom <= 0);
  }

  function renderSmoothHero() {
    if (isHeroVisible) {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0002) {
        currentProgress += diff * 0.25;
        
        if (heroVideo && videoDuration > 0 && !heroVideo.seeking) {
          const targetTime = currentProgress * videoDuration;
          if (Math.abs(heroVideo.currentTime - targetTime) > 0.015) {
            heroVideo.currentTime = targetTime;
          }
        }
      }

      // Smooth continuous hero text fade
      if (heroText) {
        if (currentProgress >= 0.06 && currentProgress <= 0.72) {
          let op = 1;
          if (currentProgress < 0.2) op = (currentProgress - 0.06) / 0.14;
          else if (currentProgress > 0.55) op = (0.72 - currentProgress) / 0.17;
          const clamped = Math.max(0, Math.min(1, op));
          heroText.style.opacity = clamped;
          heroText.style.transform = `translateY(${(1 - clamped) * 12}px)`;
        } else {
          heroText.style.opacity = '0';
        }
      }

      // Scroll indicator
      if (scrollIndicator) {
        scrollIndicator.style.opacity = currentProgress > 0.04 ? '0' : '1';
        scrollIndicator.style.pointerEvents = currentProgress > 0.04 ? 'none' : 'auto';
      }

      // Fade to black
      if (heroFade) {
        const fadeStart = 0.72;
        if (currentProgress > fadeStart) {
          heroFade.style.opacity = Math.min(1, (currentProgress - fadeStart) / (1 - fadeStart));
        } else {
          heroFade.style.opacity = 0;
        }
      }
    }
    requestAnimationFrame(renderSmoothHero);
  }
  requestAnimationFrame(renderSmoothHero);

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

    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function onIntroResize() {
      if (!introSection) return;
      const width = introSection.offsetWidth;
      const height = introSection.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onIntroResize);

    let isIntroVisible = true;
    const introObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { isIntroVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    introObs.observe(introSection);

    let clock = 0;
    function animateIntro3d() {
      requestAnimationFrame(animateIntro3d);
      if (!isIntroVisible) return;

      clock += 0.01;

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      group.rotation.x = currentMouseY * 0.4 + Math.sin(clock * 0.5) * 0.1;
      group.rotation.y = currentMouseX * 0.6 + clock * 0.2;

      knotMesh.rotation.x += 0.005;
      knotMesh.rotation.y += 0.008;
      icoMesh.rotation.x -= 0.007;
      icoMesh.rotation.z += 0.005;

      satellites.forEach(sat => {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
        sat.position.y = sat.userData.yOffset + Math.sin(clock * 2 + sat.userData.angle) * 1.5;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      particleSystem.rotation.y = clock * 0.03;
      renderer.render(scene, camera);
    }
    animateIntro3d();
  }

  /* =========================================
     4. 3D WEBGL BACKGROUND (SKILLS SECTION)
     ========================================= */
  const skillsSection = document.getElementById('skills');
  const skills3dCanvas = document.getElementById('skills3dCanvas');

  if (skills3dCanvas && typeof THREE !== 'undefined') {
    const sScene = new THREE.Scene();
    const sCamera = new THREE.PerspectiveCamera(55, skillsSection.offsetWidth / skillsSection.offsetHeight, 0.1, 1000);
    sCamera.position.z = 30;

    const sRenderer = new THREE.WebGLRenderer({
      canvas: skills3dCanvas,
      alpha: true,
      antialias: true
    });
    sRenderer.setSize(skillsSection.offsetWidth, skillsSection.offsetHeight);
    sRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sGroup = new THREE.Group();
    sScene.add(sGroup);

    // 1. Dual Concentric 3D Rings
    const ringGeo1 = new THREE.TorusGeometry(10, 0.15, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    sGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(14, 0.2, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x6c5ce7, wireframe: true, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    sGroup.add(ring2);

    const ringGeo3 = new THREE.TorusGeometry(18, 0.25, 16, 100);
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.2 });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.y = Math.PI / 4;
    sGroup.add(ring3);

    // 2. Floating 3D Polyhedrons
    const polyhedrons = [];
    for (let i = 0; i < 12; i++) {
      const geo = i % 2 === 0 ? new THREE.DodecahedronGeometry(1.5, 0) : new THREE.IcosahedronGeometry(1.2, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x00d4ff : (i % 3 === 1 ? 0xa855f7 : 0x00ff88),
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      const poly = new THREE.Mesh(geo, mat);
      poly.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 20
      );
      poly.userData = {
        rx: (Math.random() - 0.5) * 0.02,
        ry: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.001 + Math.random() * 0.002,
        floatAmp: 1 + Math.random() * 2,
        initY: poly.position.y
      };
      polyhedrons.push(poly);
      sGroup.add(poly);
    }

    // 3. Cyber Matrix Point Grid
    const sParticleCount = 250;
    const sParticleGeo = new THREE.BufferGeometry();
    const sParticlePos = new Float32Array(sParticleCount * 3);

    for (let i = 0; i < sParticleCount * 3; i += 3) {
      sParticlePos[i] = (Math.random() - 0.5) * 70;
      sParticlePos[i + 1] = (Math.random() - 0.5) * 50;
      sParticlePos[i + 2] = (Math.random() - 0.5) * 30;
    }
    sParticleGeo.setAttribute('position', new THREE.BufferAttribute(sParticlePos, 3));
    const sParticleMat = new THREE.PointsMaterial({ color: 0x6c5ce7, size: 0.3, transparent: true, opacity: 0.5 });
    const sParticles = new THREE.Points(sParticleGeo, sParticleMat);
    sScene.add(sParticles);

    let sTargetMouseX = 0, sTargetMouseY = 0;
    let sCurrentMouseX = 0, sCurrentMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      sTargetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      sTargetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function onSkillsResize() {
      if (!skillsSection) return;
      const width = skillsSection.offsetWidth;
      const height = skillsSection.offsetHeight;
      sCamera.aspect = width / height;
      sCamera.updateProjectionMatrix();
      sRenderer.setSize(width, height);
    }
    window.addEventListener('resize', onSkillsResize);

    let isSkillsVisible = true;
    const skillsObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { isSkillsVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    skillsObs.observe(skillsSection);

    let sClock = 0;
    function animateSkills3d() {
      requestAnimationFrame(animateSkills3d);
      if (!isSkillsVisible) return;

      sClock += 0.01;
      sCurrentMouseX += (sTargetMouseX - sCurrentMouseX) * 0.05;
      sCurrentMouseY += (sTargetMouseY - sCurrentMouseY) * 0.05;

      sGroup.rotation.y = sCurrentMouseX * 0.4 + sClock * 0.15;
      sGroup.rotation.x = sCurrentMouseY * 0.3;

      ring1.rotation.z += 0.004;
      ring2.rotation.y += 0.005;
      ring3.rotation.x += 0.006;

      polyhedrons.forEach((poly, idx) => {
        poly.rotation.x += poly.userData.rx;
        poly.rotation.y += poly.userData.ry;
        poly.position.y = poly.userData.initY + Math.sin(sClock * 2 + idx) * poly.userData.floatAmp;
      });

      sParticles.rotation.y = -sClock * 0.02;
      sRenderer.render(sScene, sCamera);
    }
    animateSkills3d();
  }

  /* =========================================
     5. SCROLL REVEAL [data-motion]
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
     6. STAT COUNTING
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
     7. MATRIX RAIN
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
     8. HORIZONTAL GALLERY — STICKY + TRANSLATE
     ========================================= */
  const gallerySection = document.getElementById('project-gallery');
  const galleryTrack = document.getElementById('galleryTrack');

  function handleGalleryScroll() {
    if (!gallerySection || !galleryTrack) return;

    const rect = gallerySection.getBoundingClientRect();
    const sectionHeight = gallerySection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / Math.max(sectionHeight, 1));

    const slideCount = galleryTrack.children.length;
    const totalWidth = (slideCount - 1) * window.innerWidth;
    const translateX = -progress * totalWidth;

    galleryTrack.style.transform = `translateX(${translateX}px)`;
  }

  /* =========================================
     9. SAKURA PARTICLES
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
     10. SKILLS — VERTICAL BAR + GAME LOAD %
     ========================================= */
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
     11. CLEAN GLASSMORPHISM CONTACT FORM
     ========================================= */
  const TARGET_EMAIL = 'mrsahilvishwakarmaofficial@gmail.com';
  const btnSubmitContact = document.getElementById('btnSubmitContact');
  const contactName = document.getElementById('contactName');
  const contactEmail = document.getElementById('contactEmail');
  const contactAddress = document.getElementById('contactAddress');
  const contactSubject = document.getElementById('contactSubject');
  const contactMessage = document.getElementById('contactMessage');
  const contactToast = document.getElementById('contactToast');

  function showToast(msg) {
    if (!contactToast) return;
    contactToast.textContent = msg;
    contactToast.classList.add('show');
    setTimeout(() => { contactToast.classList.remove('show'); }, 3500);
  }

  if (btnSubmitContact) {
    btnSubmitContact.addEventListener('click', () => {
      const name = contactName?.value.trim() || '';
      const email = contactEmail?.value.trim() || '';
      const address = contactAddress?.value.trim() || 'Not specified';
      const subject = contactSubject?.value.trim() || 'Portfolio Inquiry';
      const message = contactMessage?.value.trim() || '';

      if (!name || !email) {
        showToast('Please fill in your name and email.');
        if (!name && contactName) contactName.focus();
        else if (!email && contactEmail) contactEmail.focus();
        return;
      }

      const mailSubject = encodeURIComponent(`[Portfolio Contact] ${subject} — ${name}`);
      const mailBody = encodeURIComponent(`Hi Sahil,

Name: ${name}
Email: ${email}
Location: ${address}
Subject: ${subject}

Message:
${message}

Best regards,
${name}`);

      const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${mailSubject}&body=${mailBody}`;
      showToast('Opening your email client...');
      window.location.href = mailtoUrl;
    });
  }

  /* =========================================
     12. MASTER SCROLL
     ========================================= */
  let ticking = false;
  window.addEventListener('scroll', () => {
    updateVideoScrollTarget();
    if (!ticking) {
      requestAnimationFrame(() => {
        handleGalleryScroll();
        handleSkillsScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateVideoScrollTarget();
  handleGalleryScroll();
  handleSkillsScroll();

  /* =========================================
     13. PIXEL CAT COMPANION (CURSOR CHASER)
     ========================================= */
  (function initPixelCat() {
    const isReducedMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
    if (isReducedMotion) return;

    const nekoEl = document.createElement("div");
    let nekoPosX = 64;
    let nekoPosY = 64;
    let mousePosX = window.innerWidth / 2;
    let mousePosY = window.innerHeight / 2;

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;
    const nekoSpeed = 11;

    const spriteSets = {
      idle: [[-3, -3]],
      alert: [[-7, -3]],
      scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
      scratchWallN: [[0, 0], [0, -1]],
      scratchWallS: [[-7, -1], [-6, -2]],
      scratchWallE: [[-2, -2], [-2, -3]],
      scratchWallW: [[-4, 0], [-4, -1]],
      tired: [[-3, -2]],
      sleeping: [[-2, 0], [-2, -1]],
      N: [[-1, -2], [-1, -3]],
      NE: [[0, -2], [0, -3]],
      E: [[-3, 0], [-3, -1]],
      SE: [[-5, -1], [-5, -2]],
      S: [[-6, -3], [-7, -2]],
      SW: [[-5, -3], [-6, -1]],
      W: [[-4, -2], [-4, -3]],
      NW: [[-1, 0], [-1, -1]]
    };

    nekoEl.id = "pixelCat";
    nekoEl.ariaHidden = "true";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = "999999";
    nekoEl.style.backgroundImage = 'url("assets/oneko.gif")';
    nekoEl.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.5))";

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", (e) => {
      mousePosX = e.clientX;
      mousePosY = e.clientY;
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        mousePosX = e.touches[0].clientX;
        mousePosY = e.touches[0].clientY;
      }
    }, { passive: true });

    let lastFrameTimestamp;
    function onAnimationFrame(timestamp) {
      if (!nekoEl.isConnected) return;
      if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
      if (timestamp - lastFrameTimestamp > 95) {
        lastFrameTimestamp = timestamp;
        frame();
      }
      window.requestAnimationFrame(onAnimationFrame);
    }

    function setSprite(name, frameIdx) {
      const set = spriteSets[name] || spriteSets.idle;
      const sprite = set[frameIdx % set.length];
      nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    }

    function resetIdleAnimation() {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function idle() {
      idleTime += 1;
      if (idleTime > 10 && Math.floor(Math.random() * 150) === 0 && idleAnimation === null) {
        const available = ["sleeping", "scratchSelf"];
        if (nekoPosX < 32) available.push("scratchWallW");
        if (nekoPosY < 32) available.push("scratchWallN");
        if (nekoPosX > window.innerWidth - 32) available.push("scratchWallE");
        if (nekoPosY > window.innerHeight - 32) available.push("scratchWallS");
        idleAnimation = available[Math.floor(Math.random() * available.length)];
      }

      switch (idleAnimation) {
        case "sleeping":
          if (idleAnimationFrame < 8) {
            setSprite("tired", 0);
            break;
          }
          setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
          break;
        case "scratchWallN":
        case "scratchWallS":
        case "scratchWallE":
        case "scratchWallW":
        case "scratchSelf":
          setSprite(idleAnimation, idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdleAnimation();
          break;
        default:
          setSprite("idle", 0);
          return;
      }
      idleAnimationFrame += 1;
    }

    function frame() {
      frameCount += 1;
      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      // Stand near cursor when within 48px
      if (distance < nekoSpeed || distance < 48) {
        idle();
        return;
      }

      idleAnimation = null;
      idleAnimationFrame = 0;

      if (idleTime > 1) {
        setSprite("alert", 0);
        idleTime = Math.min(idleTime, 6);
        idleTime -= 1;
        return;
      }

      let direction = diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";
      setSprite(direction || "idle", frameCount);

      nekoPosX -= (diffX / distance) * nekoSpeed;
      nekoPosY -= (diffY / distance) * nekoSpeed;

      nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
      nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

      nekoEl.style.left = `${nekoPosX - 16}px`;
      nekoEl.style.top = `${nekoPosY - 16}px`;
    }

    window.requestAnimationFrame(onAnimationFrame);
  })();

  setTimeout(() => {
    if (heroText) heroText.classList.add('visible');
  }, 800);

});
