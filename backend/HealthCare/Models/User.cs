using System.ComponentModel.DataAnnotations;

namespace HealthCare.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string Name { get; set; } = string.Empty;

    [Required, EmailAddress] public string Email { get; set; } = string.Empty;

    [Required] public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    // "User" or "Admin"
    [Required] public string Role { get; set; } = "User";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public string? ProfileImageUrl { get; set; }
    public string? ProfileImagePublicId { get; set; }
}
