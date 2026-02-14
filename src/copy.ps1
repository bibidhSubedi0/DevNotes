$source = "D:\DevNotes\src"
$destination = "$env:USERPROFILE\Desktop\DevNotes_Flat_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Create destination folder
New-Item -ItemType Directory -Path $destination -Force | Out-Null

# Get all files recursively and copy into one folder
Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
    $targetPath = Join-Path $destination $_.Name

    # If file name already exists, add number to prevent overwrite
    $counter = 1
    while (Test-Path $targetPath) {
        $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        $ext = $_.Extension
        $targetPath = Join-Path $destination "$name`_$counter$ext"
        $counter++
    }

    Copy-Item $_.FullName -Destination $targetPath
}

Write-Host "All files copied (flattened) to $destination"
