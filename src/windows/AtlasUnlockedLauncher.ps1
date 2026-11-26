param(
    [ValidateSet('Start', 'Stop', 'Shortcut')][string]$Action = 'Start',
    [switch]$NoBrowser,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..')).TrimEnd('\')
$gameUrl = 'http://localhost:8080/'
$hashAlgorithm = [Security.Cryptography.SHA256]::Create()
$projectHash = [BitConverter]::ToString($hashAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($projectRoot.ToLowerInvariant()))).Replace('-', '').Substring(0, 24)
$hashAlgorithm.Dispose()
# Per-computer state must never be copied by OneDrive with the project.
$runtimeFolder = Join-Path $env:LOCALAPPDATA "AtlasUnlocked\$projectHash"
$null = New-Item -ItemType Directory -Path $runtimeFolder -Force
$stateFile = Join-Path $runtimeFolder 'server.json'
$launcherLog = Join-Path $runtimeFolder 'launcher.log'
$mutex = $null
$locked = $false

function Write-LauncherLog([string]$Message) {
    Add-Content -LiteralPath $launcherLog -Value "$(Get-Date -Format o) $Message"
    Write-Host $Message
}

function Show-Message([string]$Message, [int]$Icon = 64, [int]$Seconds = 0) {
    Write-LauncherLog $Message
    if (-not $Quiet) {
        $popup = New-Object -ComObject WScript.Shell
        $null = $popup.Popup($Message, $Seconds, 'Atlas Unlocked', $Icon)
    }
}

function Get-GameProcess([int]$ProcessId) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
    $serverPath = Join-Path $projectRoot 'src\windows\AtlasUnlockedServer.mjs'
    # Verify the executable and this installation's exact production server path.
    if ($process -and $process.Name -eq 'node.exe' -and
        $process.CommandLine -match ([regex]::Escape($serverPath) + '(?:"|\s|$)')) {
        return $process
    }
    return $null
}

function Get-Listeners {
    return @(Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique)
}

function Get-RunningGame {
    foreach ($listenerId in (Get-Listeners)) {
        $process = Get-GameProcess $listenerId
        if ($process) { return $process }
    }
    return $null
}

function Save-ServerState($Process) {
    @{ root = $projectRoot; pid = $Process.ProcessId; created = $Process.CreationDate.ToUniversalTime().ToString('o'); url = $gameUrl } |
        ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8
}

function Test-Ready {
    try {
        $response = Invoke-WebRequest -Uri ($gameUrl + '__atlas_unlocked_health') -UseBasicParsing -TimeoutSec 2
        $health = $response.Content | ConvertFrom-Json
        return $response.StatusCode -eq 200 -and $health.application -eq 'Atlas Unlocked' -and
            $health.mode -eq 'production' -and $health.root -eq $projectRoot -and $health.indexSha256
    } catch { return $false }
}

function Find-Chrome {
    $registrations = @(
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe'
    )
    foreach ($registration in $registrations) {
        $key = Get-Item -LiteralPath $registration -ErrorAction SilentlyContinue
        if ($key) {
            $candidate = $key.GetValue('')
            if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) { return $candidate }
        }
    }
    foreach ($folder in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA)) {
        if (!$folder) { continue }
        $candidate = Join-Path $folder 'Google\Chrome\Application\chrome.exe'
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
    }
}

function Open-Game {
    if ($NoBrowser) { return }

    # The launcher mutex serializes requests. Skip a second handoff from a rapid repeat click.
    $stamp = Join-Path $runtimeFolder 'browser-request'
    $lastRequest = Get-Item -LiteralPath $stamp -ErrorAction SilentlyContinue
    if ($lastRequest) {
        $elapsed = ([DateTime]::UtcNow - $lastRequest.LastWriteTimeUtc).TotalSeconds
        if ($elapsed -ge 0 -and $elapsed -lt 4) {
            Write-LauncherLog 'Skipped a repeat browser request.'
            return
        }
    }

    $chrome = Find-Chrome
    if (!$chrome) { throw "Google Chrome could not be located. Open $gameUrl in Chrome." }

    $browserStart = New-Object Diagnostics.ProcessStartInfo
    $browserStart.FileName = $chrome
    $browserStart.Arguments = $gameUrl
    $browserStart.UseShellExecute = $true
    $null = [Diagnostics.Process]::Start($browserStart)
    Set-Content -LiteralPath $stamp -Value '' -Encoding ASCII
    Write-LauncherLog "Requested Google Chrome to open $gameUrl"
}

function Start-ProductionServer {
    $info = New-Object Diagnostics.ProcessStartInfo
    $info.FileName = (Get-Command node.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1 -ExpandProperty Source)
    $server = Join-Path $projectRoot 'src\windows\AtlasUnlockedServer.mjs'
    $log = Join-Path $runtimeFolder 'server.log'
    $info.Arguments = '"' + $server + '" --port 8080 --log "' + $log + '"'
    $info.WorkingDirectory = $projectRoot
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    return [Diagnostics.Process]::Start($info)
}

function Stop-VerifiedProcess($Process) {
    # Recheck both identity and creation time immediately before killing its own tree.
    $current = Get-GameProcess $Process.ProcessId
    if (-not $current -or $current.CreationDate -ne $Process.CreationDate) { return }
    & "$env:SystemRoot\System32\taskkill.exe" /PID $current.ProcessId /T /F | Out-Null
    if ($LASTEXITCODE -ne 0 -and (Get-GameProcess $current.ProcessId)) { throw 'The game server could not be stopped. Run AtlasUnlockedLauncher.ps1 -Action Stop again.' }
}

try {
    if ($Action -eq 'Shortcut') {
        $shell = New-Object -ComObject WScript.Shell
        $shortcutPath = Join-Path $shell.SpecialFolders.Item('Desktop') 'Atlas Unlocked.lnk'
        $shortcut = $shell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = Join-Path $PSHOME 'powershell.exe'
        $shortcut.Arguments = '-NoProfile -WindowStyle Hidden -File "' + $PSCommandPath + '" -Action Start'
        $shortcut.WorkingDirectory = $projectRoot
        $shortcut.Description = 'Start Atlas Unlocked and open the game'
        $shortcut.WindowStyle = 7
        $gameIcon = @('public\favicon.ico') | ForEach-Object { Join-Path $projectRoot $_ } | Where-Object { Test-Path -LiteralPath $_ }
        $shortcut.IconLocation = if ($gameIcon) { @($gameIcon)[0] + ',0' } else { "$env:SystemRoot\System32\shell32.dll,13" }
        $shortcut.Save()
        Show-Message "Your Atlas Unlocked desktop shortcut is ready. Double-click it to play."
        exit 0
    }

    # Serialize simultaneous double-clicks, installs, and stop requests for this folder.
    $mutex = New-Object Threading.Mutex($false, "Local\AtlasUnlocked-$projectHash")
    try { $locked = $mutex.WaitOne([TimeSpan]::FromMinutes(20)) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { throw 'Another game setup is still running. Please wait a few minutes, then try again.' }

    if ($Action -eq 'Stop') {
        $running = Get-RunningGame
        if (-not $running -and (Test-Path -LiteralPath $stateFile)) {
            $savedServer = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
            if ($savedServer.root -eq $projectRoot) {
                $candidate = Get-GameProcess $savedServer.pid
                if ($candidate -and $candidate.CreationDate.ToUniversalTime().ToString('o') -eq $savedServer.created) { $running = $candidate }
            }
        }
        if ($running) { Stop-VerifiedProcess $running }
        Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
        Show-Message 'Atlas Unlocked is stopped. You may close its browser tab. Your saved game stays in the browser.'
        exit 0
    }

    $running = Get-RunningGame
    if ($running) {
        $deadline = [DateTime]::UtcNow.AddSeconds(120)
        while (-not (Test-Ready)) {
            if ([DateTime]::UtcNow -gt $deadline -or -not (Get-GameProcess $running.ProcessId)) { throw 'The existing game server is not responding. Run AtlasUnlockedLauncher.ps1 -Action Stop, then start the game again.' }
            Start-Sleep -Milliseconds 500
        }
        Save-ServerState $running
        Write-LauncherLog "Reusing game server PID $($running.ProcessId)."
        Open-Game
        exit 0
    }
    # Reopening a verified loopback game does not require process inspection.
    if (Test-Ready) {
        Write-LauncherLog 'Reusing the running Atlas Unlocked server.'
        Open-Game
        exit 0
    }
    if ((Get-Listeners).Count -gt 0) { throw 'Port 8080 is being used by another program or another copy of the game. Close that program, then start Atlas Unlocked again. Nothing else was stopped.' }

    if (-not (Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue)) {
        throw 'Node.js is not installed. Install Node.js LTS, then start Atlas Unlocked again. Playing does not require npm or Vite.'
    }
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'dist\index.html')) -or
        -not (Test-Path -LiteralPath (Join-Path $projectRoot 'src\windows\AtlasUnlockedServer.mjs'))) {
        throw 'The production installation is incomplete. Update from the verified production build. Your browser saves are untouched.'
    }
    $serverRunner = Start-ProductionServer
    $deadline = [DateTime]::UtcNow.AddSeconds(120)
    $ready = $false
    while ([DateTime]::UtcNow -lt $deadline) {
        if (Test-Ready) {
            $running = Get-RunningGame
            if ($running) { $ready = $true; break }
        }
        if ($serverRunner.HasExited) { break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $ready) {
        $running = Get-RunningGame
        if ($running) { Stop-VerifiedProcess $running }
        throw 'The game server could not start. Try the launcher again. If it still fails, ask an adult to check the launcher logs.'
    }
    Save-ServerState $running
    Write-LauncherLog "Started game server PID $($running.ProcessId) from $projectRoot."
    Open-Game
    exit 0
} catch {
    $message = $_.Exception.Message + "`r`n`r`nDetails: $runtimeFolder"
    Show-Message $message 16
    exit 1
} finally {
    if ($locked -and $mutex) { $mutex.ReleaseMutex() }
    if ($mutex) { $mutex.Dispose() }
}
