// One orchestrated moment: the statement's metrics count up once on load.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var metrics = document.querySelectorAll('#metric-row dd');

  function formatValue(value, decimals, suffix) {
    var str = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    return str + suffix;
  }

  function animateMetric(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;

    if (reduceMotion || isNaN(target)) {
      el.textContent = formatValue(target, decimals, suffix);
      return;
    }

    var duration = 900;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target * eased, decimals, suffix);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && metrics.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          metrics.forEach(animateMetric);
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(document.getElementById('metric-row'));
  } else {
    metrics.forEach(animateMetric);
  }
})();

// Rotating role line: cycles through how the role actually shows up across
// his experience, typed and erased like a terminal prompt.
(function () {
  var el = document.getElementById('role-typed');
  if (!el) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var roles = [
    'Full-Stack Java Developer',
    'Microservices Engineer',
    'Distributed Systems Builder',
    'Spring Boot & AWS'
  ];

  if (reduceMotion) {
    el.textContent = roles[0];
    return;
  }

  var roleIndex = 0;
  var charIndex = roles[0].length;
  var deleting = false;
  var holdTime = 1600;
  var typeSpeed = 55;
  var deleteSpeed = 30;

  function tick() {
    var current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      if (charIndex > current.length) {
        charIndex = current.length;
        deleting = true;
        window.setTimeout(tick, deleteSpeed);
        return;
      }
    } else {
      charIndex--;
      if (charIndex < 0) {
        charIndex = 0;
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    el.textContent = current.slice(0, charIndex);
    window.setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
  }

  window.setTimeout(tick, 900);
})();

// High-end interactions: trailing cursor thread, magnetic buttons, 3D tilt.
// Only on devices with a fine pointer that can actually hover — never on
// touch, and never when the person prefers reduced motion.
(function () {
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  document.body.classList.add('has-fine-cursor');

  var dot = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  var thread = document.getElementById('thread-line');

  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: mouse.x, y: mouse.y };

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function raf() {
    // Dot tracks the cursor exactly; the ring lags behind on a lerp,
    // and the thread line stretches between the two — the "web" feel.
    ringPos.x += (mouse.x - ringPos.x) * 0.14;
    ringPos.y += (mouse.y - ringPos.y) * 0.14;

    dot.style.transform = 'translate(' + mouse.x + 'px,' + mouse.y + 'px) translate(-50%,-50%)';
    ring.style.transform = 'translate(' + ringPos.x + 'px,' + ringPos.y + 'px) translate(-50%,-50%)';

    thread.setAttribute('x1', mouse.x);
    thread.setAttribute('y1', mouse.y);
    thread.setAttribute('x2', ringPos.x);
    thread.setAttribute('y2', ringPos.y);

    window.requestAnimationFrame(raf);
  }
  window.requestAnimationFrame(raf);

  // Ring grows over anything clickable
  document.querySelectorAll('a, button, .project-panel, .metric').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('active'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('active'); });
  });

  // Magnetic pull: buttons drift slightly toward the cursor within range
  document.querySelectorAll('.magnetic').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var relX = e.clientX - (r.left + r.width / 2);
      var relY = e.clientY - (r.top + r.height / 2);
      el.style.transform = 'translate(' + relX * 0.3 + 'px,' + relY * 0.35 + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = 'translate(0,0)';
    });
  });

  // 3D tilt on project panels and metric cells
  document.querySelectorAll('.project-panel, .metric').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      var rotateY = px * 10;
      var rotateX = py * -10;
      el.style.transform = 'perspective(700px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-3px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  });
})();



// Scroll reveal: rise each tagged element once, the first time it enters
// the viewport. Skipped entirely under reduced motion (CSS handles it).
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
})();
