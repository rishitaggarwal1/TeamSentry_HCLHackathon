// Controllers/AppointmentsController.cs
using System.Security.Claims;
using HealthCare.DTOs;
using HealthCare.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthCare.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _svc;
    public AppointmentsController(IAppointmentService svc) => _svc = svc;

    // GET /api/appointments/doctors/available?date=YYYY-MM-DD
    [HttpGet("doctors/available")]
    public async Task<IActionResult> AvailableDoctors([FromQuery] string date, CancellationToken ct)
        => Ok(await _svc.GetAvailableDoctorsAsync(date, ct));

    // GET /api/appointments/slots/available?doctorId=GUID&date=YYYY-MM-DD
    [HttpGet("slots/available")]
    public async Task<IActionResult> AvailableSlots([FromQuery] Guid doctorId, [FromQuery] string date, CancellationToken ct)
        => Ok(await _svc.GetAvailableSlotsAsync(doctorId, date, ct));

    // POST /api/appointments/book  (Patient only)
    [Authorize(Roles = "Patient")]
    [HttpPost("book")]
    public async Task<IActionResult> Book([FromBody] BookSlotRequest req, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var (ok, error) = await _svc.BookSlotAsync(userId, req, ct);
        if (!ok) return BadRequest(new { message = error });

        return Ok(new { message = "Booked successfully." });
    }
}
