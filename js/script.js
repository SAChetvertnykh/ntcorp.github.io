/* =========================================================
   NAVITECH CORP — интерактивность сайта
   1. Переключение темы (светлая / тёмная)
   2. Мобильное меню
   3. Состояние шапки при скролле + подсветка активного пункта
   4. Плавное появление блоков при скролле
   5. Canvas-анимация «сети связей» в hero
   6. Карусель скриншотов CRM-системы (автоперелистывание)
   7. Валидация формы обратной связи
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Переключение темы ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  var rootEl = document.documentElement;
  var THEME_KEY = 'navitech-theme';

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* localStorage недоступен — тема просто не сохранится между визитами */
    }
  }

  function syncThemeToggleState() {
    if (!themeToggle) return;
    var isLight = rootEl.getAttribute('data-theme') === 'light';
    themeToggle.setAttribute('aria-checked', String(isLight));
    themeToggle.setAttribute(
      'aria-label',
      isLight ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'
    );
  }

  syncThemeToggleState();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = rootEl.getAttribute('data-theme') === 'light';
      var nextTheme = isLight ? 'dark' : 'light';
      rootEl.setAttribute('data-theme', nextTheme);
      saveTheme(nextTheme);
      syncThemeToggleState();
    });
  }

  /* ---------- 2. Мобильное меню ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
      });
    });
  }

  /* ---------- 3. Состояние шапки при скролле + активный пункт меню ---------- */
  var header = document.getElementById('site-header');
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ---------- 4. Плавное появление блоков при скролле ---------- */
  var revealTargets = document.querySelectorAll(
    '.service-card, .advantage-card, .partner-logo, .about-text, .product-gallery, .contact-form'
  );

  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          var target = entry.target;
          var delay = Array.prototype.indexOf.call(target.parentNode.children, target) % 4;
          target.style.transitionDelay = (delay * 0.08) + 's';
          target.classList.add('is-visible');
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- 5. Canvas-анимация «сети связей» в hero ---------- */
  var canvas = document.getElementById('hero-network');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var heroSection = document.getElementById('hero');
    var nodes = [];
    var pointer = { x: null, y: null };
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeCanvas() {
      var rect = heroSection.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      createNodes(rect.width, rect.height);
    }

    function createNodes(width, height) {
      var count = Math.max(18, Math.floor((width * height) / 42000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1.6 + Math.random() * 1.6
        });
      }
    }

    function draw() {
      var width = canvas.width / window.devicePixelRatio;
      var height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        if (pointer.x !== null) {
          var dx = n.x - pointer.x;
          var dy = n.y - pointer.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            n.x += dx / dist * 0.6;
            n.y += dy / dist * 0.6;
          }
        }
      }

      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var na = nodes[a];
          var nb = nodes[b];
          var ddx = na.x - nb.x;
          var ddy = na.y - nb.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 140) {
            ctx.strokeStyle = 'rgba(255, 106, 19,' + (0.22 * (1 - d / 140)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = j % 3 === 0 ? 'rgba(255, 174, 66, 0.75)' : 'rgba(255, 106, 19, 0.55)';
        ctx.fill();
      }

      if (!reducedMotion) {
        window.requestAnimationFrame(draw);
      }
    }

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', function () {
      pointer.x = null;
      pointer.y = null;
    });

    if (reducedMotion) {
      draw();
    }
  }

  /* ---------- 6. Карусель скриншотов CRM-системы ---------- */
  var gallery = document.getElementById('product-gallery');
  var galleryTrack = document.getElementById('product-gallery-track');

  if (gallery && galleryTrack) {
    var slides = galleryTrack.querySelectorAll('.product-gallery-slide');
    var dots = gallery.querySelectorAll('.product-gallery-dot');
    var currentSlide = 0;
    var slideInterval = null;
    var AUTOPLAY_DELAY = 5000;

    function goToSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      galleryTrack.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentSlide);
      });
    }

    function startAutoplay() {
      stopAutoplay();
      slideInterval = window.setInterval(function () {
        goToSlide(currentSlide + 1);
      }, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      if (slideInterval) {
        window.clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-slide-index'), 10) || 0;
        goToSlide(index);
        startAutoplay();
      });
    });

    var prevEdge = document.getElementById('product-gallery-prev');
    var nextEdge = document.getElementById('product-gallery-next');

    if (prevEdge) {
      prevEdge.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
        startAutoplay();
      });
    }

    if (nextEdge) {
      nextEdge.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
        startAutoplay();
      });
    }

    gallery.addEventListener('mouseenter', stopAutoplay);
    gallery.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    goToSlide(0);
    startAutoplay();
  }

  /* ---------- 7. Валидация формы обратной связи ---------- */
  var contactForm = document.getElementById('contact-form');

  if (contactForm) {
    var nameField = document.getElementById('contact-name');
    var emailField = document.getElementById('contact-email');
    var phoneField = document.getElementById('contact-phone');
    var messageField = document.getElementById('contact-message');
    var DRAFT_KEY = 'navitech-contact-draft';

    function saveDraft() {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          name: nameField.value,
          email: emailField.value,
          phone: phoneField.value,
          message: messageField.value
        }));
      } catch (e) {
        /* localStorage недоступен — черновик просто не сохранится */
      }
    }

    function restoreDraft() {
      try {
        var raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        var draft = JSON.parse(raw);
        nameField.value = draft.name || '';
        emailField.value = draft.email || '';
        phoneField.value = draft.phone || '';
        messageField.value = draft.message || '';
      } catch (e) {
        /* повреждённый или недоступный черновик — просто игнорируем */
      }
    }

    function clearDraft() {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        /* localStorage недоступен — нечего очищать */
      }
    }

    restoreDraft();
    [nameField, emailField, phoneField, messageField].forEach(function (field) {
      field.addEventListener('input', saveDraft);
    });

    var formNote = document.createElement('p');
    formNote.className = 'form-note';
    formNote.id = 'contact-form-note';
    contactForm.appendChild(formNote);

    function setError(field, message) {
      field.classList.toggle('is-invalid', Boolean(message));
      var errorId = field.id + '-error';
      var errorEl = document.getElementById(errorId);
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        errorEl.id = errorId;
        field.insertAdjacentElement('afterend', errorEl);
      }
      errorEl.textContent = message || '';
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      if (!nameField.value.trim()) {
        setError(nameField, 'Укажите ваше имя');
        valid = false;
      } else {
        setError(nameField, '');
      }

      if (!emailField.value.trim() || !isValidEmail(emailField.value.trim())) {
        setError(emailField, 'Укажите корректный email');
        valid = false;
      } else {
        setError(emailField, '');
      }

      if (!messageField.value.trim()) {
        setError(messageField, 'Опишите ваш запрос');
        valid = false;
      } else {
        setError(messageField, '');
      }

      setError(phoneField, '');

      if (!valid) {
        formNote.className = 'form-note';
        formNote.textContent = 'Проверьте, пожалуйста, поля, отмеченные ошибкой.';
        return;
      }

      formNote.className = 'form-note is-success';
      formNote.textContent = 'Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.';
      contactForm.reset();
      clearDraft();
    });
  }

});
