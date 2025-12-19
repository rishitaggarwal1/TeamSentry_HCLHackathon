using HealthCare.Models;
namespace HealthCare.Services.Interfaces;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
}
