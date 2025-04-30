// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Google Maps configuration
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

const CONFIG = {
    // Google Maps API key
    GOOGLE_MAPS_API_KEY: 'AIzaSyDikeJLOFHIe1kzcR6xqJA34QazL9PIN_M',
    // Default map center (can be updated based on user's location)
    DEFAULT_CENTER: {
        lat: 40.7128,
        lng: -74.0060
    },
    // Map styles for a cleaner look
    MAP_STYLES: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ]
}; 