document.addEventListener('DOMContentLoaded', async function() {
    // Configure marked.js with highlight.js for syntax highlighting
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.warn('Highlight.js error:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
    
    const searchInput = document.getElementById('search');
    const contentContainer = document.getElementById('documentation-content');
    const navigationList = document.getElementById('navigation-list');
    
    let allSections = [];
    let sectionsData = {};
    let loadedSections = new Set();
    let loadingQueue = [];
    let isLoading = false;
    
    // Show initial loading indicator
    showLoadingIndicator();
    
    // Load structure and start progressive loading
    try {
        const response = await fetch('data/structure.json');
        const structure = await response.json();
        
        // Store sections data
        sectionsData = structure.sections;
        
        // Flatten sections for navigation and search
        structure.sections.forEach(section => {
            allSections.push(section);
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    allSections.push(subsection);
                });
            }
        });
        
        // Generate navigation immediately
        generateNavigation(structure.sections);
        
        // Start progressive loading: load first section immediately, then queue others
        await progressivelyLoadContent(structure.sections);
        
        // Initialize functionality
        initializeSearch();
        initializeNavigation();
        
    } catch (error) {
        console.error('Error loading content:', error);
        hideLoadingIndicator();
        contentContainer.innerHTML = `
            <section id="error">
                <h1>Error Loading Documentation</h1>
                <p>Sorry, there was an error loading the documentation. Please try refreshing the page.</p>
                <p>Error details: ${error.message}</p>
            </section>
        `;
    }

    function showLoadingIndicator() {
        contentContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <h2>Loading Documentation...</h2>
                <p>Please wait while we load the API documentation</p>
            </div>
        `;
    }
    
    function hideLoadingIndicator() {
        // The loading indicator will be replaced by actual content
        // This function is here for consistency and future use
    }
    
    async function loadMarkdownFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}`);
            }
            const markdown = await response.text();
            return marked.parse(markdown);
        } catch (error) {
            console.warn(`Could not load ${filePath}:`, error);
            return `<p>Content not available for ${filePath}</p>`;
        }
    }

    async function progressivelyLoadContent(sections) {
        let allContentHtml = '';
        
        // First, load and show the first section immediately
        if (sections.length > 0) {
            const firstSection = sections[0];
            console.log('Loading first section:', firstSection.title);
            
            const firstSectionHtml = await loadSectionContent(firstSection);
            allContentHtml += firstSectionHtml;
            
            // Display first section and hide loader
            contentContainer.innerHTML = allContentHtml;
            hljs.highlightAll();
            hideLoadingIndicator();
            
            // Mark first section as loaded
            loadedSections.add(firstSection.id);
            if (firstSection.subsections) {
                firstSection.subsections.forEach(sub => loadedSections.add(sub.id));
            }
        }
        
        // Then load remaining sections in the background
        for (let i = 1; i < sections.length; i++) {
            const section = sections[i];
            console.log('Background loading:', section.title);
            
            try {
                const sectionHtml = await loadSectionContent(section);
                allContentHtml += sectionHtml;
                
                // Update the DOM with new content
                contentContainer.innerHTML = allContentHtml;
                hljs.highlightAll();
                
                // Mark section as loaded
                loadedSections.add(section.id);
                if (section.subsections) {
                    section.subsections.forEach(sub => loadedSections.add(sub.id));
                }
                
                // Small delay to not block the UI
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error loading section ${section.title}:`, error);
            }
        }
        
        console.log('All sections loaded!');
    }

    async function loadSectionContent(section) {
        let sectionHtml = '';
        
        // Load main section content
        const sectionContent = await loadMarkdownFile(section.file);
        sectionHtml = `<section id="${section.id}">${sectionContent}`;
        
        // Load subsections if they exist
        if (section.subsections) {
            for (const subsection of section.subsections) {
                const subContent = await loadMarkdownFile(subsection.file);
                sectionHtml += `<div id="${subsection.id}">${subContent}</div>`;
            }
        }
        
        sectionHtml += `</section>`;
        return sectionHtml;
    }
    
    function generateNavigation(sections) {
        let navHtml = '';
        
        sections.forEach(section => {
            navHtml += `<li><a href="#${section.id}">${section.title}</a></li>`;
            
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    navHtml += `<li><a href="#${subsection.id}" class="subsection">${subsection.title}</a></li>`;
                });
            }
        });
        
        navigationList.innerHTML = navHtml;
    }

    function initializeSearch() {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const sections = document.querySelectorAll('section, div[id]');
            
            sections.forEach(section => {
                if (!section.id || section.id === 'loading' || section.id === 'error') {
                    return;
                }
                
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm) || searchTerm === '') {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    }

    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.sticky-nav a');
        
        // Active navigation highlighting
        function updateActiveNav() {
            const sections = document.querySelectorAll('section, div[id]');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < bottom) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
        
        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Update active navigation on scroll
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }
    
    function initializeSearch() {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const sections = document.querySelectorAll('section, div[id]');
            
            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm) || searchTerm === '') {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    }
    
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.sticky-nav a');
        
        // Active navigation highlighting
        function updateActiveNav() {
            const sections = document.querySelectorAll('section, div[id]');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < bottom) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
        
        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Update active navigation on scroll
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }
    
    // Scroll to Top Button functionality
    function initializeScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        
        // Show/hide button based on scroll position
        function toggleScrollButton() {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
        
        // Smooth scroll to top
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Event listeners
        window.addEventListener('scroll', toggleScrollButton);
        scrollToTopBtn.addEventListener('click', scrollToTop);
        
        // Initial check
        toggleScrollButton();
    }
    
    // Mobile Navigation functionality
    function initializeMobileNavigation() {
        const toggleBtn = document.getElementById('mobile-nav-toggle');
        const overlay = document.getElementById('mobile-nav-overlay');
        const drawer = document.getElementById('mobile-nav-drawer');
        const closeBtn = document.getElementById('mobile-nav-close');
        const mobileNavList = document.getElementById('mobile-navigation-list');

                // Copy navigation items to mobile drawer
        function populateMobileNav() {
            const desktopNavList = document.getElementById('navigation-list');
            if (desktopNavList) {
                mobileNavList.innerHTML = desktopNavList.innerHTML;
                
                // Add click handlers for mobile nav links
                const mobileLinks = mobileNavList.querySelectorAll('a');
                mobileLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetId = link.getAttribute('href').substring(1);
                        const targetSection = document.getElementById(targetId);
                        
                        if (targetSection) {
                            // Close mobile navigation
                            closeMobileNav();
                            
                            // Scroll to section after a brief delay
                            setTimeout(() => {
                                targetSection.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }, 300);
                        }
                    });
                });
            }
        }

        // Open mobile navigation
        function openMobileNav() {
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            overlay.classList.add('active');
            drawer.classList.add('active');
        }

        // Close mobile navigation
        function closeMobileNav() {
            overlay.classList.remove('active');
            drawer.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Update active link in mobile navigation
        function updateMobileActiveNav() {
            const sections = document.querySelectorAll('section, div[id]');
            const scrollPos = window.scrollY + 100;
            const mobileLinks = mobileNavList.querySelectorAll('a');
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < bottom) {
                    mobileLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Event listeners
        if (toggleBtn) toggleBtn.addEventListener('click', openMobileNav);
        if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
        if (overlay) overlay.addEventListener('click', closeMobileNav);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                closeMobileNav();
            }
        });

        // Populate mobile navigation when content loads
        setTimeout(populateMobileNav, 1000);

        // Update active navigation on scroll
        window.addEventListener('scroll', updateMobileActiveNav);
    }
    
    // Initialize mobile navigation
    initializeMobileNavigation();
    
    // Initialize scroll to top button
    initializeScrollToTop();
});