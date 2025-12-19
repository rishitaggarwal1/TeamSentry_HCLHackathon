using Microsoft.EntityFrameworkCore;
using HealthCare.Models;

namespace HealthCare.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<DoctorProfile> DoctorProfiles => Set<DoctorProfile>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<DoctorSlot> DoctorSlots => Set<DoctorSlot>();
    public DbSet<PatientProfile> PatientProfiles => Set<PatientProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<PatientProfile>()
        .HasOne(p => p.User)
        .WithOne()
        .HasForeignKey<PatientProfile>(p => p.UserId)
        .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DoctorProfile>()
        .HasOne(d => d.User)
        .WithOne()
        .HasForeignKey<DoctorProfile>(d => d.UserId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DoctorSlot>()
            .HasOne(s => s.Doctor)
            .WithMany()
            .HasForeignKey(s => s.DoctorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DoctorSlot>()
            .HasOne(s => s.Patient)
            .WithMany()
            .HasForeignKey(s => s.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

    }

}
