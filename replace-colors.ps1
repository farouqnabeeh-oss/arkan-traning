$files = Get-ChildItem -Path "src\app" -Recurse -Include "*.tsx"
foreach ($file in $files) {
  try {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $replaced = $content.Replace("bg-brand-beige", "bg-brand-dark")
    [System.IO.File]::WriteAllText($file.FullName, $replaced, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($file.Name)"
  } catch {
    Write-Host "Skipped: $($file.Name) - $($_.Exception.Message)"
  }
}
Write-Host "Done."
