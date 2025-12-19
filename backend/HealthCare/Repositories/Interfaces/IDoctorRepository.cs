using HealthCare.Models;

namespace HealthCare.Repositories.Interfaces;

public interface IDoctorRepository
{
    Task AddAsync(DoctorProfile profile, CancellationToken ct);
    Task<DoctorProfile?> GetDoctorByUserIdAsync(Guid userId, CancellationToken ct);
    Task SaveAsync(CancellationToken ct);
}
