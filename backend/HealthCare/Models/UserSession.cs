namespace HealthCare.Models;

public class UserSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    // Device identifier from frontend (uuid stored in localStorage)
    public string DeviceId { get; set; } = string.Empty;

    // Friendly name from frontend (optional)
    public string DeviceName { get; set; } = "Unknown";

    public string UserAgent { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;

    // Refresh token is stored as hash
    public string RefreshTokenHash { get; set; } = string.Empty;

    public bool IsRevoked { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}
