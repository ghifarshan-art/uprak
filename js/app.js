// =========================================================================
// 1. FUNGSI OTOMATIS MEMASTIKAN MENU DEFAULT HANYA BERJALAN 1x DI AWAL
// =========================================================================
function initDefaultMenus() {
    let isInitialized = localStorage.getItem('menus_initialized');
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    
    if (!isInitialized && menus.length === 0) {
        let defaultMenus = [
            { id: 1001, name: "Seblak Original", price: 12000, category: "Makanan", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
            { id: 1002, name: "Seblak Spesial", price: 17000, category: "Makanan", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
            { id: 1003, name: "Es Teh Manis", price: 5000, category: "Minuman", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400" },
            { id: 1004, name: "Es Jeruk", price: 7000, category: "Minuman", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" }
        ];

        localStorage.setItem('menus', JSON.stringify(defaultMenus));
        localStorage.setItem('menus_initialized', 'true');
    }
}

initDefaultMenus();

// Ambil riwayat keranjang belanja yang tersimpan agar tidak terhapus saat berpindah halaman
let cart = JSON.parse(localStorage.getItem('savedCart')) || [];

// =========================================================================
// 2. FUNGSI MENAMPILKAN MENU KE ETALASE (MAKANAN & MINUMAN)
// =========================================================================
function displayMenus() {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let containerMakanan = document.getElementById('container-makanan');
    let containerMinuman = document.getElementById('container-minuman');

    if (containerMakanan) containerMakanan.innerHTML = '';
    if (containerMinuman) containerMinuman.innerHTML = '';

    menus.forEach(menu => {
        let menuHTML = `
            <div class="col-6 col-md-4 mb-3">
                <div class="card card-menu h-100 bg-white border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    <img src="${menu.img}" class="card-img-top" alt="${menu.name}" style="height: 120px; object-fit: cover;">
                    <div class="card-body p-2 d-flex flex-column justify-content-between">
                        <div>
                            <h6 class="card-title fw-bold mb-1 text-truncate" style="font-size: 0.9rem;">${menu.name}</h6>
                            <p class="card-text text-success fw-bold mb-2 small">Rp ${menu.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button class="btn btn-outline-danger w-100 rounded-pill btn-sm py-1.5" style="font-size: 0.7rem; letter-spacing: -0.3px;" onclick="addToCart(${menu.id})">
                            <i class="fas fa-shopping-basket me-1"></i> + Keranjang
                        </button>
                    </div>
                </div>
            </div>`;

        if (menu.category === 'Makanan' && containerMakanan) {
            containerMakanan.innerHTML += menuHTML;
        } else if (menu.category === 'Minuman' && containerMinuman) {
            containerMinuman.innerHTML += menuHTML;
        }
    });
}

// =========================================================================
// 3. FUNGSI MANAJEMEN KERANJANG BELANJA (TAMBAH, UPDATE, & HAPUS)
// =========================================================================
function addToCart(id) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let menu = menus.find(m => m.id === id);
    if (!menu) return;

    let cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...menu, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    let listDesktop = document.getElementById('cart-items-list-desktop');
    let countDesktop = document.getElementById('cart-count-desktop');
    let totalDesktop = document.getElementById('cart-total-desktop');

    let listMobile = document.getElementById('cart-items-list-mobile');
    let countMobile = document.getElementById('cart-count-mobile');
    let totalMobile = document.getElementById('cart-total-mobile');

    // Selalu amankan isi variabel cart ke localStorage setiap kali ada perubahan
    localStorage.setItem('savedCart', JSON.stringify(cart));

    if (cart.length === 0) {
        let emptyHTML = `<p class="text-muted text-center py-4 small">Keranjangmu masih kosong.</p>`;
        
        if (listDesktop) listDesktop.innerHTML = emptyHTML;
        if (listMobile) listMobile.innerHTML = emptyHTML;
        
        if (countDesktop) countDesktop.innerText = '0';
        if (countMobile) countMobile.innerText = '0';
        
        if (totalDesktop) totalDesktop.innerText = 'Rp 0';
        if (totalMobile) totalMobile.innerText = 'Rp 0';
        return;
    }

    let itemsHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        itemsHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h6 class="mb-0 fw-bold small text-truncate" style="max-width: 140px;">${item.name}</h6>
                    <small class="text-muted">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</small>
                </div>
                <button class="btn btn-sm text-danger border-0 p-1" onclick="removeFromCart(${index})">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>`;
    });

    if (listDesktop) listDesktop.innerHTML = itemsHTML;
    if (countDesktop) countDesktop.innerText = totalItems;
    if (totalDesktop) totalDesktop.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    if (listMobile) listMobile.innerHTML = itemsHTML;
    if (countMobile) countMobile.innerText = totalItems;
    if (totalMobile) totalMobile.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// =========================================================================
// 4. FUNGSI PROSES CHECKOUT PESANAN KE PANEL ADMIN KASIR
// =========================================================================
function checkoutOrder() {
    if (cart.length === 0) {
        alert('Tidak ada produk untuk dipesan. Silakan pilih menu terlebih dahulu!');
        return;
    }

    let currentUser = localStorage.getItem('currentUser');

    // JIKA USER BELUM LOGIN: Amankan keranjang, beri peringatan, lalu lempar ke login.html
    if (!currentUser || currentUser === 'Admin Kasir') {
        alert('Anda harus login terlebih dahulu sebelum memproses pesanan!');
        localStorage.setItem('savedCart', JSON.stringify(cart)); // Kunci data belanjaan sebelum pindah halaman
        window.location.href = 'login.html';
        return;
    }

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let itemsSummary = cart.map(item => `${item.name} (${item.quantity}x)`).join(', ');
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let newOrder = {
        id: 'MMY' + Math.floor(1000 + Math.random() * 9000),
        customer: currentUser,
        items: itemsSummary,
        totalPrice: totalPrice,
        status: 'Diproses'
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`Pesanan berhasil dikirim dengan ID Nota: #${newOrder.id}\nSilakan tunggu hidangan Anda disiapkan!`);
    
    let offcanvasElement = document.getElementById('cartOffcanvasMobile');
    if (offcanvasElement) {
        let bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (bsOffcanvas) bsOffcanvas.hide();
    }

    // Bersihkan keranjang setelah sukses order
    cart = [];
    localStorage.removeItem('savedCart');
    updateCartUI();
}

// Fungsi melakukan logout pelanggan
function logoutCustomer() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('savedCart');
    window.location.reload();
}

// =========================================================================
// 5. EVENT HANDLER DIMUAT SAAT HALAMAN SELESAI DIAKSES
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = localStorage.getItem('currentUser');
    let userEl = document.getElementById('display-user');
    let btnLogout = document.getElementById('btn-logout');
    
    // Tampilkan data UI keranjang bawaan lama jika tersimpan
    updateCartUI();

    if (currentUser && currentUser !== 'Admin Kasir') {
        if (userEl) userEl.innerHTML = `Hallo <span class="fw-bold text-danger">${currentUser}</span>, Selamat datang`;
        if (btnLogout) btnLogout.classList.remove('d-none');
        
        // JIKA mendeteksi instruksi kirim otomatis pasca pindah dari login.html
        if (localStorage.getItem('triggerCheckout') === 'true') {
            localStorage.removeItem('triggerCheckout'); // Hapus tanda eksekusi
            checkoutOrder(); // Jalankan checkout otomatis
        }
    } else {
        if (userEl) userEl.innerText = 'Selamat Datang di Kedai Mamayu';
        if (btnLogout) btnLogout.classList.add('d-none');
    }
    
    displayMenus();
});
