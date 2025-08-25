# 🎯 Fix lucide 'Review' redeclaration in EnhancedSitterProfile.jsx (alias to ReviewIcon)

$file = 'src\components\sitters\EnhancedSitterProfile.jsx'
if (-not (Test-Path $file)) { Write-Error "File not found: $file"; exit 1 }

# Read file
$code = Get-Content $file -Raw

# 1) In the lucide-react import line, alias Review -> Review as ReviewIcon (only on that import)
$code = [regex]::Replace($code, '(?m)^(.*\{[^}]*\}.*from\s*["'']lucide-react["''].*)$', {
  param($m)
  $line = $m.Groups[1].Value
  if ($line -match '\bReview as ReviewIcon\b') { return $line } # already fixed
  if ($line -match '\bReview\b') {
    # Replace bare 'Review' with 'Review as ReviewIcon' in that import line
    return ($line -replace '\bReview\b','Review as ReviewIcon')
  }
  return $line
})

# 2) Update JSX usage: <Review ...> -> <ReviewIcon ...> and </Review> -> </ReviewIcon>
# Use regex to avoid matching <ReviewIcon ...> or <ReviewSomething ...>
# Only match <Review ...> or </Review> not followed by a word character (so not <ReviewIcon>)
$code = $code -replace '<\s*Review(?!\w)(\s|>)', '<ReviewIcon$1'
$code = $code -replace '</\s*Review(?!\w)\s*>', '</ReviewIcon>'

# 3) Save changes to file
Set-Content -Path $file -Value $code -Encoding UTF8
Write-Host "✅ Fixed lucide Review import conflict in $file"

Write-Host "`nNow restart your dev server:"
Write-Host "  npm run dev"
