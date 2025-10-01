// Shared Recent Activity System
class ActivityManager {
    constructor() {
        this.activities = this.loadActivities();
        this.maxActivities = 10;
    }

    loadActivities() {
        const saved = localStorage.getItem('sharedActivities');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return [
            {
                id: 1,
                type: 'anime',
                icon: 'fas fa-tv',
                iconColor: 'blue',
                content: 'Watched episode 12 of <span class="font-medium">Attack on Titan</span>',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                editable: true
            },
            {
                id: 2,
                type: 'project',
                icon: 'fas fa-check',
                iconColor: 'green',
                content: 'Completed project <span class="font-medium">Portfolio Redesign</span>',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                editable: true
            },
            {
                id: 3,
                type: 'manga',
                icon: 'fas fa-book',
                iconColor: 'purple',
                content: 'Read chapter 45 of <span class="font-medium">One Piece</span>',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                editable: true
            },
            {
                id: 4,
                type: 'upload',
                icon: 'fas fa-upload',
                iconColor: 'yellow',
                content: 'Uploaded new video <span class="font-medium">Tutorial</span>',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                editable: true
            }
        ];
    }

    saveActivities() {
        localStorage.setItem('sharedActivities', JSON.stringify(this.activities));
    }

    addActivity(activity) {
        activity.id = Date.now();
        activity.timestamp = new Date().toISOString();
        
        this.activities.unshift(activity);
        
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }
        
        this.saveActivities();
        this.updateHomeActivityDisplay();
        
        return activity.id;
    }

    updateActivity(id, newContent) {
        const activity = this.activities.find(a => a.id === id);
        if (activity && activity.editable) {
            activity.content = newContent;
            this.saveActivities();
            this.updateHomeActivityDisplay();
        }
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(a => a.id !== id);
        this.saveActivities();
        this.updateHomeActivityDisplay();
    }

    getRecentActivities(limit = 5) {
        return this.activities.slice(0, limit);
    }

    getAllActivities() {
        return this.activities;
    }

    updateHomeActivityDisplay() {
        const container = document.getElementById('homeRecentActivity');
        if (container) {
            this.renderActivities(container, 4);
        }
    }

    renderActivities(container, limit) {
        if (!container) return;

        const activitiesToShow = this.activities.slice(0, limit);
        
        if (activitiesToShow.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-inbox text-2xl mb-2"></i>
                    <p>No recent activities</p>
                    <button class="btn btn-outline mt-2 text-xs" onclick="document.getElementById('addActivityHome').click()">
                        <i class="fas fa-plus"></i> Add Your First Activity
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = activitiesToShow.map(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            return `
                <div class="flex items-start space-x-3 activity-item" data-activity-id="${activity.id}">
                    <div class="w-8 h-8 rounded-full bg-${activity.iconColor}-100 dark:bg-${activity.iconColor}-900 flex items-center justify-center text-${activity.iconColor}-600 dark:text-${activity.iconColor}-400 mt-1 flex-shrink-0">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-700 dark:text-gray-300 activity-content">${activity.content}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 activity-time">${timeAgo}</p>
                    </div>
                    ${activity.editable ? `
                        <div class="activity-actions opacity-0 transition-opacity flex space-x-1">
                            <button class="edit-activity text-gray-400 hover:text-blue-500 p-1 rounded transition-colors" title="Edit">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button class="delete-activity text-gray-400 hover:text-red-500 p-1 rounded transition-colors" title="Delete">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        this.attachActivityEventListeners(container);
    }

    attachActivityEventListeners(container) {
        container.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const actions = item.querySelector('.activity-actions');
                if (actions) {
                    actions.classList.remove('opacity-0');
                    actions.classList.add('opacity-100');
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const actions = item.querySelector('.activity-actions');
                if (actions) {
                    actions.classList.add('opacity-0');
                    actions.classList.remove('opacity-100');
                }
            });
        });

        container.querySelectorAll('.edit-activity').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const activityItem = e.target.closest('.activity-item');
                const activityId = parseInt(activityItem.dataset.activityId);
                const contentElement = activityItem.querySelector('.activity-content');
                
                const currentContent = contentElement.innerHTML;
                const newContent = prompt('Edit activity:', this.stripHtml(currentContent));
                
                if (newContent !== null && newContent.trim() !== '') {
                    const formattedContent = this.formatActivityContent(newContent);
                    this.updateActivity(activityId, formattedContent);
                }
            });
        });

        container.querySelectorAll('.delete-activity').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const activityItem = e.target.closest('.activity-item');
                const activityId = parseInt(activityItem.dataset.activityId);
                
                if (confirm('Are you sure you want to delete this activity?')) {
                    this.deleteActivity(activityId);
                }
            });
        });
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    formatActivityContent(text) {
        return text
            .replace(/\b(episode \d+ of)\s+(.*?)(?=\s|$)/gi, '$1 <span class="font-medium">$2</span>')
            .replace(/\b(chapter \d+ of)\s+(.*?)(?=\s|$)/gi, '$1 <span class="font-medium">$2</span>')
            .replace(/\b(project)\s+(.*?)(?=\s|$)/gi, '$1 <span class="font-medium">$2</span>')
            .replace(/\b(video)\s+(.*?)(?=\s|$)/gi, '$1 <span class="font-medium">$2</span>')
            .replace(/\b(tutorial)\s+(.*?)(?=\s|$)/gi, '$1 <span class="font-medium">$2</span>')
            .replace(/\*(.*?)\*/g, '<span class="font-medium">$1</span>');
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return past.toLocaleDateString();
    }
}

// Shared Stats Overview System
class StatsManager {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        const saved = localStorage.getItem('sharedStats');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return [
            { id: 'projects', value: '23', label: 'Projects', editable: true },
            { id: 'anime-completed', value: '255', label: 'Anime Completed', editable: true },
            { id: 'manga-completed', value: '8', label: 'Manga Completed', editable: true },
            { id: 'badges', value: '15', label: 'Badges', editable: true }
        ];
    }

    saveStats() {
        localStorage.setItem('sharedStats', JSON.stringify(this.stats));
    }

    updateStat(id, newValue) {
        const stat = this.stats.find(s => s.id === id);
        if (stat && stat.editable) {
            stat.value = newValue;
            this.saveStats();
            this.updateHomeStatsDisplay();
        }
    }

    getAllStats() {
        return this.stats;
    }

    updateHomeStatsDisplay() {
        const container = document.getElementById('homeStatsOverview');
        if (container) {
            this.renderStats(container);
        }
    }

    renderStats(container) {
        if (!container) return;

        container.innerHTML = this.stats.map(stat => {
            return `
                <div class="stat-card">
                    <div class="stat-value editable" data-stat-id="${stat.id}" contenteditable="${stat.editable}">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `;
        }).join('');

        this.attachStatsEventListeners(container);
    }

    attachStatsEventListeners(container) {
        container.querySelectorAll('.editable[contenteditable="true"]').forEach(element => {
            element.addEventListener('blur', (e) => {
                const statId = e.target.getAttribute('data-stat-id');
                const newValue = e.target.textContent.trim();
                
                if (newValue && !isNaN(newValue)) {
                    this.updateStat(statId, newValue);
                    showSaveIndicator();
                } else {
                    const stat = this.stats.find(s => s.id === statId);
                    e.target.textContent = stat.value;
                }
            });

            element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });
    }
}

// Global managers
const activityManager = new ActivityManager();
const statsManager = new StatsManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeActivitySystem();
    initializeStatsSystem();
    
    // Load saved content from localStorage
    loadSavedContent();
    
    // Make all elements with class "editable" editable
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
        // Set contenteditable attribute
        element.setAttribute('contenteditable', 'true');
        
        // Add event listener for input changes
        element.addEventListener('input', function() {
            const elementId = this.getAttribute('data-id');
            const content = this.textContent;
            
            // Save to localStorage
            localStorage.setItem(elementId, content);
            
            // Show save indicator
            showSaveIndicator();
        });
        
        // Add focus and blur styling
        element.addEventListener('focus', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            this.style.outline = '2px solid var(--accent)';
        });
        
        element.addEventListener('blur', function() {
            this.style.backgroundColor = '';
            this.style.outline = '';
        });
    });
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize weather - try cached data first, then fetch fresh data
    if (!loadCachedWeatherData()) {
        initializeWeather();
    } else {
        // Still initialize for future refreshes
        initializeWeather();
        // Refresh data in background
        setTimeout(getWeatherData, 1000);
    }

    // Initialize time and date
    updateTimeAndDate();
    setInterval(updateTimeAndDate, 1000);

    // Initialize anime data
    const homeSection = document.getElementById('home');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (homeSection.classList.contains('active')) {
                    // Load anime data with a small delay to improve perceived performance
                    setTimeout(() => {
                        fetchLatestAnimeUpdates();
                        fetchTrendingAnime();
                    }, 300);
                }
            }
        });
    });
    
    observer.observe(homeSection, { attributes: true });
    
    // Also load immediately if home is already active
    if (homeSection.classList.contains('active')) {
        setTimeout(() => {
            fetchLatestAnimeUpdates();
            fetchTrendingAnime();
        }, 500);
    }
    
    // Refresh button functionality
    const refreshAnimeBtn = document.getElementById('refreshAnime');
    if (refreshAnimeBtn) {
        refreshAnimeBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
            this.disabled = true;
            
            Promise.all([fetchLatestAnimeUpdates(), fetchTrendingAnime()]).finally(() => {
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                    this.disabled = false;
                }, 1000);
            });
        });
    }
});

// Initialize Activity System
function initializeActivitySystem() {
    activityManager.updateHomeActivityDisplay();
    
    const modal = document.getElementById('activityModal');
    const openButtons = ['addActivityHome'];
    const closeButton = document.getElementById('closeActivityModal');
    const cancelButton = document.getElementById('cancelActivity');
    const form = document.getElementById('activityForm');
    
    openButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });
        }
    });
    
    [closeButton, cancelButton].forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    });
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const type = document.getElementById('activityType').value;
            let content = document.getElementById('activityContent').value.trim();
            
            if (!content) {
                alert('Please enter activity description');
                return;
            }
            
            content = content.replace(/\*(.*?)\*/g, '<span class="font-medium">$1</span>');
            
            const typeConfig = {
                anime: { icon: 'fas fa-tv', color: 'blue' },
                manga: { icon: 'fas fa-book', color: 'purple' },
                project: { icon: 'fas fa-check', color: 'green' },
                upload: { icon: 'fas fa-upload', color: 'yellow' },
                other: { icon: 'fas fa-star', color: 'gray' }
            };
            
            const config = typeConfig[type] || typeConfig.other;
            
            activityManager.addActivity({
                type: type,
                icon: config.icon,
                iconColor: config.color,
                content: content,
                editable: true
            });
            
            form.reset();
            modal.classList.add('hidden');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// Initialize Stats System
function initializeStatsSystem() {
    statsManager.updateHomeStatsDisplay();
    
    const editButtons = ['editStatsHome'];
    
    editButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const statElements = document.querySelectorAll('.stat-value[contenteditable="true"]');
                statElements.forEach(element => {
                    element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    element.style.outline = '2px solid var(--accent)';
                    element.focus();
                });
            });
        }
    });
}

// Function to load saved content from localStorage
function loadSavedContent() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
        const elementId = element.getAttribute('data-id');
        const savedContent = localStorage.getItem(elementId);
        
        if (savedContent) {
            element.textContent = savedContent;
        }
    });
}

// Function to show save indicator
function showSaveIndicator() {
    const saveIndicator = document.getElementById('saveIndicator');
    saveIndicator.classList.add('show');
    
    setTimeout(() => {
        saveIndicator.classList.remove('show');
    }, 2000);
}

// Function to initialize search
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // Check if it's a URL
                    if (query.includes('.') || query.startsWith('http')) {
                        window.open(query, '_blank');
                    } else {
                        // Perform a search
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                    }
                }
            }
        });
    }
}

// Weather functionality
function initializeWeather() {
    const refreshBtn = document.getElementById('refreshWeather');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', getWeatherData);
    }
    
    // Get weather data on page load
    getWeatherData();
    
    // Refresh weather every 30 minutes
    setInterval(getWeatherData, 30 * 60 * 1000);
}

async function getWeatherData() {
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherDescription = document.getElementById('weatherDescription');
    const weatherIcon = document.getElementById('weatherIcon');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const visibility = document.getElementById('visibility');
    const refreshBtn = document.getElementById('refreshWeather');
    
    // Show loading state
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshBtn.disabled = true;
    }
    
    weatherLocation.textContent = 'Detecting location...';
    weatherTemp.textContent = '--°C';
    weatherDescription.textContent = 'Loading...';
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get weather data from OpenWeatherMap API
        const weatherData = await fetchWeatherData(latitude, longitude);
        
        // Update UI with weather data
        updateWeatherUI(weatherData);
        
    } catch (error) {
        console.error('Error getting weather data:', error);
        weatherLocation.textContent = 'Unable to get location';
        weatherDescription.textContent = 'Please allow location access';
        weatherTemp.textContent = '--°C';
        
        // Try to use IP-based location as fallback
        try {
            await getWeatherByIP();
        } catch (ipError) {
            console.error('IP-based weather also failed:', ipError);
        }
    } finally {
        // Reset refresh button
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60 * 60 * 1000 // 1 hour
        });
    });
}

async function fetchWeatherData(lat, lon) {
    const API_KEY = 'ca1f3d0d3aec32f0725acb83b73dd8ca';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Weather API request failed');
    }
    
    return await response.json();
}

// Fallback: Get weather by IP location
async function getWeatherByIP() {
    const API_KEY = 'ca1f3d0d3aec32f0725acb83b73dd8ca';
    
    try {
        // First get location by IP
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        // Then get weather for that location
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ipData.city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();
        
        updateWeatherUI(weatherData);
    } catch (error) {
        throw new Error('IP-based weather failed');
    }
}

function updateWeatherUI(data) {
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherDescription = document.getElementById('weatherDescription');
    const weatherIcon = document.getElementById('weatherIcon');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const visibility = document.getElementById('visibility');
    
    // Extract data from API response
    const temp = Math.round(data.main.temp);
    const feelsLikeTemp = Math.round(data.main.feels_like);
    const city = data.name;
    const country = data.sys.country;
    const description = data.weather[0].description;
    const humidityValue = data.main.humidity;
    const windSpeedValue = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A';
    const pressure = data.main.pressure;
    const iconCode = data.weather[0].icon;
    
    // Update UI elements
    weatherTemp.textContent = `${temp}°C`;
    weatherLocation.textContent = `${city}, ${country}`;
    weatherDescription.textContent = capitalizeFirstLetter(description);
    feelsLike.textContent = `${feelsLikeTemp}°C`;
    humidity.textContent = `${humidityValue}%`;
    windSpeed.textContent = `${windSpeedValue} km/h`;
    visibility.textContent = `${visibilityKm} km`;
    
    // Update weather icon
    updateWeatherIcon(weatherIcon, iconCode);
    
    // Save to localStorage for offline use
    const weatherData = {
        temp,
        feelsLikeTemp,
        city,
        country,
        description,
        humidity: humidityValue,
        windSpeed: windSpeedValue,
        visibilityKm,
        pressure,
        iconCode,
        timestamp: Date.now()
    };
    localStorage.setItem('weatherData', JSON.stringify(weatherData));
}

function updateWeatherIcon(iconElement, iconCode) {
    // Map OpenWeatherMap icon codes to Font Awesome icons
    const iconMap = {
        '01d': 'fas fa-sun text-yellow-500',
        '01n': 'fas fa-moon text-blue-300',
        '02d': 'fas fa-cloud-sun text-yellow-400',
        '02n': 'fas fa-cloud-moon text-blue-300',
        '03d': 'fas fa-cloud text-gray-400',
        '03n': 'fas fa-cloud text-gray-400',
        '04d': 'fas fa-cloud text-gray-500',
        '04n': 'fas fa-cloud text-gray-500',
        '09d': 'fas fa-cloud-rain text-blue-400',
        '09n': 'fas fa-cloud-rain text-blue-400',
        '10d': 'fas fa-cloud-sun-rain text-blue-400',
        '10n': 'fas fa-cloud-moon-rain text-blue-400',
        '11d': 'fas fa-bolt text-yellow-500',
        '11n': 'fas fa-bolt text-yellow-500',
        '13d': 'fas fa-snowflake text-blue-200',
        '13n': 'fas fa-snowflake text-blue-200',
        '50d': 'fas fa-smog text-gray-400',
        '50n': 'fas fa-smog text-gray-400'
    };
    
    const iconClass = iconMap[iconCode] || 'fas fa-question text-gray-400';
    iconElement.innerHTML = `<i class="${iconClass}"></i>`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Load cached weather data if available
function loadCachedWeatherData() {
    const cached = localStorage.getItem('weatherData');
    if (cached) {
        const weatherData = JSON.parse(cached);
        const cacheAge = Date.now() - weatherData.timestamp;
        const maxCacheAge = 30 * 60 * 1000; // 30 minutes
        
        if (cacheAge < maxCacheAge) {
            updateWeatherUIFromCache(weatherData);
            return true;
        }
    }
    return false;
}

function updateWeatherUIFromCache(data) {
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherDescription = document.getElementById('weatherDescription');
    const weatherIcon = document.getElementById('weatherIcon');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const visibility = document.getElementById('visibility');
    
    weatherTemp.textContent = `${data.temp}°C`;
    weatherLocation.textContent = `${data.city}, ${data.country}`;
    weatherDescription.textContent = capitalizeFirstLetter(data.description);
    feelsLike.textContent = `${data.feelsLikeTemp}°C`;
    humidity.textContent = `${data.humidity}%`;
    windSpeed.textContent = `${data.windSpeed} km/h`;
    visibility.textContent = `${data.visibilityKm} km`;
    
    updateWeatherIcon(weatherIcon, data.iconCode);
    
    // Show that this is cached data
    const locationElement = document.getElementById('weatherLocation');
    locationElement.innerHTML = `${data.city}, ${data.country} <span class="text-xs text-gray-500">(Cached)</span>`;
}

// Time and Date Widget
function updateTimeAndDate() {
    const now = new Date();
    
    // Update time
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString();
    }
    
    // Update date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Anime API Integration
async function fetchLatestAnimeUpdates() {
    const container = document.getElementById('animeUpdatesContainer');
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading anime updates...</p>
            </div>
        `;
        
        // GraphQL query for latest anime
        const query = `
            query {
                Page(page: 1, perPage: 10) {
                    media(type: ANIME, status: RELEASING, sort: [START_DATE_DESC]) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        description
                        episodes
                        nextAiringEpisode {
                            episode
                            timeUntilAiring
                        }
                        status
                        averageScore
                    }
                }
            }
        `;
        
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        const animeList = data.data.Page.media;
        
        // Clear container
        container.innerHTML = '';
        
        if (animeList.length === 0) {
            container.innerHTML = '<p class="text-center py-4">No recent anime updates found.</p>';
            return;
        }
        
        // Display anime updates
        animeList.forEach(anime => {
            const animeElement = createAnimeUpdateElement(anime);
            container.appendChild(animeElement);
        });
        
    } catch (error) {
        console.error('Error fetching anime updates:', error);
        container.innerHTML = `
            <div class="text-center py-4 text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Failed to load anime updates</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// Function to create anime update element
function createAnimeUpdateElement(anime) {
    const element = document.createElement('div');
    element.className = 'anime-update-item';
    
    // Format description (remove HTML tags)
    const description = anime.description 
        ? anime.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
        : 'No description available.';
    
    // Get status badge
    const statusBadge = getStatusBadge(anime.status);
    
    // Calculate next episode info
    let episodeInfo = '';
    if (anime.nextAiringEpisode) {
        const daysUntilAiring = Math.floor(anime.nextAiringEpisode.timeUntilAiring / (24 * 60 * 60));
        const hoursUntilAiring = Math.floor((anime.nextAiringEpisode.timeUntilAiring % (24 * 60 * 60)) / (60 * 60));
        
        if (daysUntilAiring > 0) {
            episodeInfo = `Episode ${anime.nextAiringEpisode.episode} in ${daysUntilAiring} day${daysUntilAiring > 1 ? 's' : ''}`;
        } else if (hoursUntilAiring > 0) {
            episodeInfo = `Episode ${anime.nextAiringEpisode.episode} in ${hoursUntilAiring} hour${hoursUntilAiring > 1 ? 's' : ''}`;
        } else {
            episodeInfo = `Episode ${anime.nextAiringEpisode.episode} airing soon`;
        }
    } else if (anime.episodes) {
        episodeInfo = `${anime.episodes} episodes`;
    }
    
    element.innerHTML = `
        <div class="anime-cover-small">
            ${anime.coverImage ? 
                `<img src="${anime.coverImage.large}" alt="${anime.title.romaji}" loading="lazy">` : 
                anime.title.romaji.substring(0, 10)
            }
        </div>
        <div class="anime-update-info">
            <div class="anime-update-title">${anime.title.english || anime.title.romaji}</div>
            <div class="anime-update-meta">
                ${statusBadge}
                ${anime.averageScore ? `<span>⭐ ${anime.averageScore / 10}/10</span>` : ''}
                ${episodeInfo ? `<span>• ${episodeInfo}</span>` : ''}
            </div>
            <div class="anime-update-description">${description}</div>
        </div>
    `;
    
    return element;
}

// Function to get status badge
function getStatusBadge(status) {
    switch(status) {
        case 'RELEASING':
            return '<span class="anime-status-badge status-releasing">Airing</span>';
        case 'FINISHED':
            return '<span class="anime-status-badge status-finished">Completed</span>';
        case 'NOT_YET_RELEASED':
            return '<span class="anime-status-badge status-not-yet-released">Upcoming</span>';
        default:
            return `<span class="anime-status-badge">${status}</span>`;
    }
}

// Fetch trending anime
async function fetchTrendingAnime() {
    const container = document.getElementById('trendingAnimeContainer');
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="text-center py-2">
                <i class="fas fa-spinner fa-spin text-lg mb-1"></i>
                <p class="text-sm">Loading trending anime...</p>
            </div>
        `;
        
        // GraphQL query for trending anime
        const query = `
            query {
                Page(page: 1, perPage: 8) {
                    media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
                        id
                        title {
                            romaji
                            english
                        }
                        averageScore
                    }
                }
            }
        `;
        
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        const trendingAnime = data.data.Page.media;
        
        // Clear container
        container.innerHTML = '';
        
        if (trendingAnime.length === 0) {
            container.innerHTML = '<p class="text-center py-2 text-sm">No trending anime found.</p>';
            return;
        }
        
        // Display trending anime
        trendingAnime.forEach((anime, index) => {
            const animeElement = createTrendingAnimeElement(anime, index + 1);
            container.appendChild(animeElement);
        });
        
    } catch (error) {
        console.error('Error fetching trending anime:', error);
        container.innerHTML = `
            <div class="text-center py-2 text-red-500 text-sm">
                <i class="fas fa-exclamation-triangle text-lg mb-1"></i>
                <p>Failed to load trending anime</p>
            </div>
        `;
    }
}

// Function to create trending anime element
function createTrendingAnimeElement(anime, rank) {
    const element = document.createElement('div');
    element.className = 'trending-anime-item';
    
    element.innerHTML = `
        <div class="trending-rank">${rank}</div>
        <div class="trending-anime-title">${anime.title.english || anime.title.romaji}</div>
        ${anime.averageScore ? `<div class="trending-score">${anime.averageScore / 10}</div>` : ''}
    `;
    
    return element;
}