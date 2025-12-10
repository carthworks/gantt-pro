# Chrome Web Store Submission Guide

## 📋 Pre-Submission Checklist

### ✅ Files Ready
- [x] manifest.json (v2.1.0)
- [x] background.js
- [x] index.html
- [x] styles-fullscreen.css
- [x] app-fullscreen.js
- [x] icons/ (16px, 48px, 128px)
- [x] PRIVACY-POLICY.md
- [x] STORE-LISTING.md
- [x] README.md

### ✅ Extension Details
- **Name**: Gantt Pro - Project Timeline Manager
- **Version**: 2.1.0
- **Author**: Karthikeyan T
- **Email**: tkarthikeyan@gmail.com
- **Category**: Productivity
- **Language**: English

---

## 🚀 Step-by-Step Submission Process

### Step 1: Create ZIP Package

1. **Navigate to project folder**:
   ```
   cd c:\Users\tkart\Dev\products\gantt-chrart-pro
   ```

2. **Create a ZIP file** containing ONLY these files/folders:
   ```
   ✅ manifest.json
   ✅ background.js
   ✅ index.html
   ✅ styles-fullscreen.css
   ✅ app-fullscreen.js
   ✅ icons/
      ├── icon16.png
      ├── icon48.png
      └── icon128.png
   ```

3. **DO NOT include**:
   ```
   ❌ popup.html (legacy)
   ❌ styles.css (legacy)
   ❌ app.js (legacy)
   ❌ preview.html
   ❌ README.md
   ❌ *.md files
   ❌ .git folder
   ```

4. **Name the ZIP file**: `gantt-pro-v2.1.0.zip`

---

### Step 2: Prepare Store Assets

#### Required Images

1. **Icon** (Already have ✅)
   - 128x128px PNG
   - Location: `icons/icon128.png`

2. **Screenshots** (Need to create)
   - Size: 1280x800px or 640x400px
   - Format: PNG or JPEG
   - Minimum: 1 screenshot
   - Recommended: 3-5 screenshots

   **Suggested Screenshots**:
   - Screenshot 1: Main interface with projects and timeline
   - Screenshot 2: Smart Task Suggestions panel
   - Screenshot 3: Progress Velocity Tracker
   - Screenshot 4: Add/Edit project modal
   - Screenshot 5: Export options

3. **Promotional Images** (Optional but recommended)
   - Small tile: 440x280px
   - Large tile: 920x680px
   - Marquee: 1400x560px

---

### Step 3: Chrome Web Store Developer Dashboard

1. **Go to**: https://chrome.google.com/webstore/devconsole

2. **Sign in** with your Google account

3. **Pay one-time developer fee** ($5 USD) if not already paid

4. **Click "New Item"**

---

### Step 4: Fill Out Store Listing

#### Product Details

**Name**:
```
Gantt Pro - Project Timeline Manager
```

**Summary** (132 characters max):
```
Professional Gantt charts with AI-powered insights, progress tracking, and smart task suggestions for effective project management.
```

**Description** (Use content from STORE-LISTING.md):
```
Gantt Pro is a professional project timeline manager with intelligent features designed to help you plan, track, and complete your projects efficiently.

🎯 INTELLIGENT PROJECT MANAGEMENT
• Progress Velocity Tracker - See completion rate and estimated dates
• Smart Task Suggestions - AI-powered recommendations
• Priority-based Workflow - Auto-detect overdue and due-soon tasks

📊 COMPREHENSIVE GANTT CHARTS
• Visual timeline with color-coded bars
• Multiple view modes: Day, Week, Month, Year
• Interactive timeline with progress indicators
• Today marker for easy reference

🔍 ADVANCED FEATURES
• Real-time search across projects and tasks
• Filter by progress and status
• Export to JSON/CSV
• Import from JSON
• Keyboard shortcuts
• Zoom controls (50-200%)
• Print-optimized output

🎨 PREMIUM DESIGN
• Modern dark theme
• Smooth animations
• Professional typography
• Fullscreen interface

💾 PRIVACY & SECURITY
• 100% local storage
• No tracking or analytics
• No account required
• Works offline

Perfect for project managers, developers, freelancers, students, and teams!
```

**Category**:
```
Productivity
```

**Language**:
```
English
```

---

#### Privacy Practices

**Single Purpose**:
```
Project and task management with Gantt chart visualization
```

**Permission Justification**:

**storage**:
```
Required to save user's projects and tasks locally in the browser for persistence across sessions.
```

**tabs**:
```
Required to open the extension in a new fullscreen tab for better user experience and workspace.
```

**Host Permissions**:
```
None required
```

**Remote Code**:
```
No
```

**Data Usage**:
```
This extension does not collect, transmit, or share any user data. All project and task information is stored locally in the user's browser using Chrome's storage API. No data leaves the user's device.
```

**Privacy Policy URL**:
```
https://github.com/karthikeyan-t/gantt-pro/blob/main/PRIVACY-POLICY.md
```
(Note: Upload PRIVACY-POLICY.md to GitHub first)

---

#### Store Listing

**Upload Screenshots** (1280x800px recommended):
- Main interface screenshot
- Smart suggestions screenshot
- Velocity tracker screenshot
- Modal/editing screenshot
- Export options screenshot

**Upload Promotional Images** (Optional):
- Small tile (440x280px)
- Large tile (920x680px)

**YouTube Video** (Optional):
- Demo video URL if available

---

### Step 5: Upload Package

1. **Click "Upload new package"**
2. **Select** `gantt-pro-v2.1.0.zip`
3. **Wait** for upload and validation
4. **Fix any errors** if validation fails

---

### Step 6: Distribution

**Visibility**:
```
Public
```

**Regions**:
```
All regions (or select specific countries)
```

**Pricing**:
```
Free
```

---

### Step 7: Submit for Review

1. **Review all information**
2. **Check "I have read and agree to the terms"**
3. **Click "Submit for Review"**

---

## ⏱️ Review Timeline

- **Initial Review**: 1-3 business days
- **Additional Reviews** (if changes requested): 1-2 business days

---

## 📸 Creating Screenshots

### Option 1: Manual Screenshots

1. **Load the extension** in Chrome
2. **Open** the extension (click icon)
3. **Add sample projects** with different states
4. **Take screenshots** (Windows: Win+Shift+S)
5. **Resize to 1280x800px** using image editor

### Option 2: Automated (Using Browser DevTools)

1. Open extension
2. Press F12 (DevTools)
3. Click device toolbar icon
4. Set dimensions: 1280x800
5. Take screenshot

---

## 🎨 Screenshot Suggestions

### Screenshot 1: Main Interface
- Show full Gantt chart with projects
- Include timeline with colored bars
- Show sidebar with stats
- Capture "Today" indicator

### Screenshot 2: Smart Suggestions
- Expand "What to Work On Today" section
- Show multiple suggestions with badges
- Highlight priority colors

### Screenshot 3: Velocity Tracker
- Show velocity chart with data
- Display completion rate
- Show trend indicator

### Screenshot 4: Add/Edit Modal
- Open project/task modal
- Show form fields
- Display color picker

### Screenshot 5: Features Overview
- Show search bar in use
- Display filters menu
- Show export modal

---

## ✅ Post-Submission

### After Approval

1. **Share the link**:
   ```
   https://chrome.google.com/webstore/detail/[your-extension-id]
   ```

2. **Monitor reviews** and respond to user feedback

3. **Track installations** in Developer Dashboard

4. **Plan updates** based on user requests

---

## 🔄 Updating the Extension

For future updates:

1. **Update version** in manifest.json
2. **Create new ZIP** with updated files
3. **Upload to existing listing**
4. **Submit for review**

Version numbering:
- Major: 3.0.0 (breaking changes)
- Minor: 2.2.0 (new features)
- Patch: 2.1.1 (bug fixes)

---

## 📝 Important Notes

### Do's ✅
- ✅ Test extension thoroughly before submission
- ✅ Use high-quality screenshots
- ✅ Write clear, accurate description
- ✅ Respond to review feedback quickly
- ✅ Keep privacy policy up-to-date

### Don'ts ❌
- ❌ Include unnecessary files in ZIP
- ❌ Use misleading descriptions
- ❌ Request unnecessary permissions
- ❌ Include external scripts or tracking
- ❌ Violate Chrome Web Store policies

---

## 🆘 Troubleshooting

### Common Issues

**"Manifest file is invalid"**
- Check JSON syntax
- Verify all required fields
- Ensure icons exist

**"Package is too large"**
- Remove unnecessary files
- Optimize images
- Check ZIP only contains required files

**"Privacy policy required"**
- Upload PRIVACY-POLICY.md to GitHub
- Add URL to store listing

**"Screenshots required"**
- Upload at least 1 screenshot
- Ensure correct dimensions (1280x800 or 640x400)

---

## 📧 Support

If you encounter issues:

1. **Chrome Web Store Help**: https://support.google.com/chrome_webstore
2. **Developer Forum**: https://groups.google.com/a/chromium.org/g/chromium-extensions
3. **Email**: tkarthikeyan@gmail.com

---

## 🎉 Checklist Before Submission

- [ ] ZIP file created with correct files only
- [ ] manifest.json updated with v2.1.0
- [ ] Author information correct
- [ ] Icons present (16, 48, 128px)
- [ ] Privacy policy uploaded to GitHub
- [ ] Screenshots created (minimum 1, recommended 5)
- [ ] Store listing description written
- [ ] Permission justifications prepared
- [ ] Extension tested in Chrome
- [ ] Developer account created
- [ ] $5 developer fee paid

---

**Ready to submit? Good luck! 🚀**

---

**Author**: Karthikeyan T  
**Email**: tkarthikeyan@gmail.com  
**Date**: December 10, 2025
