param(
  [string]$uri = "wss://ingegilje.no/ws"
)

# Create WebSocket client
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ct = New-Object System.Threading.CancellationToken

Write-Host "Connecting to $uri ..."
$ws.ConnectAsync($uri, $ct).Wait()
Write-Host "Connected!"

# Prepare buffer
$buffer = New-Object Byte[] 1024
$segment = New-Object System.ArraySegment[byte] -ArgumentList (, $buffer)

# Wait for server message
$result = $ws.ReceiveAsync($segment, $ct).Result
$msg = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count)

Write-Host "Received from server: $msg"

# Close connection
$ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
Write-Host "Closed connection."
