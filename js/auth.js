// Dijalankan segera saat index.html diproses (Auth Guard)
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. AUTH GUARD (Proteksi Halaman) ---
    const userFirstName = localStorage.getItem("firstName");
    if (!userFirstName) {
        // Paksa redirect jika belum login
        window.location.replace("login.html");
        return; 
    }

    // --- 2. INISIALISASI DARK MODE GLOBAL ---
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) document.body.classList.add("dark-mode");

    const darkModeToggle = document.getElementById("darkModeToggleGlobal");
    if (darkModeToggle) {
        darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDarkNow = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDarkNow);
            darkModeToggle.textContent = isDarkNow ? "☀️" : "🌙";
        });
    }

    // --- 3. SAPAAN WAKTU DINAMIS DI NAVBAR ---
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        const hour = new Date().getHours();
        let greeting = "Halo";
        
        if (hour >= 5 && hour < 12) greeting = "Selamat Pagi";
        else if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
        else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
        else greeting = "Selamat Malam";

        // Render nama dari Local Storage
        welcomeMessage.innerHTML = `${greeting}, <b>${userFirstName}</b>!`;
    }

    // --- 4. FUNGSI LOGOUT ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Hapus session user (Jangan hapus savedUsername & darkMode agar preferensi tetap ada)
            localStorage.removeItem("firstName");
            
            // Redirect ke halaman login
            window.location.replace("login.html");
        });
    }
});