// Repositories/Interfaces/IAppointmentRepository.cs
using HealthCare.Models;

namespace HealthCare.Repositories.Interfaces;

public interface IAppointmentRepository
{
    Task<List<DoctorProfile>> GetDoctorsWithAvailableSlotsAsync(DateTime date, CancellationToken ct);
    Task<List<DoctorSlot>> GetAvailableSlotsAsync(Guid doctorId, DateTime date, CancellationToken ct);

    Task<DoctorSlot?> GetSlotByIdAsync(Guid slotId, CancellationToken ct);
    Task<PatientProfile?> GetPatientByUserIdAsync(Guid userId, CancellationToken ct);

    Task SaveAsync(CancellationToken ct);
}
