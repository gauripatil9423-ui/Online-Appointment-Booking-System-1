using System.Collections.Concurrent;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

var appointments = new ConcurrentDictionary<int, Appointment>();
var nextId = 0;

// Sample appointments appear on first launch.
AddSample("Aarav Patel", "aarav@example.com", "General Consultation", DateTime.Today.AddDays(1).AddHours(10), "Confirmed");
AddSample("Priya Shah", "priya@example.com", "Dental Consultation", DateTime.Today.AddDays(2).AddHours(14), "Confirmed");

void AddSample(string name, string email, string service, DateTime date, string status)
{
    var id = Interlocked.Increment(ref nextId);
    appointments[id] = new Appointment(id, name, email, service, date, status);
}

app.MapGet("/api/appointments", () =>
    Results.Ok(appointments.Values.OrderBy(a => a.DateTime).ToArray()));

app.MapPost("/api/appointments", (CreateAppointment input) =>
{
    if (string.IsNullOrWhiteSpace(input.Name) ||
        string.IsNullOrWhiteSpace(input.Email) ||
        string.IsNullOrWhiteSpace(input.Service) ||
        input.DateTime is null)
        return Results.BadRequest(new { message = "Please complete all required fields." });

    if (!DateTime.TryParse(input.DateTime, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var date))
        return Results.BadRequest(new { message = "Please choose a valid appointment date and time." });

    if (date <= DateTime.Now)
        return Results.BadRequest(new { message = "Appointment must be in the future." });

    if (date.Hour < 9 || date.Hour >= 17)
        return Results.BadRequest(new { message = "Appointments are available from 9:00 AM to 5:00 PM." });

    var conflict = appointments.Values.Any(a => a.DateTime == date && a.Status != "Cancelled");
    if (conflict)
        return Results.Conflict(new { message = "That time is already booked. Please select another time." });

    var id = Interlocked.Increment(ref nextId);
    var appointment = new Appointment(id, input.Name.Trim(), input.Email.Trim(), input.Service, date, "Confirmed");
    appointments[id] = appointment;
    return Results.Created($"/api/appointments/{id}", appointment);
});

app.MapPatch("/api/appointments/{id:int}/cancel", (int id) =>
{
    if (!appointments.TryGetValue(id, out var appointment))
        return Results.NotFound(new { message = "Appointment not found." });

    var cancelled = appointment with { Status = "Cancelled" };
    appointments[id] = cancelled;
    return Results.Ok(cancelled);
});

app.MapDelete("/api/appointments/{id:int}", (int id) =>
    appointments.TryRemove(id, out _) ? Results.NoContent() : Results.NotFound());

app.Run();

record Appointment(int Id, string Name, string Email, string Service, DateTime DateTime, string Status);
record CreateAppointment(string? Name, string? Email, string? Service, string? DateTime);
