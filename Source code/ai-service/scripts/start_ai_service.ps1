param(
    [switch]$NoReload,
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    try {
        Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 3 | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForEndpoint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [Parameter(Mandatory = $true)]
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Endpoint -Url $Url) {
            return $true
        }
        Start-Sleep -Seconds 2
    }

    return $false
}

$aiServiceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$repoRoot = (Resolve-Path (Join-Path $aiServiceRoot "..")).Path
$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

Write-Host "[1/4] Checking Ollama..."
if (-not (Test-Endpoint -Url "http://localhost:11434/api/tags")) {
    $ollamaExe = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"

    if (-not (Test-Path $ollamaExe)) {
        throw "Ollama is not installed. Install from https://ollama.ai"
    }

    Write-Host "Starting Ollama server..."
    Start-Process -FilePath $ollamaExe -ArgumentList "serve" -WindowStyle Hidden | Out-Null

    if (-not (Wait-ForEndpoint -Url "http://localhost:11434/api/tags" -TimeoutSeconds 20)) {
        throw "Ollama did not start in time."
    }
}

Write-Host "[2/4] Checking existing AI service..."
if (Test-Endpoint -Url "http://localhost:8000/ready") {
    Write-Host "AI service is already running at http://localhost:8000"
    exit 0
}

Write-Host "[3/4] Starting AI service..."
$uvicornArgs = @("-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000")
if (-not $NoReload) {
    $uvicornArgs += "--reload"
}

$process = Start-Process -FilePath $pythonExe -ArgumentList $uvicornArgs -WorkingDirectory $aiServiceRoot -PassThru

Write-Host "[4/4] Waiting for readiness..."
if (-not (Wait-ForEndpoint -Url "http://localhost:8000/ready" -TimeoutSeconds $TimeoutSeconds)) {
    try {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
        }
    }
    catch {
        # Ignore cleanup errors
    }

    throw "AI service failed to become ready within $TimeoutSeconds seconds."
}

$ready = Invoke-RestMethod -Uri "http://localhost:8000/ready" -Method Get
Write-Host "AI service is running. PID: $($process.Id)"
Write-Host "Ready checks: model_service=$($ready.checks.model_service), embedding_service=$($ready.checks.embedding_service), vector_store=$($ready.checks.vector_store), database=$($ready.checks.database)"
Write-Host "Mentor endpoint: http://localhost:8000/api/mentor/chat"
