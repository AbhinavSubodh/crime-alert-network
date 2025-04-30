// Local Storage Service
const StorageService = {
    // Initialize storage with default data if empty
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('crimes')) {
            localStorage.setItem('crimes', JSON.stringify([]));
        }
        if (!localStorage.getItem('admins')) {
            // Create default admin account
            const defaultAdmin = {
                email: 'admin@example.com',
                password: 'admin123', // In real app, this should be hashed
                isAdmin: true
            };
            localStorage.setItem('admins', JSON.stringify([defaultAdmin]));
        }
    },

    // User Management
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },

    createUser(email, password) {
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            email,
            password, // In real app, this should be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    },

    validateUser(email, password) {
        const users = this.getUsers();
        const admins = this.getAdmins();
        
        // Check regular users
        const user = users.find(u => u.email === email && u.password === password);
        if (user) return { ...user, isAdmin: false };
        
        // Check admin users
        const admin = admins.find(a => a.email === email && a.password === password);
        if (admin) return { ...admin, isAdmin: true };
        
        return null;
    },

    // Crime Reports Management
    getCrimes() {
        return JSON.parse(localStorage.getItem('crimes') || '[]');
    },

    createCrime(crimeData) {
        const crimes = this.getCrimes();
        const newCrime = {
            id: Date.now().toString(),
            ...crimeData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        crimes.push(newCrime);
        localStorage.setItem('crimes', JSON.stringify(crimes));
        return newCrime;
    },

    updateCrime(crimeId, updates) {
        const crimes = this.getCrimes();
        const index = crimes.findIndex(c => c.id === crimeId);
        
        if (index === -1) throw new Error('Crime report not found');
        
        crimes[index] = { ...crimes[index], ...updates };
        localStorage.setItem('crimes', JSON.stringify(crimes));
        return crimes[index];
    },

    // Admin Management
    getAdmins() {
        return JSON.parse(localStorage.getItem('admins') || '[]');
    },

    isAdmin(email) {
        const admins = this.getAdmins();
        return admins.some(admin => admin.email === email);
    },

    // Image handling (using Base64 for demo)
    saveImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Query helpers
    getPendingCrimes() {
        const crimes = this.getCrimes();
        return crimes.filter(crime => crime.status === 'pending');
    },

    getApprovedCrimes() {
        const crimes = this.getCrimes();
        return crimes.filter(crime => crime.status === 'approved');
    },

    getRecentCrimes(hours = 24) {
        const crimes = this.getApprovedCrimes();
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);
        
        return crimes.filter(crime => {
            const crimeDate = new Date(crime.createdAt);
            return crimeDate >= cutoff;
        });
    },

    getCrimesByType(type) {
        const crimes = this.getApprovedCrimes();
        return type === 'all' ? crimes : crimes.filter(crime => crime.type === type);
    }
};

// Initialize storage on page load
StorageService.init(); 