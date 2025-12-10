// ===== Enhanced Gantt Pro Application =====
class GanttProApp {
    constructor() {
        this.projects = [];
        this.currentView = 'day';
        this.startDate = null;
        this.endDate = null;
        this.editingId = null;
        this.searchQuery = '';
        this.activeFilters = {
            progress: [],
            status: []
        };
        this.zoomLevel = 100;
        this.sortBy = null;
        this.sortDirection = 'asc';
        this.sidebarCollapsed = false;

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDateRange();
        this.setupKeyboardShortcuts();
        this.render();
        this.updateStats();
    }

    loadData() {
        chrome.storage.local.get(['ganttProjects'], (result) => {
            if (result.ganttProjects) {
                this.projects = result.ganttProjects;
                this.render();
                this.updateStats();
            } else {
                this.addSampleData();
            }
        });
    }

    saveData() {
        chrome.storage.local.set({ ganttProjects: this.projects }, () => {
            this.showNotification('Data saved successfully', 'success');
        });
    }

    addSampleData() {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        this.projects = [
            {
                id: this.generateId(),
                name: 'myKarthikCgart',
                startDate: formatDate(new Date(2025, 11, 10)),
                duration: 1,
                progress: 0,
                color: '#667eea',
                description: 'Main project for Karthik',
                dependencies: [],
                tasks: [
                    {
                        id: this.generateId(),
                        name: 'Task#2',
                        startDate: formatDate(new Date(2025, 3, 30)),
                        duration: 2,
                        progress: 95,
                        color: '#667eea',
                        description: '',
                        dependencies: []
                    },
                    {
                        id: this.generateId(),
                        name: 'Task#3',
                        startDate: formatDate(new Date(2025, 4, 2)),
                        duration: 1,
                        progress: 50,
                        color: '#667eea',
                        description: '',
                        dependencies: []
                    },
                    {
                        id: this.generateId(),
                        name: 'New task',
                        startDate: formatDate(new Date(2025, 4, 3)),
                        duration: 1,
                        progress: 100,
                        color: '#667eea',
                        description: '',
                        dependencies: []
                    }
                ]
            },
            {
                id: this.generateId(),
                name: 'Project#4',
                startDate: formatDate(new Date(2025, 3, 30)),
                duration: 3,
                progress: 75,
                color: '#f093fb',
                description: 'Secondary project',
                dependencies: [],
                tasks: [
                    {
                        id: this.generateId(),
                        name: 'New task',
                        startDate: formatDate(new Date(2025, 3, 30)),
                        duration: 8,
                        progress: 0,
                        color: '#f093fb',
                        description: '',
                        dependencies: []
                    },
                    {
                        id: this.generateId(),
                        name: 'New task',
                        startDate: formatDate(new Date(2025, 3, 30)),
                        duration: 1,
                        progress: 0,
                        color: '#f093fb',
                        description: '',
                        dependencies: []
                    }
                ]
            },
            {
                id: this.generateId(),
                name: 'Project_AAA',
                startDate: formatDate(new Date(2025, 4, 1)),
                duration: 5,
                progress: 23,
                color: '#fa709a',
                description: 'Additional project',
                dependencies: [],
                tasks: []
            }
        ];

        this.saveData();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setDefaultDateRange() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(1);

        const end = new Date(today);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);

        this.startDate = start;
        this.endDate = end;

        document.getElementById('startDate').valueAsDate = start;
        document.getElementById('endDate').valueAsDate = end;
    }

    setupEventListeners() {
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.render();
            });
        });

        // Date range
        document.getElementById('startDate').addEventListener('change', (e) => {
            this.startDate = e.target.valueAsDate;
            this.render();
        });

        document.getElementById('endDate').addEventListener('change', (e) => {
            this.endDate = e.target.valueAsDate;
            this.render();
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            document.getElementById('searchClear').style.display = this.searchQuery ? 'block' : 'none';
            this.render();
        });

        document.getElementById('searchClear').addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            document.getElementById('searchClear').style.display = 'none';
            this.render();
        });

        // Filters
        document.getElementById('filterBtn').addEventListener('click', () => {
            document.getElementById('filterMenu').classList.toggle('active');
        });

        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
            document.getElementById('filterMenu').classList.remove('active');
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
            this.activeFilters = { progress: [], status: [] };
            document.getElementById('filterBadge').style.display = 'none';
            this.render();
        });

        // Toolbar buttons
        document.getElementById('expandAllBtn').addEventListener('click', () => {
            document.querySelectorAll('.project-item').forEach(item => {
                item.classList.add('expanded');
            });
        });

        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            document.querySelectorAll('.project-item').forEach(item => {
                item.classList.remove('expanded');
            });
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            const today = new Date();
            this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            document.getElementById('startDate').valueAsDate = this.startDate;
            document.getElementById('endDate').valueAsDate = this.endDate;
            this.render();
        });

        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomLevel = Math.min(200, this.zoomLevel + 10);
            this.updateZoom();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomLevel = Math.max(50, this.zoomLevel - 10);
            this.updateZoom();
        });

        // Sidebar toggle
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Floating sidebar toggle (reopen sidebar)
        document.getElementById('sidebarToggleFloating').addEventListener('click', () => {
            this.sidebarCollapsed = false;
            document.getElementById('sidebar').classList.remove('collapsed');
        });

        // Action buttons
        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            document.getElementById('exportModal').classList.add('active');
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('shortcutsModal').classList.add('active');
        });

        // Add project button
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeExportModal').addEventListener('click', () => {
            document.getElementById('exportModal').classList.remove('active');
        });

        document.getElementById('closeShortcutsModal').addEventListener('click', () => {
            document.getElementById('shortcutsModal').classList.remove('active');
        });

        // Click outside modals to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Form submission
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Progress slider
        document.getElementById('projectProgress').addEventListener('input', (e) => {
            document.getElementById('progressValue').textContent = e.target.value + '%';
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const color = e.target.dataset.color;
                document.getElementById('projectColor').value = color;
            });
        });

        // Export options
        document.getElementById('exportJSON').addEventListener('click', () => {
            this.exportAsJSON();
        });

        document.getElementById('exportCSV').addEventListener('click', () => {
            this.exportAsCSV();
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortKey = th.dataset.sort;
                if (this.sortBy === sortKey) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sortKey;
                    this.sortDirection = 'asc';
                }
                this.updateSortIndicators();
                this.render();
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New Project
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openModal();
            }

            // Ctrl/Cmd + F: Focus Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }

            // Ctrl/Cmd + P: Print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }

            // Ctrl/Cmd + E: Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                document.getElementById('exportModal').classList.add('active');
            }

            // Ctrl/Cmd + +: Zoom In
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.zoomLevel = Math.min(200, this.zoomLevel + 10);
                this.updateZoom();
            }

            // Ctrl/Cmd + -: Zoom Out
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                this.zoomLevel = Math.max(50, this.zoomLevel - 10);
                this.updateZoom();
            }

            // Escape: Close Modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }

            // ?: Show Shortcuts
            if (e.key === '?') {
                document.getElementById('shortcutsModal').classList.add('active');
            }
        });
    }

    applyFilters() {
        this.activeFilters = { progress: [], status: [] };

        document.querySelectorAll('.filter-checkbox:checked').forEach(cb => {
            const filter = cb.dataset.filter;
            const value = cb.dataset.value;
            this.activeFilters[filter].push(value);
        });

        const totalFilters = this.activeFilters.progress.length + this.activeFilters.status.length;
        const badge = document.getElementById('filterBadge');

        if (totalFilters > 0) {
            badge.textContent = totalFilters;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        this.render();
    }

    updateZoom() {
        document.getElementById('zoomLevel').textContent = this.zoomLevel + '%';
        const wrapper = document.getElementById('timelineWrapper');
        wrapper.style.transform = `scale(${this.zoomLevel / 100})`;
        wrapper.style.transformOrigin = 'top left';
    }

    updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sorted', 'asc', 'desc');
            if (th.dataset.sort === this.sortBy) {
                th.classList.add('sorted', this.sortDirection);
            }
        });
    }

    filterProjects(projects) {
        return projects.filter(project => {
            // Search filter
            if (this.searchQuery) {
                const matchesSearch = project.name.toLowerCase().includes(this.searchQuery) ||
                    (project.tasks && project.tasks.some(t => t.name.toLowerCase().includes(this.searchQuery)));
                if (!matchesSearch) return false;
            }

            // Progress filter
            if (this.activeFilters.progress.length > 0) {
                const matchesProgress = this.activeFilters.progress.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return project.progress >= min && project.progress <= max;
                });
                if (!matchesProgress) return false;
            }

            // Status filter
            if (this.activeFilters.status.length > 0) {
                const status = project.progress === 0 ? 'not-started' :
                    project.progress === 100 ? 'completed' : 'in-progress';
                if (!this.activeFilters.status.includes(status)) return false;
            }

            return true;
        });
    }

    sortProjects(projects) {
        if (!this.sortBy) return projects;

        return [...projects].sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];

            if (this.sortBy === 'startDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateStats() {
        const totalProjects = this.projects.length;
        const totalTasks = this.projects.reduce((sum, p) => sum + (p.tasks ? p.tasks.length : 0), 0);
        const avgProgress = totalProjects > 0
            ? Math.round(this.projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
            : 0;

        document.getElementById('totalProjects').textContent = totalProjects;
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('avgProgress').textContent = avgProgress + '%';

        // Update intelligent features
        this.updateProgressVelocity();
        this.updateSmartSuggestions();
    }

    // ===== INTELLIGENT FEATURES =====

    updateProgressVelocity() {
        const allItems = [];
        this.projects.forEach(project => {
            allItems.push(project);
            if (project.tasks) {
                allItems.push(...project.tasks);
            }
        });

        // Calculate completion rate (tasks completed per day)
        const completedItems = allItems.filter(item => item.progress === 100);
        const inProgressItems = allItems.filter(item => item.progress > 0 && item.progress < 100);
        const totalItems = allItems.length;

        // Simple velocity calculation (completed items / total days in current month)
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const currentDay = today.getDate();
        const completionRate = currentDay > 0 ? (completedItems.length / currentDay).toFixed(2) : 0;

        // Estimated completion date
        const remainingItems = totalItems - completedItems.length;
        const daysToComplete = completionRate > 0 ? Math.ceil(remainingItems / completionRate) : 0;
        const estimatedDate = new Date(today);
        estimatedDate.setDate(estimatedDate.getDate() + daysToComplete);

        // Update UI
        document.getElementById('completionRate').textContent = `${completionRate} tasks/day`;

        if (remainingItems > 0 && completionRate > 0) {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            document.getElementById('estimatedCompletion').textContent = estimatedDate.toLocaleDateString('en-US', options);
        } else if (remainingItems === 0) {
            document.getElementById('estimatedCompletion').textContent = 'All Complete! 🎉';
        } else {
            document.getElementById('estimatedCompletion').textContent = 'No data yet';
        }

        // Update trend indicator
        const avgProgress = allItems.reduce((sum, item) => sum + item.progress, 0) / allItems.length;
        const trendIndicator = document.getElementById('trendIndicator');
        const trendText = document.getElementById('trendText');

        if (avgProgress >= 70) {
            trendIndicator.className = 'trend-indicator';
            trendText.textContent = 'On track';
        } else if (avgProgress >= 40) {
            trendIndicator.className = 'trend-indicator warning';
            trendText.textContent = 'Needs attention';
        } else {
            trendIndicator.className = 'trend-indicator danger';
            trendText.textContent = 'At risk';
        }

        // Render velocity chart
        this.renderVelocityChart(allItems);
    }

    renderVelocityChart(items) {
        const canvas = document.getElementById('velocityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate progress over last 7 days (simulated data for demo)
        const today = new Date();
        const dataPoints = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Simulate progress data (in real app, this would come from historical data)
            const completedByDate = items.filter(item => {
                const itemDate = new Date(item.startDate);
                return itemDate <= date && item.progress === 100;
            }).length;

            dataPoints.push(completedByDate);
        }

        // Draw chart
        const padding = 20;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const maxValue = Math.max(...dataPoints, 1);
        const pointSpacing = chartWidth / (dataPoints.length - 1);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.2)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

        ctx.beginPath();
        ctx.moveTo(padding, height - padding);

        dataPoints.forEach((value, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - ((value / maxValue) * chartHeight);

            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        dataPoints.forEach((value, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - ((value / maxValue) * chartHeight);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        dataPoints.forEach((value, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - ((value / maxValue) * chartHeight);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea';
            ctx.fill();
            ctx.strokeStyle = '#1a1f2e';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    updateSmartSuggestions() {
        const container = document.getElementById('smartSuggestions');
        if (!container) return;

        const suggestions = this.generateSmartSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="suggestions-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <p>Great! No urgent tasks right now.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item priority-${suggestion.priority}" data-id="${suggestion.id}">
                <div class="suggestion-header">
                    <div class="suggestion-title">
                        ${this.escapeHtml(suggestion.name)}
                    </div>
                    <span class="suggestion-badge ${suggestion.badgeClass}">${suggestion.badge}</span>
                </div>
                <div class="suggestion-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${suggestion.dateInfo}
                </div>
                <div class="suggestion-reason">${suggestion.reason}</div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.openModal(id, this.isTask(id));
            });
        });
    }

    generateSmartSuggestions() {
        const suggestions = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.projects.forEach(project => {
            const items = [project];
            if (project.tasks) {
                items.push(...project.tasks);
            }

            items.forEach(item => {
                const startDate = new Date(item.startDate);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + item.duration);

                const daysUntilStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                // Overdue tasks
                if (endDate < today && item.progress < 100) {
                    const daysOverdue = Math.abs(daysUntilEnd);
                    suggestions.push({
                        id: item.id,
                        name: item.name,
                        priority: 'high',
                        badge: 'OVERDUE',
                        badgeClass: 'overdue',
                        dateInfo: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
                        reason: `This task was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and is ${item.progress}% complete.`,
                        score: 1000 + daysOverdue
                    });
                }
                // Due soon (within 3 days)
                else if (daysUntilEnd >= 0 && daysUntilEnd <= 3 && item.progress < 100) {
                    suggestions.push({
                        id: item.id,
                        name: item.name,
                        priority: 'medium',
                        badge: 'DUE SOON',
                        badgeClass: 'due-soon',
                        dateInfo: `Due in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}`,
                        reason: `This task is due soon and is ${item.progress}% complete.`,
                        score: 500 + (3 - daysUntilEnd)
                    });
                }
                // Starting soon (within 2 days) and not started
                else if (daysUntilStart >= 0 && daysUntilStart <= 2 && item.progress === 0) {
                    suggestions.push({
                        id: item.id,
                        name: item.name,
                        priority: 'low',
                        badge: 'STARTS SOON',
                        badgeClass: 'blocking',
                        dateInfo: `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`,
                        reason: `This task starts soon. Consider planning ahead.`,
                        score: 100 + (2 - daysUntilStart)
                    });
                }
                // In progress but stalled (progress between 1-99%)
                else if (item.progress > 0 && item.progress < 100 && daysUntilEnd > 3) {
                    suggestions.push({
                        id: item.id,
                        name: item.name,
                        priority: 'low',
                        badge: 'IN PROGRESS',
                        badgeClass: 'blocking',
                        dateInfo: `${item.progress}% complete`,
                        reason: `Continue working on this task to maintain momentum.`,
                        score: 50 + item.progress
                    });
                }
            });
        });

        // Sort by priority score (highest first) and return top 5
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    isTask(id) {
        for (const project of this.projects) {
            if (project.id === id) return false;
            if (project.tasks && project.tasks.some(t => t.id === id)) return true;
        }
        return false;
    }

    showNotification(message, type = 'info', title = '') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#43e97b" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5576c" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        notification.innerHTML = `
      <div class="notification-icon">${icons[type]}</div>
      <div class="notification-content">
        ${title ? `<div class="notification-title">${title}</div>` : ''}
        <div class="notification-message">${message}</div>
      </div>
    `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    exportAsJSON() {
        const dataStr = JSON.stringify(this.projects, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gantt-pro-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        document.getElementById('exportModal').classList.remove('active');
        this.showNotification('Data exported as JSON', 'success');
    }

    exportAsCSV() {
        let csv = 'Project,Type,Start Date,Duration,Progress,Color,Description\n';

        this.projects.forEach(project => {
            csv += `"${project.name}",Project,${project.startDate},${project.duration},${project.progress}%,${project.color},"${project.description || ''}"\n`;

            if (project.tasks) {
                project.tasks.forEach(task => {
                    csv += `"${task.name}",Task,${task.startDate},${task.duration},${task.progress}%,${task.color},"${task.description || ''}"\n`;
                });
            }
        });

        const dataBlob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gantt-pro-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        document.getElementById('exportModal').classList.remove('active');
        this.showNotification('Data exported as CSV', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('This will replace all existing data. Continue?')) {
                        this.projects = data;
                        this.saveData();
                        this.render();
                        this.updateStats();
                        this.showNotification('Data imported successfully', 'success');
                    }
                } catch (error) {
                    this.showNotification('Invalid JSON file', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    openModal(projectId = null, isTask = false, parentProjectId = null) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');

        form.reset();
        this.populateDependenciesDropdown(projectId);

        if (projectId) {
            const item = this.findItem(projectId);
            if (item) {
                document.getElementById('modalTitle').textContent = isTask ? 'Edit Task' : 'Edit Project';
                document.getElementById('projectId').value = projectId;
                document.getElementById('projectName').value = item.name;
                document.getElementById('projectStart').value = item.startDate;
                document.getElementById('projectDuration').value = item.duration;
                document.getElementById('projectProgress').value = item.progress;
                document.getElementById('progressValue').textContent = item.progress + '%';
                document.getElementById('projectColor').value = item.color;
                document.getElementById('projectDescription').value = item.description || '';

                if (item.dependencies) {
                    item.dependencies.forEach(depId => {
                        const option = document.querySelector(`#projectDependencies option[value="${depId}"]`);
                        if (option) option.selected = true;
                    });
                }
            }
        } else {
            document.getElementById('modalTitle').textContent = isTask ? 'New Task' : 'New Project';
            document.getElementById('projectProgress').value = 0;
            document.getElementById('progressValue').textContent = '0%';

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('projectStart').value = today;
            document.getElementById('projectDuration').value = 1;
        }

        document.getElementById('isTask').value = isTask;
        document.getElementById('parentProjectId').value = parentProjectId || '';

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('projectModal').classList.remove('active');
    }

    populateDependenciesDropdown(excludeId = null) {
        const select = document.getElementById('projectDependencies');
        select.innerHTML = '';

        this.projects.forEach(project => {
            if (project.id !== excludeId) {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                select.appendChild(option);

                if (project.tasks) {
                    project.tasks.forEach(task => {
                        if (task.id !== excludeId) {
                            const taskOption = document.createElement('option');
                            taskOption.value = task.id;
                            taskOption.textContent = `  ↳ ${task.name}`;
                            select.appendChild(taskOption);
                        }
                    });
                }
            }
        });
    }

    findItem(id) {
        for (const project of this.projects) {
            if (project.id === id) return project;
            if (project.tasks) {
                const task = project.tasks.find(t => t.id === id);
                if (task) return task;
            }
        }
        return null;
    }

    saveProject() {
        const id = document.getElementById('projectId').value;
        const isTask = document.getElementById('isTask').value === 'true';
        const parentProjectId = document.getElementById('parentProjectId').value;

        const selectedDeps = Array.from(document.getElementById('projectDependencies').selectedOptions)
            .map(opt => opt.value);

        const data = {
            id: id || this.generateId(),
            name: document.getElementById('projectName').value,
            startDate: document.getElementById('projectStart').value,
            duration: parseInt(document.getElementById('projectDuration').value),
            progress: parseInt(document.getElementById('projectProgress').value),
            color: document.getElementById('projectColor').value,
            description: document.getElementById('projectDescription').value,
            dependencies: selectedDeps
        };

        if (id) {
            this.updateItem(id, data);
        } else {
            if (isTask && parentProjectId) {
                const project = this.projects.find(p => p.id === parentProjectId);
                if (project) {
                    if (!project.tasks) project.tasks = [];
                    project.tasks.push(data);
                }
            } else {
                data.tasks = [];
                this.projects.push(data);
            }
        }

        this.saveData();
        this.render();
        this.updateStats();
        this.closeModal();
    }

    updateItem(id, data) {
        for (const project of this.projects) {
            if (project.id === id) {
                Object.assign(project, data);
                return;
            }
            if (project.tasks) {
                const task = project.tasks.find(t => t.id === id);
                if (task) {
                    Object.assign(task, data);
                    return;
                }
            }
        }
    }

    deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const projectIndex = this.projects.findIndex(p => p.id === id);
        if (projectIndex !== -1) {
            this.projects.splice(projectIndex, 1);
        } else {
            for (const project of this.projects) {
                if (project.tasks) {
                    const taskIndex = project.tasks.findIndex(t => t.id === id);
                    if (taskIndex !== -1) {
                        project.tasks.splice(taskIndex, 1);
                        break;
                    }
                }
            }
        }

        this.saveData();
        this.render();
        this.updateStats();
        this.showNotification('Item deleted', 'info');
    }

    render() {
        this.renderSidebar();
        this.renderGanttTable();
        this.renderTimeline();
    }

    renderSidebar() {
        const container = document.getElementById('projectsList');
        let filteredProjects = this.filterProjects(this.projects);

        if (filteredProjects.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No Projects Found</h3>
          <p>${this.searchQuery || this.activeFilters.progress.length > 0 ? 'Try adjusting your filters' : 'Click "Add Project" to get started'}</p>
        </div>
      `;
            return;
        }

        container.innerHTML = filteredProjects.map(project => `
      <div class="project-item" data-id="${project.id}">
        <div class="project-header">
          <div class="project-info">
            <div class="project-color" style="background: ${project.color};"></div>
            <div class="project-details">
              <h3>${this.escapeHtml(project.name)}</h3>
              <div class="project-meta">${project.tasks ? project.tasks.length : 0} tasks • ${project.progress}% complete</div>
            </div>
          </div>
          <div class="project-actions">
            <button class="action-btn edit-project" data-id="${project.id}" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-project" data-id="${project.id}" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        ${project.tasks && project.tasks.length > 0 ? `
          <div class="task-list">
            ${project.tasks.map(task => `
              <div class="task-item" style="border-left-color: ${task.color};">
                <div class="task-info">
                  <h4>${this.escapeHtml(task.name)}</h4>
                  <div class="task-meta">${task.duration} days • ${task.progress}%</div>
                </div>
                <div class="project-actions">
                  <button class="action-btn edit-task" data-id="${task.id}" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete-task" data-id="${task.id}" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            `).join('')}
            <button class="add-task-btn" data-project-id="${project.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </div>
        ` : `
          <div class="task-list">
            <button class="add-task-btn" data-project-id="${project.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </div>
        `}
      </div>
    `).join('');

        // Add event listeners
        this.attachSidebarListeners(container);
    }

    attachSidebarListeners(container) {
        container.querySelectorAll('.project-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    const item = e.currentTarget.closest('.project-item');
                    item.classList.toggle('expanded');
                }
            });
        });

        container.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(e.currentTarget.dataset.id, false);
            });
        });

        container.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteItem(e.currentTarget.dataset.id);
            });
        });

        container.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(e.currentTarget.dataset.id, true);
            });
        });

        container.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteItem(e.currentTarget.dataset.id);
            });
        });

        container.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(null, true, e.currentTarget.dataset.projectId);
            });
        });
    }

    renderGanttTable() {
        const tbody = document.getElementById('ganttTableBody');
        let filteredProjects = this.filterProjects(this.projects);
        filteredProjects = this.sortProjects(filteredProjects);

        if (filteredProjects.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No projects to display
          </td>
        </tr>
      `;
            return;
        }

        let rows = '';

        filteredProjects.forEach(project => {
            const depCount = project.dependencies ? project.dependencies.length : 0;
            rows += `
        <tr data-id="${project.id}">
          <td><strong>${this.escapeHtml(project.name)}</strong></td>
          <td>${this.formatDate(project.startDate)}</td>
          <td>${project.duration}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress}%; background: ${project.color};"></div>
            </div>
            <div class="progress-text">${project.progress}%</div>
          </td>
          <td>
            ${depCount > 0 ? `<span class="dependency-badge">${depCount}</span>` : '-'}
          </td>
          <td>
            <div class="row-actions">
              <button class="action-btn edit-project" data-id="${project.id}" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete-project" data-id="${project.id}" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;

            if (project.tasks) {
                project.tasks.forEach(task => {
                    const taskDepCount = task.dependencies ? task.dependencies.length : 0;
                    rows += `
            <tr class="task-row" data-id="${task.id}">
              <td>↳ ${this.escapeHtml(task.name)}</td>
              <td>${this.formatDate(task.startDate)}</td>
              <td>${task.duration}</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${task.progress}%; background: ${task.color};"></div>
                </div>
                <div class="progress-text">${task.progress}%</div>
              </td>
              <td>
                ${taskDepCount > 0 ? `<span class="dependency-badge">${taskDepCount}</span>` : '-'}
              </td>
              <td>
                <div class="row-actions">
                  <button class="action-btn edit-task" data-id="${task.id}" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete-task" data-id="${task.id}" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `;
                });
            }
        });

        tbody.innerHTML = rows;
        this.attachTableListeners(tbody);
    }

    attachTableListeners(tbody) {
        tbody.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openModal(btn.dataset.id, false);
            });
        });

        tbody.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteItem(btn.dataset.id);
            });
        });

        tbody.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openModal(btn.dataset.id, true);
            });
        });

        tbody.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteItem(btn.dataset.id);
            });
        });
    }

    renderTimeline() {
        const header = document.getElementById('timelineHeader');
        const timeline = document.getElementById('ganttTimeline');

        if (!this.startDate || !this.endDate) return;

        const dates = this.getDateRange();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        header.innerHTML = dates.map(date => {
            const isToday = date.getTime() === today.getTime();
            return `<div class="timeline-cell ${isToday ? 'today' : ''}">${this.formatTimelineDate(date)}</div>`;
        }).join('');

        let filteredProjects = this.filterProjects(this.projects);
        filteredProjects = this.sortProjects(filteredProjects);

        if (filteredProjects.length === 0) {
            timeline.innerHTML = '';
            return;
        }

        let rows = '';

        filteredProjects.forEach(project => {
            rows += this.renderTimelineRow(project, dates, today);

            if (project.tasks) {
                project.tasks.forEach(task => {
                    rows += this.renderTimelineRow(task, dates, today);
                });
            }
        });

        timeline.innerHTML = rows;
    }

    renderTimelineRow(item, dates, today) {
        const startDate = new Date(item.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + item.duration - 1);

        const firstDate = dates[0];
        const cellWidth = 60;

        const daysDiff = Math.floor((startDate - firstDate) / (1000 * 60 * 60 * 24));
        const left = daysDiff * cellWidth;
        const width = item.duration * cellWidth;

        const gridCells = dates.map(date => {
            const isToday = date.getTime() === today.getTime();
            return `<div class="timeline-grid-cell ${isToday ? 'today' : ''}"></div>`;
        }).join('');

        return `
      <div class="timeline-row">
        ${gridCells}
        <div class="timeline-bar" style="left: ${left}px; width: ${width}px; background: ${item.color};">
          <div class="timeline-bar-progress" style="width: ${item.progress}%;"></div>
          <div class="timeline-bar-text">${this.escapeHtml(item.name)}</div>
        </div>
      </div>
    `;
    }

    getDateRange() {
        const dates = [];
        const current = new Date(this.startDate);

        while (current <= this.endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }

    formatTimelineDate(date) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        switch (this.currentView) {
            case 'day':
                return `${date.getDate()}\n${days[date.getDay()]}`;
            case 'week':
                return `Week ${this.getWeekNumber(date)}`;
            case 'month':
                return `${months[date.getMonth()]}\n${date.getFullYear()}`;
            case 'year':
                return date.getFullYear().toString();
            default:
                return date.getDate().toString();
        }
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new GanttProApp();
