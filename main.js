fetch('/navbar.html')
.then(res => res.text())
.then(data => {
    document.getElementById('navbar').innerHTML = data;

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

    // Highlight the link for the current page
    let path = window.location.pathname.replace(/\/$/, '');
    if (path === '') {
        path = '/index.html';
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('/') && path.endsWith(href)) {
            link.classList.add('active');
        }
    });
});
