/**
 * Blog List Component (full implementation)
 * Handles: fetching, sorting, filtering, searching, error handling, and caching.
 */
export class BlogList {
    constructor(container) {
        this.container = container;
        this.listContainer = container.querySelector('.blog-list-content');
        this.loadingIndicator = container.querySelector('.loading-indicator');
        this.errorContainer = container.querySelector('.error-container');

        this.sortSelect = container.querySelector('.sort-select');
        this.filterSelect = container.querySelector('.filter-select');
        this.searchInput = container.querySelector('.search-input');

        this.apiUrl = 'https://frontend-blog-lyart.vercel.app/blogsData.json';
        this.items = [];
        this.filteredItems = [];
        this.page = 1;
        this.perPage = 10;
        this.cacheKey = "blogs_cache_v1";

        // Bind handlers
        this.onSortChange = this.onSortChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSearchInput = this.onSearchInput.bind(this);
    }

    async init() {
        try {
            this.showLoading();
            await this.fetchData();
            this.setupEventListeners();
            this.render();
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
        }
    }

    async fetchData() {
        // Try local cache first
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    this.items = parsed;
                    this.filteredItems = [...parsed];
                    return;
                }
            } catch { /* ignore broken cache */ }
        }

        // Fetch fresh data
        let retries = 2;
        while (retries >= 0) {
            try {
                const res = await fetch(this.apiUrl);
                if (!res.ok) throw new Error('Failed to fetch blogs');
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error('Unexpected API response');

                this.items = data;
                this.filteredItems = [...data];

                // Cache result
                localStorage.setItem(this.cacheKey, JSON.stringify(data));
                return;
            } catch (err) {
                if (retries === 0) throw err;
                retries--;
                await new Promise(res => setTimeout(res, 500)); // retry delay
            }
        }
    }

    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onSortChange);
        this.filterSelect?.addEventListener('change', this.onFilterChange);
        let t;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(t);
            t = setTimeout(() => this.onSearchInput(e), 250);
        });
    }

    render() {
        const end = this.page * this.perPage;
        const slice = this.filteredItems.slice(0, end);

        this.listContainer.innerHTML = slice.map(item => `
            <article class="blog-item border rounded-lg shadow-sm p-4 mb-4 bg-white flex gap-4">
                <img src="${item.image}" alt="" class="blog-image w-32 h-24 object-cover rounded-md" />
                <div class="blog-content flex-1">
                    <h3 class="blog-title text-lg font-semibold">${item.title}</h3>
                    <div class="blog-meta text-sm text-gray-500 space-x-2">
                        <span class="blog-author">${item.author}</span>
                        <time class="blog-date">${new Date(item.published_date).toLocaleDateString()}</time>
                        <span class="blog-reading-time">${item.reading_time} min read</span>
                    </div>
                    <p class="blog-excerpt text-gray-700 mt-1">${item.content}</p>
                    <div class="blog-tags mt-2 flex flex-wrap gap-2">
                        ${(item.tags || []).map(t => `<span class="tag bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded">${t}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        if (slice.length === 0) {
            this.listContainer.innerHTML = '<p class="no-results text-gray-600">No blogs found</p>';
        }
    }

    // --- Sorting ---
    onSortChange(e) {
        const by = e.target.value;
        if (by === 'date') {
            this.filteredItems.sort((a, b) =>
                new Date(b.published_date) - new Date(a.published_date)
            );
        } else if (by === 'reading_time') {
            this.filteredItems.sort((a, b) =>
                parseInt(a.reading_time) - parseInt(b.reading_time)
            );
        } else if (by === 'category') {
            this.filteredItems.sort((a, b) =>
                (a.category || '').localeCompare(b.category || '')
            );
        }
        this.page = 1;
        this.render();
    }

    // --- Filtering ---
    onFilterChange(e) {
        const val = e.target.value;
        if (val) {
            this.filteredItems = this.items.filter(
                (item) => item.category === val || (item.tags || []).includes(val)
            );
        } else {
            this.filteredItems = [...this.items];
        }
        this.page = 1;
        this.render();
    }

    // --- Searching ---
    onSearchInput(e) {
        const q = (e.target.value || '').toLowerCase();
        this.filteredItems = this.items.filter((item) =>
            item.title.toLowerCase().includes(q)
        );
        this.page = 1;
        this.render();
    }

    // --- UI Helpers ---
    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
    showError(err) {
        if (!this.errorContainer) return;
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.textContent = `Error: ${err.message}`;
    }
}
