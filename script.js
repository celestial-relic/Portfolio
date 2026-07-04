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
  heroVideo.addEventListener('loadedmetadata', () => { videoDuration = heroVideo.duration; });
  heroVideo.load();

  function handleVideoScroll() {
    const rect = heroSection.getBoundingClientRect();
    const sectionHeight = heroSection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / sectionHeight);

    // Hide video layer once past the hero spacer
    videoLayer.classList.toggle('hidden', rect.bottom <= 0);

    // Scrub video
    if (videoDuration > 0) heroVideo.currentTime = progress * videoDuration;

    // Hero text visible between 10%-70%
    heroText.classList.toggle('visible', progress > 0.1 && progress < 0.7);

    // Scroll indicator
    scrollIndicator.classList.toggle('hidden', progress > 0.05);

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
     3. SCROLL REVEAL [data-motion]
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
     4. STAT COUNTING
     ========================================= */
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = parseInt(el.dataset.count);
        let cur = 0; const step = Math.ceil(target / 40);
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = cur + '+';
          if (cur >= target) clearInterval(iv);
        }, 40);
        statObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number[data-count]').forEach(el => statObs.observe(el));

  /* =========================================
     5. MATRIX RAIN
     ========================================= */
  const matrixCanvas = document.getElementById('matrixCanvas');
  if (matrixCanvas) {
    const ctx = matrixCanvas.getContext('2d');
    let animId, fontSize = 14, cols, drops;

    function resizeMatrix() {
      matrixCanvas.width = matrixCanvas.parentElement.offsetWidth;
      matrixCanvas.height = matrixCanvas.parentElement.offsetHeight;
    }
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);

    function initDrops() { cols = Math.floor(matrixCanvas.width / fontSize); drops = new Array(cols).fill(1); }
    initDrops();

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
      entries.forEach(e => { if (e.isIntersecting) { initDrops(); drawMatrix(); } else { cancelAnimationFrame(animId); } });
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
     6. HORIZONTAL GALLERY — STICKY + TRANSLATE
     ========================================= */
  const gallerySection = document.getElementById('project-gallery');
  const galleryTrack = document.getElementById('galleryTrack');

  function handleGalleryScroll() {
    if (!gallerySection || !galleryTrack) return;

    const rect = gallerySection.getBoundingClientRect();
    const sectionHeight = gallerySection.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / sectionHeight);

    // Total horizontal distance to travel
    const slideCount = galleryTrack.children.length;
    const totalWidth = (slideCount - 1) * window.innerWidth;
    const translateX = -progress * totalWidth;

    galleryTrack.style.transform = `translateX(${translateX}px)`;
  }

  /* =========================================
     7. SAKURA PARTICLES
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
     8. SKILLS — VERTICAL BAR + GAME LOAD %
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

    // Fill the vertical bar like a loading bar
    if (centerBarFill) centerBarFill.style.height = (progress * 100) + '%';
    if (centerBarValue) centerBarValue.textContent = Math.round(progress * 100);

    // Each skill's percentage increases as you scroll through
    if (skillsGrid) {
      const items = skillsGrid.querySelectorAll('.skill-item');
      const total = items.length;
      items.forEach((item, i) => {
        const level = parseInt(item.dataset.level) || 50;
        // Stagger: each skill starts filling at a different scroll point
        const start = (i / total) * 0.8;
        const end = start + 0.2;
        const p = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        const val = item.querySelector('.skill-val');
        if (val) val.textContent = Math.round(p * level) + '%';
      });
    }
  }

  /* =========================================
     9. MASTER SCROLL
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

  setTimeout(() => { heroText.classList.add('visible'); }, 800);

});
