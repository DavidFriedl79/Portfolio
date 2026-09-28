/**
 * David Friedl - Engineering Portfolio
 * Interactive Script: Background Canvas, Nav Spy, Skills Filter,
 * Dactylus Sensor Simulator, Modal Controller & vCard Generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCircuitCanvas();
  initNavigation();
  initSkillsFilter();
  initDactylusSimulator();
  initDactylusModal();
  initContactActions();
  initScrollAnimations();
});

/* ==========================================================================
   1. Interactive Background Circuit Canvas
   ========================================================================== */
function initCircuitCanvas() {
  const canvas = document.getElementById('circuitCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: -1000, y: -1000, radius: 120 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createNodes();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let nodes = [];
  const nodeCount = Math.floor(Math.min(width, 1600) / 38);

  function createNodes() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.2
      });
    }
  }
  createNodes();

  let pulses = [];
  function addPulse(x1, y1, x2, y2) {
    if (pulses.length > 25) return;
    pulses.push({
      x1, y1, x2, y2,
      progress: 0,
      speed: 0.015 + Math.random() * 0.015
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting circuit traces
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      // Update position
      a.x += a.vx;
      a.y += a.vy;

      if (a.x < 0 || a.x > width) a.vx *= -1;
      if (a.y < 0 || a.y > height) a.vy *= -1;

      // Mouse interactivity
      const dxMouse = a.x - mouse.x;
      const dyMouse = a.y - mouse.y;
      const distMouse = Math.hypot(dxMouse, dyMouse);

      if (distMouse < mouse.radius) {
        const force = (mouse.radius - distMouse) / mouse.radius;
        a.x += (dxMouse / distMouse) * force * 1.5;
        a.y += (dyMouse / distMouse) * force * 1.5;
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${a.alpha * 0.8})`;
      ctx.fill();

      // Trace connections
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          const lineAlpha = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();

          // Occasionally trigger an electric pulse between nodes
          if (Math.random() < 0.0003) {
            addPulse(a.x, a.y, b.x, b.y);
          }
        }
      }
    }

    // Render active pulses
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pulse = pulses[p];
      pulse.progress += pulse.speed;

      if (pulse.progress >= 1) {
        pulses.splice(p, 1);
        continue;
      }

      const curX = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
      const curY = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. Navigation, Sticky Header & ScrollSpy
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const mobileToggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('mobileBackdrop');
  const drawerClose = document.getElementById('drawerClose');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNav();
  });

  // Mobile Drawer Toggle
  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // ScrollSpy
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollY = window.pageYOffset + 120;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
        drawerLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   3. Skills Filter & Live Search
   ========================================================================== */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.skill-card');
  const searchInput = document.getElementById('skillSearchInput');

  let activeCategory = 'all';
  let searchTerm = '';

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const cardText = card.textContent.toLowerCase();

      const matchesCat = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/* ==========================================================================
   4. Dactylus 12-Channel Force Simulator
   ========================================================================== */
function initDactylusSimulator() {
  const sensorNodes = document.querySelectorAll('.sensor-node');
  const triggerBtn = document.getElementById('triggerPulseBtn');
  const testInteractiveBtn = document.getElementById('interactiveTestBtn');
  const totalForceEl = document.getElementById('totalForceVal');

  if (!sensorNodes.length) return;

  // Base force array for 12 channels
  let channelForces = [6.5, 8.2, 7.4, 4.8, 3.5, 5.2, 5.8, 7.9, 7.1, 4.2, 3.1, 4.9];

  function updateDisplay() {
    let sum = 0;
    sensorNodes.forEach((node, index) => {
      const val = channelForces[index] || 0;
      sum += val;

      const fill = node.querySelector('.c-bar-fill');
      const valLabel = node.querySelector('.c-val');

      // Max value scale ~ 12N
      const pct = Math.min(100, Math.max(10, (val / 12) * 100));

      if (fill) fill.style.height = `${pct}%`;
      if (valLabel) valLabel.textContent = `${val.toFixed(1)} N`;
    });

    if (totalForceEl) {
      totalForceEl.textContent = `${sum.toFixed(1)} N`;
    }
  }

  // Interactive click on single channels
  sensorNodes.forEach((node, idx) => {
    node.addEventListener('click', () => {
      sensorNodes.forEach((n) => n.classList.remove('active-channel'));
      node.classList.add('active-channel');

      // Increase selected channel force
      channelForces[idx] = Math.min(11.8, channelForces[idx] + 2.5);
      updateDisplay();

      // Show toast
      showToast(`Kanal ${idx + 1}: Kraftwert auf ${channelForces[idx].toFixed(1)} N kalibriert.`);
    });
  });

  // Pulse Wave function
  function simulatePulse() {
    sensorNodes.forEach((n) => n.classList.add('active-channel'));

    channelForces = channelForces.map((f) => {
      const spike = 5.0 + Math.random() * 6.5;
      return Number(Math.min(12.0, spike).toFixed(1));
    });
    updateDisplay();

    setTimeout(() => {
      // Natural settling back to realistic baseline
      channelForces = [6.5, 8.2, 7.4, 4.8, 3.5, 5.2, 5.8, 7.9, 7.1, 4.2, 3.1, 4.9];
      updateDisplay();
      sensorNodes.forEach((n) => n.classList.remove('active-channel'));
    }, 1800);
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', simulatePulse);
  }

  if (testInteractiveBtn) {
    testInteractiveBtn.addEventListener('click', () => {
      simulatePulse();
      showToast('12-Kanal Messung synchron initiiert.');
    });
  }

  // Subtle real-time sensor jitter
  setInterval(() => {
    channelForces = channelForces.map((val) => {
      const jitter = (Math.random() - 0.5) * 0.18;
      return Math.max(1.0, Math.min(12.0, val + jitter));
    });
    updateDisplay();
  }, 2200);

  updateDisplay();
}

/* ==========================================================================
   5. Dactylus Detail Modal Dialog
   ========================================================================== */
function initDactylusModal() {
  const modal = document.getElementById('dactylusModal');
  const openBtn = document.getElementById('openDactylusModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const closeBtnSec = document.getElementById('modalCloseBtnSecondary');
  const contactBtn = document.getElementById('modalContactBtn');

  if (!modal || !openBtn) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBtnSec) closeBtnSec.addEventListener('click', closeModal);
  if (contactBtn) contactBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. Contact Actions, Form & Dynamic vCard Download
   ========================================================================== */
function initContactActions() {
  // Clipboard Copy Buttons
  const copyButtons = document.querySelectorAll('.ci-copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Kopiert: ${textToCopy}`);
          btn.innerHTML = '<i class="fa-solid fa-check text-cyan"></i>';
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        });
      }
    });
  });

  // Dynamic vCard Download
  const vcardBtn = document.getElementById('downloadVCardBtn');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', () => {
      generateAndDownloadVCard();
    });
  }

  // Interactive Form Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('senderName').value;
      const email = document.getElementById('senderEmail').value;
      const subject = document.getElementById('subjectSelect').value;
      const message = document.getElementById('senderMessage').value;

      const mailtoLink = `mailto:ddavidffriedl@gmail.com?subject=${encodeURIComponent(
        `[Portfolio Kontakt] ${subject} - ${name}`
      )}&body=${encodeURIComponent(
        `Name/Unternehmen: ${name}\nE-Mail: ${email}\nBetreff: ${subject}\n\nNachricht:\n${message}`
      )}`;

      window.location.href = mailtoLink;
      showToast('E-Mail-Programm geöffnet. Vielen Dank für Ihre Nachricht!');
    });
  }

  // Update Year in Footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function generateAndDownloadVCard() {
  const vcardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Friedl;David;;;',
    'FN:David Friedl',
    'ORG:Angewandte Elektronik & Technische Informatik',
    'TITLE:Bachelorstudent & HTL-Ingenieuranwärter',
    'EMAIL;TYPE=INTERNET,PREF:ddavidffriedl@gmail.com',
    'TEL;TYPE=CELL,VOICE,PREF:+4369917338709',
    'ADR;TYPE=HOME:;;Wien;Wien;;;Österreich',
    'URL:https://github.com/DavidFriedl79',
    'NOTE:HTL Elektronik und Technische Informatik | Fachschule Elektrotechnik | Projekt Dactylus (12-Kanal Kraftmesssystem)',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'David_Friedl.vcf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Visitenkarte (vCard) erfolgreich heruntergeladen!');
}

/* ==========================================================================
   7. Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check text-cyan"></i> <span>${message}</span>`;
  toast.classList.add('show');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   8. Scroll-Triggered Entrance Animations
   ========================================================================== */
function initScrollAnimations() {
  const animElements = document.querySelectorAll(
    '.timeline-item, .experience-card, .skill-card, .featured-project-card, .about-main-card, .pillar-card'
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  animElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}
