document.addEventListener('DOMContentLoaded', async () => {
  let projectsData = [];
  let futureProjectsData = [];

  try {
    const response = await fetch('data/projects.json');
    const data = await response.json();
    projectsData = data.projectsList || [];
    futureProjectsData = data.futureProjectsList || [];
  } catch (error) {
    console.error("Erreur projets:", error);
  }

  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 800);
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  const initProjectEngine = (dataList, tabsContainerId, detailsContainerId) => {
    const tabsContainer = document.getElementById(tabsContainerId);
    const detailsContainer = document.getElementById(detailsContainerId);

    if (!tabsContainer || !detailsContainer || dataList.length === 0) return;

    const showProject = (project) => {
      tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`tab-${project.id}`);
      if (activeBtn) activeBtn.classList.add('active');

      detailsContainer.classList.add('skeleton');

      setTimeout(() => {
        detailsContainer.classList.remove('skeleton');
        let currentImgIndex = 0;
        const images = project.images && project.images.length > 0 ? project.images : ['https://via.placeholder.com/1200x800?text=Aucun+visuel'];

        detailsContainer.innerHTML = `
          <div class="carousel-container">
            <button class="carousel-nav prev-btn" aria-label="Précédente">&lt;</button>
            <img id="carousel-img" src="${images[0]}" alt="Photo de ${project.title}" style="cursor: pointer;">
            <button class="carousel-nav next-btn" aria-label="Suivante">&gt;</button>
            <div class="carousel-dots">
              ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
            </div>
          </div>
          <div class="project-info-wrapper" style="position: relative; padding-bottom: 1.5rem;">
            <h2>${project.title}</h2>
            <h4 style="color: var(--accent-color); margin-bottom: 1rem;">${project.location}</h4>
            <p style="margin-bottom: 1.5rem; opacity: 0.85;">${project.description}</p>
            <h5 style="margin-bottom: 0.5rem; font-weight: 600;">Caractéristiques & Prestations :</h5>
            <ul style="list-style: square; padding-left: 20px; opacity: 0.8; margin-bottom: 2rem;">
              ${project.features.map(feat => `<li>${feat}</li>`).join('')}
            </ul>
            ${project.moreInfoImage ? `<button id="btn-more-info" class="btn-more-info">En savoir plus</button>` : ''}
          </div>
        `;

        const carouselImg = detailsContainer.querySelector('#carousel-img');
        const dots = detailsContainer.querySelectorAll('.dot');

        const updateCarousel = (index) => {
          currentImgIndex = index;
          carouselImg.style.opacity = '0';
          setTimeout(() => {
            carouselImg.src = images[currentImgIndex];
            carouselImg.style.opacity = '1';
          }, 150);
          dots.forEach((dot, dIdx) => dot.classList.toggle('active', dIdx === currentImgIndex));
        };

        detailsContainer.querySelector('.next-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          updateCarousel((currentImgIndex + 1) % images.length);
        });

        detailsContainer.querySelector('.prev-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          updateCarousel((currentImgIndex - 1 + images.length) % images.length);
        });

        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            updateCarousel(parseInt(e.target.getAttribute('data-index')));
          });
        });

        carouselImg.addEventListener('click', () => openLightbox(images, currentImgIndex));

        if (project.moreInfoImage) {
          detailsContainer.querySelector('#btn-more-info').addEventListener('click', () => {
            openLightbox([project.moreInfoImage], 0);
          });
        }
      }, 400);
    };

    dataList.forEach(proj => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.id = `tab-${proj.id}`;
      btn.textContent = proj.title;
      btn.addEventListener('click', () => showProject(proj));
      tabsContainer.appendChild(btn);
    });

    const currentHash = window.location.hash.replace('#', '');
    const requestedProject = dataList.find(p => p.id === currentHash) || dataList[0];
    if (requestedProject) showProject(requestedProject);
  };

  initProjectEngine(projectsData, 'project-tabs', 'project-details');
  initProjectEngine(futureProjectsData, 'future-project-tabs', 'future-project-details');

  const openLightbox = (imagesList, startIndex) => {
    let lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox-modal';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-nav lightbox-prev">&lt;</button>
        <div class="lightbox-content"><img id="lightbox-img" src="" alt="Zoom"></div>
        <button class="lightbox-nav lightbox-next">&gt;</button>
      `;
      document.body.appendChild(lightbox);

      lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('active'));
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });

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
      imgElement.style.opacity = '0';
      setTimeout(() => {
        imgElement.src = imagesList[currentIndex];
        imgElement.style.opacity = '1';
      }, 150);
    };

    if (imagesList.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }

    prevBtn.onclick = (e) => { e.stopPropagation(); updateLightboxImg((currentIndex - 1 + imagesList.length) % imagesList.length); };
    nextBtn.onclick = (e) => { e.stopPropagation(); updateLightboxImg((currentIndex + 1) % imagesList.length); };

    updateLightboxImg(startIndex);
    lightbox.classList.add('active');
  };

  const tiltCards = document.querySelectorAll('.tilt-card-3d');
  tiltCards.forEach(card => {
    card.style.transition = 'transform 0.1s ease';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      const rotateX = (y / (rect.height / 2)) * 3;
      const rotateY = (x / (rect.width / 2)) * 3;
      card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.style.transition = 'transform 0.1s ease';
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

  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navElement = document.querySelector('header.glassmorphism nav');
  const navLinks = document.querySelectorAll('header.glassmorphism nav a');

  if (hamburgerBtn && navElement) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      navElement.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => {
          hamburgerBtn.classList.remove('open');
          navElement.classList.remove('open');
        }, 200);
      });
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Envoyer';

      if (submitBtn) {
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
      }

      const formData = new FormData(contactForm);
      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
          contactForm.reset();
          const successMessage = document.createElement('div');
          successMessage.className = 'form-success-box';
          successMessage.innerHTML = `<h4>Message envoyé !</h4><p>Nous vous répondrons rapidement.</p>`;
          contactForm.prepend(successMessage);

          setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => successMessage.remove(), 500);
          }, 8000);
        } else {
          alert("Une erreur est survenue.");
        }
      } catch (error) {
        console.error("Erreur formulaire:", error);
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});