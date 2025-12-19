using HealthCare.DTOs;
using HealthCare.Models;
using HealthCare.Repositories.Interfaces;
using HealthCare.Services.Interfaces;
using Microsoft.Extensions.Configuration;
namespace HealthCare.Services.Implementations;


public class AuthService : IAuthService
{
    private readonly IAuthRepository _repo;
    private readonly IJwtTokenService _jwt;
    private readonly IConfiguration _config;

    public AuthService(IAuthRepository repo, IJwtTokenService jwt, IConfiguration config)
    {
        _repo = repo;
        _jwt = jwt;
        _config = config;
    }

    public async Task RegisterAsync(RegisterRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        if (await _repo.EmailExistsAsync(email))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Name = req.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = "User"
        };

        await _repo.AddUserAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, string ip, string ua)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _repo.GetUserByEmailAsync(email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (string.IsNullOrWhiteSpace(req.DeviceId))
            throw new ArgumentException("DeviceId is required.");

        var refreshDays = int.Parse(_config["Jwt:RefreshTokenDays"] ?? "7");
        var refreshToken = Guid.NewGuid().ToString("N");

        var oldSessions = await _repo.GetActiveSessionsByDeviceAsync(user.Id, req.DeviceId);
        oldSessions.ForEach(s => s.IsRevoked = true);

        var session = new UserSession
        {
            UserId = user.Id,
            DeviceId = req.DeviceId,
            DeviceName = req.DeviceName ?? "Unknown",
            UserAgent = ua,
            IpAddress = ip,
            RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays)
        };

        await _repo.AddSessionAsync(session);

        var access = _jwt.CreateAccessToken(user);
        return new AuthResponse(access, refreshToken, session.Id, user.Role);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest req)
    {
        var session = await _repo.GetSessionByIdAsync(req.SessionId);

        if (session == null || session.IsRevoked || session.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedAccessException("Session expired.");

        if (!BCrypt.Net.BCrypt.Verify(req.RefreshToken, session.RefreshTokenHash))
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var user = await _repo.GetUserByIdAsync(session.UserId)!;
        var access = _jwt.CreateAccessToken(user!);

        return new AuthResponse(access, null!, session.Id, user!.Role);
    }

    public async Task LogoutAsync(Guid userId, Guid sessionId)
    {
        var session = await _repo.GetSessionByIdAsync(sessionId);
        if (session != null && session.UserId == userId)
        {
            session.IsRevoked = true;
            await _repo.SaveAsync();
        }
    }

    public async Task<IEnumerable<object>> GetSessionsAsync(Guid userId)
    {
        var sessions = await _repo.GetActiveSessionsAsync(userId);

        return sessions.Select(s => new
        {
            s.Id,
            s.DeviceId,
            s.DeviceName,
            s.IpAddress,
            s.UserAgent,
            s.CreatedAt,
            s.ExpiresAt
        });
    }

    public async Task RevokeSessionAsync(Guid userId, Guid sessionId)
    {
        await LogoutAsync(userId, sessionId);
    }
}
