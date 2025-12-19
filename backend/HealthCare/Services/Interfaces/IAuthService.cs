using HealthCare.DTOs;

namespace HealthCare.Services.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request, string ip, string userAgent);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(Guid userId, Guid sessionId);
    Task<IEnumerable<object>> GetSessionsAsync(Guid userId);
    Task RevokeSessionAsync(Guid userId, Guid sessionId);
}
