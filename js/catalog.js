// Data Dummy Produk (Bisa diganti dengan fetch API nantinya)
const allProducts = [
    { id: 1, name: "Kemeja Flanel Pria", category: "fashion", price: 125000, rating: 4.5, image: "https://via.placeholder.com/200" },
    { id: 2, name: "Mouse Wireless Gaming", category: "electronics", price: 210000, rating: 4.8, image: "https://via.placeholder.com/200" },
    { id: 3, name: "Keripik Singkong Pedas", category: "food", price: 15000, rating: 4.2, image: "https://via.placeholder.com/200" },
    { id: 4, name: "Headphone Bluetooth", category: "electronics", price: 350000, rating: 4.7, image: "https://via.placeholder.com/200" },
    { id: 5, name: "Celana Jeans Casual", category: "fashion", price: 180000, rating: 4.4, image: "https://via.placeholder.com/200" },
    { id: 6, name: "Kopi Susu Literan", category: "food", price: 45000, rating: 4.9, image: "https://via.placeholder.com/200" },
    { id: 7, name: "Keyboard Mechanical", category: "electronics", price: 450000, rating: 4.6, image: "https://via.placeholder.com/200" },
    { id: 8, name: "Jaket Hoodie Polos", category: "fashion", price: 160000, rating: 4.3, image: "https://via.placeholder.com/200" }
];

let filteredProducts = [...allProducts];
let displayedCount = 4; // Jumlah produk awal yang dirender sebelum tombol load more diklik
const itemsPerPage = 4;

// Ambil elemen dari kerangka HTML yang sudah disediakan
const controlsArea = document.getElementById('controlsArea');
const productGrid = document.getElementById('productGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');

// 1. RENDER KONTROL (Search, Filter Kategori, Sorting) ke dalam #controlsArea
function renderControls() {
    controlsArea.innerHTML = `
        <div class="search-filter-wrapper" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
            <input type="text" id="searchInput" placeholder="Cari produk..." class="form-control" style="flex: 1; min-width: 200px; padding: 8px;" />
            
            <select id="categoryFilter" class="form-select" style="padding: 8px;">
                <option value="">Semua Kategori</option>
                <option value="electronics">Elektronik</option>
                <option value="fashion">Fashion</option>
                <option value="food">Makanan & Minuman</option>
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

// 2. RENDER PRODUK ke dalam #productGrid
function renderProducts() {
    productGrid.innerHTML = '';
    
    const productsToDisplay = filteredProducts.slice(0, displayedCount);

    if (productsToDisplay.length === 0) {
        productGrid.innerHTML = `<p style="text-align: center; color: var(--text-muted); width: 100%;">Produk tidak ditemukan.</p>`;
        loadMoreContainer.innerHTML = '';
        return;
    }

    // Buat wadah grid untuk kartu produk
    let gridWrapper = document.createElement('div');
    gridWrapper.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;";

    productsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card";
        card.style.cssText = "border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fff; display: flex; flex-direction: column; justify-content: space-between;";
        card.innerHTML = `
            <div>
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
                <span style="font-size: 11px; background: #eee; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">${product.category}</span>
                <h4 style="font-size: 16px; margin: 8px 0; color: #333;">${product.name}</h4>
                <p style="font-weight: bold; color: #4f46e5; margin: 4px 0;">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p style="color: #f59e0b; font-size: 14px; margin: 0 0 12px 0;">★ ${product.rating}</p>
            </div>
            <button class="btn-add-cart" data-id="${product.id}" style="padding: 6px 12px; background: #4f46e5; color: #fff; border: none; border-radius: 4px; cursor: pointer;">+ Keranjang</button>
        `;
        gridWrapper.appendChild(card);
    });

    productGrid.appendChild(gridWrapper);
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

    // Filter data
    filteredProducts = allProducts.filter(product => {
        const matchesKeyword = product.name.toLowerCase().includes(keyword);
        const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
        return matchesKeyword && matchesCategory;
    });

    // Sorting data
    if (sortValue === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating-desc") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    displayedCount = itemsPerPage; // Reset halaman saat filter/sort berubah
    renderProducts();
}

// Jalankan fungsi utama saat file dimuat
renderControls();
initListeners();
renderProducts();