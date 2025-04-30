// DOM Elements
const crimeReportForm = document.getElementById('crime-report-form');
const crimeTypeSelect = document.getElementById('crime-type');
const crimeDescription = document.getElementById('crime-description');
const crimeImage = document.getElementById('crime-image');
const imagePreview = document.getElementById('image-preview');

// Initialize recent reports when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadRecentReports();
    setupImagePreview();
});

// Handle form submission
crimeReportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        showNotification('Please login to report a crime', 'error');
        return;
    }

    const location = document.getElementById('crime-location').value;
    if (!location) {
        showNotification('Please select a location on the map', 'error');
        return;
    }

    try {
        // Handle image if provided
        let imageUrl = null;
        if (crimeImage.files.length > 0) {
            imageUrl = await StorageService.saveImage(crimeImage.files[0]);
        }

        // Create crime report
        const crimeData = {
            type: crimeTypeSelect.value,
            description: crimeDescription.value,
            location: location,
            imageUrl: imageUrl,
            reportedBy: currentUser.email,
            status: 'pending'
        };

        // Save to storage
        StorageService.createCrime(crimeData);

        // Clear form
        crimeReportForm.reset();
        imagePreview.innerHTML = '';
        showNotification('Crime report submitted successfully', 'success');

        // Notify admins (in a real app, this would be handled by a backend service)
        notifyAdmins(crimeData);

    } catch (error) {
        showNotification('Error submitting report: ' + error.message, 'error');
    }
});

// Load recent reports for the home page
function loadRecentReports() {
    const recentAlerts = document.getElementById('recent-alerts');
    const crimes = StorageService.getRecentCrimes(24); // Last 24 hours
    
    if (crimes.length === 0) {
        recentAlerts.innerHTML = '<p class="no-alerts">No recent crime reports.</p>';
        return;
    }

    crimes.forEach(crime => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-card';
        
        const location = typeof crime.location === 'string' 
            ? JSON.parse(crime.location) 
            : crime.location;
            
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-type ${crime.type}">${crime.type}</span>
                <span class="alert-time">${formatTimeAgo(new Date(crime.createdAt))}</span>
            </div>
            <p class="alert-description">${crime.description}</p>
            <p class="alert-location">
                <small>Location: ${formatLocation(location)}</small>
            </p>
            ${crime.imageUrl ? `
                <div class="alert-image">
                    <img src="${crime.imageUrl}" alt="Crime scene">
                </div>
            ` : ''}
        `;
        
        recentAlerts.appendChild(alertElement);
    });
}

// Set up image preview
function setupImagePreview() {
    crimeImage.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" alt="Preview">
                            <button type="button" class="remove-image">&times;</button>
                        </div>
                    `;

                    // Add remove button functionality
                    document.querySelector('.remove-image').addEventListener('click', () => {
                        crimeImage.value = '';
                        imagePreview.innerHTML = '';
                    });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                showNotification('Error loading image preview', 'error');
            }
        }
    });
}

// Notify admins of new crime report
function notifyAdmins(crimeData) {
    const admins = StorageService.getAdmins();
    admins.forEach(admin => {
        // In a real app, this would send an email or push notification
        console.log(`Notifying admin ${admin.email} about new crime report:`, crimeData);
    });
}

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + ' years ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + ' months ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + ' days ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + ' hours ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + ' minutes ago';
    
    return 'just now';
}

// Helper function to format location
function formatLocation(location) {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
} 