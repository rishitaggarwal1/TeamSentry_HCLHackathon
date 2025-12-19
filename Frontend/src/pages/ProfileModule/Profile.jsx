import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import {
  ArrowLeft,
  Mail,
  Phone,
  Camera,
  User,
  Calendar,
  Activity,
  FileText,
} from "lucide-react";
import { notify } from "../../utils/toast";
import { userService } from "../../user/user.service";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Expanded state to include Patient details
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    profileImageUrl: "",
    // Patient Specific Fields
    patientId: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    height: "",
    weight: "",
    maritalStatus: "",
    allergies: "",
  });

  const [original, setOriginal] = useState(null);

  // File state + preview
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // --- 1. Fetch User Data ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const me = await userService.getMe();

        // Normalize data (handle potential nulls)
        const normalized = {
          name: me?.name ?? "",
          email: me?.email ?? "",
          phone: me?.phone ?? "",
          role: me?.role ?? "", // "Patient" or "Doctor" or "Admin"
          profileImageUrl: me?.profileImageUrl ?? "avtaar.jpeg",

          // Patient specific mappings
          patientId: me?.patientId ?? "N/A", // Usually read-only
          gender: me?.gender ?? "",
          dob: me?.dob ? me.dob.split("T")[0] : "", // Format YYYY-MM-DD
          bloodGroup: me?.bloodGroup ?? "",
          height: me?.height ?? "",
          weight: me?.weight ?? "",
          maritalStatus: me?.maritalStatus ?? "",
          allergies: me?.allergies ?? "",
        };

        setProfileData(normalized);
        setOriginal(normalized);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load profile";
        notify(msg, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const avatarSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (profileData.profileImageUrl) return profileData.profileImageUrl;
    return "/avtaar.jpeg";
  }, [previewUrl, profileData.profileImageUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      notify("Please select an image file", "error");
      return;
    }

    // 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be under 5MB", "error");
      return;
    }

    setSelectedImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- 2. Save Updates ---
  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();

      // Basic Info
      form.append("name", profileData.name ?? "");
      form.append("email", profileData.email ?? "");
      form.append("phone", profileData.phone ?? "");

      // Append Patient Specifics ONLY if role is Patient
      if (profileData.role === "Patient") {
        form.append("gender", profileData.gender ?? "");
        form.append("dob", profileData.dob ?? "");
        form.append("bloodGroup", profileData.bloodGroup ?? "");
        form.append("height", profileData.height ?? "");
        form.append("weight", profileData.weight ?? "");
        form.append("maritalStatus", profileData.maritalStatus ?? "");
        form.append("allergies", profileData.allergies ?? "");
      }

      // Image
      if (selectedImage) form.append("ProfileImage", selectedImage);

      const updated = await userService.updateMeMultipart(form);

      // Re-normalize response to update UI state
      const normalized = {
        ...profileData, // Keep existing structure
        ...updated, // Overwrite with server response
        dob: updated?.dob ? updated.dob.split("T")[0] : profileData.dob,
      };

      setProfileData(normalized);
      setOriginal(normalized);
      setSelectedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      setIsEditing(false);
      notify("Profile updated successfully", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) setProfileData(original);
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="profile-container text-center p-10">Loading...</div>;
  }

  const isPatient = profileData.role === "Patient";

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
          {/* --- Avatar Section --- */}
          <div className="avatar-section">
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={avatarSrc} alt="Profile" className="large-avatar" />
              {isEditing && (
                <>
                  <label
                    htmlFor="profileImageInput"
                    className="camera-btn"
                    title="Change photo"
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
            {isPatient && (
              <p className="text-sm text-gray-500">
                ID: {profileData.patientId}
              </p>
            )}
          </div>

          <div className="profile-info">
            {/* --- General Account Info (Common for Everyone) --- */}
            <div className="info-section">
              <h3>
                <User size={18} className="inline mr-2" /> Account Information
              </h3>
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
                  <p className="read-only-text">{profileData.email}</p>{" "}
                  {/* Usually email is not editable directly */}
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
                    />
                  ) : (
                    <p>{profileData.phone || "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* --- Medical Details (ONLY FOR PATIENTS) --- */}
            {isPatient && (
              <>
                <div className="separator"></div>
                <div className="info-section">
                  <h3>
                    <Activity size={18} className="inline mr-2" /> Medical
                    Details
                  </h3>
                  <div className="info-grid">
                    {/* Gender & DOB */}
                    <div className="info-field">
                      <label>Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p>{profileData.gender || "-"}</p>
                      )}
                    </div>

                    <div className="info-field">
                      <label>
                        <Calendar size={16} /> Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dob"
                          value={profileData.dob}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p>{profileData.dob || "-"}</p>
                      )}
                    </div>

                    {/* Vitals */}
                    <div className="info-field">
                      <label>Blood Group</label>
                      {isEditing ? (
                        <select
                          name="bloodGroup"
                          value={profileData.bloodGroup}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      ) : (
                        <p>{profileData.bloodGroup || "-"}</p>
                      )}
                    </div>

                    <div className="info-field">
                      <label>Height (cm)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="height"
                          value={profileData.height}
                          onChange={handleInputChange}
                          placeholder="e.g. 175"
                        />
                      ) : (
                        <p>
                          {profileData.height
                            ? `${profileData.height} cm`
                            : "-"}
                        </p>
                      )}
                    </div>

                    <div className="info-field">
                      <label>Weight (kg)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="weight"
                          value={profileData.weight}
                          onChange={handleInputChange}
                          placeholder="e.g. 70"
                        />
                      ) : (
                        <p>
                          {profileData.weight
                            ? `${profileData.weight} kg`
                            : "-"}
                        </p>
                      )}
                    </div>

                    <div className="info-field">
                      <label>Marital Status</label>
                      {isEditing ? (
                        <select
                          name="maritalStatus"
                          value={profileData.maritalStatus}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">Select</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      ) : (
                        <p>{profileData.maritalStatus || "-"}</p>
                      )}
                    </div>

                    {/* Allergies - Full Width */}
                    <div className="info-field full-width">
                      <label>
                        <FileText size={16} /> Allergies / Medical Conditions
                      </label>
                      {isEditing ? (
                        <textarea
                          name="allergies"
                          value={profileData.allergies}
                          onChange={handleInputChange}
                          className="form-textarea"
                          rows="3"
                          placeholder="List any allergies or chronic conditions..."
                        />
                      ) : (
                        <p>{profileData.allergies || "None reported"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
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
