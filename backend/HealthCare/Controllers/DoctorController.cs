using HealthCare.DTOs;
using HealthCare.Services;
using HealthCare.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HealthCare.Controllers;

[ApiController]
[Route("api/doctor")]
public class DoctorController : ControllerBase
{
    private readonly IDoctorService _doctorReg;
    private readonly IWebHostEnvironment _env;

    public DoctorController(IDoctorService doctorReg, IWebHostEnvironment env)
    {
        _doctorReg = doctorReg;
        _env = env;
    }

    // POST api/doctor/register
    // multipart/form-data:
    // name, email, password, licenseFile
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromForm] RegisterRequest req,
        [FromForm] IFormFile licenseFile,
        CancellationToken ct)
    {
        await _doctorReg.RegisterDoctorAsync(req, licenseFile, ct);
        return Ok(new { message = "Doctor registered successfully. Waiting for admin approval." });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyDoctorProfile(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var doctorId = await _doctorReg.GetDoctorIdByUserIdAsync(userId, ct);

        if (doctorId is null)
            return NotFound(new { message = "Doctor profile not found." });

        return Ok(new { doctorId });
    }
}
