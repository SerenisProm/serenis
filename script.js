document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Transition de Page Morphing ---
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.pointerEvents = 'none';
        }, 800);
    }

    // --- 2. Dark/Light Mode Morphing ---
    const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-toggle-page');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // --- 3. Remplissage du Menu Déroulant (data.js) ---
    const navList = document.getElementById('nav-projects-list');
    if (navList && typeof projectsData !== 'undefined') {
        projectsData.forEach(proj => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="realisations.html?id=${proj.id}">${proj.title}</a>`;
            navList.appendChild(li);
        });
    }

    // --- 4. Onglets & 3D Tilt Card (Page Réalisations) ---
    const tabsContainer = document.getElementById('project-tabs');
    const detailsContainer = document.getElementById('project-details');

    if (tabsContainer && detailsContainer && typeof projectsData !== 'undefined') {
        const showProject = (project) => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`tab-${project.id}`);
            if(activeBtn) activeBtn.classList.add('active');

            // Affichage avec Skeleton Loading simulé pendant 500ms
            detailsContainer.classList.add('skeleton');
            setTimeout(() => {
                detailsContainer.classList.remove('skeleton');
                detailsContainer.innerHTML = `
                    <img src="${project.image}" alt="Photo de ${project.title}">
                    <div style="transform: translateZ(10px)">
                        <h2>${project.title}</h2>
                        <h4 style="color: var(--accent-color); margin-bottom: 1rem;">${project.location}</h4>
                        <p style="margin-bottom: 1.5rem; opacity: 0.85;">${project.description}</p>
                        <h5 style="margin-bottom: 0.5rem; font-weight:600;">Caractéristiques & Prestations :</h5>
                        <ul style="list-style: square; padding-left: 20px; opacity: 0.8;">
                            ${project.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }, 500);
        };

        projectsData.forEach(proj => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.id = `tab-${proj.id}`;
            btn.textContent = proj.title;
            btn.addEventListener('click', () => showProject(proj));
            tabsContainer.appendChild(btn);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const requestedId = urlParams.get('id');
        const projectToShow = projectsData.find(p => p.id === requestedId) || projectsData[0];
        
        if (projectToShow) {
            showProject(projectToShow);
        }
    }

    // --- 5. Effet 3D Tilt sur les Cartes ---
    const tiltCards = document.querySelectorAll('.3d-tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            const rotateX = -(y / (rect.height / 2)) * 8; // Sensibilité X
            const rotateY = (x / (rect.width / 2)) * 8;   // Sensibilité Y
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // --- 6. Effet Magnétique sur les Boutons ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- 7. Click Ripple (Effet d'onde circulaire) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ripple-target')) {
            const btn = e.target;
            const circle = document.createElement('span');
            const diameter = Math.max(btn.clientWidth, btn.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
            circle.classList.add('ripple');

            const prevRipple = btn.querySelector('.ripple');
            if (prevRipple) prevRipple.remove();

            btn.appendChild(circle);
        }
    });

    // --- 8. Scroll Reveal (Animation au scroll) ---
    const reveals = document.querySelectorAll('.scroll-reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                el.classList.add('visible');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initialiser dès le premier affichage
});