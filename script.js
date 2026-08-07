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

  // --- TRANSITION OVERLAY ---
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 800);
  }

  // --- THÈME SOMBRE / CLAIR ---
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

  // --- FONCTION DE PRÉCHARGEMENT INSTANTANÉ DES IMAGES ---
  const preloadAllImages = (datalist) => {
    const preload = () => {
      datalist.forEach(proj => {
        if (proj.images && Array.isArray(proj.images)) {
          proj.images.forEach(url => {
            const img = new Image();
            img.src = url;
          });
        }
        if (proj.moreInfoImage) {
          const img = new Image();
          img.src = proj.moreInfoImage;
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 1000);
    }
  };

  // --- MOTEUR DE GESTION DES PROJETS ---
  const initProjectEngine = (dataList, tabsContainerId, detailsContainerId) => {
    const tabsContainer = document.getElementById(tabsContainerId);
    const detailsContainer = document.getElementById(detailsContainerId);

    if (!tabsContainer || !detailsContainer || dataList.length === 0) return;

    tabsContainer.innerHTML = '';

    // Barre de contrôles
    const controlWrapper = document.createElement('div');
    controlWrapper.className = 'projects-control-bar';

    // Extraction des villes uniques
    const rawCities = dataList.map(p => {
      const match = p.location.match(/^(.*?)\s*\(/);
      return match ? match[1].trim() : p.location;
    });
    const uniqueCities = ['Toutes les villes', ...new Set(rawCities)];

    // 1. Menu Déroulant des Villes
    const citySelectEl = document.createElement('select');
    citySelectEl.className = 'city-select-dropdown';
    citySelectEl.ariaLabel = 'Sélectionner un lieu';

    uniqueCities.forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelectEl.appendChild(opt);
    });

    citySelectEl.addEventListener('change', (e) => {
      filterProjects(e.target.value);
    });

    // 2. Menu Déroulant des Projets
    const selectEl = document.createElement('select');
    selectEl.className = 'project-select-dropdown';
    selectEl.ariaLabel = 'Sélectionner un programme';

    const populateSelect = (listToDisplay) => {
      selectEl.innerHTML = '';
      listToDisplay.forEach(proj => {
        const opt = document.createElement('option');
        opt.value = proj.id;
        opt.textContent = proj.title;
        selectEl.appendChild(opt);
      });
    };

    populateSelect(dataList);

    controlWrapper.appendChild(citySelectEl);
    controlWrapper.appendChild(selectEl);
    tabsContainer.appendChild(controlWrapper);

    // Zone des onglets filtrés
    const buttonsListWrapper = document.createElement('div');
    buttonsListWrapper.className = 'filtered-tabs-wrapper';
    tabsContainer.appendChild(buttonsListWrapper);

    // Affichage d'un projet
    const showProject = (project) => {
      selectEl.value = project.id;
      buttonsListWrapper.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`tab-${project.id}`);
      if (activeBtn) activeBtn.classList.add('active');

      detailsContainer.classList.add('skeleton');

      setTimeout(() => {
        detailsContainer.classList.remove('skeleton');
        let currentImgIndex = 0;
        const images = project.images && project.images.length > 0
          ? project.images
          : ['https://via.placeholder.com/1200x800?text=Aucun+visuel'];

        detailsContainer.innerHTML = `
          <div class="carousel-container">
            <button class="carousel-nav prev-btn" aria-label="Précédente">&lt;</button>
            <div class="carousel-img-wrapper">
              <img id="carousel-img" src="${images[0]}" alt="Photo de ${project.title}">
            </div>
            <button class="carousel-nav next-btn" aria-label="Suivante">&gt;</button>
            <div class="carousel-dots">
              ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
            </div>
          </div>
          <div class="project-info-wrapper">
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
        const nextBtn = detailsContainer.querySelector('.next-btn');
        const prevBtn = detailsContainer.querySelector('.prev-btn');

        const updateCarousel = (index) => {
          currentImgIndex = index;
          carouselImg.style.opacity = '0';
          setTimeout(() => {
            carouselImg.src = images[currentImgIndex];
            carouselImg.style.opacity = '1';
          }, 150);
          dots.forEach((dot, dIdx) => dot.classList.toggle('active', dIdx === currentImgIndex));
        };

        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateCarousel((currentImgIndex + 1) % images.length);
          });
        }
        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateCarousel((currentImgIndex - 1 + images.length) % images.length);
          });
        }

        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            updateCarousel(parseInt(e.target.getAttribute('data-index')));
          });
        });

        if (carouselImg) {
          carouselImg.addEventListener('click', () => openLightbox(images, currentImgIndex));
        }

        if (project.moreInfoImage) {
          const btnMoreInfo = detailsContainer.querySelector('#btn-more-info');
          if (btnMoreInfo) {
            btnMoreInfo.addEventListener('click', () => {
              openLightbox([project.moreInfoImage], 0);
            });
          }
        }
      }, 250);
    };

    const renderButtons = (list) => {
      buttonsListWrapper.innerHTML = '';
      list.forEach(proj => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.id = `tab-${proj.id}`;
        btn.textContent = proj.title;
        btn.addEventListener('click', () => showProject(proj));
        buttonsListWrapper.appendChild(btn);
      });
    };

    const filterProjects = (cityName) => {
      const filtered = cityName === 'Toutes les villes'
        ? dataList
        : dataList.filter(p => p.location.includes(cityName));

      populateSelect(filtered);
      renderButtons(filtered);

      if (filtered.length > 0) {
        showProject(filtered[0]);
      }
    };

    selectEl.addEventListener('change', (e) => {
      const selectedProj = dataList.find(p => p.id === e.target.value);
      if (selectedProj) showProject(selectedProj);
    });

    renderButtons(dataList);

    const currentHash = window.location.hash.replace('#', '');
    const requestedProject = dataList.find(p => p.id === currentHash) || dataList[0];
    if (requestedProject) showProject(requestedProject);

    preloadAllImages(dataList);
  };

  initProjectEngine(projectsData, 'project-tabs', 'project-details');
  initProjectEngine(futureProjectsData, 'future-project-tabs', 'future-project-details');

  // --- LIGHTBOX (MODALE ZOOM) ---
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

      if (imagesList.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      }
    };

    prevBtn.onclick = (e) => {
      e.stopPropagation();
      updateLightboxImg((currentIndex - 1 + imagesList.length) % imagesList.length);
    };

    nextBtn.onclick = (e) => {
      e.stopPropagation();
      updateLightboxImg((currentIndex + 1) % imagesList.length);
    };

    updateLightboxImg(startIndex);
    lightbox.classList.add('active');
  };

  // --- MOTEUR SCROLL REVEAL ---
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
});