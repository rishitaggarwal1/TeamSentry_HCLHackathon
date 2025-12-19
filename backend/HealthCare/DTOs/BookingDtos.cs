// DTOs/BookingDtos.cs
namespace HealthCare.DTOs;

public record AvailableDoctorDto(Guid DoctorId, string Name, string Email);
public record AvailableSlotDto(Guid SlotId, string Start, string End);
public record BookSlotRequest(Guid SlotId);
