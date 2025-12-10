# Gantt Pro - Chrome Web Store Package Creator
# Author: Karthikeyan T
# Email: tkarthikeyan@gmail.com

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gantt Pro - Package Creator v2.1.0  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$sourceDir = Get-Location
$packageName = "gantt-pro-v2.1.0.zip"
$packagePath = Join-Path $sourceDir $packageName

# Files to include in the package
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "index.html",
    "styles-fullscreen.css",
    "app-fullscreen.js",
    "icons\icon16.png",
    "icons\icon48.png",
    "icons\icon128.png"
)

Write-Host "Checking required files..." -ForegroundColor Yellow

# Check if all required files exist
$allFilesExist = $true
foreach ($file in $filesToInclude) {
    $filePath = Join-Path $sourceDir $file
    if (Test-Path $filePath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ $file (MISSING!)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "ERROR: Some required files are missing!" -ForegroundColor Red
    Write-Host "Please ensure all files are present before packaging." -ForegroundColor Red
    exit 1
}

# Remove old package if exists
if (Test-Path $packagePath) {
    Write-Host "Removing old package..." -ForegroundColor Yellow
    Remove-Item $packagePath -Force
}

Write-Host "Creating ZIP package..." -ForegroundColor Yellow
Write-Host ""

# Create temporary directory for packaging
$tempDir = Join-Path $env:TEMP "gantt-pro-package"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Create icons directory in temp
$tempIconsDir = Join-Path $tempDir "icons"
New-Item -ItemType Directory -Path $tempIconsDir | Out-Null

# Copy files to temp directory
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $sourceDir $file
    if ($file.StartsWith("icons\")) {
        $destPath = Join-Path $tempIconsDir (Split-Path $file -Leaf)
    }
    else {
        $destPath = Join-Path $tempDir (Split-Path $file -Leaf)
    }
    Copy-Item $sourcePath $destPath
    Write-Host "  Added: $file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Compressing files..." -ForegroundColor Yellow

# Create ZIP file
Compress-Archive -Path "$tempDir\*" -DestinationPath $packagePath -Force

# Clean up temp directory
Remove-Item $tempDir -Recurse -Force

# Get package size
$packageSize = (Get-Item $packagePath).Length
$packageSizeKB = [math]::Round($packageSize / 1KB, 2)
$packageSizeMB = [math]::Round($packageSize / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Package Created Successfully!        " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package Details:" -ForegroundColor Cyan
Write-Host "  Name: $packageName" -ForegroundColor White
Write-Host "  Location: $packagePath" -ForegroundColor White
Write-Host "  Size: $packageSizeKB KB ($packageSizeMB MB)" -ForegroundColor White
Write-Host "  Files: $($filesToInclude.Count)" -ForegroundColor White
Write-Host ""

Write-Host "Extension Information:" -ForegroundColor Cyan
Write-Host "  Name: Gantt Pro - Project Timeline Manager" -ForegroundColor White
Write-Host "  Version: 2.1.0" -ForegroundColor White
Write-Host "  Author: Karthikeyan T" -ForegroundColor White
Write-Host "  Email: tkarthikeyan@gmail.com" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "  2. Sign in with your Google account" -ForegroundColor White
Write-Host "  3. Click 'New Item'" -ForegroundColor White
Write-Host "  4. Upload: $packageName" -ForegroundColor White
Write-Host "  5. Follow the submission guide in CHROME-STORE-SUBMISSION.md" -ForegroundColor White
Write-Host ""

Write-Host "Documentation Files:" -ForegroundColor Cyan
Write-Host "  • CHROME-STORE-SUBMISSION.md - Complete submission guide" -ForegroundColor White
Write-Host "  • STORE-LISTING.md - Store description and details" -ForegroundColor White
Write-Host "  • PRIVACY-POLICY.md - Privacy policy (upload to GitHub)" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to open the package location..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open folder containing the package
explorer.exe "/select,$packagePath"

Write-Host ""
Write-Host "Good luck with your submission! 🚀" -ForegroundColor Green
Write-Host ""
