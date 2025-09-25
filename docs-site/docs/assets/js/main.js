document.addEventListener('DOMContentLoaded', async function() {
    // Initialize theme from URL or localStorage
    initializeTheme();
    
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
    const mobileNavigationList = document.getElementById('mobile-navigation-list');
    
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
            initializeCodeCopy();
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
                initializeCodeCopy();
                
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
        
        // Load subsections if they exist and have separate files
        if (section.subsections) {
            for (const subsection of section.subsections) {
                // Only load subsection content if it has a separate file
                if (subsection.file) {
                    const subContent = await loadMarkdownFile(subsection.file);
                    sectionHtml += `<div id="${subsection.id}">${subContent}</div>`;
                }
                // If no file is specified, the subsection is just an anchor within the main section
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
        
        // Populate both desktop and mobile navigation
        navigationList.innerHTML = navHtml;
        if (mobileNavigationList) {
            mobileNavigationList.innerHTML = navHtml;
        }
        
        // Initialize navigation click handlers after navigation is generated
        initializeNavigation();
    }

    function initializeSearch() {
        const searchResultsCount = document.getElementById('search-results-count');
        const searchNavigationHint = document.getElementById('search-navigation-hint');
        let currentMatchIndex = -1;
        let totalHighlights = [];
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const sections = document.querySelectorAll('section, div[id]');
            let totalMatches = 0;
            let sectionsWithMatches = 0;
            
            // Reset navigation state
            currentMatchIndex = -1;
            totalHighlights = [];
            
            // Clear previous highlights
            clearSearchHighlights();
            
            if (searchTerm === '') {
                // Show all sections when search is empty
                sections.forEach(section => {
                    if (!section.id || section.id === 'loading' || section.id === 'error') {
                        return;
                    }
                    section.style.display = 'block';
                });
                searchResultsCount.textContent = '';
                searchResultsCount.classList.remove('visible');
                searchNavigationHint.textContent = '';
                return;
            }
            
            sections.forEach(section => {
                if (!section.id || section.id === 'loading' || section.id === 'error') {
                    return;
                }
                
                const text = section.textContent.toLowerCase();
                const matches = countMatches(text, searchTerm);
                
                if (matches > 0) {
                    section.style.display = 'block';
                    highlightSearchTerms(section, searchTerm);
                    totalMatches += matches;
                    sectionsWithMatches++;
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Collect all highlights for navigation
            totalHighlights = Array.from(document.querySelectorAll('.search-highlight'));
            
            // Update search results counter
            if (totalMatches > 0) {
                const matchText = totalMatches === 1 ? 'match' : 'matches';
                const sectionText = sectionsWithMatches === 1 ? 'section' : 'sections';
                searchResultsCount.textContent = `${totalMatches} ${matchText} in ${sectionsWithMatches} ${sectionText}`;
                searchResultsCount.classList.add('visible');
                
                // Show navigation hint
                if (totalHighlights.length > 1) {
                    searchNavigationHint.textContent = 'Press Enter to navigate matches, Shift+Enter for previous';
                } else {
                    searchNavigationHint.textContent = '';
                }
                
                // Highlight first match if there are results
                if (totalHighlights.length > 0) {
                    currentMatchIndex = 0;
                    highlightCurrentMatch();
                }
            } else {
                searchResultsCount.textContent = 'No matches found';
                searchResultsCount.classList.add('visible');
                searchNavigationHint.textContent = '';
            }
        });
        
        // Add keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                if (totalHighlights.length === 0) return;
                
                if (e.shiftKey) {
                    // Shift+Enter: Previous match
                    navigateToPreviousMatch();
                } else {
                    // Enter: Next match
                    navigateToNextMatch();
                }
            }
        });
        
        function navigateToNextMatch() {
            if (totalHighlights.length === 0) return;
            
            currentMatchIndex = (currentMatchIndex + 1) % totalHighlights.length;
            highlightCurrentMatch();
            scrollToCurrentMatch();
        }
        
        function navigateToPreviousMatch() {
            if (totalHighlights.length === 0) return;
            
            currentMatchIndex = currentMatchIndex <= 0 ? totalHighlights.length - 1 : currentMatchIndex - 1;
            highlightCurrentMatch();
            scrollToCurrentMatch();
        }
        
        function highlightCurrentMatch() {
            // Remove current highlighting from all matches
            totalHighlights.forEach(highlight => highlight.classList.remove('current'));
            
            // Add current highlighting to active match
            if (currentMatchIndex >= 0 && currentMatchIndex < totalHighlights.length) {
                totalHighlights[currentMatchIndex].classList.add('current');
                
                // Update counter to show current position
                const matchText = totalHighlights.length === 1 ? 'match' : 'matches';
                const sectionsWithMatches = new Set(totalHighlights.map(h => h.closest('section, div[id]'))).size;
                const sectionText = sectionsWithMatches === 1 ? 'section' : 'sections';
                searchResultsCount.textContent = `${currentMatchIndex + 1} of ${totalHighlights.length} ${matchText} in ${sectionsWithMatches} ${sectionText}`;
            }
        }
        
        function scrollToCurrentMatch() {
            if (currentMatchIndex >= 0 && currentMatchIndex < totalHighlights.length) {
                const currentHighlight = totalHighlights[currentMatchIndex];
                const contentElement = document.querySelector('.content');
                
                // Calculate position relative to content container
                const highlightRect = currentHighlight.getBoundingClientRect();
                const contentRect = contentElement.getBoundingClientRect();
                const scrollPosition = highlightRect.top - contentRect.top + contentElement.scrollTop - 100; // 100px offset for better visibility
                
                contentElement.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Helper function to count all occurrences of search term in text
    function countMatches(text, searchTerm) {
        if (!searchTerm) return 0;
        
        // Use regex to find all matches (case insensitive)
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }
    
    function clearSearchHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.insertBefore(document.createTextNode(highlight.textContent), highlight);
            parent.removeChild(highlight);
            parent.normalize();
        });
    }
    
    function highlightSearchTerms(element, searchTerm) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and already highlighted nodes
                    const parent = node.parentNode;
                    if (parent.tagName === 'SCRIPT' || 
                        parent.tagName === 'STYLE' || 
                        parent.classList.contains('search-highlight') ||
                        parent.classList.contains('code-copy-btn')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const lowerText = text.toLowerCase();
            const index = lowerText.indexOf(searchTerm);
            
            if (index !== -1) {
                const beforeText = text.substring(0, index);
                const matchText = text.substring(index, index + searchTerm.length);
                const afterText = text.substring(index + searchTerm.length);
                
                const fragment = document.createDocumentFragment();
                
                if (beforeText) {
                    fragment.appendChild(document.createTextNode(beforeText));
                }
                
                const highlight = document.createElement('span');
                highlight.className = 'search-highlight';
                highlight.textContent = matchText;
                fragment.appendChild(highlight);
                
                if (afterText) {
                    const afterNode = document.createTextNode(afterText);
                    fragment.appendChild(afterNode);
                    
                    // Recursively highlight remaining occurrences in the after text
                    const tempDiv = document.createElement('div');
                    tempDiv.appendChild(afterNode.cloneNode(true));
                    if (tempDiv.textContent.toLowerCase().indexOf(searchTerm) !== -1) {
                        highlightSearchTerms(tempDiv, searchTerm);
                        fragment.removeChild(fragment.lastChild);
                        while (tempDiv.firstChild) {
                            fragment.appendChild(tempDiv.firstChild);
                        }
                    }
                }
                
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    function initializeNavigation() {
        // Get navigation links from both desktop and mobile navigation
        const desktopNavLinks = document.querySelectorAll('#navigation-list a');
        const mobileNavLinks = document.querySelectorAll('#mobile-navigation-list a');
        const allNavLinks = [...desktopNavLinks, ...mobileNavLinks];
        
        // Smooth scrolling for navigation links with click highlighting
        allNavLinks.forEach((link, index) => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if this is a mobile navigation link and close mobile nav
                const isMobileLink = this.closest('#mobile-navigation-list');
                if (isMobileLink) {
                    // Close mobile navigation
                    const overlay = document.getElementById('mobile-nav-overlay');
                    const drawer = document.getElementById('mobile-nav-drawer');
                    if (overlay) overlay.classList.remove('active');
                    if (drawer) drawer.classList.remove('active');
                    document.body.classList.remove('mobile-nav-open');
                }
                
                // Remove active class from all navigation links
                allNavLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                const contentElement = document.querySelector('.content');
                
                if (targetElement && contentElement) {
                    // Calculate position relative to content container
                    const targetRect = targetElement.getBoundingClientRect();
                    const contentRect = contentElement.getBoundingClientRect();
                    const scrollPosition = targetRect.top - contentRect.top + contentElement.scrollTop - 20; // 20px offset
                    
                    const scrollDelay = isMobileLink ? 300 : 0; // Delay for mobile to allow drawer to close
                    
                    setTimeout(() => {
                        contentElement.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                    }, scrollDelay);
                } else {
                    // If target element not found, try to find it by waiting for content to load
                    setTimeout(() => {
                        const delayedTarget = document.getElementById(targetId);
                        if (delayedTarget && contentElement) {
                            const targetRect = delayedTarget.getBoundingClientRect();
                            const contentRect = contentElement.getBoundingClientRect();
                            const scrollPosition = targetRect.top - contentRect.top + contentElement.scrollTop - 20;
                            
                            contentElement.scrollTo({
                                top: scrollPosition,
                                behavior: 'smooth'
                            });
                        }
                    }, 500); // Wait 500ms for content to fully load
                }
            });
        });
    }
    
    // Scroll to Top Button functionality
    function initializeScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        const contentElement = document.querySelector('.content');
        
        // Show/hide button based on scroll position
        function toggleScrollButton() {
            if (contentElement.scrollTop > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
        
        // Smooth scroll to top
        function scrollToTop() {
            contentElement.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Event listeners
        contentElement.addEventListener('scroll', toggleScrollButton);
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
                // Re-initialize navigation to attach click handlers to new mobile links
                initializeNavigation();
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
    
    // Initialize theme management
    initializeTheme();
    
    // Theme Management Functions
    function initializeTheme() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTheme = urlParams.get('theme');
        
        // Valid theme options
        const validThemes = ['light', 'dark', 'system'];
        
        let selectedTheme = 'system'; // default
        
        if (urlTheme && validThemes.includes(urlTheme)) {
            // Theme from URL takes priority
            selectedTheme = urlTheme;
            // Save to localStorage for future visits
            localStorage.setItem('preferred-theme', selectedTheme);
        } else {
            // Check localStorage for saved preference
            const savedTheme = localStorage.getItem('preferred-theme');
            if (savedTheme && validThemes.includes(savedTheme)) {
                selectedTheme = savedTheme;
            }
        }
        
        applyTheme(selectedTheme);
        
        // Add theme info to console for debugging
        console.log(`Theme applied: ${selectedTheme}`);
        if (urlTheme) {
            console.log(`Theme from URL parameter: ${urlTheme}`);
        }
    }
    
    function applyTheme(theme) {
        const body = document.body;
        
        // Remove any existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-system');
        
        // Apply the selected theme
        body.classList.add(`theme-${theme}`);
        
        // Set data attribute for CSS targeting
        body.setAttribute('data-theme', theme);
        
        // For system theme, we'll rely on CSS media queries
        // For light/dark themes, we'll override the media queries
    }
    
    // Expose theme function globally for potential future use
    window.setTheme = function(theme) {
        const validThemes = ['light', 'dark', 'system'];
        if (validThemes.includes(theme)) {
            applyTheme(theme);
            localStorage.setItem('preferred-theme', theme);
            
            // Update URL without reloading the page
            const url = new URL(window.location);
            url.searchParams.set('theme', theme);
            window.history.replaceState({}, '', url);
            
            console.log(`Theme changed to: ${theme}`);
        } else {
            console.error(`Invalid theme: ${theme}. Valid options are: ${validThemes.join(', ')}`);
        }
    };
    
    // Copy to Clipboard functionality for code blocks
    function initializeCodeCopy() {
        // Add copy buttons to all pre elements
        const preElements = document.querySelectorAll('pre');
        
        preElements.forEach(pre => {
            // Skip if copy button already exists
            if (pre.querySelector('.code-copy-btn')) return;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            `;
            copyBtn.title = 'Copy code to clipboard';
            
            copyBtn.addEventListener('click', async () => {
                const code = pre.querySelector('code') || pre;
                const textToCopy = code.textContent || code.innerText;
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Show success feedback
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    `;
                    copyBtn.classList.add('copied');
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        `;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    // Show success feedback
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    `;
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        `;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }
            });
            
            pre.appendChild(copyBtn);
        });
    }
    
    // Initialize copy functionality when content loads
    initializeCodeCopy();
});