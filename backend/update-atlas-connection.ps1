# Script to update MongoDB Atlas connection string
# Replace <db_password> with your actual MongoDB Atlas password

$password = Read-Host "Enter your MongoDB Atlas password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$connectionString = "mongodb+srv://mohinibharti9368_db_user:$passwordPlain@cluster0.hgjwzwo.mongodb.net/parking-slot-app?retryWrites=true&w=majority"

# Update .env file
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace 'MONGODB_URI=.*', "MONGODB_URI=$connectionString"
$envContent | Set-Content .env -NoNewline

Write-Host "✅ .env file updated with MongoDB Atlas connection string!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Make sure your MongoDB Atlas IP whitelist includes your current IP!" -ForegroundColor Yellow
Write-Host "Or add 0.0.0.0/0 for testing (less secure)" -ForegroundColor Yellow

