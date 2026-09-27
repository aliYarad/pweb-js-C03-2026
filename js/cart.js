document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");
  const productModal = document.getElementById("productModal");
 
  function formatRupiah(num) {
    return `Rp ${Number(num).toLocaleString("id-ID")}`;
  }
 
  function findProduct(id) {
    const source = typeof allProducts !== "undefined" ? allProducts : [];
    return source.find((p) => p.id === id) || null;
  }
 
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  }
 
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartBadge();
  }
 
  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
    saveCart(cart);
    renderCartPanel();
    showToast(`${product.name} ditambahkan ke keranjang`);
  }
 
  function removeFromCart(id) {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    renderCartPanel();
  }
 
  function updateCartQty(id, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(cart);
    renderCartPanel();
  }
 
  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
 
  function renderCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    const totalQty = getCart().reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalQty;
  }
 
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  }
 
  function saveWishlist(list) {
    localStorage.setItem("wishlist", JSON.stringify(list));
    renderWishlistBadge();
  }
 
  function isWishlisted(id) {
    return getWishlist().some((item) => item.id === id);
  }
 
  function toggleWishlist(product) {
    let list = getWishlist();
    if (isWishlisted(product.id)) {
      list = list.filter((item) => item.id !== product.id);
      showToast(`${product.name} dihapus dari wishlist`);
    } else {
      list.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      showToast(`${product.name} ditambahkan ke wishlist`);
    }
    saveWishlist(list);
    renderWishlistPanel();
  }
 
  function renderWishlistBadge() {
    const badge = document.getElementById("wishlistBadge");
    if (badge) badge.textContent = getWishlist().length;
  }
 
  function showToast(message) {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }
 
  function closeModal() {
    productModal.classList.add("hidden");
    productModal.innerHTML = "";
  }
 
  function openProductModal(id) {
    if (!productModal) return;
    const product = findProduct(id);
 
    if (!product) {
      productModal.classList.remove("hidden");
      productModal.innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
          <div class="modal-box">
            <p>Produk tidak ditemukan.</p>
            <button class="btn-submit" id="modalCloseBtn">Tutup</button>
          </div>
        </div>`;
      document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
      return;
    }
 
    const wished = isWishlisted(product.id);
    productModal.classList.remove("hidden");
    productModal.innerHTML = `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-box">
          <button class="modal-close" id="modalCloseBtn">&times;</button>
          <span class="modal-category">${product.category}</span>
          <img src="${product.image}" alt="${product.name}" class="modal-img">
          <h3>${product.name}</h3>
          <p class="modal-brand">Brand: ${product.brand || "Tidak ada data"}</p>
          <p class="modal-price">${formatRupiah(product.price)} <span class="modal-rating">&#9733; ${product.rating}</span></p>
          <p class="modal-stock">Stok: ${product.stock !== undefined ? product.stock : "Tidak ada data"}</p>
          <p class="modal-desc">${product.description || "Deskripsi belum tersedia untuk produk ini."}</p>
          <div class="modal-actions">
            <button class="btn-submit modal-add-cart">Tambah ke Keranjang</button>
            <button class="btn-icon modal-wishlist-btn">${wished ? "❤️" : "🤍"}</button>
          </div>
        </div>
      </div>`;
 
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });
    productModal.querySelector(".modal-add-cart").addEventListener("click", () => addToCart(product));
    productModal.querySelector(".modal-wishlist-btn").addEventListener("click", (e) => {
      toggleWishlist(product);
      e.target.textContent = isWishlisted(product.id) ? "❤️" : "🤍";
    });
  }

  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (!card) return;
 
      const addBtn = card.querySelector(".btn-add-cart");
      const id = addBtn ? Number(addBtn.dataset.id) : null;
      if (id === null) return;
 
      if (e.target.closest(".btn-add-cart")) {
        e.stopPropagation();
        const product = findProduct(id);
        if (product) addToCart(product);
        return;
      }
 
      if (e.target.closest(".btn-wishlist")) {
        e.stopPropagation();
        const product = findProduct(id);
        if (product) {
          toggleWishlist(product);
          e.target.textContent = isWishlisted(id) ? "❤️" : "🤍";
        }
        return;
      }
 
      openProductModal(id);
    });
  }
 
  function enhanceCardWithWishlist(card) {
    if (card.querySelector(".btn-wishlist")) return; // sudah pernah disisipkan
    const addBtn = card.querySelector(".btn-add-cart");
    if (!addBtn) return;
    const id = Number(addBtn.dataset.id);
 
    const wishBtn = document.createElement("button");
    wishBtn.type = "button";
    wishBtn.className = "btn-wishlist";
    wishBtn.textContent = isWishlisted(id) ? "❤️" : "🤍";
 
    const actionRow = document.createElement("div");
    actionRow.className = "card-action-row";
    addBtn.parentNode.insertBefore(actionRow, addBtn);
    actionRow.appendChild(addBtn);
    actionRow.appendChild(wishBtn);
  }
 
  function enhanceAllCards() {
    if (!productGrid) return;
    productGrid.querySelectorAll(".product-card").forEach(enhanceCardWithWishlist);
  }
 
  if (productGrid) {
    const gridObserver = new MutationObserver(() => enhanceAllCards());
    gridObserver.observe(productGrid, { childList: true, subtree: true });
    enhanceAllCards(); // jaga-jaga kalau produk sudah lebih dulu dirender
  }
 
  function renderCartPanel() {
    const panel = document.getElementById("cartPanel");
    if (!panel) return;
    const cart = getCart();
    if (cart.length === 0) {
      panel.innerHTML = `<p class="panel-empty">Keranjang masih kosong</p>`;
      return;
    }
    panel.innerHTML =
      cart
        .map(
          (item) => `
        <div class="panel-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}">
          <div class="panel-item-info">
            <p>${item.name}</p>
            <span>${formatRupiah(item.price)} x ${item.qty}</span>
          </div>
          <div class="panel-item-actions">
            <button data-action="dec">-</button>
            <button data-action="inc">+</button>
            <button data-action="remove">🗑</button>
          </div>
        </div>`
        )
        .join("") + `<div class="panel-total">Total: ${formatRupiah(cartTotal(cart))}</div>`;
  }
 
  function renderWishlistPanel() {
    const panel = document.getElementById("wishlistPanel");
    if (!panel) return;
    const list = getWishlist();
    if (list.length === 0) {
      panel.innerHTML = `<p class="panel-empty">Wishlist masih kosong</p>`;
      return;
    }
    panel.innerHTML = list
      .map(
        (item) => `
        <div class="panel-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}">
          <div class="panel-item-info">
            <p>${item.name}</p>
            <span>${formatRupiah(item.price)}</span>
          </div>
          <div class="panel-item-actions">
            <button data-action="move-to-cart">🛒</button>
            <button data-action="remove">🗑</button>
          </div>
        </div>`
      )
      .join("");
  }
 
  function positionPanel(panel, iconId) {
    const icon = document.getElementById(iconId);
    if (!icon) return;
    const rect = icon.getBoundingClientRect();
    panel.style.position = "fixed";
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.right = `${window.innerWidth - rect.right}px`;
  }
 
  function togglePanel(panelId, iconId) {
    let panel = document.getElementById(panelId);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = panelId;
      panel.className = "dropdown-panel hidden";
      document.body.appendChild(panel);
    }
    const willOpen = panel.classList.contains("hidden");
    document.querySelectorAll(".dropdown-panel").forEach((p) => p.classList.add("hidden"));
    if (willOpen) {
      positionPanel(panel, iconId);
      panel.classList.remove("hidden");
    }
  }
 
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePanel("cartPanel", "cartIcon");
      renderCartPanel();
    });
  }
 
  const wishlistIcon = document.getElementById("wishlistIcon");
  if (wishlistIcon) {
    wishlistIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePanel("wishlistPanel", "wishlistIcon");
      renderWishlistPanel();
    });
  }
 
  document.addEventListener("click", (e) => {
    const panelItem = e.target.closest(".panel-item");
    if (!panelItem) {
      const clickedOutside =
        !e.target.closest(".dropdown-panel") &&
        !e.target.closest("#cartIcon") &&
        !e.target.closest("#wishlistIcon");
      if (clickedOutside) {
        document.querySelectorAll(".dropdown-panel").forEach((p) => p.classList.add("hidden"));
      }
      return;
    }
 
    const id = Number(panelItem.dataset.id);
    const action = e.target.dataset.action;
    if (!action) return;
 
    if (action === "inc") updateCartQty(id, 1);
    if (action === "dec") updateCartQty(id, -1);
    if (action === "remove" && panelItem.closest("#cartPanel")) removeFromCart(id);
    if (action === "remove" && panelItem.closest("#wishlistPanel")) {
      const list = getWishlist().filter((i) => i.id !== id);
      saveWishlist(list);
      renderWishlistPanel();
    }
    if (action === "move-to-cart") {
      const item = getWishlist().find((i) => i.id === id);
      if (item) {
        addToCart({ ...item, qty: 1 });
        const list = getWishlist().filter((i) => i.id !== id);
        saveWishlist(list);
        renderWishlistPanel();
      }
    }
  });
 
  renderCartBadge();
  renderWishlistBadge();
});