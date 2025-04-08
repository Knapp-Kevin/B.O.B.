# Create-Icon.ps1
# Usage: Run this script in the folder containing your PNG images
# The images should be named like: icon-16.png, icon-32.png, etc.

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version
    Write-Host "ImageMagick found: $($magickVersion[0])"
}
catch {
    Write-Host "Error: ImageMagick not found. Please install it from https://imagemagick.org/script/download.php" -ForegroundColor Red
    Exit
}

# Get all icon PNG files in the current directory
$iconFiles = Get-ChildItem -Path "." -Filter "icon-*.png" | Sort-Object Name

if ($iconFiles.Count -eq 0) {
    Write-Host "No icon files found. Please ensure your files are named like 'icon-16.png', 'icon-32.png', etc." -ForegroundColor Yellow
    Exit
}

Write-Host "Found $($iconFiles.Count) icon files:" -ForegroundColor Green
$iconFiles | ForEach-Object { Write-Host "  - $($_.Name)" }

# Build the convert command
$convertCommand = "magick convert "
$iconFiles | ForEach-Object { $convertCommand += "$($_.Name) " }
$convertCommand += "icon.ico"

# Execute the command
Write-Host "Creating icon.ico file..." -ForegroundColor Cyan
Invoke-Expression $convertCommand

if (Test-Path "icon.ico") {
    Write-Host "Success! icon.ico created with the following sizes:" -ForegroundColor Green
    magick identify icon.ico
}
else {
    Write-Host "Error creating icon.ico file" -ForegroundColor Red
}