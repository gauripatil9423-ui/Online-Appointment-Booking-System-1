# Online Appointment Booking System (CareBook)

A responsive appointment booking demo built with ASP.NET Core 8 and plain HTML/CSS/JavaScript. No database or extra NuGet packages are required.

## Features
- Responsive landing page and booking form
- Name, email, service, date, and time validation
- Booking-time conflict check
- Appointment list with status
- Cancel or delete appointments
- Two sample appointments on startup

## Requirements
- .NET 8 SDK (or a newer SDK that can target .NET 8)
- Visual Studio Code
- C# Dev Kit extension for a better VS Code experience (optional)

Check .NET installation in a terminal:
```bash
dotnet --info
```

## Run in VS Code
1. Extract the ZIP file to a normal folder (do not run from inside the ZIP).
2. Open VS Code.
3. Choose **File → Open Folder** and select the `OnlineAppointmentBookingSystem` folder containing `OnlineAppointmentBookingSystem.csproj`.
4. Open **Terminal → New Terminal**.
5. Run:
   ```bash
   dotnet restore
   dotnet run
   ```
6. In the terminal, find the local URL printed by ASP.NET Core, usually `http://localhost:5xxx` or `https://localhost:7xxx`.
7. Open that URL in your browser. Use the exact URL shown in your terminal.

Stop the server with `Ctrl+C`.

## Troubleshooting
- **`dotnet` is not recognized:** Install the .NET 8 SDK for Windows from https://dotnet.microsoft.com/en-us/download/dotnet/8.0, close and reopen VS Code, then run `dotnet --version`.
- **Wrong folder:** In the terminal run `dir`. You should see `OnlineAppointmentBookingSystem.csproj` and `Program.cs`. If not, use `cd` to enter the project folder.
- **Port already in use:** Run `dotnet run --urls http://localhost:5055`, then open `http://localhost:5055`.
- **Browser says site cannot be reached:** Keep the terminal running, use the exact URL printed by `dotnet run`, and check that the app did not report a startup error.
- **HTTPS certificate warning:** Use the HTTP URL printed in the terminal. If you need HTTPS locally, run `dotnet dev-certs https --trust` in a terminal.
- **Changes not appearing:** Hard-refresh the browser with `Ctrl+F5`.
- **NuGet/network issue:** This project uses only the .NET shared framework; no third-party packages are needed. Once the SDK is installed, `dotnet restore` should normally work offline or with minimal network access.

## Important demo limitations
Appointments are stored in memory, so all bookings reset when the server restarts. This is a learning/demo project, not production-ready. A real deployment should add a database, authentication/authorization, privacy protections, server-side scheduling rules, and secure hosting.
