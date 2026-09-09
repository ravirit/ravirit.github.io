document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  const revealItems = document.querySelectorAll('.section, .timeline-item, .project-card, .skill-group, .contact-card');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    observer.observe(item);
  });

  document.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
    document.documentElement.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });
});
