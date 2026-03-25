# Auto-commit script for DashCourier website
# This script automatically commits and pushes changes to GitHub

param(
    [string]$message = "Update DashCourier website"
)

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit." -ForegroundColor Green
    exit 0
}

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add -A

# Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "$message - $timestamp"

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Changes successfully pushed to GitHub!" -ForegroundColor Green
