// DOM Elements
const adminSection = document.getElementById('admin-section');
const pendingReports = document.getElementById('pending-reports');

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});

// Check admin access on auth state change
function checkAdminAccess() {
    if (currentUser && currentUser.isAdmin) {
        loadPendingReports();
    } else {
        adminSection.classList.add('hidden');
    }
}

// Load pending reports
function loadPendingReports() {
    const crimes = StorageService.getPendingCrimes();
    pendingReports.innerHTML = '';

    if (crimes.length === 0) {
        pendingReports.innerHTML = '<p class="no-reports">No pending reports to review.</p>';
        return;
    }
    
    crimes.forEach(crime => {
        const reportElement = document.createElement('div');
        reportElement.className = 'report-card';
        
        const location = typeof crime.location === 'string' 
            ? JSON.parse(crime.location) 
            : crime.location;

        reportElement.innerHTML = `
            <div class="report-header">
                <span class="report-type ${crime.type}">${crime.type}</span>
                <span class="report-time">${formatTimeAgo(new Date(crime.createdAt))}</span>
            </div>
            <p class="report-description">${crime.description}</p>
            <p class="report-details">
                <small>Reported by: ${crime.reportedBy}</small><br>
                <small>Location: ${formatLocation(location)}</small>
            </p>
            ${crime.imageUrl ? `
                <div class="report-image">
                    <img src="${crime.imageUrl}" alt="Crime scene">
                </div>
            ` : ''}
            <div class="report-actions">
                <button onclick="approveReport('${crime.id}')" class="btn-success">Approve</button>
                <button onclick="rejectReport('${crime.id}')" class="btn-danger">Reject</button>
            </div>
        `;
        
        pendingReports.appendChild(reportElement);
    });
}

// Approve a report
async function approveReport(reportId) {
    try {
        const report = StorageService.updateCrime(reportId, {
            status: 'approved',
            approvedBy: currentUser.email,
            approvedAt: new Date().toISOString()
        });

        // Notify nearby users
        notifyNearbyUsers(report);
        
        showNotification('Report approved successfully', 'success');
        loadPendingReports();
    } catch (error) {
        showNotification('Error approving report: ' + error.message, 'error');
    }
}

// Reject a report
async function rejectReport(reportId) {
    try {
        StorageService.updateCrime(reportId, {
            status: 'rejected',
            rejectedBy: currentUser.email,
            rejectedAt: new Date().toISOString()
        });
        
        showNotification('Report rejected successfully', 'success');
        loadPendingReports();
    } catch (error) {
        showNotification('Error rejecting report: ' + error.message, 'error');
    }
}

// Notify nearby users of approved crime report
function notifyNearbyUsers(crimeData) {
    // In a real app, this would:
    // 1. Query for users within a certain radius
    // 2. Send push notifications or emails
    // 3. Update their notification preferences
    
    // For demo purposes, we'll just log to console
    console.log('Notifying nearby users about approved crime:', crimeData);
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