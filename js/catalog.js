let allProducts = [];
let filteredProducts = [];
let displayedCount = 4; 
const itemsPerPage = 4;

// Ambil elemen dari kerangka HTML yang sudah disediakan
const controlsArea = document.getElementById('controlsArea');
const productGrid = document.getElementById('productGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');

// FUNGSI FETCH DATA DARI DUMMYJSON
async function fetchProducts() {
    try {
        productGrid.innerHTML = `<p style="text-align: center; color: var(--text-muted); width: 100%;">Memuat produk...</p>`;
        
        const response = await fetch('https://dummyjson.com/products?limit=30');
        const data = await response.json();

        allProducts = data.products.map(item => {
            const originalPriceIDR = Math.round(item.price * 15000);
            // Hitung harga setelah diskon
            const discount = item.discountPercentage || 0;
            const finalPriceIDR = discount > 0 
                ? Math.round(originalPriceIDR * (1 - discount / 100)) 
                : originalPriceIDR;

            return {
                id: item.id,
                name: item.title,
                category: item.category,
                price: finalPriceIDR,          // Harga setelah diskon
                originalPrice: originalPriceIDR, // Harga asli buat dicoret
                discount: discount,            // Persentase diskon
                rating: item.rating,
                image: item.thumbnail,
                description: item.description
            };
        });

        // LANGSUNG ACAK URUTANNYA SEJAK PERTAMA KALI DIMUAT
        allProducts.sort(() => Math.random() - 0.5);

        filteredProducts = [...allProducts];
        
        renderControls();
        initListeners();
        renderProducts();
    } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        productGrid.innerHTML = `<p style="text-align: center; color: red; width: 100%;">Gagal memuat data produk.</p>`;
    }
}

// 1. RENDER KONTROL (Search, Filter Kategori, Sorting) ke dalam #controlsArea
function renderControls() {
    controlsArea.innerHTML = `
        <div class="search-filter-wrapper" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
            <input type="text" id="searchInput" placeholder="Cari produk..." class="form-control" style="flex: 1; min-width: 200px; padding: 8px;" />
            
            <select id="categoryFilter" class="form-select" style="padding: 8px;">
                <option value="">Semua Kategori</option>
                <option value="beauty">Beauty</option>
                <option value="fragrances">Fragrances</option>
                <option value="furniture">Furniture</option>
                <option value="groceries">Groceries</option>
            </select>
            
            <select id="sortSelect" class="form-select" style="padding: 8px;">
                <option value="">Urutkan</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
                <option value="rating-desc">Rating Tertinggi</option>
            </select>
        </div>
    `;
}

// 2. RENDER PRODUK langsung ke dalam #productGrid (tanpa bungkus tambahan agar grid CSS bawaan berfungsi)
function renderProducts() {
    productGrid.innerHTML = '';
    
    const productsToDisplay = filteredProducts.slice(0, displayedCount);

    if (productsToDisplay.length === 0) {
        productGrid.innerHTML = `<p style="text-align: center; color: var(--text-muted); width: 100%;">Produk tidak ditemukan.</p>`;
        loadMoreContainer.innerHTML = '';
        return;
    }

    productsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card";
        card.style.cssText = "border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #fff; display: flex; flex-direction: column; justify-content: space-between; position: relative;";
    
        // Format diskon jika ada
        let priceHtml = `<p style="font-weight: bold; color: #4f46e5; margin: 4px 0;">Rp ${product.price.toLocaleString('id-ID')}</p>`;
        let badgeHtml = '';

        if (product.discount > 0) {
            badgeHtml = `<span style="position: absolute; top: 10px; right: 10px; background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${product.discount}% OFF</span>`;
            priceHtml = `
                <div>
                    <span style="font-size: 12px; color: #9ca3af; text-decoration: line-through; margin-right: 6px;">Rp ${product.originalPrice.toLocaleString('id-ID')}</span>
                    <span style="font-size: 11px; background: #fee2e2; color: #dc2626; font-weight: bold; padding: 1px 4px; border-radius: 3px;">-${product.discount}%</span>
                </div>
                <p style="font-weight: bold; color: #4f46e5; margin: 2px 0 4px 0;">Rp ${product.price.toLocaleString('id-ID')}</p>
            `;
        }

        card.innerHTML = `
            <div>
                ${badgeHtml}
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
                <span style="font-size: 11px; background: #eee; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">${product.category}</span>
                <h4 style="font-size: 16px; margin: 8px 0; color: #333;">${product.name}</h4>
                <p style="font-size: 12px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${product.description}</p>
                ${priceHtml}
                <p style="color: #f59e0b; font-size: 14px; margin: 0 0 12px 0;">★ ${product.rating}</p>
            </div>
            <button class="btn-add-cart" data-id="${product.id}">+ Keranjang</button>
        `;
        productGrid.appendChild(card);
});

    renderLoadMoreButton();
}

// 3. RENDER TOMBOL LOAD MORE ke dalam #loadMoreContainer
function renderLoadMoreButton() {
    loadMoreContainer.innerHTML = '';
    if (displayedCount < filteredProducts.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = "loadMoreBtn";
        loadMoreBtn.innerText = "Muat Lebih Banyak";
        loadMoreBtn.style.cssText = "display: block; margin: 30px auto; padding: 10px 20px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;";
        
        loadMoreBtn.addEventListener('click', () => {
            displayedCount += itemsPerPage;
            renderProducts();
        });
        
        loadMoreContainer.appendChild(loadMoreBtn);
    }
}

// 4. DEBOUNCE & CLOSURE UNTUK SEARCH
function createDebounce() {
    let timeoutId;
    return function(func, delay) {
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };
}

// 5. INISIALISASI EVENT LISTENER (Search, Filter, Sorting)
function initListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');

    const debounce = createDebounce();

    const handleSearch = debounce((e) => {
        applyFilterAndSort();
    }, 400);

    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', applyFilterAndSort);
    sortSelect.addEventListener('change', applyFilterAndSort);
}

function applyFilterAndSort() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');

    const keyword = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    // 1. Filter data berdasarkan search & kategori
    filteredProducts = allProducts.filter(product => {
        const matchesKeyword = product.name.toLowerCase().includes(keyword);
        const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
        return matchesKeyword && matchesCategory;
    });

    // 2. LOGIKA SORTING & ACAK
    if (sortValue === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating-desc") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (selectedCategory === "" && sortValue === "") {
        // Jika "Semua Kategori" dipilih dan tidak ada sorting yang aktif, 
        // kita acak urutannya agar produknya tidak mengelompok per kategori!
        filteredProducts.sort(() => Math.random() - 0.5);
    }

    displayedCount = itemsPerPage; // Reset halaman saat filter/sort berubah
    renderProducts();
}

fetchProducts();