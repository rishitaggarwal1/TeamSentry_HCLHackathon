using HealthCare.DTOs;
using HealthCare.Models;
using HealthCare.Repositories.Interfaces;
using HealthCare.Services.Interfaces;
using HealthCare.Utils.Interfaces;

namespace HealthCare.Services;

public class DoctorService : IDoctorService
{
    private readonly IAuthRepository _users;
    private readonly IDoctorRepository _doctors;
    private readonly IImageStorage _images;

    public DoctorService(IAuthRepository users, IDoctorRepository doctors, IImageStorage images)
    {
        _users = users;
        _doctors = doctors;
        _images = images;
    }
    public async Task<Guid?> GetDoctorIdByUserIdAsync(Guid userId, CancellationToken ct)
    {
        var doctor = await _doctors.GetDoctorByUserIdAsync(userId, ct);
        return doctor?.Id;
    }
    public async Task RegisterDoctorAsync(RegisterRequest req, IFormFile licenseFile, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        if (await _users.EmailExistsAsync(email))
            throw new InvalidOperationException("Email already exists.");

        if (licenseFile is null || licenseFile.Length == 0)
            throw new InvalidOperationException("Medical license file is required.");

        var ext = Path.GetExtension(licenseFile.FileName).ToLowerInvariant();
        var allowed = new HashSet<string> { ".pdf", ".png", ".jpg", ".jpeg" };
        if (!allowed.Contains(ext))
            throw new InvalidOperationException("Only PDF/PNG/JPG/JPEG allowed.");

        var user = new User
        {
            Name = req.Name.Trim(),
            Email = email,
            Role = "Doctor",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _users.AddUserAsync(user);
        await _users.SaveAsync();


        var (url, publicId) = await _images.UploadUserImageAsync(licenseFile, email.ToString(), ct);

        var doctorProfile = new DoctorProfile
        {
            UserId = user.Id,
            IsApproved = false,
            CreatedAtUtc = DateTime.UtcNow,
            LicenseImageUrl = url,
            LicenseImagePublicId = publicId,
            LicenseUploadedAtUtc = DateTime.UtcNow
        };

        await _doctors.AddAsync(doctorProfile, ct);
        await _doctors.SaveAsync(ct);
    }
}
