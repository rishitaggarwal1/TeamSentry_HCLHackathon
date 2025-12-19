import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { ArrowLeft, Mail, Phone, Camera } from "lucide-react";
import { notify } from "../../utils/toast";
import { userService } from "../../user/user.service";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    profileImageUrl: "", // NEW (read from backend if available)
  });

  const [original, setOriginal] = useState(null);

  // NEW: file state + preview
  const [selectedImage, setSelectedImage] = useState(null); // File
  const [previewUrl, setPreviewUrl] = useState(""); // local preview

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const me = await userService.getMe();
        const normalized = {
          name: me?.name ?? "",
          email: me?.email ?? "",
          phone: me?.phone ?? "",
          role: me?.role ?? "",
          profileImageUrl: me?.profileImageUrl ?? "avtaar.jpeg",
        };
        setProfileData(normalized);
        setOriginal(normalized);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to load profile";
        notify(msg, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // cleanup preview object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const avatarSrc = useMemo(() => {
    // Priority: new selected preview -> server image -> placeholder
    if (previewUrl) return previewUrl;
    if (profileData.profileImageUrl) return profileData.profileImageUrl;
    return "/avtaar.jpeg";
  }, [previewUrl, profileData.profileImageUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  // NEW: image validation + preview
  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validate type
    if (!file.type?.startsWith("image/")) {
      notify("Please select an image file", "error");
      e.target.value = "";
      return;
    }

    // validate size (example: 5MB)
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      notify(`Image must be under ${MAX_MB}MB`, "error");
      e.target.value = "";
      return;
    }

    // set file + preview
    setSelectedImage(file);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // IMPORTANT: backend expects multipart/form-data if you send file
      const form = new FormData();
      form.append("name", profileData.name ?? "");
      form.append("email", profileData.email ?? "");
      form.append("phone", profileData.phone ?? "");

      // The key MUST match your DTO property: ProfileImage
      if (selectedImage) form.append("ProfileImage", selectedImage);

      const updated = await userService.updateMeMultipart(form);

      const normalized = {
        name: updated?.name ?? profileData.name,
        email: updated?.email ?? profileData.email,
        phone: updated?.phone ?? profileData.phone,
        role: updated?.role ?? profileData.role,
        profileImageUrl: updated?.profileImageUrl ?? profileData.profileImageUrl,
      };

      setProfileData(normalized);
      setOriginal(normalized);

      // reset temp image state
      setSelectedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      setIsEditing(false);
      notify("Profile updated successfully", "success");
    } catch (err) {
      if (err?.response?.status === 409) {
        notify("Email already in use", "error");
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to update profile";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) setProfileData(original);

    // reset image state
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <header className="profile-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={24} />
          </button>
          <h1>My Profile</h1>
          <div className="header-spacer"></div>
        </header>
        <main className="profile-main">
          <div className="profile-card">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={24} />
        </button>
        <h1>My Profile</h1>
        <div className="header-spacer"></div>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <div className="avatar-section">
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={avatarSrc} alt="Profile" className="large-avatar" />

              {/* NEW: show upload button only while editing */}
              {isEditing && (
                <>
                  <label
                    htmlFor="profileImageInput"
                    title="Change photo"
                    style={{
                      position: "absolute",
                      right: 6,
                      bottom: 6,
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: "#111",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Camera size={18} />
                  </label>

                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handlePickImage}
                    style={{ display: "none" }}
                  />
                </>
              )}
            </div>

            <h2>{profileData.name || "User"}</h2>
            <p className="profile-status">{profileData.role || "User"}</p>

            {/* Optional helper text */}
            {isEditing && (
              <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Click the camera icon to upload a new photo (max 5MB).
              </p>
            )}
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{profileData.name}</p>
                  )}
                </div>

                <div className="info-field">
                  <label>
                    <Mail size={16} /> Email
                  </label>
                  {isEditing ? (
                    <input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{profileData.email}</p>
                  )}
                </div>

                <div className="info-field">
                  <label>
                    <Phone size={16} /> Phone
                  </label>
                  {isEditing ? (
                    <input
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  ) : (
                    <p>{profileData.phone || "-"}</p>
                  )}
                </div>

                <div className="info-field">
                  <label>Role</label>
                  <p>{profileData.role || "User"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {!isEditing ? (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
