document.addEventListener("DOMContentLoaded", () => {
    // --- 1. INISIALISASI TEMA (DARK MODE) ---
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) document.body.classList.add("dark-mode");

    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDarkNow = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDarkNow);
            darkModeToggle.textContent = isDarkNow ? "☀️" : "🌙";
        });
    }

    // --- 2. DEKLARASI ELEMEN FORM ---
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const toast = document.getElementById("toast");
    const togglePassword = document.getElementById("togglePassword");
    const rememberMeCheck = document.getElementById("rememberMe");

    // --- 3. FITUR SHOW/HIDE PASSWORD ---
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        togglePassword.textContent = type === "password" ? "Lihat" : "Tutup";
    });

    // --- 4. FITUR REMEMBER ME (Load dari storage) ---
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberMeCheck.checked = true;
    }

    // --- 5. FUNGSI TOAST & LOADING ---
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove("hidden");
        void toast.offsetWidth; // Trigger reflow animasi
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.classList.add("hidden"), 400);
        }, 3000);
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            btnText.textContent = "Memproses...";
            spinner.classList.remove("hidden");
        } else {
            loginBtn.disabled = false;
            btnText.textContent = "Masuk";
            spinner.classList.add("hidden");
        }
    }

    // --- 6. HANDLE SUBMIT LOGIN API ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showToast("Username dan password wajib diisi!");
            return;
        }

        setLoading(true);

        try {
            // Fetch ke dummyjson sesuai spesifikasi praktikum
            const response = await fetch("https://dummyjson.com/users?limit=100");
            
            if (!response.ok) throw new Error("Gagal terhubung ke server.");

            const data = await response.json();
            const users = data.users;

            // INJEKSI AKUN LOKAL UNTUK DEMO PRAKTIKUM
            users.push({
                username: "admin",
                password: "123",
                firstName: "Praktikan" 
            });

            const validUser = users.find(user => user.username === username && user.password === password);

            if (validUser) {
                // Simpan Sesi (Auth Guard Requirement)
                localStorage.setItem("firstName", validUser.firstName);
                
                // Simpan preferensi Remember Me
                if (rememberMeCheck.checked) {
                    localStorage.setItem("savedUsername", username);
                } else {
                    localStorage.removeItem("savedUsername");
                }
                
                // Redirect otomatis
                window.location.href = "index.html";
            } else {
                showToast("Username atau password salah!");
            }

        } catch (error) {
            showToast("Error: " + error.message);
        } finally {
            setLoading(false); 
        }
    });
});