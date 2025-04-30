// Map configuration
const mapConfig = {
    center: { lat: -34.397, lng: 150.644 }, // Default center
    zoom: 12,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

// Initialize maps
let homeMap, crimeMap, locationPicker;
let markers = [];

// Initialize maps when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMaps();
    setupEventListeners();
    loadCrimeMarkers();
});

function initializeMaps() {
    // Home page map
    homeMap = new google.maps.Map(document.getElementById('home-map'), {
        ...mapConfig,
        zoom: 13
    });

    // Crime map
    crimeMap = new google.maps.Map(document.getElementById('crime-map'), {
        ...mapConfig,
        zoom: 12
    });

    // Location picker map
    locationPicker = new google.maps.Map(document.getElementById('location-picker'), {
        ...mapConfig,
        zoom: 15
    });

    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                [homeMap, crimeMap, locationPicker].forEach(map => {
                    map.setCenter(pos);
                });
            },
            () => {
                showNotification('Error: The Geolocation service failed.', 'error');
            }
        );
    }
}

function setupEventListeners() {
    // Add click listener to location picker
    let locationMarker = null;
    locationPicker.addListener('click', (e) => {
        if (locationMarker) locationMarker.setMap(null);
        locationMarker = new google.maps.Marker({
            position: e.latLng,
            map: locationPicker
        });
        document.getElementById('crime-location').value = JSON.stringify({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    });

    // Set up filter listeners
    document.getElementById('crime-filter').addEventListener('change', (e) => {
        filterCrimes();
    });

    document.getElementById('date-range').addEventListener('change', (e) => {
        filterCrimes();
    });
}

// Load crime markers from storage
function loadCrimeMarkers() {
    clearMarkers();
    const crimes = StorageService.getApprovedCrimes();
    crimes.forEach(crime => addCrimeMarker(crime));
    updateCrimeList(crimes);
}

// Add a crime marker to the map
function addCrimeMarker(crime) {
    const position = typeof crime.location === 'string' 
        ? JSON.parse(crime.location) 
        : crime.location;

    const marker = new google.maps.Marker({
        position: position,
        map: crimeMap,
        title: crime.type,
        icon: getCrimeIcon(crime.type)
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="info-window">
                <h3>${crime.type}</h3>
                <p>${crime.description}</p>
                <p><small>Reported: ${new Date(crime.createdAt).toLocaleDateString()}</small></p>
                ${crime.imageUrl ? `<img src="${crime.imageUrl}" alt="Crime scene" style="max-width: 200px;">` : ''}
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(crimeMap, marker);
    });

    markers.push(marker);

    // Add marker to home map for recent crimes (last 24 hours)
    const isRecent = (Date.now() - new Date(crime.createdAt).getTime()) < 24 * 60 * 60 * 1000;
    if (isRecent) {
        const homeMarker = new google.maps.Marker({
            position: position,
            map: homeMap,
            title: crime.type,
            icon: getCrimeIcon(crime.type)
        });
        
        const homeInfoWindow = new google.maps.InfoWindow({
            content: infoWindow.getContent()
        });

        homeMarker.addListener('click', () => {
            homeInfoWindow.open(homeMap, homeMarker);
        });

        markers.push(homeMarker);
    }
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Get marker icon based on crime type
function getCrimeIcon(type) {
    const icons = {
        theft: '🔴',
        vandalism: '🟡',
        assault: '🔵',
        suspicious: '⚪'
    };
    return icons[type] || '📍';
}

// Filter crimes based on type and date range
function filterCrimes() {
    const typeFilter = document.getElementById('crime-filter').value;
    const dateRange = parseInt(document.getElementById('date-range').value);
    
    let crimes = StorageService.getApprovedCrimes();
    
    // Apply type filter
    if (typeFilter !== 'all') {
        crimes = crimes.filter(crime => crime.type === typeFilter);
    }
    
    // Apply date filter
    if (dateRange !== 'all') {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - dateRange);
        crimes = crimes.filter(crime => new Date(crime.createdAt) >= cutoff);
    }
    
    clearMarkers();
    crimes.forEach(crime => addCrimeMarker(crime));
    updateCrimeList(crimes);
}

// Update the crime list sidebar
function updateCrimeList(crimes) {
    const crimeList = document.getElementById('crime-list');
    crimeList.innerHTML = '';

    if (crimes.length === 0) {
        crimeList.innerHTML = '<p class="no-crimes">No crimes found matching the criteria.</p>';
        return;
    }

    crimes.forEach(crime => {
        const crimeElement = document.createElement('div');
        crimeElement.className = 'crime-item';
        crimeElement.innerHTML = `
            <h3>${crime.type}</h3>
            <p>${crime.description}</p>
            <p><small>Reported: ${new Date(crime.createdAt).toLocaleDateString()}</small></p>
        `;
        crimeList.appendChild(crimeElement);
    });
} 