# Model Download Script for B.O.B. AI Server

# Base directory for models
$modelBaseDir = "G:\b.o.b\ai-server\models"
$embeddingModelDir = Join-Path $modelBaseDir "embeddings\all-MiniLM-L6-v2"

# Ensure directories exist
if (!(Test-Path -Path $embeddingModelDir)) {
    New-Item -ItemType Directory -Force -Path $embeddingModelDir
}

# Model download URLs
$modelDownloads = @{
    "Tokenizer" = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json"
    "Config" = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/config.json"
    "Model" = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/model.safetensors"
    "Vocab" = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/vocab.txt"
}

# Function to download a file
function Download-File {
    param (
        [string]$Url,
        [string]$OutputPath
    )

    Write-Host "Downloading: $Url"
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath
        Write-Host "Successfully downloaded to: $OutputPath" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download $Url" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Download Each Model File
foreach ($key in $modelDownloads.Keys) {
    $outputFileName = switch ($key) {
        "Model" { "model.safetensors" }
        "Tokenizer" { "tokenizer.json" }
        "Config" { "config.json" }
        "Vocab" { "vocab.txt" }
    }
    $outputPath = Join-Path $embeddingModelDir $outputFileName
    Download-File -Url $modelDownloads[$key] -OutputPath $outputPath
}

# Final Verification
Write-Host "`nDownload Summary:" -ForegroundColor Cyan
Get-ChildItem $embeddingModelDir | Format-Table Name, Length

Write-Host "`nModel download complete. Verify file sizes and contents." -ForegroundColor Green
