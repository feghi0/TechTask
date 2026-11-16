param([ValidateSet('post','get','estructura','tests')][string]$Stage='tests')
$Host.UI.RawUI.WindowTitle="TechTask - evidencia $Stage"
$projectRoot=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$outputRoot=Join-Path $projectRoot 'docs/entrega-tp4/03-evidencias/capturas'
Clear-Host
if ($Stage -eq 'tests') {
  Write-Host 'TechTask | Pruebas automatizadas reales' -ForegroundColor Cyan
  Write-Host '> npm test'
  npm test 2>&1 | Tee-Object -FilePath (Join-Path $outputRoot 'tests-terminal.txt')
} elseif ($Stage -eq 'estructura') {
  Write-Host 'TechTask | Estructura real del proyecto' -ForegroundColor Cyan
  Write-Host '> tree frontend /F'
  tree frontend /F
  Write-Host '> tree backend /F'
  tree backend /F
} else {
  $method=if($Stage -eq 'post'){'POST'}else{'GET'}
  $uri='http://127.0.0.1:3001/api/tasks'
  Write-Host "TechTask | $method $uri" -ForegroundColor Cyan
  $params=@{Uri=$uri;Method=$method;UseBasicParsing=$true}
  if($method -eq 'POST') {
    $params.ContentType='application/json'
    $params.Body='{"title":"TP de Redes - API","subject":"Redes","priority":"high"}'
    Write-Host ('Request body: '+$params.Body)
  }
  Write-Host '> Invoke-WebRequest @params'
  $response=Invoke-WebRequest @params
  Write-Host "HTTP $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
  Write-Host "Content-Type: $($response.Headers['Content-Type'])"
  $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
  @{method=$method;url=$uri;status=[int]$response.StatusCode;response=($response.Content|ConvertFrom-Json)} | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $outputRoot "api-$Stage-terminal.json") -Encoding UTF8
}
