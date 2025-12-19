using HealthCare.Data;
using HealthCare.Models;
using HealthCare.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthCare.Repositories.Implementations;

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _db;

    public AuthRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<bool> EmailExistsAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public Task<User?> GetUserByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<User?> GetUserByIdAsync(Guid userId) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

    public async Task AddUserAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public Task<List<UserSession>> GetActiveSessionsByDeviceAsync(Guid userId, string deviceId) =>
        _db.UserSessions
            .Where(s => s.UserId == userId && s.DeviceId == deviceId && !s.IsRevoked)
            .ToListAsync();

    public async Task AddSessionAsync(UserSession session)
    {
        _db.UserSessions.Add(session);
        await _db.SaveChangesAsync();
    }

    public Task<UserSession?> GetSessionByIdAsync(Guid sessionId) =>
        _db.UserSessions.FirstOrDefaultAsync(s => s.Id == sessionId);

    public Task<List<UserSession>> GetActiveSessionsAsync(Guid userId) =>
        _db.UserSessions
            .Where(s => s.UserId == userId && !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public Task SaveAsync() => _db.SaveChangesAsync();
}
