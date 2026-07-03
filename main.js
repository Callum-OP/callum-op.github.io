/* =========================================================
   Callum O'Prey — portfolio interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    loadNavbar();
    setupScrollProgress();
    setupReveal();
    setupRotator();
    setupQuoteRotator();
    setupStats();
    setupHeroGlow();
    setupFilter();
});

/* ---------- Theme (night / sunset) ---------- */
function applySavedTheme() {
    if (localStorage.getItem('theme') === 'sunset') {
        document.documentElement.setAttribute('data-theme', 'sunset');
    }
}

function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const render = () => {
        const sunset = document.documentElement.getAttribute('data-theme') === 'sunset';
        btn.innerHTML = sunset ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        btn.setAttribute('aria-label', sunset ? 'Switch to night theme' : 'Switch to sunset theme');
    };

    render();
    btn.addEventListener('click', () => {
        const sunset = document.documentElement.getAttribute('data-theme') === 'sunset';
        if (sunset) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'night');
        } else {
            document.documentElement.setAttribute('data-theme', 'sunset');
            localStorage.setItem('theme', 'sunset');
        }
        render();
    });
}

/* ---------- Navbar (injected on every page) ---------- */
function loadNavbar() {
    const mount = document.getElementById('navbar');
    if (!mount) return;

    fetch('/navbar.html')
        .then(res => res.text())
        .then(data => {
            mount.innerHTML = data;

            // Mobile hamburger toggle
            const toggle = document.getElementById('navToggle');
            const menu = document.getElementById('navMenu');
            if (toggle && menu) {
                toggle.addEventListener('click', () => {
                    const isOpen = menu.classList.toggle('open');
                    toggle.classList.toggle('open', isOpen);
                    toggle.setAttribute('aria-expanded', isOpen);
                });
            }

            // Day / sunset theme toggle (lives in the injected navbar)
            setupThemeToggle();

            // Highlight the link for the current page
            let path = window.location.pathname.replace(/\/$/, '');
            if (path === '') path = '/index.html';
            document.querySelectorAll('.nav-links a').forEach(link => {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('/') && path.endsWith(href)) {
                    link.classList.add('active');
                }
            });
        });
}

/* ---------- Scroll progress bar ---------- */
function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    const update = () => {
        const h = document.documentElement;
        const scrolled = h.scrollTop;
        const height = h.scrollHeight - h.clientHeight;
        bar.style.width = height > 0 ? (scrolled / height) * 100 + '%' : '0';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

/* ---------- Scroll reveal ---------- */
function setupReveal() {
    const targets = document.querySelectorAll(
        '.project-card, .category-heading, .category-desc, .stat, .filter-bar, ' +
        '#contact, .timeline-item, .cert-pdf, footer .quote'
    );
    if (!targets.length || !('IntersectionObserver' in window)) return;

    document.body.classList.add('reveal-ready');

    // Stagger cards within each row for a cascading effect
    document.querySelectorAll('.row').forEach(row => {
        row.querySelectorAll('.project-card').forEach((card, i) => {
            card.style.transitionDelay = (i % 3) * 90 + 'ms';
        });
    });

    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
}

/* ---------- Hero word rotator ---------- */
function setupRotator() {
    const el = document.querySelector('.rotator');
    if (!el) return;
    let words;
    try { words = JSON.parse(el.getAttribute('data-words')); } catch (e) { return; }
    if (!Array.isArray(words) || words.length < 2) return;

    let i = 0;
    setInterval(() => {
        el.classList.add('swap');
        setTimeout(() => {
            i = (i + 1) % words.length;
            el.textContent = words[i];
            el.classList.remove('swap');
        }, 250);
    }, 2200);
}

/* ---------- Footer quote rotator ---------- */
function setupQuoteRotator() {
    const rot = document.querySelector('.quote-rotator');
    if (!rot) return;
    const items = [...rot.querySelectorAll('.quote-item')];
    if (items.length < 2) return;

    let i = 0;
    items.forEach((it, idx) => { it.style.display = idx === 0 ? '' : 'none'; });

    setInterval(() => {
        const cur = items[i];
        cur.classList.add('q-fade');
        setTimeout(() => {
            cur.style.display = 'none';
            cur.classList.remove('q-fade');

            i = (i + 1) % items.length;
            const next = items[i];
            next.style.display = '';
            next.classList.add('q-fade');
            void next.offsetWidth; // force reflow so the fade-in transitions
            next.classList.remove('q-fade');
        }, 500);
    }, 6000);
}

/* ---------- Count-up stats ---------- */
function setupStats() {
    const nums = document.querySelectorAll('.stat-num[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    const run = el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1400;
        const start = performance.now();
        const step = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
        });
    }, { threshold: 0.6 });

    nums.forEach(el => io.observe(el));
}

/* ---------- Pointer-reactive hero glow ---------- */
function setupHeroGlow() {
    const hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(pointer: coarse)').matches) return;

    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
}

/* ---------- Project type filter ---------- */
function setupFilter() {
    const bar = document.querySelector('.filter-bar');
    if (!bar) return;

    const chips = bar.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('#projects .project-card');
    const groups = document.querySelectorAll('.project-group');

    const typeOf = card => {
        const tag = card.querySelector('.project-tag');
        if (!tag) return '';
        const match = [...tag.classList].find(c => c.startsWith('tag-'));
        return match ? match.replace('tag-', '') : '';
    };

    bar.addEventListener('click', e => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;

        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-filter');

        cards.forEach(card => {
            const col = card.closest('[class*="col-"]');
            if (!col) return;
            const show = filter === 'all' || typeOf(card) === filter;
            col.classList.toggle('is-hidden', !show);
        });

        // Hide any category group that has no visible cards
        groups.forEach(group => {
            const visible = group.querySelectorAll('.project-card')
                .length && [...group.querySelectorAll('[class*="col-"]')]
                .some(col => !col.classList.contains('is-hidden'));
            group.classList.toggle('is-empty', !visible);
        });
    });
}
