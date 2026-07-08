document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestion du mode Sombre / Clair
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

    // 2. Remplissage du menu déroulant (Homepage & autres)
    const navList = document.getElementById('nav-projects-list');
    if (navList && typeof projectsData !== 'undefined') {
        projectsData.forEach(proj => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="realisations.html?id=${proj.id}">${proj.title}</a>`;
            navList.appendChild(li);
        });
    }

    // 3. Page Réalisations : Génération des onglets et affichage
    const tabsContainer = document.getElementById('project-tabs');
    const detailsContainer = document.getElementById('project-details');

    if (tabsContainer && detailsContainer && typeof projectsData !== 'undefined') {
        // Fonction pour afficher un projet
        const showProject = (project) => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`tab-${project.id}`);
            if(activeBtn) activeBtn.classList.add('active');

            detailsContainer.innerHTML = `
                <h2>${project.title} - ${project.location}</h2>
                <img src="${project.image}" alt="Photo de ${project.title}">
                <p><strong>Description :</strong> ${project.description}</p>
                <p><strong>Prestations :</strong></p>
                <ul>
                    ${project.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
            `;
        };

        // Créer les boutons
        projectsData.forEach(proj => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.id = `tab-${proj.id}`;
            btn.textContent = proj.title;
            btn.addEventListener('click', () => showProject(proj));
            tabsContainer.appendChild(btn);
        });

        // Vérifier si une URL demande un projet spécifique (via le menu déroulant)
        const urlParams = new URLSearchParams(window.location.search);
        const requestedId = urlParams.get('id');
        const projectToShow = projectsData.find(p => p.id === requestedId) || projectsData[0];
        
        if (projectToShow) {
            showProject(projectToShow);
        }
    }
});