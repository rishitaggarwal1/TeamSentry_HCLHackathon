namespace HealthCare.DTOs;

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password, string DeviceId, string? DeviceName);

public record AuthResponse(string AccessToken, string RefreshToken, Guid SessionId, string Role);

public record RefreshRequest(string RefreshToken, Guid SessionId);
public record LogoutRequest(Guid SessionId);
