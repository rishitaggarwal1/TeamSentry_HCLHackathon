// Services/AppointmentService.cs
using HealthCare.DTOs;
using HealthCare.Repositories.Interfaces;
using HealthCare.Services.Interfaces;

namespace HealthCare.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repo;
    public AppointmentService(IAppointmentRepository repo) => _repo = repo;

    private static DateTime ParseDateOrThrow(string date)
    {
        if (!DateOnly.TryParse(date, out var d))
            throw new InvalidOperationException("Invalid date. Use YYYY-MM-DD.");
        return d.ToDateTime(TimeOnly.MinValue);
    }

    public async Task<List<AvailableDoctorDto>> GetAvailableDoctorsAsync(string date, CancellationToken ct)
    {
        var slotDate = ParseDateOrThrow(date);

        var docs = await _repo.GetDoctorsWithAvailableSlotsAsync(slotDate, ct);
        return docs.Select(d => new AvailableDoctorDto(
            d.Id,
            d.User?.Name ?? "",
            d.User?.Email ?? ""
        )).ToList();
    }

    public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(Guid doctorId, string date, CancellationToken ct)
    {
        var slotDate = ParseDateOrThrow(date);

        var slots = await _repo.GetAvailableSlotsAsync(doctorId, slotDate, ct);
        return slots.Select(s => new AvailableSlotDto(
            s.SlotId,
            s.StartTime.ToString(@"hh\:mm"),
            s.EndTime.ToString(@"hh\:mm")
        )).ToList();
    }

    public async Task<(bool ok, string? error)> BookSlotAsync(Guid userId, BookSlotRequest req, CancellationToken ct)
    {
        if (req.SlotId == Guid.Empty) return (false, "SlotId is required.");

        var patient = await _repo.GetPatientByUserIdAsync(userId, ct);
        if (patient is null) return (false, "Patient profile not found.");

        var slot = await _repo.GetSlotByIdAsync(req.SlotId, ct);
        if (slot is null) return (false, "Slot not found.");
        if (slot.IsBooked) return (false, "Slot already booked.");

        slot.PatientId = patient.Id;
        slot.IsBooked = true;

        await _repo.SaveAsync(ct);
        return (true, null);
    }
}
