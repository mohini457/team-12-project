# Script to fix MongoDB Atlas authentication
# This will help you update the password correctly

Write-Host "`n=== MongoDB Atlas Authentication Fix ===" -ForegroundColor Cyan
Write-Host ""

# Get password securely
$password = Read-Host "Enter your MongoDB Atlas password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# URL encode special characters
$passwordEncoded = [System.Web.HttpUtility]::UrlEncode($passwordPlain)

Write-Host "`nYour connection details:" -ForegroundColor Yellow
Write-Host "Username: mohinibharti9368_db_user" -ForegroundColor Green
Write-Host "Password length: $($passwordPlain.Length) characters" -ForegroundColor Green

# Ask which encoding to use
Write-Host "`nChoose password encoding:" -ForegroundColor Cyan
Write-Host "1. Use as-is (if no special characters)" -ForegroundColor White
Write-Host "2. URL encode (if password has @, #, %, etc.)" -ForegroundColor White
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "2") {
    $finalPassword = $passwordEncoded
    Write-Host "Using URL-encoded password" -ForegroundColor Yellow
} else {
    $finalPassword = $passwordPlain
    Write-Host "Using password as-is" -ForegroundColor Yellow
}

# Build connection string
$connectionString = "mongodb+srv://mohinibharti9368_db_user:$finalPassword@cluster0.hgjwzwo.mongodb.net/parking-slot-app?retryWrites=true&w=majority"

# Update .env file
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace 'MONGODB_URI=.*', "MONGODB_URI=$connectionString"
$envContent | Set-Content .env -NoNewline

Write-Host "`n✅ .env file updated!" -ForegroundColor Green
Write-Host "`nNow test the connection:" -ForegroundColor Cyan
Write-Host "node test-atlas-connection.js" -ForegroundColor Yellow

