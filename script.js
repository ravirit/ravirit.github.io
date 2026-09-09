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
        window.setTimeout(tick, holdTime);
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

  window.setTimeout(tick, holdTime);
})();

// Scroll reveal: fade + rise each tagged element once, the first time it
// enters the viewport. Skipped entirely under reduced motion (CSS handles it).
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

