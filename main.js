// ===============================
// CONFIGURATION & INITIALIZATION
// ===============================

// API Keys (Replace with your own keys)
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Get from https://openweathermap.org/api
const YOUTUBE_API_KEY = 'AIzaSyABUNd3GL6-500X1gMWl9b__u7nGjVPNJw'; // Already in use
const GITHUB_USERNAME = 'yamanjr10'; // Your GitHub username

// Sample data for demonstration
const SAMPLE_WALLPAPERS = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
];

const SAMPLE_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

// ===============================
// NOTIFICATION SYSTEM
// ===============================

class NotificationSystem {
  constructor() {
    this.storageKey = 'notifications';
    this.maxNotifications = 50;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadNotifications();
  }

  setupEventListeners() {
    const bell = document.getElementById('notificationBell');
    const center = document.getElementById('notificationCenter');
    const clearBtn = document.getElementById('clearAllNotifications');

    if (bell) bell.addEventListener('click', () => this.toggleCenter());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearAll());

    // Close notification center when clicking outside
    document.addEventListener('click', (e) => {
      if (!center.contains(e.target) && !bell.contains(e.target)) {
        this.hideCenter();
      }
    });
  }

  notify({ type = 'info', title, message, sticky = false, id = null }) {
    const notification = {
      id: id || Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.showToast(notification);
    this.saveNotification(notification);
    this.updateBellIndicator();
  }

  showToast(notification) {
    const toast = document.createElement('div');
    toast.className = `toast ${notification.type}`;
    toast.innerHTML = `
                    <div class="toast-icon">
                        <i class="fas fa-${this.getIconForType(notification.type)}"></i>
                    </div>
                    <div class="toast-content">
                        <div class="toast-title">${notification.title}</div>
                        <div class="toast-message">${notification.message}</div>
                    </div>
                    <button class="toast-close">
                        <i class="fas fa-times"></i>
                    </button>
                `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds unless sticky
    if (!notification.sticky) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideInRight 0.3s ease reverse';
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    }

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    });
  }

  getIconForType(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  saveNotification(notification) {
    const notifications = this.getStoredNotifications();
    notifications.unshift(notification);

    // Keep only the most recent notifications
    if (notifications.length > this.maxNotifications) {
      notifications.splice(this.maxNotifications);
    }

    sessionStorage.setItem(this.storageKey, JSON.stringify(notifications));
    this.renderNotifications();
  }

  getStoredNotifications() {
    return JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
  }

  renderNotifications() {
    const container = document.getElementById('notificationList');
    const notifications = this.getStoredNotifications();

    if (!container) return;

    container.innerHTML = notifications.length ?
      notifications.map(notif => `
                        <div class="notification-item">
                            <div class="toast-icon">
                                <i class="fas fa-${this.getIconForType(notif.type)}"></i>
                            </div>
                            <div class="toast-content">
                                <div class="toast-title">${notif.title}</div>
                                <div class="toast-message">${notif.message}</div>
                                <div class="text-xs text-gray-500 mt-1">${new Date(notif.timestamp).toLocaleTimeString()}</div>
                            </div>
                            <button class="notification-dismiss" data-id="${notif.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') :
      '<div class="text-center py-4 text-gray-500">No notifications</div>';

    // Add event listeners to dismiss buttons
    container.querySelectorAll('.notification-dismiss').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dismissNotification(btn.dataset.id);
      });
    });
  }

  dismissNotification(id) {
    const notifications = this.getStoredNotifications().filter(n => n.id !== id);
    sessionStorage.setItem(this.storageKey, JSON.stringify(notifications));
    this.renderNotifications();
    this.updateBellIndicator();
  }

  clearAll() {
    sessionStorage.setItem(this.storageKey, '[]');
    this.renderNotifications();
    this.updateBellIndicator();
  }

  toggleCenter() {
    const center = document.getElementById('notificationCenter');
    center.classList.toggle('active');
  }

  hideCenter() {
    const center = document.getElementById('notificationCenter');
    center.classList.remove('active');
  }

  updateBellIndicator() {
    const bell = document.getElementById('notificationBell');
    const notifications = this.getStoredNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
      bell.classList.add('has-notifications');
    } else {
      bell.classList.remove('has-notifications');
    }
  }

  loadNotifications() {
    this.renderNotifications();
    this.updateBellIndicator();
  }
}

// Global notify function
function notify(options) {
  window.notificationSystem.notify(options);
}

// ===============================
// PROFILE WIDGET (with local avatar upload)
// ===============================

class ProfileWidget {
  constructor() {
    this.storageKey = 'userProfile';
    this.visitKey = 'lastVisit';
    this.streakKey = 'userStreak';
    this.init();
  }

  init() {
    this.loadProfile();
    this.setupEventListeners();
    this.updateStreak();
    this.updateGreeting();
  }

  loadProfile() {
    const profile = JSON.parse(localStorage.getItem(this.storageKey)) || {
      name: 'Guest',
      avatarUrl: ''
    };

    this.updateProfileDisplay(profile);
    return profile;
  }

  updateProfileDisplay(profile) {
    const greetingEl = document.getElementById('greetingText');
    const avatarEl = document.getElementById('profileAvatar');

    if (greetingEl) {
      const timeBasedGreeting = this.getTimeBasedGreeting();
      greetingEl.textContent = `${timeBasedGreeting}, ${profile.name}!`;
    }

    if (avatarEl) {
      if (profile.avatarUrl) {
        avatarEl.style.backgroundImage = `url(${profile.avatarUrl})`;
        avatarEl.classList.add('avatar-image');
        avatarEl.textContent = '';
      } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.classList.remove('avatar-image');
        avatarEl.classList.add('avatar-initials');
        avatarEl.textContent = profile.name.charAt(0).toUpperCase();
      }
    }
  }

  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  updateGreeting() {
    const profile = this.loadProfile();
    this.updateProfileDisplay(profile);
  }

  updateStreak() {
    const now = new Date();
    const today = now.toDateString();
    const lastVisit = localStorage.getItem(this.visitKey);
    let streak = parseInt(localStorage.getItem(this.streakKey)) || 0;

    if (lastVisit !== today) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit === yesterday.toDateString()) {
        streak += 1;
      } else if (lastVisit && lastVisit !== today) {
        streak = 1;
      } else if (!lastVisit) {
        streak = 1;
      }

      localStorage.setItem(this.streakKey, streak.toString());
      localStorage.setItem(this.visitKey, today);
    }

    const streakEl = document.getElementById('streakCount');
    if (streakEl) {
      streakEl.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
    }
  }

  setupEventListeners() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('profileModal');
    const closeBtn = document.getElementById('closeProfileModal');
    const cancelBtn = document.getElementById('cancelProfileEdit');
    const form = document.getElementById('profileForm');
    const fileInput = document.getElementById('profileAvatarFile');
    const previewImg = document.getElementById('avatarPreview');

    if (editBtn) editBtn.addEventListener('click', () => this.showModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideModal());
    if (form) form.addEventListener('submit', (e) => this.saveProfile(e));

    // Handle avatar file selection + live preview
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
          previewImg.classList.remove('hidden');
          previewImg.dataset.previewData = event.target.result; // store Base64 temporarily
        };
        reader.readAsDataURL(file);
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideModal();
      });
    }
  }

  showModal() {
    const modal = document.getElementById('profileModal');
    const profile = this.loadProfile();
    const nameInput = document.getElementById('profileName');
    const previewImg = document.getElementById('avatarPreview');

    if (nameInput) nameInput.value = profile.name;
    if (previewImg && profile.avatarUrl) {
      previewImg.src = profile.avatarUrl;
      previewImg.classList.remove('hidden');
    }
    if (modal) modal.classList.remove('hidden');
  }

  hideModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('hidden');
  }

  saveProfile(e) {
    e.preventDefault();

    const nameInput = document.getElementById('profileName');
    const previewImg = document.getElementById('avatarPreview');

    const profile = {
      name: nameInput.value.trim() || 'Guest',
      avatarUrl: previewImg.dataset.previewData || ''
    };

    localStorage.setItem(this.storageKey, JSON.stringify(profile));
    this.updateProfileDisplay(profile);
    this.hideModal();

    notify({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.'
    });
  }
}


// ===============================
// THEME SWITCHER
// ===============================

class ThemeSwitcher {
  constructor() {
    this.storageKey = 'dashboardTheme';
    this.wallpaperKey = 'dashboardWallpaper';
    this.currentTheme = 'dark';
    this.currentWallpaper = 0;
    this.init();
  }

  init() {
    this.loadPreferences();
    this.setupEventListeners();
    this.applyTheme();
    this.applyWallpaper();
  }

  loadPreferences() {
    this.currentTheme = localStorage.getItem(this.storageKey) || 'dark';
    this.currentWallpaper = parseInt(localStorage.getItem(this.wallpaperKey)) || 0;
  }

  setupEventListeners() {
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setTheme(e.target.dataset.theme);
      });
    });

    // Wallpaper buttons
    document.querySelectorAll('.wallpaper-btn').forEach(btn => {
      if (btn.id !== 'nextWallpaperBtn') {
        btn.addEventListener('click', (e) => {
          this.setWallpaper(parseInt(e.target.dataset.wallpaper));
        });
      }
    });

    // Next wallpaper button
    const nextBtn = document.getElementById('nextWallpaperBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextWallpaper();
      });
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme();

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    notify({
      type: 'success',
      title: 'Theme Changed',
      message: `Switched to ${theme} theme.`
    });
  }

  applyTheme() {
    document.documentElement.className = this.currentTheme + '-theme';
  }

  setWallpaper(index) {
    this.currentWallpaper = index;
    localStorage.setItem(this.wallpaperKey, index.toString());
    this.applyWallpaper();

    notify({
      type: 'info',
      title: 'Wallpaper Changed',
      message: 'Background wallpaper updated.'
    });
  }

  nextWallpaper() {
    const nextIndex = (this.currentWallpaper + 1) % SAMPLE_WALLPAPERS.length;
    this.setWallpaper(nextIndex);
  }

  applyWallpaper() {
    const bg = document.querySelector('.anime-bg');
    const wallpaper = SAMPLE_WALLPAPERS[this.currentWallpaper];

    if (wallpaper.startsWith('linear-gradient')) {
      bg.style.backgroundImage = wallpaper;
    } else {
      bg.style.backgroundImage = `url(${wallpaper})`;
    }
  }
}

// ===============================
// WEATHER WIDGET
// ===============================

class WeatherWidget {
  constructor() {
    this.storageKey = 'weatherLocation';
    this.cacheKey = 'weatherCache';
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadWeather();
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshWeather');
    const locationBtn = document.getElementById('setLocationBtn');
    const modal = document.getElementById('weatherLocationModal');
    const closeBtn = document.getElementById('closeWeatherLocationModal');
    const cancelBtn = document.getElementById('cancelWeatherLocation');
    const form = document.getElementById('weatherLocationForm');

    if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadWeather(true));
    if (locationBtn) locationBtn.addEventListener('click', () => this.showLocationModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideLocationModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideLocationModal());
    if (form) form.addEventListener('submit', (e) => this.saveLocation(e));

    if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideLocationModal();
    });
  }

  showLocationModal() {
    const modal = document.getElementById('weatherLocationModal');
    const cityInput = document.getElementById('weatherCity');
    const location = localStorage.getItem(this.storageKey);

    if (cityInput) cityInput.value = location || '';
    if (modal) modal.classList.remove('hidden');
  }

  hideLocationModal() {
    const modal = document.getElementById('weatherLocationModal');
    if (modal) modal.classList.add('hidden');
  }

  saveLocation(e) {
    e.preventDefault();

    const cityInput = document.getElementById('weatherCity');
    const city = cityInput.value.trim();

    if (city) {
      localStorage.setItem(this.storageKey, city);
      this.hideLocationModal();
      this.loadWeather(true);

      notify({
        type: 'success',
        title: 'Location Saved',
        message: `Weather location set to ${city}.`
      });
    }
  }

  async loadWeather(forceRefresh = false) {
    const location = localStorage.getItem(this.storageKey);

    if (!location) {
      this.showLocationModal();
      return;
    }

    // Check cache
    const cached = this.getCachedWeather();
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.displayWeather(cached.data);
      return;
    }

    this.showLoading();

    try {
      if (OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        // Show mock data if no API key
        this.displayMockWeather(location);
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) throw new Error('Weather data not available');

      const data = await response.json();
      this.cacheWeather(data);
      this.displayWeather(data);

    } catch (error) {
      console.error('Error fetching weather:', error);
      this.displayMockWeather(location);

      notify({
        type: 'error',
        title: 'Weather Error',
        message: 'Failed to fetch weather data. Showing mock data.'
      });
    }
  }

  displayWeather(data) {
    const locationEl = document.getElementById('weatherLocation');
    const tempEl = document.getElementById('weatherTemp');
    const descEl = document.getElementById('weatherDescription');
    const forecastEl = document.getElementById('weatherForecast');
    const iconEl = document.getElementById('weatherIcon');

    if (locationEl) locationEl.textContent = data.name;
    if (tempEl) tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    if (descEl) descEl.textContent = data.weather[0].description;
    if (forecastEl) forecastEl.textContent = `H: ${Math.round(data.main.temp_max)}° L: ${Math.round(data.main.temp_min)}°`;
    if (iconEl) iconEl.className = `fas fa-${this.getWeatherIcon(data.weather[0].main)}`;

    this.hideLoading();
  }

  displayMockWeather(location) {
    const mockData = {
      name: location,
      main: {
        temp: 22,
        temp_min: 18,
        temp_max: 26
      },
      weather: [{ description: 'Partly cloudy', main: 'Clouds' }]
    };

    this.displayWeather(mockData);

    notify({
      type: 'info',
      title: 'Mock Weather Data',
      message: 'Using mock data. Add OpenWeather API key for live data.'
    });
  }

  getWeatherIcon(condition) {
    const icons = {
      Clear: 'sun',
      Clouds: 'cloud',
      Rain: 'cloud-rain',
      Drizzle: 'cloud-drizzle',
      Thunderstorm: 'bolt',
      Snow: 'snowflake',
      Mist: 'smog',
      Fog: 'smog'
    };
    return icons[condition] || 'sun';
  }

  showLoading() {
    const widget = document.getElementById('weatherCard');
    if (widget) widget.classList.add('weather-loading');
  }

  hideLoading() {
    const widget = document.getElementById('weatherCard');
    if (widget) widget.classList.remove('weather-loading');
  }

  getCachedWeather() {
    const cached = localStorage.getItem(this.cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  cacheWeather(data) {
    const cache = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }
}

// ===============================
// MINI ANALYTICS
// ===============================

class MiniAnalytics {
  constructor() {
    this.storageKey = 'analyticsData';
    this.chart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadData();
    this.renderChart();
  }

  setupEventListeners() {
    const addDataBtn = document.getElementById('addSampleData');
    if (addDataBtn) {
      addDataBtn.addEventListener('click', () => this.addSampleData());
    }
  }

  loadData() {
    let data = JSON.parse(localStorage.getItem(this.storageKey));

    if (!data) {
      // Initialize with sample data
      data = {
        anime: [3, 5, 2, 4, 6, 3, 4],
        manga: [2, 3, 1, 2, 4, 2, 3],
        projects: [1, 2, 1, 3, 2, 1, 2]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    this.updateStats(data);
    return data;
  }

  updateStats(data) {
    const animeCount = data.anime.reduce((a, b) => a + b, 0);
    const mangaCount = data.manga.reduce((a, b) => a + b, 0);

    const animeEl = document.getElementById('animeCount');
    const mangaEl = document.getElementById('mangaCount');

    if (animeEl) animeEl.textContent = animeCount;
    if (mangaEl) mangaEl.textContent = mangaCount;
  }

  renderChart() {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    const data = this.loadData();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Anime',
            data: data.anime,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Manga',
            data: data.manga,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'var(--text)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'var(--text)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'var(--text)'
            }
          }
        }
      }
    });
  }

  addSampleData() {
    const data = this.loadData();

    // Add random data points
    data.anime = data.anime.map(() => Math.floor(Math.random() * 7) + 1);
    data.manga = data.manga.map(() => Math.floor(Math.random() * 5) + 1);

    localStorage.setItem(this.storageKey, JSON.stringify(data));
    this.updateStats(data);
    this.renderChart();

    notify({
      type: 'success',
      title: 'Data Updated',
      message: 'Added new sample data to analytics.'
    });
  }

  updateAnalytics(newData) {
    localStorage.setItem(this.storageKey, JSON.stringify(newData));
    this.updateStats(newData);
    this.renderChart();
  }
}

// ===============================
// ANIME DASHBOARD API FETCHER
// (Trending + Upcoming from AniList)
// ===============================

// --- Fetch Trending Anime ---
async function loadTrendingAnime() {
  const container = document.getElementById("trendingAnimeContainer");
  container.innerHTML = `
    <div class="text-center py-2">
      <i class="fas fa-spinner fa-spin text-lg mb-1"></i>
      <p class="text-sm">Loading trending anime...</p>
    </div>
  `;

  try {
    const query = `
      query {
        Page(page: 1, perPage: 10) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              english
              romaji
            }
            coverImage {
              medium
            }
            averageScore
          }
        }
      }
    `;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to fetch trending anime");

    const data = await response.json();
    const animeList = data.data.Page.media;

    container.innerHTML = animeList
      .map(
        (anime, index) => `
        <div class="trending-anime-item flex items-center gap-3 bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition">
          <div class="text-gray-400 font-bold w-5">${index + 1}</div>
          <img src="${anime.coverImage.medium}" alt="${anime.title.english || anime.title.romaji}" class="w-10 h-14 rounded object-cover" />
          <div class="flex-1">
            <div class="text-sm font-semibold text-white">
              ${anime.title.english || anime.title.romaji}
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading trending anime:", error);
    container.innerHTML = `
      <div class="text-center py-2 text-red-400">
        <i class="fas fa-exclamation-triangle mb-1"></i>
        <p class="text-sm">Failed to load trending anime.</p>
      </div>
    `;
  }
}

// --- Fetch Upcoming Anime ---
async function loadUpcomingAnime() {
  const container = document.getElementById("Upcominganimecontainer");
  container.innerHTML = `
    <div class="text-center py-4">
      <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
      <p>Loading upcoming anime...</p>
    </div>
  `;

  try {
    const query = `
      query {
        Page(page: 1, perPage: 10) {
          media(type: ANIME, sort: POPULARITY_DESC, status_in: [NOT_YET_RELEASED]) {
            id
            title {
              english
              romaji
            }
            coverImage {
              medium
            }
            season
            seasonYear
          }
        }
      }
    `;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to fetch upcoming anime");

    const data = await response.json();
    const animeList = data.data.Page.media;

    container.innerHTML = animeList
      .map(
        (anime) => `
        <div class="anime-update-item flex items-center gap-3 bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition">
          <img src="${anime.coverImage.medium}" alt="${anime.title.english || anime.title.romaji}" class="w-10 h-14 rounded object-cover" />
          <div>
            <div class="text-sm font-semibold text-white">${anime.title.english || anime.title.romaji}</div>
            <div class="text-xs text-gray-400">${anime.season || "TBA"} ${anime.seasonYear || ""}</div>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading upcoming anime:", error);
    container.innerHTML = `
      <div class="text-center py-4 text-red-400">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p>Failed to load upcoming anime.</p>
      </div>
    `;
  }
}

// --- Initialize on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
  loadTrendingAnime();
  loadUpcomingAnime();
});


// --- Initialize on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
  loadTrendingAnime();
  loadUpcomingAnime();
});

// --- Optional: Manual Refresh Buttons (if you have them) ---
document.getElementById("refreshAnime")?.addEventListener("click", loadUpcomingAnime);
document.getElementById("refreshTrendingAnime")?.addEventListener("click", loadTrendingAnime);

// ===============================
// CALENDAR WIDGET
// ===============================

class CalendarWidget {
  constructor() {
    this.storageKey = 'calendarEvents';
    this.currentDate = new Date();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderCalendar();
    this.renderEvents();
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const addBtn = document.getElementById('addEventBtn');
    const modal = document.getElementById('calendarEventModal');
    const closeBtn = document.getElementById('closeCalendarEventModal');
    const cancelBtn = document.getElementById('cancelCalendarEvent');
    const deleteBtn = document.getElementById('deleteCalendarEvent');
    const form = document.getElementById('calendarEventForm');

    if (prevBtn) prevBtn.addEventListener('click', () => this.previousMonth());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());
    if (addBtn) addBtn.addEventListener('click', () => this.showEventModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideEventModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideEventModal());
    if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteEvent());
    if (form) form.addEventListener('submit', (e) => this.saveEvent(e));

    if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideEventModal();
    });
  }

  renderCalendar() {
    const monthEl = document.getElementById('calendarMonth');
    const gridEl = document.getElementById('calendarGrid');

    if (!monthEl || !gridEl) return;

    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    monthEl.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

    // Clear grid
    gridEl.innerHTML = '';

    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day empty font-semibold';
      dayEl.textContent = day;
      gridEl.appendChild(dayEl);
    });

    // Get first day of month and days in month
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'calendar-day empty';
      gridEl.appendChild(emptyEl);
    }

    // Add days of the month
    const today = new Date();
    const events = this.getEvents();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = day;
      dayEl.dataset.date = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Check if today
      if (this.currentDate.getMonth() === today.getMonth() &&
        this.currentDate.getFullYear() === today.getFullYear() &&
        day === today.getDate()) {
        dayEl.classList.add('today');
      }

      // Check if has events
      const dayEvents = events.filter(event => event.date === dayEl.dataset.date);
      if (dayEvents.length > 0) {
        dayEl.classList.add('has-event');
      }

      dayEl.addEventListener('click', () => this.showDayEvents(dayEl.dataset.date));
      gridEl.appendChild(dayEl);
    }
  }

  renderEvents() {
    const today = new Date().toISOString().split('T')[0];
    const events = this.getEvents().filter(event => event.date === today);
    const container = document.getElementById('todayEvents');

    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = '<div class="text-gray-500 text-sm">No events for today</div>';
      return;
    }

    container.innerHTML = events.map(event => `
                    <div class="calendar-event">
                        <div class="calendar-event-title">${event.title}</div>
                        ${event.time ? `<div class="calendar-event-time">${event.time}</div>` : ''}
                    </div>
                `).join('');
  }

  showDayEvents(date) {
    const events = this.getEvents().filter(event => event.date === date);
    if (events.length > 0) {
      const eventList = events.map(event =>
        `${event.time ? event.time + ' - ' : ''}${event.title}`
      ).join('\n');

      notify({
        type: 'info',
        title: `Events on ${new Date(date).toLocaleDateString()}`,
        message: eventList
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }

  showEventModal(event = null) {
    const modal = document.getElementById('calendarEventModal');
    const titleEl = document.getElementById('calendarEventModalTitle');
    const submitBtn = document.getElementById('calendarEventSubmit');
    const deleteBtn = document.getElementById('deleteCalendarEvent');
    const form = document.getElementById('calendarEventForm');

    if (!modal) return;

    // Reset form
    form.reset();
    document.getElementById('calendarEventId').value = '';

    if (event) {
      // Edit existing event
      titleEl.textContent = 'Edit Event';
      submitBtn.textContent = 'Update Event';
      deleteBtn.classList.remove('hidden');

      document.getElementById('calendarEventId').value = event.id;
      document.getElementById('calendarEventTitle').value = event.title;
      document.getElementById('calendarEventDate').value = event.date;
      document.getElementById('calendarEventTime').value = event.time || '';
      document.getElementById('calendarEventCategory').value = event.category || 'personal';
    } else {
      // Add new event
      titleEl.textContent = 'Add Event';
      submitBtn.textContent = 'Add Event';
      deleteBtn.classList.add('hidden');
      document.getElementById('calendarEventDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
  }

  hideEventModal() {
    const modal = document.getElementById('calendarEventModal');
    if (modal) modal.classList.add('hidden');
  }

  saveEvent(e) {
    e.preventDefault();

    const id = document.getElementById('calendarEventId').value || Date.now().toString();
    const title = document.getElementById('calendarEventTitle').value;
    const date = document.getElementById('calendarEventDate').value;
    const time = document.getElementById('calendarEventTime').value;
    const category = document.getElementById('calendarEventCategory').value;

    if (!title || !date) return;

    const events = this.getEvents();
    const existingIndex = events.findIndex(event => event.id === id);
    const event = { id, title, date, time, category };

    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(events));
    this.renderCalendar();
    this.renderEvents();
    this.hideEventModal();

    notify({
      type: 'success',
      title: existingIndex >= 0 ? 'Event Updated' : 'Event Added',
      message: `"${title}" has been ${existingIndex >= 0 ? 'updated' : 'added'} to your calendar.`
    });
  }

  deleteEvent() {
    const id = document.getElementById('calendarEventId').value;
    const title = document.getElementById('calendarEventTitle').value;

    if (!id) return;

    const events = this.getEvents().filter(event => event.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    this.renderCalendar();
    this.renderEvents();
    this.hideEventModal();

    notify({
      type: 'success',
      title: 'Event Deleted',
      message: `"${title}" has been removed from your calendar.`
    });
  }

  getEvents() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  getUpcomingEvents(limit = 5) {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents()
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }
}

// ===============================
// QUOTE WIDGET
// ===============================

class QuoteWidget {
  constructor() {
    this.storageKey = 'bookmarkedQuotes';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadQuote();
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshQuote');
    const bookmarkBtn = document.getElementById('bookmarkQuote');

    if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadQuote());
    if (bookmarkBtn) bookmarkBtn.addEventListener('click', () => this.bookmarkQuote());
  }

  async loadQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random');
      const data = await response.json();

      this.displayQuote(data.content, data.author);
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Fallback to local quotes
      const randomQuote = SAMPLE_QUOTES[Math.floor(Math.random() * SAMPLE_QUOTES.length)];
      this.displayQuote(randomQuote.text, randomQuote.author);

      notify({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Using cached quotes. Check your connection for fresh quotes.'
      });
    }
  }

  displayQuote(text, author) {
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');

    if (textEl) textEl.textContent = text;
    if (authorEl) authorEl.textContent = `- ${author}`;

    this.currentQuote = { text, author };
  }

  bookmarkQuote() {
    if (!this.currentQuote) return;

    const bookmarks = this.getBookmarks();
    const alreadyBookmarked = bookmarks.some(
      quote => quote.text === this.currentQuote.text && quote.author === this.currentQuote.author
    );

    if (alreadyBookmarked) {
      notify({
        type: 'info',
        title: 'Already Bookmarked',
        message: 'This quote is already in your bookmarks.'
      });
      return;
    }

    bookmarks.push(this.currentQuote);
    localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));

    notify({
      type: 'success',
      title: 'Quote Bookmarked',
      message: 'Quote added to your bookmarks.'
    });
  }

  getBookmarks() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }
}

// ===============================
// SOCIAL WIDGET
// ===============================

class SocialWidget {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadYouTubeStats();
    this.loadGitHubStats();
  }

  setupEventListeners() {
    // Social connection buttons can be added here
  }

  async loadYouTubeStats() {
    const CHANNEL_ID = "UCDwG7iHjjI0W92w9Ipl6r1w";

    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();

      if (!data.items || !data.items.length) throw new Error("Channel not found");

      const { statistics } = data.items[0];

      // Format numbers
      const formatNumber = (n) => Intl.NumberFormat('en-US', { notation: "compact" }).format(n);

      // Update UI
      document.getElementById("yt-subs").textContent = formatNumber(statistics.subscriberCount);
      document.getElementById("yt-views").textContent = formatNumber(statistics.viewCount);
      document.getElementById("yt-videos").textContent = statistics.videoCount;
    } catch (err) {
      console.error("Error fetching YouTube stats:", err);
      // Show mock data
      document.getElementById("yt-subs").textContent = "1.2K";
      document.getElementById("yt-views").textContent = "45.6K";
      document.getElementById("yt-videos").textContent = "24";
    }
  }

  async loadGitHubStats() {
    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      const data = await response.json();

      document.getElementById("gh-repos").textContent = data.public_repos;
      document.getElementById("gh-followers").textContent = data.followers;

      // Get stars count (this requires additional API calls)
      const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
      const repos = await reposResponse.json();
      const stars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);
      document.getElementById("gh-stars").textContent = stars;

    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      // Show mock data
      document.getElementById("gh-repos").textContent = "12";
      document.getElementById("gh-followers").textContent = "45";
      document.getElementById("gh-stars").textContent = "89";

      notify({
        type: 'warning',
        title: 'GitHub Stats',
        message: 'Using mock data. Check rate limits or connection.'
      });
    }
  }
}

// ===============================
// MUSIC WIDGET
// ===============================

class MusicWidget {
  constructor() {
    this.storageKey = 'musicSource';
    this.isPlaying = false;
    this.currentTrack = 0;
    this.tracks = [
      { title: 'Sample Track 1', artist: 'Unknown Artist', src: '' },
      { title: 'Sample Track 2', artist: 'Unknown Artist', src: '' },
      { title: 'Sample Track 3', artist: 'Unknown Artist', src: '' }
    ];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadPreferences();
  }

  setupEventListeners() {
    const playBtn = document.getElementById('musicPlay');
    const prevBtn = document.getElementById('musicPrev');
    const nextBtn = document.getElementById('musicNext');
    const sourceSelect = document.getElementById('musicSource');

    if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
    if (prevBtn) prevBtn.addEventListener('click', () => this.previousTrack());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
    if (sourceSelect) sourceSelect.addEventListener('change', (e) => this.changeSource(e.target.value));
  }

  loadPreferences() {
    const source = localStorage.getItem(this.storageKey) || 'spotify';
    this.changeSource(source);

    const select = document.getElementById('musicSource');
    if (select) select.value = source;
  }

  changeSource(source) {
    localStorage.setItem(this.storageKey, source);

    const spotifyEmbed = document.getElementById('spotifyEmbed');
    const localPlayer = document.getElementById('localPlayer');

    if (source === 'spotify') {
      if (spotifyEmbed) spotifyEmbed.classList.remove('hidden');
      if (localPlayer) localPlayer.classList.add('hidden');
    } else {
      if (spotifyEmbed) spotifyEmbed.classList.add('hidden');
      if (localPlayer) localPlayer.classList.remove('hidden');
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById('musicPlay');

    if (playBtn) {
      playBtn.innerHTML = this.isPlaying ?
        '<i class="fas fa-pause"></i>' :
        '<i class="fas fa-play"></i>';
    }

    // Update track info
    this.updateTrackInfo();
  }

  previousTrack() {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.updateTrackInfo();
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.updateTrackInfo();
  }

  updateTrackInfo() {
    const track = this.tracks[this.currentTrack];
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
  }
}

// ===============================
// QUICK TOOLS
// ===============================

class QuickTools {
  constructor() {
    this.notesKey = 'quickNotes';
    this.filesKey = 'uploadedFiles';
    this.pomodoroInterval = null;
    this.pomodoroTime = 25 * 60;
    this.isPomodoroRunning = false;
    this.isWorkTime = true;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadNotes();
    this.loadFiles();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tool-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tool);
      });
    });

    // Notes
    const notesArea = document.getElementById('quickNotes');
    const exportBtn = document.getElementById('exportNotes');
    const importBtn = document.getElementById('importNotes');

    if (notesArea) notesArea.addEventListener('input', () => this.saveNotes());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportNotes());
    if (importBtn) importBtn.addEventListener('click', () => this.importNotes());

    // Pomodoro
    const startBtn = document.getElementById('pomodoroStart');
    const pauseBtn = document.getElementById('pomodoroPause');
    const resetBtn = document.getElementById('pomodoroReset');
    const workInput = document.getElementById('pomodoroWork');
    const breakInput = document.getElementById('pomodoroBreak');

    if (startBtn) startBtn.addEventListener('click', () => this.startPomodoro());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pausePomodoro());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetPomodoro());
    if (workInput) workInput.addEventListener('change', () => this.updatePomodoroSettings());
    if (breakInput) breakInput.addEventListener('change', () => this.updatePomodoroSettings());

    // Files
    const uploadBtn = document.getElementById('uploadFileBtn');
    if (uploadBtn) uploadBtn.addEventListener('click', () => this.uploadFile());
  }

  switchTab(tool) {
    // Update active tab
    document.querySelectorAll('.tool-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tool === tool);
    });

    // Show active content
    document.querySelectorAll('.tool-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tool}Tool`);
    });
  }

  // Notes functionality
  loadNotes() {
    const notes = localStorage.getItem(this.notesKey);
    const notesArea = document.getElementById('quickNotes');
    if (notesArea && notes) {
      notesArea.value = notes;
    }
  }

  saveNotes() {
    const notesArea = document.getElementById('quickNotes');
    if (notesArea) {
      localStorage.setItem(this.notesKey, notesArea.value);
    }
  }

  exportNotes() {
    const notesArea = document.getElementById('quickNotes');
    if (!notesArea) return;

    const blob = new Blob([notesArea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.txt';
    a.click();
    URL.revokeObjectURL(url);

    notify({
      type: 'success',
      title: 'Notes Exported',
      message: 'Your notes have been downloaded.'
    });
  }

  importNotes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const notesArea = document.getElementById('quickNotes');
        if (notesArea) {
          notesArea.value = e.target.result;
          this.saveNotes();

          notify({
            type: 'success',
            title: 'Notes Imported',
            message: 'Your notes have been imported successfully.'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // Pomodoro functionality
  startPomodoro() {
    if (this.isPomodoroRunning) return;

    this.isPomodoroRunning = true;
    this.pomodoroInterval = setInterval(() => {
      this.pomodoroTime--;
      this.updatePomodoroDisplay();

      if (this.pomodoroTime <= 0) {
        this.pomodoroComplete();
      }
    }, 1000);
  }

  pausePomodoro() {
    this.isPomodoroRunning = false;
    if (this.pomodoroInterval) {
      clearInterval(this.pomodoroInterval);
    }
  }

  resetPomodoro() {
    this.pausePomodoro();
    this.isWorkTime = true;
    const workInput = document.getElementById('pomodoroWork');
    this.pomodoroTime = (workInput ? parseInt(workInput.value) : 25) * 60;
    this.updatePomodoroDisplay();
  }

  pomodoroComplete() {
    this.pausePomodoro();

    const message = this.isWorkTime ?
      'Work session complete! Time for a break.' :
      'Break complete! Ready for another work session.';

    notify({
      type: 'success',
      title: 'Pomodoro Complete',
      message: message,
      sticky: true
    });

    // Switch between work and break
    this.isWorkTime = !this.isWorkTime;
    const input = document.getElementById(this.isWorkTime ? 'pomodoroWork' : 'pomodoroBreak');
    this.pomodoroTime = (input ? parseInt(input.value) : (this.isWorkTime ? 25 : 5)) * 60;
    this.updatePomodoroDisplay();

    // Auto-start next session
    this.startPomodoro();
  }

  updatePomodoroDisplay() {
    const timerEl = document.getElementById('pomodoroTimer');
    if (timerEl) {
      const minutes = Math.floor(this.pomodoroTime / 60);
      const seconds = this.pomodoroTime % 60;
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  updatePomodoroSettings() {
    if (!this.isPomodoroRunning) {
      this.resetPomodoro();
    }
  }

  // File functionality
  uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput || !fileInput.files[0]) {
      notify({
        type: 'error',
        title: 'No File Selected',
        message: 'Please select a file to upload.'
      });
      return;
    }

    const file = fileInput.files[0];
    this.showFilePreview(file);
    this.saveFileMetadata(file);

    notify({
      type: 'success',
      title: 'File Uploaded',
      message: `"${file.name}" has been uploaded.`
    });

    // Reset file input
    fileInput.value = '';
  }

  showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const nameEl = document.getElementById('fileName');
    const sizeEl = document.getElementById('fileSize');

    if (preview && nameEl && sizeEl) {
      nameEl.textContent = file.name;
      sizeEl.textContent = this.formatFileSize(file.size);
      preview.style.display = 'block';
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveFileMetadata(file) {
    const files = JSON.parse(localStorage.getItem(this.filesKey) || '[]');
    files.push({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadDate: new Date().toISOString()
    });

    localStorage.setItem(this.filesKey, JSON.stringify(files));
    this.updateStorageUsage();
  }

  loadFiles() {
    this.updateStorageUsage();
  }

  updateStorageUsage() {
    const files = JSON.parse(localStorage.getItem(this.filesKey) || '[]');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
    const progress = Math.min((usedMB / 100) * 100, 100); // 100MB max storage

    const usedEl = document.getElementById('storageUsed');
    const progressEl = document.getElementById('storageProgress');

    if (usedEl) usedEl.textContent = `${usedMB} MB / 100 MB`;
    if (progressEl) progressEl.style.width = `${progress}%`;
  }
}

// ===============================
// EXISTING FUNCTIONALITY
// ===============================

// Time & Date Widget
function updateTimeAndDate() {
  const timeEl = document.getElementById("currentTime");
  const dateEl = document.getElementById("currentDate");
  if (!timeEl || !dateEl) return;

  const now = new Date();

  // Format time in 12-hour format with AM/PM
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 to 12 for midnight
  const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;

  // Format date as: Wednesday, Oct 23, 2025
  const options = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
  const formattedDate = now.toLocaleDateString(undefined, options);

  timeEl.textContent = formattedTime;
  dateEl.textContent = formattedDate;
}

// YouTube Stats
async function updateYouTubeStats() {
  const CHANNEL_ID = "UCDwG7iHjjI0W92w9Ipl6r1w";

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();

    if (!data.items || !data.items.length) throw new Error("Channel not found");

    const { statistics, snippet } = data.items[0];

    // Format numbers (e.g., 1.2K)
    const formatNumber = (n) => Intl.NumberFormat('en-US', { notation: "compact" }).format(n);

    // Format joined date
    const joinDate = new Date(snippet.publishedAt);
    const formattedJoinDate = joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Update UI
    document.getElementById("yt-channel-name").textContent = snippet.title;
    document.getElementById("yt-joined").textContent = `Joined: ${formattedJoinDate}`;
    document.getElementById("yt-subs").textContent = formatNumber(statistics.subscriberCount);
    document.getElementById("yt-views").textContent = formatNumber(statistics.viewCount);
    document.getElementById("yt-videos").textContent = statistics.videoCount;
  } catch (err) {
    console.error("Error fetching YouTube stats:", err);
  }
}

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all widgets
  window.notificationSystem = new NotificationSystem();
  new ProfileWidget();
  new ThemeSwitcher();
  new WeatherWidget();
  new MiniAnalytics();
  new CalendarWidget();
  new QuoteWidget();
  new SocialWidget();
  new MusicWidget();
  new QuickTools();

  // Initialize existing functionality
  setInterval(updateTimeAndDate, 1000);
  updateTimeAndDate();
  updateYouTubeStats();
  setInterval(updateYouTubeStats, 60000);

  // Demo notifications
  setTimeout(() => {
    notify({
      type: 'success',
      title: 'Dashboard Ready',
      message: 'All widgets have been initialized successfully.'
    });
  }, 1000);

  // Add sample events for demo
  setTimeout(() => {
    const calendar = new CalendarWidget();
    const events = calendar.getEvents();
    if (events.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const sampleEvent = {
        id: 'demo-event',
        title: 'Welcome to Your Dashboard',
        date: today,
        time: '12:00',
        category: 'personal'
      };
      events.push(sampleEvent);
      localStorage.setItem('calendarEvents', JSON.stringify(events));
      calendar.renderCalendar();
      calendar.renderEvents();
    }
  }, 2000);
});

// ===============================
// One Piece Countdown Widget
// ===============================
(function () {
  const episodeDisplay = document.getElementById("onePieceEpisode");
  const timerDisplay = document.getElementById("onePieceTimer");
  const statusDisplay = document.getElementById("onePieceStatus");

  // Load saved episode number or default to 1147
  let currentEpisode = parseInt(localStorage.getItem("onePieceEpisodeNum")) || 1147;

  function getNextSunday23() {
    const now = new Date();
    const next = new Date();

    // Set to next Sunday 23:00 (11 PM)
    next.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
    next.setHours(23, 0, 0, 0);

    // If it's already past Sunday 11PM this week, jump to next week
    if (next <= now) next.setDate(next.getDate() + 7);
    return next;
  }

  let nextAirTime = getNextSunday23();

  function updateCountdown() {
    const now = new Date();
    const diff = nextAirTime - now;

    if (diff <= 0) {
      // Episode Released
      timerDisplay.textContent = "Episode Released!";
      statusDisplay.textContent = "Available Now 🎬";

      // Increment next episode once per week
      setTimeout(() => {
        currentEpisode++;
        localStorage.setItem("onePieceEpisodeNum", currentEpisode);
        nextAirTime = getNextSunday23();
        episodeDisplay.textContent = `Episode ${currentEpisode}`;
      }, 10 * 60 * 1000); // after 10 minutes

      return;
    }

    // Calculate remaining time
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Display
    timerDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    episodeDisplay.textContent = `Episode ${currentEpisode}`;
  }

  // Update every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

// ==============================
// Anime Progress Chart (2025)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("animeProgressChart");
  if (!ctx) return;

  const totalAnimeText = document.getElementById("totalAnime2025");
  const totalStats = document.getElementById("totalStats");
  const uploadInput = document.getElementById("animeJsonUpload");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let animeData = JSON.parse(localStorage.getItem("myAnimeListData")) || null;

  // ✅ Initialize Chart.js chart
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Anime Completed",
          data: [],
          yAxisID: "yAnime",
          backgroundColor: "rgba(147, 51, 234, 0.3)",
          borderColor: "rgba(147, 51, 234, 1)",
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: "rgba(168, 85, 247, 0.6)",
          order: 2,
        },
        {
          label: "Hours Watched",
          data: [],
          yAxisID: "yHours",
          type: "line",
          borderColor: "rgba(255, 165, 0, 0.9)",
          borderWidth: 2,
          backgroundColor: "rgba(209, 219, 21, 0.696)",
          pointBackgroundColor: "rgba(255,165,0,1)",
          pointRadius: 5,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#aaa" }
        },
        yAnime: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#aaa" },
          title: { display: true, text: "Anime Completed", color: "#ccc", font: { size: 12 } }
        },
        yHours: {
          type: "linear",
          position: "right",
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { color: "#aaa" },
          title: { display: true, text: "Hours Watched", color: "#ccc", font: { size: 12 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#ccc", boxWidth: 12, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: "rgba(30,30,40,0.9)",
          borderColor: "rgba(255,255,255,0.2)",
          borderWidth: 1,
          titleColor: "#fff",
          bodyColor: "#ddd",
          padding: 10,
          callbacks: {
            label: function (ctx) {
              if (ctx.dataset.label === "Anime Completed") {
                return ` ${ctx.dataset.label}: ${ctx.formattedValue} anime`;
              } else {
                return ` ${ctx.dataset.label}: ${ctx.formattedValue} hours`;
              }
            }
          }
        }
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      }
    }
  });

  // ✅ Helper: format number to "k" style
  function formatK(num) {
    if (num < 1000) return num.toString();
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }

  // ✅ Parse uploaded JSON data
  function parseAnimeData(data) {
    const monthlyAnime = Array(12).fill(0);
    const monthlyHours = Array(12).fill(0);

    let totalAnime = 0;
    let totalEpisodes = 0;
    let totalMinutes = 0;

    data.forEach(anime => {
      if (!anime.finishDate) return;
      const date = new Date(anime.finishDate);
      if (isNaN(date) || date.getFullYear() !== 2025) return;

      const month = date.getMonth();
      monthlyAnime[month]++;

      const eps = parseInt(anime.episodes || 0);
      const duration = parseInt(anime.duration || 0);
      const minutes = eps * duration;

      totalAnime++;
      totalEpisodes += eps;
      totalMinutes += minutes;
      monthlyHours[month] += minutes / 60;
    });

    chart.data.datasets[0].data = monthlyAnime;
    chart.data.datasets[1].data = monthlyHours;
    chart.update();

    const totalHours = Math.round(totalMinutes / 60);

    // ✅ Compact “k” format + hover for real numbers
    const formattedHours = formatK(totalHours);
    const formattedEps = formatK(totalEpisodes);
    totalAnimeText.textContent = `Total Anime in 2025: ${totalAnime}`;
    totalStats.innerHTML = `
      Episodes: <span title="${totalEpisodes.toLocaleString()}">${formattedEps}</span> | 
      Hours: <span title="${totalHours.toLocaleString()}">${formattedHours}</span>
    `;
  }

  // ✅ Handle JSON upload
  uploadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        localStorage.setItem("myAnimeListData", JSON.stringify(data));
        animeData = data;
        parseAnimeData(data);
      } catch (err) {
        alert("Invalid JSON file. Please upload a valid anime data backup.");
      }
    };
    reader.readAsText(file);
  });

  // ✅ Load saved data automatically
  if (animeData) parseAnimeData(animeData);
});

