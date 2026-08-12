const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { 
            navLinks.forEach(link => { link.classList.remove('active'); });

            // Retargeted to querySelectorAll: the navbar now renders each
            // link twice (desktop pill + mobile expand menu), so both
            // instances need the .active class kept in sync. Underlying
            // active-section logic is unchanged.
            const activeLinks = document.querySelectorAll(`.nav-link[href="#${entry.target.id}"]`);
            activeLinks.forEach(link => link.classList.add('active'));
        }
    });
}, { 
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
});

sections.forEach(section => observer.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));