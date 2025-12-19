using HealthCare.Models;
namespace HealthCare.Repositories.Interfaces;


public interface IAuthRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(Guid userId);
    Task AddUserAsync(User user);

    Task<List<UserSession>> GetActiveSessionsByDeviceAsync(Guid userId, string deviceId);
    Task AddSessionAsync(UserSession session);
    Task<UserSession?> GetSessionByIdAsync(Guid sessionId);
    Task<List<UserSession>> GetActiveSessionsAsync(Guid userId);
    Task SaveAsync();
}
