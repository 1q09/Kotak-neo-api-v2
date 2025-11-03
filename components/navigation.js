function createNavigation() {
    const navItems = [
        { name: 'Home', link: 'index.html' },
        { name: 'Getting Started', link: 'getting-started.html' },
        { name: 'API Reference', link: 'api-reference.html' },
        { name: 'Guides', link: 'guides.html' },
        { name: 'FAQ', link: 'faq.html' }
    ];

    const navContainer = document.createElement('nav');
    navContainer.classList.add('sidebar');

    const ul = document.createElement('ul');
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.name;
        li.appendChild(a);
        ul.appendChild(li);
    });

    navContainer.appendChild(ul);
    document.body.appendChild(navContainer);

    // Make the navigation fixed while scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            navContainer.classList.add('fixed');
        } else {
            navContainer.classList.remove('fixed');
        }
    });
}

export default createNavigation;