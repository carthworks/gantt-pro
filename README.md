# Gantto - Professional Project Timeline Manager

A premium Chrome extension for creating and managing Gantt charts with advanced features including project/task management, date filtering, and print capabilities.

<!-- ![Gantto](icons/icon128.png) -->
![GanttPro_screenShot](image-1.png)

## ✨ Features

### 🎯 Core Functionality
- **Project & Task Management**: Create hierarchical projects with multiple tasks
- **Interactive Gantt Chart**: Visual timeline with drag-and-drop capabilities
- **Date Range Filtering**: Filter timeline view with custom date ranges
- **Multiple View Modes**: Day, Week, Month, and Year views
- **Progress Tracking**: Track completion percentage for projects and tasks
- **Color Coding**: Assign custom colors to projects and tasks for easy identification

### 🎨 Premium Design
- **Modern Dark Theme**: Professional dark mode interface with vibrant gradients
- **Smooth Animations**: Micro-animations for enhanced user experience
- **Responsive Layout**: Optimized for various screen sizes
- **Glassmorphism Effects**: Modern UI with depth and visual hierarchy

### 🛠️ Advanced Features
- **Print Support**: Print-optimized Gantt charts for presentations
- **Data Persistence**: Automatic saving using Chrome storage
- **Real-time Updates**: Instant visual feedback on all changes
- **Today Indicator**: Highlighted current date in timeline
- **Progress Visualization**: Animated progress bars with shimmer effects

## 📦 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download or Clone** this repository to your local machine

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or click Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `gantt-chrart-pro` folder
   - The extension icon should appear in your Chrome toolbar

### Method 2: Package as CRX (Production)

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Pack extension"
4. Select the extension directory
5. Click "Pack Extension"
6. Install the generated `.crx` file

## 📖 How to Use Gantto

### Quick Start Guide

#### 1. Opening Gantto
- Click the **Gantto extension icon** in your Chrome toolbar
- The application opens in a new window with a professional dark interface

#### 2. Creating Your First Project

**Step-by-Step:**
1. Click the **"Add Project"** button in the left sidebar (purple button)
2. Fill in the project details:
   - **Name**: Enter your project name (e.g., "Website Redesign")
   - **Start Date**: Select when the project begins
   - **Duration**: Enter the number of days (e.g., 30)
   - **Progress**: Set initial progress (0-100%) - *Note: This auto-calculates from tasks*
   - **Color**: Choose a color to identify your project
   - **Description**: Add optional project notes
3. Click **"Save"** to create the project

#### 3. Adding Tasks to Projects

**Two Ways to Add Tasks:**

**Method 1: From Sidebar (Recommended)**
1. Find your project in the left sidebar
2. Click on the project to expand it
3. Click the **"Add Task"** button at the top of the task list
4. Fill in task details and save

**Method 2: From Header Button**
1. Click the **"Add Task"** button in the sidebar header (below "Add Project")
2. Select which project to add the task to from the dropdown
3. Fill in task details:
   - **Project**: Select the parent project
   - **Name**: Enter task name
   - **Start Date**: Must be within project date range
   - **Duration**: Number of days (must fit within project)
   - **Progress**: Set completion percentage (0-100%)
   - **Color**: Choose task color
   - **Description**: Add task notes
4. Click **"Save"**

**Important Task Rules:**
- ✅ Task start date must be after or equal to project start date
- ✅ Task end date must be before or equal to project end date
- ✅ All tasks combined must fit within the project duration
- ✅ Project progress is automatically calculated from task progress

#### 4. Editing Projects and Tasks

1. **Edit Icon**: Click the pencil icon (✏️) next to any project or task
2. **Modify Details**: Update any field in the modal
3. **Save Changes**: Click "Save" to apply updates

**Note**: When editing projects, the progress field is disabled because it's auto-calculated from tasks.

#### 5. Deleting Items

1. Click the **trash icon** (🗑️) next to any project or task
2. Confirm the deletion in the popup
3. The item is permanently removed

**Warning**: Deleting a project will also delete all its tasks!

#### 6. Using the Gantt Chart Timeline

**Understanding the Timeline:**
- **Horizontal Bars**: Represent projects and tasks
- **Bar Color**: Matches the project/task color
- **Progress Fill**: Lighter shade shows completion percentage
- **Today Marker**: Vertical line indicates current date
- **Duration**: Bar width represents the time span

**Viewing Options:**
- **Day View**: Shows individual days
- **Week View**: Groups by weeks
- **Month View**: Shows months
- **Year View**: Annual overview

#### 7. Filtering and Searching

**Search Projects:**
1. Use the search box at the top of the sidebar
2. Type project or task name
3. Results filter in real-time

**Filter by Progress:**
1. Click the filter icon in the sidebar
2. Select progress ranges:
   - Not Started (0%)
   - In Progress (1-99%)
   - Completed (100%)
3. View is filtered instantly

**Date Range Filtering:**
1. Use date pickers in the top-right header
2. Set **Start Date** and **End Date**
3. Timeline shows only items in that range

#### 8. Viewing Project Statistics

The sidebar shows real-time stats:
- **Projects**: Total number of projects
- **Tasks**: Total number of tasks across all projects
- **Avg Progress**: Average completion across all projects

#### 9. Using Smart Features

**Progress Velocity:**
- Shows how fast you're completing tasks
- Displays days per percentage point
- Helps estimate completion time

**Smart Suggestions:**
- AI-powered task recommendations
- Highlights urgent tasks
- Shows overdue items
- Suggests next actions

#### 10. Exporting and Sharing

**Export Options:**
1. Click the **"Export"** button in the header
2. Choose format:
   - **JSON**: Full data export
   - **CSV**: Spreadsheet format

**Share Your Chart:**
1. Click the **"Share"** button
2. Options:
   - **Copy JSON**: Share raw data
   - **Generate Link**: Create shareable URL

**Print:**
1. Click the **Print** icon (🖨️)
2. Browser print dialog opens
3. Chart is optimized for printing

#### 11. Keyboard Shortcuts

- **Ctrl + N**: Create new project
- **Ctrl + F**: Focus search box
- **Ctrl + E**: Open export modal
- **Ctrl + +**: Zoom in timeline
- **Ctrl + -**: Zoom out timeline
- **?**: Show keyboard shortcuts guide
- **Escape**: Close any open modal

#### 12. Tips for Best Results

✅ **Break Down Projects**: Create multiple small tasks instead of one large task  
✅ **Update Progress Regularly**: Keep task progress current for accurate project tracking  
✅ **Use Color Coding**: Assign different colors to categorize projects  
✅ **Set Realistic Durations**: Ensure task durations are achievable  
✅ **Use Dependencies**: Link tasks that depend on each other  
✅ **Check Smart Suggestions**: Review AI recommendations daily  
✅ **Monitor Velocity**: Track progress velocity to predict completion  

### Advanced Features

#### Task Dependencies
- Select dependent tasks when creating/editing
- Visual indicators show task relationships
- Helps manage complex project workflows

#### Progress Auto-Calculation
- Project progress = Average of all task progress
- Updates automatically when tasks change
- No manual project progress entry needed

#### Data Persistence
- All data saves automatically
- Stored locally in Chrome
- No internet connection required
- Data persists across sessions

---

## 🎨 Customization

### Color Schemes

The extension comes with preset color options:
- **Purple Gradient**: `#667eea` (Default)
- **Pink Gradient**: `#f093fb`
- **Blue Gradient**: `#4facfe`
- **Green Gradient**: `#43e97b`
- **Rose Gradient**: `#fa709a`
- **Yellow Gradient**: `#feca57`

You can also use the color picker to select any custom color.

### Modifying Styles

To customize the appearance:
1. Open `styles.css`
2. Modify CSS variables in the `:root` section:
   ```css
   :root {
     --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     --bg-primary: #0f1419;
     --text-primary: #e4e6eb;
     /* ... more variables */
   }
   ```

## 📁 Project Structure

```
gantt-chrart-pro/
├── manifest.json          # Chrome extension configuration
├── popup.html            # Main HTML structure
├── styles.css            # Premium styling and animations
├── app.js                # Application logic and data management
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **Vanilla JavaScript**: No dependencies, pure ES6+
- **Chrome Storage API**: Data persistence
- **Chrome Extension Manifest V3**: Latest extension format

### Browser Compatibility
- Chrome 88+
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

### Data Storage
- Uses `chrome.storage.local` API
- Data persists across browser sessions
- Automatic saving on all changes
- No external servers or databases required

## 🎯 Keyboard Shortcuts

Currently, the extension uses mouse/click interactions. Future versions may include:
- `Ctrl/Cmd + N`: New Project
- `Ctrl/Cmd + P`: Print
- `Escape`: Close Modal

## 🐛 Troubleshooting

### Extension Not Loading
- Ensure Developer Mode is enabled
- Check for errors in `chrome://extensions/`
- Verify all files are present in the directory

### Data Not Saving
- Check Chrome storage permissions in manifest.json
- Clear browser cache and reload extension
- Check browser console for errors

### Timeline Not Displaying
- Ensure date range is set correctly
- Verify projects have valid start dates
- Check that duration values are positive numbers

## 🚀 Future Enhancements

Planned features for future versions:
- [ ] Drag-and-drop timeline bars
- [ ] Export to PDF/PNG
- [ ] Import/Export JSON data
- [ ] Dependencies between tasks
- [ ] Resource allocation
- [ ] Multiple project views
- [ ] Collaboration features
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts
- [ ] Undo/Redo functionality

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

## 👨‍💻 Author

### Karthikeyan T

**Full Stack Developer | Project Management Enthusiast**

I'm a passionate developer dedicated to creating tools that make project management easier and more efficient. Gantto was born from my own need for a simple, beautiful, and powerful Gantt chart tool that works right in the browser.

### 📬 Contact Information

- **Name**: Karthikeyan T
- **Email**: [tkarthikeyan@gmail.com](mailto:tkarthikeyan@gmail.com)
- **Phone**: +91 [Your Phone Number]
- **GitHub**: [@tkarthikeyan](https://github.com/tkarthikeyan)
- **Location**: India

### 🔗 Connect With Me

[![GitHub](https://img.shields.io/badge/GitHub-tkarthikeyan-181717?style=for-the-badge&logo=github)](https://github.com/tkarthikeyan)
[![Email](https://img.shields.io/badge/Email-tkarthikeyan%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tkarthikeyan@gmail.com)

### 💼 About This Project

Gantto represents my commitment to:
- **Clean Code**: Well-structured, maintainable JavaScript
- **User Experience**: Intuitive interfaces that users love
- **Performance**: Fast, responsive applications
- **Design**: Beautiful, modern aesthetics

### 🌟 Other Projects

Check out my other work on [GitHub](https://github.com/tkarthikeyan) for more tools and applications.

### 🤝 Let's Collaborate

I'm always open to:
- **Feedback**: Share your thoughts on Gantto
- **Feature Requests**: Suggest improvements
- **Bug Reports**: Help make Gantto better
- **Contributions**: Submit pull requests
- **Collaboration**: Work together on new projects

Feel free to reach out via email or GitHub!

---

**Made with ❤️ by Karthikeyan T**

*Empowering project managers and developers with better tools*

Enjoy using Gantto! 🎉

---

### 📝 Version History

**v2.0** (Current)
- ✨ Added task validation against project duration
- ✨ Automatic project progress calculation from tasks
- ✨ Header "Add Task" button with project selector
- ✨ Smart suggestions and progress velocity
- ✨ Export and share functionality
- ✨ Comprehensive keyboard shortcuts
- ✨ Enhanced UI with guide modal

**v1.0**
- 🎉 Initial release
- ✅ Basic project and task management
- ✅ Gantt chart visualization
- ✅ Date filtering
- ✅ Print support

---

© 2024 Karthikeyan T. All rights reserved.
