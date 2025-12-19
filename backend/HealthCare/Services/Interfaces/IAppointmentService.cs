// Services/Interfaces/IAppointmentService.cs
using HealthCare.DTOs;

namespace HealthCare.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AvailableDoctorDto>> GetAvailableDoctorsAsync(string date, CancellationToken ct);
    Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(Guid doctorId, string date, CancellationToken ct);
    Task<(bool ok, string? error)> BookSlotAsync(Guid userId, BookSlotRequest req, CancellationToken ct);
}

