# 🎯 Gantto v2.0 - Professional Project Timeline Manager

**A premium fullscreen Chrome extension for advanced Gantt chart creation and project management**

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/chrome-88%2B-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

---

## 🌟 What's New in v2.0

### Fullscreen Experience
- Opens in a **full browser tab** instead of popup
- Professional workspace layout
- Maximized viewing area

### 13+ New Premium Features
✅ **Real-time Search** - Find projects and tasks instantly  
✅ **Advanced Filters** - Filter by progress and status  
✅ **Project Statistics** - Live stats dashboard  
✅ **Export/Import** - JSON and CSV support  
✅ **Dependencies** - Link related tasks  
✅ **Table Sorting** - Sort by any column  
✅ **Zoom Controls** - 50% to 200% zoom  
✅ **Keyboard Shortcuts** - 8+ shortcuts  
✅ **Notifications** - In-app toast messages  
✅ **Collapsible Sidebar** - Maximize chart space  
✅ **Enhanced Toolbar** - Quick actions  
✅ **Description Fields** - Add detailed notes  
✅ **Sidebar Toggle** - Show/hide projects list  

---

## 📸 Screenshots

### Fullscreen Interface
The extension now opens in a full browser tab with a professional layout:
- **Header**: Search, filters, view controls, date range, action buttons
- **Sidebar**: Project stats, project/task list
- **Main Area**: Gantt table and timeline
- **Toolbar**: Expand/collapse, today, zoom controls

### Key Features Visible
- Search bar in header (top left)
- Filter button with badge (top right)
- Statistics cards in sidebar
- Toolbar above Gantt table
- Zoom controls in toolbar
- Export/import icons in header

---

## 🚀 Quick Start

### Installation

1. **Download/Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable** "Developer mode" (toggle in top-right)
4. **Click** "Load unpacked"
5. **Select** the `gantt-chrart-pro` folder
6. **Click** the Gantto icon in your toolbar

The extension will open in a **new fullscreen tab**!

---

## ✨ Features Overview

### 🔍 Search & Filter
- **Real-time search** across all projects and tasks
- **Progress filters**: 0-25%, 26-50%, 51-75%, 76-100%
- **Status filters**: Not Started, In Progress, Completed
- **Filter badge** shows active filter count
- **Keyboard shortcut**: `Ctrl/Cmd + F` for search

### 📊 Statistics Dashboard
- **Total Projects** counter
- **Total Tasks** counter
- **Average Progress** percentage
- Beautiful gradient stat cards
- Real-time updates

### 💾 Data Management
- **Export as JSON** - Full data backup
- **Export as CSV** - Spreadsheet compatible
- **Import JSON** - Restore from backup
- **Auto-save** to Chrome storage
- **Keyboard shortcut**: `Ctrl/Cmd + E` for export

### 🔗 Dependencies
- Link projects and tasks together
- Multi-select dropdown in edit modal
- Dependency count badge in table
- Visual indicators

### ⬆️⬇️ Table Sorting
- Click any column header to sort
- Sort by: Name, Start Date, Duration, Progress
- Ascending/Descending toggle
- Visual sort indicators

### 🔍 Zoom Controls
- Zoom range: 50% - 200%
- Zoom in/out buttons in toolbar
- Current zoom level display
- **Keyboard shortcuts**: `Ctrl/Cmd + +/-`

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New Project |
| `Ctrl/Cmd + F` | Focus Search |
| `Ctrl/Cmd + P` | Print |
| `Ctrl/Cmd + E` | Export |
| `Ctrl/Cmd + +` | Zoom In |
| `Ctrl/Cmd + -` | Zoom Out |
| `Escape` | Close Modal |
| `?` | Show Shortcuts |

### 🔔 Notifications
- Success notifications (green)
- Error notifications (red)
- Info notifications (blue)
- Auto-dismiss after 3 seconds
- Smooth slide-in animation

### 🛠️ Toolbar Actions
- **Expand All** - Open all project tasks
- **Collapse All** - Close all project tasks
- **Today** - Jump to current date range
- **Zoom Controls** - Adjust timeline scale

---

## 📖 Usage Guide

### Creating Projects

1. Click **"Add Project"** in sidebar
2. Fill in details:
   - Name (required)
   - Start Date (required)
   - Duration in days (required)
   - Progress percentage (0-100%)
   - Color (6 presets + custom)
   - Description (optional)
   - Dependencies (optional)
3. Click **"Save"**

### Adding Tasks

1. Click on a project to expand it
2. Click **"Add Task"**
3. Fill in task details (same as project)
4. Click **"Save"**

### Searching

1. Click search bar or press `Ctrl/Cmd + F`
2. Type project or task name
3. Results filter in real-time
4. Click **X** to clear search

### Filtering

1. Click **"Filters"** button
2. Select desired filters:
   - Progress ranges
   - Status types
3. Click **"Apply"**
4. Click **"Clear All"** to reset

### Exporting Data

1. Click export icon or press `Ctrl/Cmd + E`
2. Choose **JSON** or **CSV**
3. File downloads automatically

### Importing Data

1. Click import icon
2. Select JSON file
3. Confirm replacement
4. Data loads instantly

### Zooming Timeline

1. Use zoom buttons in toolbar
2. Or press `Ctrl/Cmd + +/-`
3. Range: 50% - 200%

### Sorting Table

1. Click any column header
2. Click again to reverse sort
3. Arrow shows current direction

---

## 🎨 Customization

### Color Schemes

6 preset colors available:
- **Purple** `#667eea` - Default
- **Pink** `#f093fb` - High priority
- **Blue** `#4facfe` - Development
- **Green** `#43e97b` - Completed
- **Rose** `#fa709a` - Design
- **Yellow** `#feca57` - Review

Plus custom color picker for any color!

### View Modes

- **Day** - Individual days with day names
- **Week** - Week numbers
- **Month** - Month names and years
- **Year** - Year numbers

### Date Ranges

- Use date pickers to set custom range
- Click **"Today"** to jump to current month
- Timeline updates automatically

---

## 🔧 Technical Details

### Technologies
- **HTML5** - Semantic structure
- **CSS3** - Modern styling (1400+ lines)
- **Vanilla JavaScript** - No dependencies (1000+ lines)
- **Chrome Storage API** - Data persistence
- **Chrome Extension Manifest V3** - Latest format

### Browser Support
- Chrome 88+
- Edge 88+ (Chromium-based)
- Opera 74+
- Brave (Chromium-based)

### Performance
- **Fast rendering** for large datasets
- **Smooth animations** (hardware-accelerated)
- **Instant search** (debounced filtering)
- **Efficient storage** (Chrome local storage)
- **Responsive** design

---

## 📁 Project Structure

```
gantt-chrart-pro/
├── manifest.json              # Extension configuration (v2.0)
├── background.js              # Service worker for fullscreen
├── index.html                 # Main fullscreen interface
├── popup.html                 # Legacy popup (v1.0)
├── styles-fullscreen.css      # Fullscreen styles (1400+ lines)
├── styles.css                 # Legacy popup styles
├── app-fullscreen.js          # Fullscreen logic (1000+ lines)
├── app.js                     # Legacy popup logic
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md                  # This file
├── INSTALL.md                 # Quick installation guide
├── FEATURES.md                # Detailed feature overview
├── FULLSCREEN-FEATURES.md     # v2.0 new features
└── PROJECT_SUMMARY.md         # Project completion summary
```

---

## 🎯 Use Cases

### Perfect For:
- **Project Managers** - Track multiple projects and deadlines
- **Developers** - Plan sprint timelines and milestones
- **Freelancers** - Manage client projects and deliverables
- **Students** - Organize assignments and study schedules
- **Teams** - Visualize team workload and dependencies
- **Personal** - Plan events, renovations, or goals

### Example Workflows:

**Software Development**:
```
Project: Website Redesign
├── Design Mockups (3 days, 100%)
├── Frontend Development (5 days, 60%)
├── Backend Integration (4 days, 20%)
└── Testing & QA (2 days, 0%)
```

**Event Planning**:
```
Project: Conference 2025
├── Venue Booking (1 day, 100%)
├── Speaker Invitations (7 days, 80%)
├── Marketing Campaign (14 days, 50%)
└── Registration Setup (3 days, 30%)
```

---

## 🔒 Privacy & Security

### Data Storage
- **Local only** - All data stored in browser
- **No external servers** - No data transmitted
- **No tracking** - No analytics or tracking
- **Secure** - Uses Chrome's secure storage API

### Permissions
- **storage** - For saving project data
- **tabs** - For opening fullscreen tab
- **No network** - No internet access required
- **No host permissions** - Doesn't access web pages

---

## 🐛 Troubleshooting

### Extension Not Loading
- Ensure Developer Mode is enabled
- Check for errors in `chrome://extensions/`
- Verify all files are present
- Try reloading the extension

### Data Not Saving
- Check Chrome storage permissions
- Clear browser cache
- Check browser console for errors
- Try exporting and re-importing data

### Timeline Not Displaying
- Ensure date range is set correctly
- Verify projects have valid start dates
- Check that duration values are positive
- Try clicking "Today" button

### Search Not Working
- Clear search and try again
- Check for JavaScript errors
- Reload the extension
- Try different search terms

---

## 🚀 Future Enhancements

Planned features for future versions:
- [ ] Drag-and-drop timeline bars
- [ ] Gantt chart PDF export
- [ ] Resource allocation
- [ ] Multiple project views
- [ ] Collaboration features
- [ ] Dark/Light theme toggle
- [ ] Undo/Redo functionality
- [ ] Critical path highlighting
- [ ] Milestone markers
- [ ] Custom fields

---

## 📄 License

This project is open source and available for personal and commercial use.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 📧 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting section

---

## 🎉 Acknowledgments

Built with:
- ❤️ Love for project management
- ☕ Lots of coffee
- 🎨 Modern web design principles
- 🚀 Performance optimization

---

## 📊 Version History

### v2.0.0 (Current)
- ✨ Fullscreen interface
- ✨ Search functionality
- ✨ Advanced filters
- ✨ Project statistics
- ✨ Export/Import (JSON, CSV)
- ✨ Dependencies management
- ✨ Table sorting
- ✨ Zoom controls
- ✨ Keyboard shortcuts
- ✨ Notifications system
- ✨ Collapsible sidebar
- ✨ Enhanced toolbar
- ✨ Description fields

### v1.0.0
- ✅ Basic Gantt chart
- ✅ Project/task management
- ✅ Timeline visualization
- ✅ Date range filtering
- ✅ Print functionality
- ✅ Color coding
- ✅ Progress tracking

---

**Made with ❤️ for project managers and developers**

**Enjoy Gantto v2.0!** 🎉🚀

---

## 🔗 Quick Links

- [Installation Guide](INSTALL.md)
- [Feature Overview](FEATURES.md)
- [v2.0 New Features](FULLSCREEN-FEATURES.md)
- [Project Summary](PROJECT_SUMMARY.md)

---

**Star ⭐ this project if you find it useful!**
