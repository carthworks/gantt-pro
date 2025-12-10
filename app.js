// ===== Data Management =====
class GanttApp {
  constructor() {
    this.projects = [];
    this.currentView = 'day';
    this.startDate = null;
    this.endDate = null;
    this.editingId = null;
    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.setDefaultDateRange();
    this.render();
  }

  loadData() {
    chrome.storage.local.get(['ganttProjects'], (result) => {
      if (result.ganttProjects) {
        this.projects = result.ganttProjects;
        this.render();
      } else {
        // Add sample data for demonstration
        this.addSampleData();
      }
    });
  }

  saveData() {
    chrome.storage.local.set({ ganttProjects: this.projects });
  }

  addSampleData() {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    this.projects = [
      {
        id: this.generateId(),
        name: 'Project1',
        startDate: formatDate(new Date(2025, 4, 1)),
        duration: 7,
        progress: 50,
        color: '#667eea',
        tasks: [
          {
            id: this.generateId(),
            name: 'Task#2',
            startDate: formatDate(new Date(2025, 4, 1)),
            duration: 2,
            progress: 95,
            color: '#667eea'
          },
          {
            id: this.generateId(),
            name: 'Task#3',
            startDate: formatDate(new Date(2025, 4, 3)),
            duration: 1,
            progress: 50,
            color: '#667eea'
          },
          {
            id: this.generateId(),
            name: 'New task',
            startDate: formatDate(new Date(2025, 4, 4)),
            duration: 1,
            progress: 100,
            color: '#667eea'
          }
        ]
      },
      {
        id: this.generateId(),
        name: 'Project#4',
        startDate: formatDate(new Date(2025, 4, 1)),
        duration: 3,
        progress: 75,
        color: '#f093fb',
        tasks: [
          {
            id: this.generateId(),
            name: 'New task',
            startDate: formatDate(new Date(2025, 4, 1)),
            duration: 8,
            progress: 0,
            color: '#f093fb'
          },
          {
            id: this.generateId(),
            name: 'New task',
            startDate: formatDate(new Date(2025, 4, 2)),
            duration: 1,
            progress: 0,
            color: '#f093fb'
          },
          {
            id: this.generateId(),
            name: 'New task',
            startDate: formatDate(new Date(2025, 4, 3)),
            duration: 1,
            progress: 0,
            color: '#f093fb'
          },
          {
            id: this.generateId(),
            name: 'New task',
            startDate: formatDate(new Date(2025, 4, 4)),
            duration: 1,
            progress: 0,
            color: '#f093fb'
          }
        ]
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
    start.setDate(1); // First day of month
    
    const end = new Date(today);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Last day of month
    
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

    // Print button
    document.getElementById('printBtn').addEventListener('click', () => {
      window.print();
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

    // Click outside modal to close
    document.getElementById('projectModal').addEventListener('click', (e) => {
      if (e.target.id === 'projectModal') {
        this.closeModal();
      }
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
  }

  openModal(projectId = null, isTask = false, parentProjectId = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    
    form.reset();
    
    if (projectId) {
      // Edit mode
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
      }
    } else {
      // Add mode
      document.getElementById('modalTitle').textContent = isTask ? 'New Task' : 'New Project';
      document.getElementById('projectProgress').value = 0;
      document.getElementById('progressValue').textContent = '0%';
      
      // Set default date to today
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
    
    const data = {
      id: id || this.generateId(),
      name: document.getElementById('projectName').value,
      startDate: document.getElementById('projectStart').value,
      duration: parseInt(document.getElementById('projectDuration').value),
      progress: parseInt(document.getElementById('projectProgress').value),
      color: document.getElementById('projectColor').value
    };

    if (id) {
      // Update existing
      this.updateItem(id, data);
    } else {
      // Add new
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
    
    // Check if it's a project
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      this.projects.splice(projectIndex, 1);
    } else {
      // Check if it's a task
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
  }

  render() {
    this.renderSidebar();
    this.renderGanttTable();
    this.renderTimeline();
  }

  renderSidebar() {
    const container = document.getElementById('projectsList');
    
    if (this.projects.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No Projects Yet</h3>
          <p>Click "Add Project" to get started</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.projects.map(project => `
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
    
    if (this.projects.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No projects to display
          </td>
        </tr>
      `;
      return;
    }
    
    let rows = '';
    
    this.projects.forEach(project => {
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

    // Add event listeners
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
    
    // Render header
    header.innerHTML = dates.map(date => {
      const isToday = date.getTime() === today.getTime();
      return `<div class="timeline-cell ${isToday ? 'today' : ''}">${this.formatTimelineDate(date)}</div>`;
    }).join('');
    
    // Render timeline rows
    if (this.projects.length === 0) {
      timeline.innerHTML = '';
      return;
    }
    
    let rows = '';
    
    this.projects.forEach(project => {
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
const app = new GanttApp();
