function createSearchBar() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search documentation...';
    searchInput.id = 'search-input';

    searchContainer.appendChild(searchInput);
    document.body.appendChild(searchContainer);

    searchInput.addEventListener('input', handleSearch);
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const contentItems = document.querySelectorAll('.content-item');

    contentItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

export { createSearchBar };