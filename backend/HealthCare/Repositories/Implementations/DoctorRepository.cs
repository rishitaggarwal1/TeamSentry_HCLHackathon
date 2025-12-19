using HealthCare.Data;
using HealthCare.Models;
using HealthCare.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthCare.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly AppDbContext _db;
    public DoctorRepository(AppDbContext db) => _db = db;

    public Task AddAsync(DoctorProfile profile, CancellationToken ct) =>
        _db.DoctorProfiles.AddAsync(profile, ct).AsTask();

    public Task<DoctorProfile?> GetDoctorByUserIdAsync(Guid userId, CancellationToken ct) =>
        _db.DoctorProfiles
           .AsNoTracking()
           .FirstOrDefaultAsync(d => d.UserId == userId, ct);
    public Task SaveAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
