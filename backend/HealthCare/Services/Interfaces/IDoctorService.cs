using HealthCare.DTOs;

namespace HealthCare.Services.Interfaces;

public interface IDoctorService
{
    Task<Guid?> GetDoctorIdByUserIdAsync(Guid userId, CancellationToken ct);
    Task RegisterDoctorAsync(RegisterRequest req, IFormFile licenseFile, CancellationToken ct);
}
