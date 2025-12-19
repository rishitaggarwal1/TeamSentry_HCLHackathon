// Repositories/AppointmentRepository.cs
using HealthCare.Data;
using HealthCare.Models;
using HealthCare.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthCare.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _db;
    public AppointmentRepository(AppDbContext db) => _db = db;

    public async Task<List<DoctorProfile>> GetDoctorsWithAvailableSlotsAsync(DateTime date, CancellationToken ct)
    {
        // Doctors that have ANY slot for that date where IsBooked=false
        var doctorIds = await _db.DoctorSlots
            .Where(s => s.Date == date && !s.IsBooked)
            .Select(s => s.DoctorId)
            .Distinct()
            .ToListAsync(ct);

        return await _db.DoctorProfiles
            .Include(d => d.User)
            .Where(d => d.IsApproved && doctorIds.Contains(d.Id))
            .OrderBy(d => d.User!.Name)
            .ToListAsync(ct);
    }

    public Task<List<DoctorSlot>> GetAvailableSlotsAsync(Guid doctorId, DateTime date, CancellationToken ct) =>
        _db.DoctorSlots
          .Where(s => s.DoctorId == doctorId && s.Date == date && !s.IsBooked)
          .OrderBy(s => s.StartTime)
          .ToListAsync(ct);

    public Task<DoctorSlot?> GetSlotByIdAsync(Guid slotId, CancellationToken ct) =>
        _db.DoctorSlots.FirstOrDefaultAsync(s => s.SlotId == slotId, ct);

    public Task<PatientProfile?> GetPatientByUserIdAsync(Guid userId, CancellationToken ct) =>
        _db.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public Task SaveAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
