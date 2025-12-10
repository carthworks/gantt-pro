// ===== Enhanced Gantto Application =====
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
        this.showCriticalPath = false;
        this.criticalPathTasks = [];

        this.init();
    }

    init() {
        this.loadDataFromURL(); // Check for shared data in URL
        this.loadData();
        this.setupEventListeners();
        this.setupNLPEventListeners();
        this.setupTemplatesEventListeners();
        this.setupCollapsibleSections();
        this.setupCriticalPathEventListeners();
        this.setupHelpModal();
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
        end.setDate(0); // Last day of next month

        // Extend end date to complete the week (to Saturday)
        // This ensures we always show complete weeks
        const endDayOfWeek = end.getDay();
        if (endDayOfWeek !== 6) { // If not Saturday
            const daysToAdd = 6 - endDayOfWeek;
            end.setDate(end.getDate() + daysToAdd);
        }

        // Add a few more days to show continuity into next month
        end.setDate(end.getDate() + 7);

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
            const projectItems = document.querySelectorAll('.project-item');
            console.log('Expand All clicked, found', projectItems.length, 'projects');
            projectItems.forEach(item => {
                item.classList.add('expanded');
            });
        });

        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            const projectItems = document.querySelectorAll('.project-item');
            console.log('Collapse All clicked, found', projectItems.length, 'projects');
            projectItems.forEach(item => {
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

        // Settings button removed from UI
        // document.getElementById('settingsBtn').addEventListener('click', () => {
        //     document.getElementById('shortcutsModal').classList.add('active');
        // });


        document.getElementById('shareBtn').addEventListener('click', () => {
            document.getElementById('shareModal').classList.add('active');
        });

        // Add project button
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Add task button in header
        document.getElementById('addTaskBtnHeader').addEventListener('click', () => {
            this.showProjectSelectorForTask();
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

        document.getElementById('closeShareModal').addEventListener('click', () => {
            document.getElementById('shareModal').classList.remove('active');
            document.getElementById('shareLinkContainer').style.display = 'none';
        });

        // Help/Guide button
        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('guideModal').classList.add('active');
        });

        document.getElementById('closeGuideModal').addEventListener('click', () => {
            document.getElementById('guideModal').classList.remove('active');
        });

        // Project Selector Modal for Add Task
        document.getElementById('closeProjectSelectorModal').addEventListener('click', () => {
            document.getElementById('projectSelectorModal').classList.remove('active');
        });

        document.getElementById('cancelProjectSelector').addEventListener('click', () => {
            document.getElementById('projectSelectorModal').classList.remove('active');
        });

        document.getElementById('confirmProjectSelector').addEventListener('click', () => {
            const selector = document.getElementById('projectSelector');
            const selectedProjectId = selector.value;

            if (selectedProjectId) {
                document.getElementById('projectSelectorModal').classList.remove('active');
                this.openModal(null, true, selectedProjectId);
            } else {
                this.showNotification('Please select a project', 'error', 'Add Task');
            }
        });


        // Share functionality
        document.getElementById('copyJSONBtn').addEventListener('click', () => {
            this.copyJSONToClipboard();
        });

        document.getElementById('generateLinkBtn').addEventListener('click', () => {
            this.generateShareLink();
        });

        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
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

        if (totalItems === 0) {
            document.getElementById('completionRate').textContent = 'No tasks yet';
            document.getElementById('estimatedCompletion').textContent = 'Add tasks to see estimates';
            return;
        }

        // Improved velocity calculation based on project timeline
        const today = new Date();

        // Find the earliest project/task start date
        let earliestDate = new Date();
        allItems.forEach(item => {
            const itemDate = new Date(item.startDate);
            if (itemDate < earliestDate) {
                earliestDate = itemDate;
            }
        });

        // Calculate days elapsed since project start (minimum 1 day to avoid division by zero)
        const daysElapsed = Math.max(1, Math.ceil((today - earliestDate) / (1000 * 60 * 60 * 24)));

        // Completion rate: tasks completed per day
        const completionRate = daysElapsed > 0 ? (completedItems.length / daysElapsed).toFixed(2) : 0;

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
            document.getElementById('estimatedCompletion').textContent = 'Start completing tasks';
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

    openModal(projectId = null, isTask = false, parentProjectId = null, showProjectSelector = false) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const progressField = document.getElementById('projectProgress');
        const progressContainer = progressField.closest('.form-group');
        const projectSelectorField = document.getElementById('projectSelectorField');
        const parentProjectSelector = document.getElementById('parentProjectSelector');
        const nlpField = document.getElementById('nlpInputField');
        const traditionalFields = document.getElementById('traditionalFormFields');
        const nlpInput = document.getElementById('nlpInput');

        form.reset();
        this.populateDependenciesDropdown(projectId);

        // Reset NLP field
        if (nlpInput) {
            nlpInput.value = '';
            nlpInput.classList.remove('parsing', 'success', 'error');
        }

        // Handle project selector field visibility and population
        if (showProjectSelector && isTask && !parentProjectId) {
            // Show and populate project selector
            projectSelectorField.style.display = 'block';
            parentProjectSelector.innerHTML = '<option value="">Select a project...</option>';

            this.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.name} (${project.tasks ? project.tasks.length : 0} tasks)`;
                parentProjectSelector.appendChild(option);
            });
        } else {
            // Hide project selector
            projectSelectorField.style.display = 'none';
        }

        if (projectId) {
            // Editing existing item - hide NLP, show traditional form
            nlpField.style.display = 'none';
            traditionalFields.style.display = 'block';

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
            // Creating new item - show NLP field first
            nlpField.style.display = 'block';
            traditionalFields.style.display = 'none';

            document.getElementById('modalTitle').textContent = isTask ? 'New Task' : 'New Project';
            document.getElementById('projectProgress').value = 0;
            document.getElementById('progressValue').textContent = '0%';

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('projectStart').value = today;
            document.getElementById('projectDuration').value = 1;
        }

        document.getElementById('isTask').value = isTask;
        document.getElementById('parentProjectId').value = parentProjectId || '';

        // Disable progress field for projects (will be auto-calculated from tasks)
        // Enable for tasks (can be set manually)
        if (!isTask) {
            progressField.disabled = true;
            progressContainer.style.opacity = '0.6';
            progressContainer.title = 'Project progress is automatically calculated from its tasks';
        } else {
            progressField.disabled = false;
            progressContainer.style.opacity = '1';
            progressContainer.title = '';
        }

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

    showProjectSelectorForTask() {
        if (this.projects.length === 0) {
            this.showNotification('Please create a project first before adding tasks', 'info', 'Add Task');
            return;
        }

        // Open the modal as a new task with project selector
        this.openModal(null, true, null, true); // Pass true as 4th parameter to show project selector
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
        let parentProjectId = document.getElementById('parentProjectId').value;

        // If no parentProjectId is set, check the project selector dropdown
        // Only validate for NEW tasks (when id is empty)
        if (isTask && !parentProjectId && !id) {
            const parentProjectSelector = document.getElementById('parentProjectSelector');
            parentProjectId = parentProjectSelector.value;

            if (!parentProjectId) {
                this.showNotification('Please select a project for this task', 'error', 'Validation Error');
                return;
            }
        }


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

        // Validate task against parent project constraints
        if (isTask && parentProjectId) {
            const project = this.projects.find(p => p.id === parentProjectId);
            if (project) {
                const validation = this.validateTaskAgainstProject(data, project, id);
                if (!validation.valid) {
                    this.showNotification(validation.message, 'error', 'Validation Error');
                    return;
                }
            }
        }

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

        // Recalculate project progress from tasks
        this.recalculateProjectProgress();

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

    // Validate that task dates and duration fit within parent project
    validateTaskAgainstProject(task, project, taskId = null) {
        const projectStart = new Date(project.startDate);
        const projectEnd = new Date(projectStart);
        projectEnd.setDate(projectEnd.getDate() + project.duration - 1);

        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(taskStart);
        taskEnd.setDate(taskEnd.getDate() + task.duration - 1);

        // Check if task starts before project
        if (taskStart < projectStart) {
            return {
                valid: false,
                message: `Task cannot start before project start date (${this.formatDate(project.startDate)})`
            };
        }

        // Check if task ends after project
        if (taskEnd > projectEnd) {
            return {
                valid: false,
                message: `Task end date exceeds project end date (${this.formatDate(projectEnd.toISOString().split('T')[0])}). Adjust task duration or project duration.`
            };
        }

        // Check total duration of all tasks doesn't exceed project duration
        const otherTasks = project.tasks ? project.tasks.filter(t => t.id !== taskId) : [];
        const allTasks = [...otherTasks, task];

        // Find the earliest task start and latest task end
        let earliestStart = new Date(task.startDate);
        let latestEnd = new Date(taskEnd);

        allTasks.forEach(t => {
            const tStart = new Date(t.startDate);
            const tEnd = new Date(tStart);
            tEnd.setDate(tEnd.getDate() + t.duration - 1);

            if (tStart < earliestStart) earliestStart = tStart;
            if (tEnd > latestEnd) latestEnd = tEnd;
        });

        // Calculate total span needed for all tasks
        const totalSpanDays = Math.ceil((latestEnd - earliestStart) / (1000 * 60 * 60 * 24)) + 1;

        if (totalSpanDays > project.duration) {
            return {
                valid: false,
                message: `All tasks combined require ${totalSpanDays} days, but project duration is only ${project.duration} days. Please adjust task dates or increase project duration.`
            };
        }

        return { valid: true };
    }

    // Automatically calculate project progress from its tasks
    recalculateProjectProgress() {
        this.projects.forEach(project => {
            if (project.tasks && project.tasks.length > 0) {
                // Calculate average progress of all tasks
                const totalProgress = project.tasks.reduce((sum, task) => sum + task.progress, 0);
                project.progress = Math.round(totalProgress / project.tasks.length);
            }
            // If project has no tasks, keep its current progress (manual entry allowed)
        });
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

        // Recalculate project progress after deletion
        this.recalculateProjectProgress();

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
            <button class="add-task-btn" data-project-id="${project.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
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
        <tr data-id="${project.id}" class="task-row background-color: ${project.color};">
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

        let daysDiff, durationInUnits;

        switch (this.currentView) {
            case 'day':
                daysDiff = Math.floor((startDate - firstDate) / (1000 * 60 * 60 * 24));
                durationInUnits = item.duration;
                break;

            case 'week':
                daysDiff = Math.floor((startDate - firstDate) / (1000 * 60 * 60 * 24 * 7));
                durationInUnits = Math.ceil(item.duration / 7);
                break;

            case 'month':
                daysDiff = (startDate.getFullYear() - firstDate.getFullYear()) * 12 +
                    (startDate.getMonth() - firstDate.getMonth());
                durationInUnits = Math.ceil(item.duration / 30);
                break;

            case 'year':
                daysDiff = startDate.getFullYear() - firstDate.getFullYear();
                durationInUnits = Math.ceil(item.duration / 365);
                break;

            default:
                daysDiff = Math.floor((startDate - firstDate) / (1000 * 60 * 60 * 24));
                durationInUnits = item.duration;
        }

        const left = daysDiff * cellWidth;
        const width = Math.max(durationInUnits * cellWidth, cellWidth); // Minimum one cell width

        const gridCells = dates.map(date => {
            const isToday = date.getTime() === today.getTime();
            return `<div class="timeline-grid-cell ${isToday ? 'today' : ''}"></div>`;
        }).join('');

        // Check if this task is on the critical path
        const isCritical = this.showCriticalPath && this.criticalPathTasks.includes(item.id);
        const criticalClass = isCritical ? ' critical-path' : '';

        return `
      <div class="timeline-row">
        ${gridCells}
        <div class="timeline-bar${criticalClass}" style="left: ${left}px; width: ${width}px; background: ${item.color};">
          <div class="timeline-bar-progress" style="width: ${item.progress}%;"></div>
          <div class="timeline-bar-text">${this.escapeHtml(item.name)}</div>
        </div>
      </div>
    `;
    }

    getDateRange() {
        const dates = [];
        const current = new Date(this.startDate);
        const maxIterations = 1000; // Safety limit to prevent infinite loops
        let iterations = 0;

        switch (this.currentView) {
            case 'day':
                // Show each day
                while (current <= this.endDate && iterations < maxIterations) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                    iterations++;
                }
                break;

            case 'week':
                // Show start of each week
                // Move to the start of the week (Sunday)
                current.setDate(current.getDate() - current.getDay());
                while (current <= this.endDate && iterations < maxIterations) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 7);
                    iterations++;
                }
                break;

            case 'month':
                // Show start of each month
                current.setDate(1); // Move to first day of month
                while (current <= this.endDate && iterations < maxIterations) {
                    dates.push(new Date(current));
                    current.setMonth(current.getMonth() + 1);
                    iterations++;
                }
                break;

            case 'year':
                // Show start of each year
                current.setMonth(0, 1); // Move to January 1st
                while (current <= this.endDate && iterations < maxIterations) {
                    dates.push(new Date(current));
                    current.setFullYear(current.getFullYear() + 1);
                    iterations++;
                }
                break;

            default:
                // Default to day view
                while (current <= this.endDate && iterations < maxIterations) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                    iterations++;
                }
        }

        // Ensure we have at least some dates to show
        if (dates.length === 0) {
            const fallbackDate = new Date();
            for (let i = 0; i < 30; i++) {
                dates.push(new Date(fallbackDate));
                fallbackDate.setDate(fallbackDate.getDate() + 1);
            }
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
                // Show month abbreviation on the 1st of each month for clarity
                if (date.getDate() === 1) {
                    return `${months[date.getMonth()]} ${date.getDate()}\n${days[date.getDay()]}`;
                }
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

    // ===== SHARE FUNCTIONALITY =====

    copyJSONToClipboard() {
        const jsonData = JSON.stringify(this.projects, null, 2);
        navigator.clipboard.writeText(jsonData).then(() => {
            this.showNotification('JSON data copied to clipboard!', 'success', 'Share');
            document.getElementById('shareModal').classList.remove('active');
        }).catch(err => {
            this.showNotification('Failed to copy to clipboard', 'error', 'Share');
            console.error('Copy failed:', err);
        });
    }

    generateShareLink() {
        try {
            const jsonData = JSON.stringify(this.projects);
            const encodedData = btoa(encodeURIComponent(jsonData));
            const baseUrl = window.location.href.split('?')[0];
            const shareUrl = `${baseUrl}?data=${encodedData}`;

            document.getElementById('shareLink').value = shareUrl;
            document.getElementById('shareLinkContainer').style.display = 'block';

            this.showNotification('Share link generated!', 'success', 'Share');
        } catch (err) {
            this.showNotification('Failed to generate link', 'error', 'Share');
            console.error('Generate link failed:', err);
        }
    }

    copyShareLink() {
        const linkInput = document.getElementById('shareLink');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(() => {
            this.showNotification('Share link copied to clipboard!', 'success', 'Share');
        }).catch(err => {
            this.showNotification('Failed to copy link', 'error', 'Share');
            console.error('Copy link failed:', err);
        });
    }

    loadDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                const jsonData = decodeURIComponent(atob(encodedData));
                const importedProjects = JSON.parse(jsonData);

                if (confirm('This link contains shared Gantt chart data. Do you want to import it?')) {
                    this.projects = importedProjects;
                    this.saveData();
                    this.render();
                    this.updateStats();
                    this.showNotification('Shared data imported successfully!', 'success', 'Import');

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (err) {
                this.showNotification('Failed to load shared data', 'error', 'Import');
                console.error('Load from URL failed:', err);
            }
        }
    }

    // ===== NATURAL LANGUAGE PROCESSING =====

    parseNaturalLanguage(text) {
        const result = {
            name: '',
            startDate: '',
            duration: 1,
            progress: 0,
            color: '#667eea',
            description: ''
        };

        // Extract name (everything before date/duration keywords)
        const nameMatch = text.match(/^([^,]+?)(?=\s+(?:from|starting|for|on|,|duration|$))/i);
        if (nameMatch) {
            result.name = nameMatch[1].trim();
        }

        // Extract progress percentage
        const progressMatch = text.match(/(\d+)%\s*(?:done|complete|progress|finished)/i);
        if (progressMatch) {
            result.progress = Math.min(100, Math.max(0, parseInt(progressMatch[1])));
        }

        // Extract duration
        const durationMatch = text.match(/(?:for|duration:?)\s*(\d+)\s*(day|days|week|weeks|month|months)/i);
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();

            if (unit.startsWith('week')) {
                result.duration = value * 7;
            } else if (unit.startsWith('month')) {
                result.duration = value * 30;
            } else {
                result.duration = value;
            }
        }

        // Extract start date
        result.startDate = this.parseStartDate(text);

        // If no name was extracted, use a default
        if (!result.name) {
            result.name = 'New Task';
        }

        return result;
    }

    parseStartDate(text) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check for absolute date (YYYY-MM-DD or MM/DD/YYYY or DD-MM-YYYY)
        const absoluteDateMatch = text.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
        if (absoluteDateMatch) {
            const dateStr = absoluteDateMatch[0];
            let date;

            if (dateStr.match(/^\d{4}/)) {
                // YYYY-MM-DD format
                date = new Date(dateStr);
            } else {
                // Try to parse MM/DD/YYYY or DD/MM/YYYY
                const parts = dateStr.split(/[-/]/);
                // Assume MM/DD/YYYY for now
                date = new Date(parts[2], parts[0] - 1, parts[1]);
            }

            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }

        // Check for relative dates
        if (/\btoday\b/i.test(text)) {
            return today.toISOString().split('T')[0];
        }

        if (/\btomorrow\b/i.test(text)) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        if (/\bnext week\b/i.test(text)) {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        }

        if (/\bnext month\b/i.test(text)) {
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth.toISOString().split('T')[0];
        }

        // Check for specific weekdays (e.g., "next Monday")
        const weekdayMatch = text.match(/(?:next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        if (weekdayMatch) {
            const targetDay = weekdayMatch[1].toLowerCase();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDayIndex = days.indexOf(targetDay);
            const currentDayIndex = today.getDay();

            let daysToAdd = targetDayIndex - currentDayIndex;
            if (daysToAdd <= 0) {
                daysToAdd += 7; // Next week
            }

            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + daysToAdd);
            return targetDate.toISOString().split('T')[0];
        }

        // Check for "in X days/weeks"
        const inDaysMatch = text.match(/in\s+(\d+)\s+(day|days|week|weeks)/i);
        if (inDaysMatch) {
            const value = parseInt(inDaysMatch[1]);
            const unit = inDaysMatch[2].toLowerCase();
            const multiplier = unit.startsWith('week') ? 7 : 1;

            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + (value * multiplier));
            return futureDate.toISOString().split('T')[0];
        }

        // Default to today
        return today.toISOString().split('T')[0];
    }

    setupNLPEventListeners() {
        const parseBtn = document.getElementById('parseNLPBtn');
        const skipBtn = document.getElementById('skipNLPBtn');
        const nlpInput = document.getElementById('nlpInput');
        const nlpField = document.getElementById('nlpInputField');
        const traditionalFields = document.getElementById('traditionalFormFields');

        // Parse button
        if (parseBtn) {
            parseBtn.addEventListener('click', () => {
                const text = nlpInput.value.trim();

                if (!text) {
                    this.showNotification('Please enter a description', 'error', 'NLP Parser');
                    return;
                }

                // Add parsing animation
                nlpInput.classList.add('parsing');

                setTimeout(() => {
                    try {
                        const parsed = this.parseNaturalLanguage(text);

                        // Fill form fields
                        document.getElementById('projectName').value = parsed.name;
                        document.getElementById('projectStart').value = parsed.startDate;
                        document.getElementById('projectDuration').value = parsed.duration;
                        document.getElementById('projectProgress').value = parsed.progress;
                        document.getElementById('progressValue').textContent = parsed.progress + '%';
                        document.getElementById('projectColor').value = parsed.color;

                        // Show success state
                        nlpInput.classList.remove('parsing');
                        nlpInput.classList.add('success');

                        // Show traditional form
                        nlpField.style.display = 'none';
                        traditionalFields.style.display = 'block';

                        this.showNotification('Successfully parsed! Review and save.', 'success', 'NLP Parser');

                        // Remove success class after animation
                        setTimeout(() => {
                            nlpInput.classList.remove('success');
                        }, 2000);

                    } catch (error) {
                        nlpInput.classList.remove('parsing');
                        nlpInput.classList.add('error');
                        this.showNotification('Failed to parse. Try using an example format.', 'error', 'NLP Parser');

                        setTimeout(() => {
                            nlpInput.classList.remove('error');
                        }, 2000);
                    }
                }, 500); // Simulate processing time
            });
        }

        // Skip button - show traditional form
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                nlpField.style.display = 'none';
                traditionalFields.style.display = 'block';
            });
        }

        // Example tags
        document.querySelectorAll('.nlp-example-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                nlpInput.value = tag.dataset.example;
                nlpInput.focus();
            });
        });
    }

    // ===== TEMPLATES & LEARNING =====

    getBuiltInTemplates() {
        const today = new Date().toISOString().split('T')[0];

        return [
            {
                id: 'web-dev',
                name: 'Web Development Project',
                icon: '💻',
                category: 'Development',
                description: 'Complete web application development with frontend, backend, and deployment phases',
                tasks: [
                    { name: 'Requirements Gathering', duration: 5, progress: 0 },
                    { name: 'UI/UX Design', duration: 7, progress: 0 },
                    { name: 'Frontend Development', duration: 14, progress: 0 },
                    { name: 'Backend API Development', duration: 14, progress: 0 },
                    { name: 'Database Setup', duration: 3, progress: 0 },
                    { name: 'Integration & Testing', duration: 7, progress: 0 },
                    { name: 'Deployment & Launch', duration: 3, progress: 0 }
                ],
                totalDuration: 53,
                estimatedDays: 53
            },
            {
                id: 'marketing-campaign',
                name: 'Marketing Campaign',
                icon: '📢',
                category: 'Marketing',
                description: 'Launch a comprehensive marketing campaign from planning to execution',
                tasks: [
                    { name: 'Market Research', duration: 5, progress: 0 },
                    { name: 'Strategy Development', duration: 3, progress: 0 },
                    { name: 'Content Creation', duration: 10, progress: 0 },
                    { name: 'Design Assets', duration: 7, progress: 0 },
                    { name: 'Campaign Setup', duration: 3, progress: 0 },
                    { name: 'Launch & Monitor', duration: 14, progress: 0 },
                    { name: 'Analysis & Reporting', duration: 3, progress: 0 }
                ],
                totalDuration: 45,
                estimatedDays: 45
            },
            {
                id: 'product-launch',
                name: 'Product Launch',
                icon: '🚀',
                category: 'Product',
                description: 'End-to-end product launch from development to market release',
                tasks: [
                    { name: 'Product Development', duration: 30, progress: 0 },
                    { name: 'Beta Testing', duration: 14, progress: 0 },
                    { name: 'Marketing Materials', duration: 10, progress: 0 },
                    { name: 'Pre-launch Campaign', duration: 7, progress: 0 },
                    { name: 'Launch Event', duration: 1, progress: 0 },
                    { name: 'Post-launch Support', duration: 14, progress: 0 }
                ],
                totalDuration: 76,
                estimatedDays: 76
            },
            {
                id: 'software-release',
                name: 'Software Release Cycle',
                icon: '⚙️',
                category: 'Development',
                description: 'Complete software release cycle with development, testing, and deployment',
                tasks: [
                    { name: 'Sprint Planning', duration: 2, progress: 0 },
                    { name: 'Feature Development', duration: 10, progress: 0 },
                    { name: 'Code Review', duration: 2, progress: 0 },
                    { name: 'QA Testing', duration: 5, progress: 0 },
                    { name: 'Bug Fixes', duration: 3, progress: 0 },
                    { name: 'Release Preparation', duration: 2, progress: 0 },
                    { name: 'Deployment', duration: 1, progress: 0 }
                ],
                totalDuration: 25,
                estimatedDays: 25
            },
            {
                id: 'event-planning',
                name: 'Event Planning',
                icon: '🎉',
                category: 'Events',
                description: 'Organize and execute a successful event from concept to completion',
                tasks: [
                    { name: 'Concept & Budget', duration: 3, progress: 0 },
                    { name: 'Venue Booking', duration: 5, progress: 0 },
                    { name: 'Vendor Coordination', duration: 7, progress: 0 },
                    { name: 'Marketing & Promotion', duration: 14, progress: 0 },
                    { name: 'Logistics Planning', duration: 5, progress: 0 },
                    { name: 'Event Execution', duration: 1, progress: 0 },
                    { name: 'Post-event Follow-up', duration: 3, progress: 0 }
                ],
                totalDuration: 38,
                estimatedDays: 38
            },
            {
                id: 'content-creation',
                name: 'Content Creation Series',
                icon: '✍️',
                category: 'Content',
                description: 'Create and publish a series of high-quality content pieces',
                tasks: [
                    { name: 'Topic Research', duration: 3, progress: 0 },
                    { name: 'Content Outline', duration: 2, progress: 0 },
                    { name: 'Writing & Drafting', duration: 10, progress: 0 },
                    { name: 'Editing & Review', duration: 5, progress: 0 },
                    { name: 'Design & Formatting', duration: 3, progress: 0 },
                    { name: 'SEO Optimization', duration: 2, progress: 0 },
                    { name: 'Publishing & Promotion', duration: 2, progress: 0 }
                ],
                totalDuration: 27,
                estimatedDays: 27
            }
        ];
    }

    loadCustomTemplates() {
        const stored = localStorage.getItem('gantt_custom_templates');
        return stored ? JSON.parse(stored) : [];
    }

    saveCustomTemplates(templates) {
        localStorage.setItem('gantt_custom_templates', JSON.stringify(templates));
    }

    applyTemplate(template) {
        const startDate = new Date();
        const project = {
            id: this.generateId(),
            name: template.name,
            startDate: startDate.toISOString().split('T')[0],
            duration: template.totalDuration || template.estimatedDays,
            progress: 0,
            color: '#667eea',
            description: template.description || '',
            tasks: []
        };

        let currentDate = new Date(startDate);
        template.tasks.forEach((taskTemplate, index) => {
            const task = {
                id: this.generateId(),
                name: taskTemplate.name,
                startDate: currentDate.toISOString().split('T')[0],
                duration: taskTemplate.duration,
                progress: taskTemplate.progress || 0,
                color: this.getTaskColor(index),
                description: taskTemplate.description || '',
                dependencies: []
            };

            project.tasks.push(task);
            currentDate.setDate(currentDate.getDate() + taskTemplate.duration);
        });

        this.projects.push(project);
        this.saveData();
        this.render();
        this.updateStats();

        this.showNotification(`Template "${template.name}" applied successfully!`, 'success', 'Templates');
        document.getElementById('templatesModal').classList.remove('active');
    }

    getTaskColor(index) {
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
        return colors[index % colors.length];
    }

    saveCurrentAsTemplate() {
        if (this.projects.length === 0) {
            this.showNotification('No projects to save as template', 'error', 'Templates');
            return;
        }

        const templateName = prompt('Enter a name for this template:');
        if (!templateName) return;

        const template = {
            id: this.generateId(),
            name: templateName,
            icon: '📁',
            category: 'Custom',
            description: 'Custom template created from your projects',
            tasks: [],
            totalDuration: 0,
            createdAt: new Date().toISOString()
        };

        this.projects.forEach(project => {
            if (project.tasks && project.tasks.length > 0) {
                project.tasks.forEach(task => {
                    template.tasks.push({
                        name: task.name,
                        duration: task.duration,
                        progress: 0,
                        description: task.description || ''
                    });
                    template.totalDuration += task.duration;
                });
            }
        });

        const customTemplates = this.loadCustomTemplates();
        customTemplates.push(template);
        this.saveCustomTemplates(customTemplates);

        this.renderCustomTemplates();
        this.showNotification('Template saved successfully!', 'success', 'Templates');
    }

    deleteCustomTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        let customTemplates = this.loadCustomTemplates();
        customTemplates = customTemplates.filter(t => t.id !== templateId);
        this.saveCustomTemplates(customTemplates);

        this.renderCustomTemplates();
        this.showNotification('Template deleted', 'info', 'Templates');
    }

    generateLearningInsights() {
        const insights = [];

        // Analyze average task duration by name similarity
        const taskDurations = {};
        this.projects.forEach(project => {
            if (project.tasks) {
                project.tasks.forEach(task => {
                    const key = task.name.toLowerCase().trim();
                    if (!taskDurations[key]) {
                        taskDurations[key] = [];
                    }
                    taskDurations[key].push(task.duration);
                });
            }
        });

        // Find patterns
        const patterns = Object.entries(taskDurations)
            .filter(([name, durations]) => durations.length >= 2)
            .map(([name, durations]) => {
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                const min = Math.min(...durations);
                const max = Math.max(...durations);
                return { name, avg: Math.round(avg), min, max, count: durations.length };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        if (patterns.length > 0) {
            insights.push({
                type: 'duration-patterns',
                title: 'Task Duration Patterns',
                icon: '⏱️',
                content: `Based on ${this.projects.length} projects, we've identified common task duration patterns.`,
                patterns: patterns,
                recommendations: patterns.map(p =>
                    `"${p.name}" typically takes ${p.avg} days (range: ${p.min}-${p.max} days)`
                )
            });
        }

        // Analyze project completion rates
        const completedProjects = this.projects.filter(p => p.progress === 100).length;
        const inProgressProjects = this.projects.filter(p => p.progress > 0 && p.progress < 100).length;
        const notStartedProjects = this.projects.filter(p => p.progress === 0).length;

        if (this.projects.length > 0) {
            insights.push({
                type: 'completion-stats',
                title: 'Project Completion Statistics',
                icon: '📊',
                content: `You have completed ${completedProjects} out of ${this.projects.length} projects.`,
                stats: {
                    completed: completedProjects,
                    inProgress: inProgressProjects,
                    notStarted: notStartedProjects,
                    completionRate: Math.round((completedProjects / this.projects.length) * 100)
                },
                recommendations: [
                    completionRate > 70 ? 'Great job! You have a high completion rate.' : 'Consider breaking down projects into smaller tasks for better completion rates.',
                    inProgressProjects > 5 ? 'You have many projects in progress. Focus on completing a few before starting new ones.' : 'Good balance of active projects.'
                ]
            });
        }

        // Analyze average project duration
        if (this.projects.length > 0) {
            const avgDuration = Math.round(
                this.projects.reduce((sum, p) => sum + p.duration, 0) / this.projects.length
            );

            insights.push({
                type: 'duration-insights',
                title: 'Project Duration Insights',
                icon: '📅',
                content: `Your average project duration is ${avgDuration} days.`,
                stats: {
                    avgDuration: avgDuration,
                    shortestProject: Math.min(...this.projects.map(p => p.duration)),
                    longestProject: Math.max(...this.projects.map(p => p.duration))
                },
                recommendations: [
                    avgDuration > 60 ? 'Consider breaking long projects into phases for better tracking.' : 'Your project durations are well-sized.',
                    'Use templates to standardize similar project timelines.'
                ]
            });
        }

        return insights;
    }

    renderBuiltInTemplates() {
        const grid = document.getElementById('builtInTemplatesGrid');
        const templates = this.getBuiltInTemplates();

        grid.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon">${template.icon}</div>
                    <span class="template-badge">${template.category}</span>
                </div>
                <h4 class="template-title">${template.name}</h4>
                <p class="template-description">${template.description}</p>
                <div class="template-meta">
                    <div class="template-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        ${template.tasks.length} tasks
                    </div>
                    <div class="template-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${template.estimatedDays} days
                    </div>
                </div>
                <div class="template-actions">
                    <button class="template-action-btn use-template" data-template-id="${template.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Use Template
                    </button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        grid.querySelectorAll('.use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.dataset.templateId;
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    this.applyTemplate(template);
                }
            });
        });
    }

    renderCustomTemplates() {
        const grid = document.getElementById('customTemplatesGrid');
        const templates = this.loadCustomTemplates();

        if (templates.length === 0) {
            grid.innerHTML = `
                <div class="templates-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    </svg>
                    <h4>No Custom Templates Yet</h4>
                    <p>Save your current projects as templates to reuse them later</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon">${template.icon}</div>
                    <span class="template-badge">${template.category}</span>
                </div>
                <h4 class="template-title">${template.name}</h4>
                <p class="template-description">${template.description}</p>
                <div class="template-meta">
                    <div class="template-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        ${template.tasks.length} tasks
                    </div>
                    <div class="template-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${template.totalDuration} days
                    </div>
                </div>
                <div class="template-actions">
                    <button class="template-action-btn use-template" data-template-id="${template.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Use
                    </button>
                    <button class="template-action-btn delete-template" data-template-id="${template.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        grid.querySelectorAll('.use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.dataset.templateId;
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    this.applyTemplate(template);
                }
            });
        });

        grid.querySelectorAll('.delete-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.dataset.templateId;
                this.deleteCustomTemplate(templateId);
            });
        });
    }

    renderLearningInsights() {
        const container = document.getElementById('insightsContainer');
        const insights = this.generateLearningInsights();

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="templates-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <h4>Not Enough Data Yet</h4>
                    <p>Create more projects to unlock learning insights and recommendations</p>
                </div>
            `;
            return;
        }

        container.innerHTML = insights.map(insight => {
            let statsHTML = '';
            let recommendationsHTML = '';

            if (insight.stats) {
                statsHTML = `
                    <div class="insight-stats">
                        ${Object.entries(insight.stats).map(([key, value]) => `
                            <div class="insight-stat">
                                <div class="insight-stat-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div class="insight-stat-value">${typeof value === 'number' && key.includes('Rate') ? value + '%' : value}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (insight.recommendations && insight.recommendations.length > 0) {
                recommendationsHTML = `
                    <div class="insight-recommendations">
                        <h4>💡 Recommendations</h4>
                        <ul>
                            ${insight.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            return `
                <div class="insight-card">
                    <div class="insight-header">
                        <div class="insight-icon">${insight.icon}</div>
                        <h3 class="insight-title">${insight.title}</h3>
                    </div>
                    <p class="insight-content">${insight.content}</p>
                    ${statsHTML}
                    ${recommendationsHTML}
                </div>
            `;
        }).join('');
    }

    setupTemplatesEventListeners() {
        // Templates button
        const templatesBtn = document.getElementById('templatesBtn');
        if (templatesBtn) {
            templatesBtn.addEventListener('click', () => {
                document.getElementById('templatesModal').classList.add('active');
                this.renderBuiltInTemplates();
                this.renderCustomTemplates();
                this.renderLearningInsights();
            });
        }

        // Close modal
        const closeBtn = document.getElementById('closeTemplatesModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('templatesModal').classList.remove('active');
            });
        }

        // Tab switching
        document.querySelectorAll('.template-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Update active tab
                document.querySelectorAll('.template-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                document.querySelectorAll('.template-content').forEach(c => c.classList.remove('active'));

                if (tabName === 'built-in') {
                    document.getElementById('builtInTemplates').classList.add('active');
                } else if (tabName === 'custom') {
                    document.getElementById('customTemplates').classList.add('active');
                    this.renderCustomTemplates();
                } else if (tabName === 'learned') {
                    document.getElementById('learningInsights').classList.add('active');
                    this.renderLearningInsights();
                }
            });
        });

        // Save as template button
        const saveTemplateBtn = document.getElementById('saveAsTemplateBtn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                this.saveCurrentAsTemplate();
            });
        }
    }

    // ===== CRITICAL PATH HIGHLIGHTING =====

    calculateCriticalPath() {
        const allTasks = [];
        const criticalPathData = {
            tasks: [],
            duration: 0,
            count: 0
        };

        // Collect all tasks from all projects
        this.projects.forEach(project => {
            if (project.tasks && project.tasks.length > 0) {
                project.tasks.forEach(task => {
                    allTasks.push({
                        ...task,
                        projectId: project.id,
                        projectName: project.name
                    });
                });
            }
        });

        if (allTasks.length === 0) {
            return criticalPathData;
        }

        // Build dependency graph
        const taskMap = new Map();
        allTasks.forEach(task => {
            taskMap.set(task.id, {
                ...task,
                earliestStart: 0,
                earliestFinish: 0,
                latestStart: Infinity,
                latestFinish: Infinity,
                slack: 0,
                isCritical: false
            });
        });

        // Calculate earliest start and finish times (forward pass)
        const calculateEarliestTimes = () => {
            let changed = true;
            while (changed) {
                changed = false;
                taskMap.forEach((task, taskId) => {
                    let maxPredecessorFinish = 0;

                    if (task.dependencies && task.dependencies.length > 0) {
                        task.dependencies.forEach(depId => {
                            const predecessor = taskMap.get(depId);
                            if (predecessor) {
                                maxPredecessorFinish = Math.max(
                                    maxPredecessorFinish,
                                    predecessor.earliestFinish
                                );
                            }
                        });
                    }

                    const newEarliestStart = maxPredecessorFinish;
                    const newEarliestFinish = newEarliestStart + task.duration;

                    if (newEarliestStart !== task.earliestStart ||
                        newEarliestFinish !== task.earliestFinish) {
                        task.earliestStart = newEarliestStart;
                        task.earliestFinish = newEarliestFinish;
                        changed = true;
                    }
                });
            }
        };

        // Calculate latest start and finish times (backward pass)
        const calculateLatestTimes = (projectDuration) => {
            // Initialize latest times for tasks with no successors
            taskMap.forEach(task => {
                let hasSuccessors = false;
                taskMap.forEach(otherTask => {
                    if (otherTask.dependencies && otherTask.dependencies.includes(task.id)) {
                        hasSuccessors = true;
                    }
                });

                if (!hasSuccessors) {
                    task.latestFinish = projectDuration;
                    task.latestStart = task.latestFinish - task.duration;
                }
            });

            // Backward pass
            let changed = true;
            while (changed) {
                changed = false;
                taskMap.forEach((task, taskId) => {
                    let minSuccessorStart = task.latestFinish;

                    taskMap.forEach(otherTask => {
                        if (otherTask.dependencies && otherTask.dependencies.includes(taskId)) {
                            minSuccessorStart = Math.min(
                                minSuccessorStart,
                                otherTask.latestStart
                            );
                        }
                    });

                    const newLatestFinish = minSuccessorStart;
                    const newLatestStart = newLatestFinish - task.duration;

                    if (newLatestFinish !== task.latestFinish ||
                        newLatestStart !== task.latestStart) {
                        task.latestFinish = newLatestFinish;
                        task.latestStart = newLatestStart;
                        changed = true;
                    }
                });
            }
        };

        // Calculate times
        calculateEarliestTimes();

        // Find project duration (maximum earliest finish)
        let projectDuration = 0;
        taskMap.forEach(task => {
            projectDuration = Math.max(projectDuration, task.earliestFinish);
        });

        calculateLatestTimes(projectDuration);

        // Calculate slack and identify critical tasks
        const criticalTasks = [];
        taskMap.forEach((task, taskId) => {
            task.slack = task.latestStart - task.earliestStart;

            // Tasks with zero or near-zero slack are on the critical path
            if (task.slack <= 0.01) {
                task.isCritical = true;
                criticalTasks.push(taskId);
            }
        });

        // If no dependencies exist, find the longest chain by duration
        if (criticalTasks.length === 0) {
            // Find tasks with longest duration
            let maxDuration = 0;
            allTasks.forEach(task => {
                maxDuration = Math.max(maxDuration, task.duration);
            });

            allTasks.forEach(task => {
                if (task.duration === maxDuration) {
                    criticalTasks.push(task.id);
                    const taskData = taskMap.get(task.id);
                    if (taskData) {
                        taskData.isCritical = true;
                    }
                }
            });
        }

        criticalPathData.tasks = criticalTasks;
        criticalPathData.duration = projectDuration;
        criticalPathData.count = criticalTasks.length;

        return criticalPathData;
    }

    toggleCriticalPath() {
        this.showCriticalPath = !this.showCriticalPath;

        const btn = document.getElementById('toggleCriticalPath');
        const btnText = document.getElementById('criticalPathBtnText');
        const info = document.getElementById('criticalPathInfo');

        if (this.showCriticalPath) {
            // Calculate critical path
            const criticalPath = this.calculateCriticalPath();
            this.criticalPathTasks = criticalPath.tasks;

            // Update button
            btn.classList.add('active');
            btnText.textContent = 'Hide Critical Path';

            // Show info
            info.style.display = 'block';
            document.getElementById('criticalTaskCount').textContent = criticalPath.count;
            document.getElementById('criticalPathDuration').textContent = `${criticalPath.duration} days`;

            // Show notification
            this.showNotification(
                `Critical path identified: ${criticalPath.count} task(s) highlighted`,
                'success',
                'Critical Path'
            );
        } else {
            // Hide critical path
            this.criticalPathTasks = [];

            // Update button
            btn.classList.remove('active');
            btnText.textContent = 'Show Critical Path';

            // Hide info
            info.style.display = 'none';
        }

        // Re-render to apply/remove highlighting
        this.render();
    }

    // ===== COLLAPSIBLE SECTIONS =====

    setupCollapsibleSections() {
        const collapsibleHeaders = document.querySelectorAll('.intelligence-header.collapsible');

        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.intelligence-section');
                const isCollapsed = section.classList.contains('collapsed');

                if (isCollapsed) {
                    // Expand
                    section.classList.remove('collapsed');
                    header.classList.remove('collapsed');
                } else {
                    // Collapse
                    section.classList.add('collapsed');
                    header.classList.add('collapsed');
                }

                // Save state to localStorage
                const sectionName = header.dataset.section;
                if (sectionName) {
                    localStorage.setItem(`section-${sectionName}-collapsed`, !isCollapsed);
                }
            });

            // Restore collapsed state from localStorage
            const sectionName = header.dataset.section;
            if (sectionName) {
                const wasCollapsed = localStorage.getItem(`section-${sectionName}-collapsed`) === 'true';
                if (wasCollapsed) {
                    const section = header.closest('.intelligence-section');
                    section.classList.add('collapsed');
                    header.classList.add('collapsed');
                }
            }
        });
    }

    setupCriticalPathEventListeners() {
        const toggleBtn = document.getElementById('toggleCriticalPath');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCriticalPath();
            });
        }
    }

    // ===== HELP MODAL =====

    setupHelpModal() {
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpModal = document.getElementById('closeHelpModal');

        if (!helpBtn || !helpModal || !closeHelpModal) {
            return; // Safety check
        }

        // Remove any existing listeners by cloning (prevents duplicates)
        const newHelpBtn = helpBtn.cloneNode(true);
        helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);

        // Open help modal
        newHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            helpModal.classList.add('active');
        });

        // Close help modal
        closeHelpModal.addEventListener('click', () => {
            helpModal.classList.remove('active');
        });

        // Close on outside click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.remove('active');
            }
        });

        // Tab switching for help modal
        const helpTabs = helpModal.querySelectorAll('.template-tab');
        helpTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Update active tab
                helpTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                helpModal.querySelectorAll('.template-content').forEach(c => c.classList.remove('active'));

                if (tabName === 'getting-started') {
                    document.getElementById('gettingStartedContent').classList.add('active');
                } else if (tabName === 'new-features') {
                    document.getElementById('newFeaturesContent').classList.add('active');
                } else if (tabName === 'tips') {
                    document.getElementById('tipsContent').classList.add('active');
                }
            });
        });
    }
}

// Initialize app
const app = new GanttProApp();
