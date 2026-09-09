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
