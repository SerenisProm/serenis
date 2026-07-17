document.addEventListener('DOMContentLoaded', async () => {
  
  let projectsData = [];

  // On va chercher le fichier JSON généré par l'admin Netlify
  try {
    const response = await fetch('data/projects.json');
    const data = await response.json();
    projectsData = data.projectsList; // On remplit notre variable avec la liste des projets
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
  }

  // À insérer dans ta logique de chargement de la page réalisations :
  
  // 1. On récupère l'identifiant (hash) situé dans l'URL (ex: #les-consuls)
  const currentHash = window.location.hash.replace('#', '');
  
  // 2. On cherche si cet identifiant existe dans notre fichier JSON
  let activeProject = projectsData.find(p => p.id === currentHash);
  
  // 3. SÉCURITÉ DEFAUT : Si l'utilisateur a juste cliqué sur "Réalisations" (pas de hash),
  // ou si le hash est inconnu, on sélectionne d'office le PREMIER projet de la liste (index 0)
  if (!activeProject && projectsData.length > 0) {
    activeProject = projectsData[0]; 
  }
  
  // 4. Tu lances ensuite tes fonctions d'affichages avec ce projet actif par défaut
  if (activeProject) {
    // Appelle ici ta fonction existante qui affiche les textes et le carrousel du projet
    // Exemple : afficherDetailsProjet(activeProject);
    
    // Pense aussi à activer visuellement le bouton de l'onglet correspondant :
    const targetTab = document.querySelector(`.tab-btn[data-id="${activeProject.id}"]`);
    if (targetTab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      targetTab.classList.add('active');
    }
  }
  
  // 1. Transition de Page Morphing
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    setTimeout(() => {
      overlay.style.pointerEvents = 'none';
    }, 800);
  }

  // 2. Dark/Light Mode Morphing
  const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-toggle-page');
  const currentTheme = localStorage.getItem('theme') || 'light';

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
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

  // 3. Remplissage du Menu Déroulant
  const navList = document.getElementById('nav-projects-list');
  if (navList && typeof projectsData !== 'undefined') {
    projectsData.forEach(proj => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="realisations.html?id=${proj.id}">${proj.title}</a>`;
      navList.appendChild(li);
    });
  }

  // 4. Onglets, Carrousel & Zoom Lightbox (Page Réalisations)
  const tabsContainer = document.getElementById('project-tabs');
  const detailsContainer = document.getElementById('project-details');

  if (tabsContainer && detailsContainer && typeof projectsData !== 'undefined') {
    const showProject = (project) => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`tab-${project.id}`);
      if (activeBtn) activeBtn.classList.add('active');

      let currentImgIndex = 0;
      const images = project.images;

      detailsContainer.classList.add('skeleton');
      setTimeout(() => {
        detailsContainer.classList.remove('skeleton');
        detailsContainer.innerHTML = `
          <div class="carousel-container">
            <button class="carousel-nav prev-btn" aria-label="Photo précédente">&lt;</button>
            <img id="carousel-img" src="${images[0]}" alt="Photo de ${project.title}" style="cursor: pointer;">
            <button class="carousel-nav next-btn" aria-label="Photo suivante">&gt;</button>
            <div class="carousel-dots">
              ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
            </div>
          </div>
          <div class="project-info-wrapper" style="transform: translateZ(10px); position: relative; padding-bottom: 3.5rem;">
            <h2>${project.title}</h2>
            <h4 style="color: var(--accent-color); margin-bottom: 1rem;">${project.location}</h4>
            <p style="margin-bottom: 1.5rem; opacity: 0.85;">${project.description}</p>
            <h5 style="margin-bottom: 0.5rem; font-weight: 600;">Caractéristiques & Prestations :</h5>
            <ul style="list-style: square; padding-left: 20px; opacity: 0.8; margin-bottom: 2rem;">
              ${project.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            ${project.moreInfoImage ? `<button id="btn-more-info" class="btn-more-info">En savoir plus</button>` : ''}
          </div>
        `;

        const carouselImg = detailsContainer.querySelector('#carousel-img');
        const dots = detailsContainer.querySelectorAll('.dot');

        const updateCarousel = (index) => {
          currentImgIndex = index;
          carouselImg.style.opacity = 0;
          setTimeout(() => {
            carouselImg.src = images[currentImgIndex];
            carouselImg.style.opacity = 1;
          }, 150);
          dots.forEach((dot, dIdx) => {
            dot.classList.toggle('active', dIdx === currentImgIndex);
          });
        };

        // Navigation carrousel
        detailsContainer.querySelector('.next-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          let nextIndex = (currentImgIndex + 1) % images.length;
          updateCarousel(nextIndex);
        });

        detailsContainer.querySelector('.prev-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          let prevIndex = (currentImgIndex - 1 + images.length) % images.length;
          updateCarousel(prevIndex);
        });

        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            const targetIdx = parseInt(e.target.getAttribute('data-index'));
            updateCarousel(targetIdx);
          });
        });

        // Zoom Lightbox au clic sur l'image principale
        carouselImg.addEventListener('click', () => {
          openLightbox(images, currentImgIndex);
        });

        // Clic sur "En savoir plus" pour ouvrir l'image spécifique en grand
        if (project.moreInfoImage) {
          detailsContainer.querySelector('#btn-more-info').addEventListener('click', () => {
            openLightbox([project.moreInfoImage], 0);
          });
        }
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

    const urlParams = new URLSearchParams(window.location.search);
    const requestedId = urlParams.get('id');
    const projectToShow = projectsData.find(p => p.id === requestedId) || projectsData[0];
    if (projectToShow) {
      showProject(projectToShow);
    }
  }

  // Fonction Lightbox (Zoom Moderne)
  const openLightbox = (imagesList, startIndex) => {
    let lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox-modal';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-nav lightbox-prev">&lt;</button>
        <div class="lightbox-content">
          <img id="lightbox-img" src="" alt="Zoom réalisation">
        </div>
        <button class="lightbox-nav lightbox-next">&gt;</button>
      `;
      document.body.appendChild(lightbox);

      lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
      });

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
      });

      // Contrôles au clavier
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') lightbox.classList.remove('active');
        if (e.key === 'ArrowRight' && imagesList.length > 1) lightbox.querySelector('.lightbox-next').click();
        if (e.key === 'ArrowLeft' && imagesList.length > 1) lightbox.querySelector('.lightbox-prev').click();
      });
    }

    let currentIndex = startIndex;
    const imgElement = lightbox.querySelector('#lightbox-img');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    const updateLightboxImg = (idx) => {
      currentIndex = idx;
      imgElement.style.opacity = 0;
      setTimeout(() => {
        imgElement.src = imagesList[currentIndex];
        imgElement.style.opacity = 1;
      }, 150);
    };

    // Cache les flèches s'il n'y a qu'une seule photo
    if (imagesList.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }

    prevBtn.onclick = (e) => {
      e.stopPropagation();
      const prevIdx = (currentIndex - 1 + imagesList.length) % imagesList.length;
      updateLightboxImg(prevIdx);
    };

    nextBtn.onclick = (e) => {
      e.stopPropagation();
      const nextIdx = (currentIndex + 1) % imagesList.length;
      updateLightboxImg(nextIdx);
    };

    updateLightboxImg(startIndex);
    lightbox.classList.add('active');
  };

  // 5. Effet 3D Tilt sur la Carte de Présentation (CORRIGÉ ICI !)
  const tiltCards = document.querySelectorAll('.tilt-card-3d');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      const rotateX = (y / (rect.height / 2)) * 5;
      const rotateY = -(x / (rect.width / 2)) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  // 6. Effet Magnétique sur les Boutons
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // 7. Click Ripple (Effet d'onde tactile)
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

  // 8. Scroll Reveal (La fonction magique !)
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
  revealOnScroll(); // Lancement immédiat au chargement de la page

  // 9. Menu Hamburger Mobile (Version corrigée avec micro-délai pour les ancres)
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navElement = document.querySelector('header.glassmorphism nav');
  const navLinks = document.querySelectorAll('header.glassmorphism nav a');

  if (hamburgerBtn && navElement) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      navElement.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // On laisse 200ms au navigateur du téléphone pour initier le scroll ou le changement de page
        setTimeout(() => {
          hamburgerBtn.classList.remove('open');
          navElement.classList.remove('open');
        }, 200);
      });
    });
  }
  // 10. Gestion du Formulaire de Contact via API (Web3Forms)
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Empêche le rechargement de la page et l'erreur 405

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Envoyer';

      // On passe le bouton en état de chargement
      if (submitBtn) {
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
      }

      // On récupère toutes les données du formulaire
      const formData = new FormData(contactForm);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          // 1. Réinitialisation du formulaire
          contactForm.reset();

          // 2. Création et affichage du message de confirmation
          const successMessage = document.createElement('div');
          successMessage.className = 'form-success-box';
          successMessage.innerHTML = `
            <h4>Message envoyé avec succès ! ✨</h4>
            <p>Merci pour votre confiance. Nous prenons connaissance de votre message et reviendrons vers vous dans les plus brefs délais.</p>
          `;

          // On insère le message tout en haut du formulaire
          contactForm.prepend(successMessage);

          // 3. Optionnel : On fait disparaître le message automatiquement après 8 secondes
          setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => successMessage.remove(), 500);
          }, 8000);

        } else {
          alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        }
      } catch (error) {
        console.error("Erreur formulaire:", error);
        alert("Impossible de joindre le serveur d'envoi. Vérifiez votre connexion.");
      } finally {
        // On remet le bouton à son état d'origine
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});