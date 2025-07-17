# Section 3 Compliance System Setup Script for Windows
Write-Host "🚀 Setting up Section 3 Compliance System..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    
    # Copy .env.example to .env.local
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ .env.local created from .env.example" -ForegroundColor Green
    } else {
        # Create .env.local with template
        @"
# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security
JWT_SECRET=your_custom_jwt_secret_32_chars_minimum
ENCRYPTION_KEY=your_encryption_key_32_chars_minimum

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Host "✅ .env.local created with template" -ForegroundColor Green
    }
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your actual API keys" -ForegroundColor White
Write-Host "2. Get Supabase credentials from: https://supabase.com" -ForegroundColor White
Write-Host "3. Get OpenAI API key from: https://platform.openai.com" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Opening .env.local for editing..." -ForegroundColor Yellow

# Open .env.local in default editor
if (Get-Command "code" -ErrorAction SilentlyContinue) {
    code .env.local
    Write-Host "✅ Opened in VS Code" -ForegroundColor Green
} elseif (Get-Command "notepad" -ErrorAction SilentlyContinue) {
    notepad .env.local
    Write-Host "✅ Opened in Notepad" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please manually edit .env.local file" -ForegroundColor Yellow
}
