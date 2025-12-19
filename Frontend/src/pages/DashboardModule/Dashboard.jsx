import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { ChevronLeft, ChevronRight, LogOut, User, Lock } from "lucide-react";
import { authService } from "../../auth/auth.service";
import { userService } from "../../user/user.service";
import { notify } from "../../utils/toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [me, setMe] = useState({ name: "", email: "", role: "", ProfileImageUrl: "" });
  const [loadingMe, setLoadingMe] = useState(true);

  const dashboardCards = [
    { id: 1, title: "Appointments", description: "View and manage your upcoming appointments", icon: "📅", path: "/appointments" },
    { id: 2, title: "Medical Records", description: "Access your medical history and records", icon: "📋", path: "/records" },
    { id: 3, title: "Prescriptions", description: "View and refill your prescriptions", icon: "💊", path: "/prescriptions" },
    { id: 4, title: "Lab Results", description: "Check your recent lab test results", icon: "🔬", path: "/labs" },
    { id: 5, title: "Billing", description: "View your bills and payment history", icon: "💰", path: "/billing" },
    { id: 6, title: "Health Tips", description: "Get personalized health recommendations", icon: "💡", path: "/tips" },
  ];

  // Load logged-in user profile from backend
  useEffect(() => {
    const loadMe = async () => {
      try {
        setLoadingMe(true);
        const data = await userService.getMe();
        setMe({
          name: data?.name ?? "",
          email: data?.email ?? "",
          role: data?.role ?? "",
          ProfileImageUrl: data?.profileImageUrl ?? "avtaar.jpeg",
        });
      } catch (err) {
        // If auth fails, user should go to login (token expired or invalid)
        navigate("/login", { replace: true });
      } finally {
        setLoadingMe(false);
      }
    };

    loadMe();
  }, [navigate]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!showProfileMenu) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showProfileMenu]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? dashboardCards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === dashboardCards.length - 1 ? 0 : prev + 1));
  };

  const handleProfileClick = () => setShowProfileMenu((p) => !p);

  const handleViewProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const handleChangePassword = () => {
    setShowProfileMenu(false);
    navigate("/change-password");
  };

  const handleLogoutClick = async () => {
    try {
      setShowProfileMenu(false);
      await authService.logout(); // calls backend /api/auth/logout + clears storage
      notify("Logged out", "success");
      navigate("/login", { replace: true });
    } catch {
      // Even if backend fails, clear local session
      navigate("/login", { replace: true });
    }
  };

  const handleCardClick = (path) => {
    // If route not implemented yet, you can notify
    // navigate(path);
    notify("This module will be available soon", "info");
  };

  const visibleCards = [
    dashboardCards[currentIndex],
    dashboardCards[(currentIndex + 1) % dashboardCards.length],
    dashboardCards[(currentIndex + 2) % dashboardCards.length],
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <span className="logo-icon">🏥</span>
          <h1>HealthCare+</h1>
        </div>

        <div className="header-right">
          <div className="profile-section" ref={menuRef}>
            <img
              src={me.ProfileImageUrl}
              alt="Profile"
              className="profile-avatar"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            />

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="menu-item" onClick={handleViewProfile}>
                  <User size={18} />
                  <span>Profile</span>
                </div>

                <div className="menu-item" onClick={handleChangePassword}>
                  <Lock size={18} />
                  <span>Change Password</span>
                </div>

                <div className="menu-item logout" onClick={handleLogoutClick}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>

          {/* Optional icon-only logout button (kept hidden like your original) */}
          <button className="logout-btn" onClick={handleLogoutClick} title="Logout" style={{ display: "none" }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>
            {loadingMe ? "Loading..." : `Welcome${me?.name ? `, ${me.name}` : ""} 👋`}
          </h2>
          <p>{loadingMe ? "" : (me?.email ? me.email : "Logged in")}</p>
        </div>

        {/* Carousel Section */}
        <div className="carousel-section">
          <button className="carousel-btn prev" onClick={handlePrevious}>
            <ChevronLeft size={24} />
          </button>

          <div className="cards-container">
            {visibleCards.map((card, index) => (
              <div key={card.id} className={`dashboard-card ${index === 0 ? "active" : ""}`}>
                <div className="card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button className="card-btn" onClick={() => handleCardClick(card.path)}>
                  View More
                </button>
              </div>
            ))}
          </div>

          <button className="carousel-btn next" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicators */}
        <div className="carousel-indicators">
          {dashboardCards.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
