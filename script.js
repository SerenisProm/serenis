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

    // --- 3. Remplissage du Menu Déroulant (Fonctionne sur toutes les pages) ---
    const navList = document.getElementById('nav-projects-list');
    if (navList && typeof projectsData !== 'undefined') {
        projectsData.forEach(proj => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="realisations.html?id=${proj.id}">${proj.title}</a>`;
            navList.appendChild(li);
        });
    }

    // --- Variables Globales d'Images pour la Lightbox ---
    let activeImagesList = [];
    let activeImageIdx = 0;

    // --- 4. Onglets & Carrousel d'images intégré (Page Réalisations) ---
    const tabsContainer = document.getElementById('project-tabs');
    const detailsContainer = document.getElementById('project-details');

    if (tabsContainer && detailsContainer && typeof projectsData !== 'undefined') {
        
        const showProject = (project) => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`tab-${project.id}`);
            if(activeBtn) activeBtn.classList.add('active');

            let currentImgIndex = 0;
            const images = project.images;
            activeImagesList = images; // Synchronise pour la Lightbox
            activeImageIdx = 0;

            // Chargement de transition (Skeleton)
            detailsContainer.classList.add('skeleton');
            
            setTimeout(() => {
                detailsContainer.classList.remove('skeleton');
                detailsContainer.innerHTML = `
                    <div class="carousel-container">
                        <button class="carousel-nav prev-btn" aria-label="Photo précédente">❮</button>
                        <img id="carousel-img" src="${images[0]}" alt="Photo de ${project.title}" style="cursor: zoom-in;">
                        <button class="carousel-nav next-btn" aria-label="Photo suivante">❯</button>
                        <div class="carousel-dots">
                            ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
                        </div>
                    </div>
                    <div style="transform: translateZ(10px)">
                        <h2>${project.title}</h2>
                        <h4 style="color: var(--accent-color); margin-bottom: 1rem;">${project.location}</h4>
                        <p style="margin-bottom: 1.5rem; opacity: 0.85;">${project.description}</p>
                        <h5 style="margin-bottom: 0.5rem; font-weight:600;">Caractéristiques & Prestations :</h5>
                        <ul style="list-style: square; padding-left: 20px; opacity: 0.8; margin-bottom: 2rem;">
                            ${project.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        <!-- Bouton d'action liant à la page d'accueil (section contact) -->
                        <a href="index.html#contact" class="btn-primary learn-more-btn magnetic-btn ripple-target" style="display: inline-block;">En savoir plus / Obtenir une brochure</a>
                    </div>
                `;

                // Logique de navigation du Carrousel
                const carouselImg = detailsContainer.querySelector('#carousel-img');
                const dots = detailsContainer.querySelectorAll('.dot');

                const updateCarousel = (index) => {
                    currentImgIndex = index;
                    activeImageIdx = index; // Maintient synchro pour la Lightbox
                    carouselImg.style.opacity = 0;
                    
                    setTimeout(() => {
                        carouselImg.src = images[currentImgIndex];
                        carouselImg.style.opacity = 1;
                    }, 150);

                    dots.forEach((dot, dIdx) => {
                        dot.classList.toggle('active', dIdx === currentImgIndex);
                    });
                };

                const nextBtn = detailsContainer.querySelector('.next-btn');
                const prevBtn = detailsContainer.querySelector('.prev-btn');

                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Évite d'ouvrir la lightbox en cliquant sur la flèche
                    let nextIndex = (currentImgIndex + 1) % images.length;
                    updateCarousel(nextIndex);
                });

                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Évite d'ouvrir la lightbox en cliquant sur la flèche
                    let prevIndex = (currentImgIndex - 1 + images.length) % images.length;
                    updateCarousel(prevIndex);
                });

                dots.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const targetIdx = parseInt(e.target.getAttribute('data-index'));
                        updateCarousel(targetIdx);
                    });
                });

            }, 400);
        };

        // Génération des onglets
        projectsData.forEach(proj => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.id = `tab-${proj.id}`;
            btn.textContent = proj.title;
            btn.addEventListener('click', () => showProject(proj));
            tabsContainer.appendChild(btn);
        });

        // Détection de l'ID via URL
        const urlParams = new URLSearchParams(window.location.search);
        const requestedId = urlParams.get('id');
        const projectToShow = projectsData.find(p => p.id === requestedId) || projectsData[0];
        
        if (projectToShow) {
            showProject(projectToShow);
        }
    }

    // --- 5. Logique Interactive de la Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    const openLightbox = () => {
        if (activeImagesList.length > 0 && lightbox && lightboxImg) {
            lightboxImg.src = activeImagesList[activeImageIdx];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloque le scroll
        }
    };

    const closeLightbox = () => {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Rétablit le scroll
        }
    };

    const navigateLightbox = (direction) => {
        if (activeImagesList.length === 0) return;
        if (direction === 'next') {
            activeImageIdx = (activeImageIdx + 1) % activeImagesList.length;
        } else {
            activeImageIdx = (activeImageIdx - 1 + activeImagesList.length) % activeImagesList.length;
        }
        
        if (lightboxImg) {
            lightboxImg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                lightboxImg.src = activeImagesList[activeImageIdx];
                lightboxImg.style.transform = 'scale(1)';
            }, 100);
        }
    };

    // Déclencheur au clic sur l'image du carrousel
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'carousel-img') {
            openLightbox();
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox('next'));

    // Fermeture de la lightbox en cliquant à l'extérieur de l'image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    // Support des touches clavier (Échap, Flèches)
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateLightbox('next');
            if (e.key === 'ArrowLeft') navigateLightbox('prev');
        }
    });

    // --- 6. Effet 3D Tilt sur la Carte ---
    const tiltCards = document.querySelectorAll('.3d-tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            const rotateX = -(y / (rect.height / 2)) * 5;
            const rotateY = (x / (rect.width / 2)) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // --- 7. Effet Magnétique Global (Boutons tactiles) ---
    document.addEventListener('mousemove', (e) => {
        const btn = e.target.closest('.magnetic-btn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }
    });

    document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('.magnetic-btn');
        if (btn) {
            btn.style.transform = 'translate(0px, 0px)';
        }
    });

    // --- 8. Click Ripple Effect ---
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.ripple-target');
        if (target) {
            const circle = document.createElement('span');
            const diameter = Math.max(target.clientWidth, target.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - target.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - target.getBoundingClientRect().top - radius}px`;
            circle.classList.add('ripple');

            const prevRipple = target.querySelector('.ripple');
            if (prevRipple) prevRipple.remove();

            target.appendChild(circle);
        }
    });

    // --- 9. Scroll Reveal ---
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
    revealOnScroll();
});