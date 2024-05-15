# Release Client

1. Manually copy .exe and config file to Gateway.
2. Run the following script:

```powershell
$b = New-PSSession B
Copy-Item -ToSession $b C:\Users\brython\Documents\next-ove-deploy\Next-OVE Client-0.0.0.exe -Destination C:\Users\kiosk\Documents\Next-OVE Client-0.0.0.exe
Copy-Item -ToSession $b C:\Users\brython\Documents\next-ove-deploy\client.config.json -Destination C:\Users\kiosk\AppData\Roaming\next-ove\ove-client-config.json
```