$ErrorActionPreference = "Stop"
$ValeVersion = if ($env:VALE_VERSION) { $env:VALE_VERSION } else { "3.21.0" }
$Target = $args[0]
$Platform = $args[1]
$ValeAsset = "vale_${ValeVersion}_Windows_64-bit.zip"
$SniffVersion = $(if ($env:RELEASE_VERSION) { $env:RELEASE_VERSION } else { $env:GITHUB_REF_NAME }).TrimStart("v")
$Staging = Join-Path $env:RUNNER_TEMP "sniff-package"
$Package = "sniff-${SniffVersion}-${Platform}"

cargo build --release --locked --target $Target
New-Item -ItemType Directory -Force $Staging | Out-Null
Invoke-WebRequest "https://github.com/vale-cli/vale/releases/download/v${ValeVersion}/${ValeAsset}" -OutFile "$Staging/$ValeAsset"
Invoke-WebRequest "https://github.com/vale-cli/vale/releases/download/v${ValeVersion}/vale_${ValeVersion}_checksums.txt" -OutFile "$Staging/checksums.txt"
$Expected = ((Select-String -Path "$Staging/checksums.txt" -Pattern " $ValeAsset$").Line -split "\s+")[0]
$Actual = (Get-FileHash "$Staging/$ValeAsset" -Algorithm SHA256).Hash.ToLowerInvariant()
if ($Expected -ne $Actual) { throw "Vale checksum mismatch" }
Expand-Archive "$Staging/$ValeAsset" "$Staging/vale"

$Output = New-Item -ItemType Directory -Force "$Staging/$Package"
Copy-Item "target/$Target/release/sniff.exe" "$Output/sniff.exe"
Copy-Item (Get-ChildItem "$Staging/vale" -Recurse -Filter vale.exe | Select-Object -First 1).FullName "$Output/vale.exe"
Copy-Item LICENSE "$Output/LICENSE-sniff"
Invoke-WebRequest "https://raw.githubusercontent.com/vale-cli/vale/v${ValeVersion}/LICENSE" -OutFile "$Output/LICENSE-vale"
Compress-Archive "$Output" "$Package.zip"
$Hash = (Get-FileHash "$Package.zip" -Algorithm SHA256).Hash.ToLowerInvariant()
"$Hash  $Package.zip" | Set-Content -NoNewline "$Package.zip.sha256"
