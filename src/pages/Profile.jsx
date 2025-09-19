import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiCamera, FiX, FiEdit3 } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { backendURL } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [removingPic, setRemovingPic] = useState(false);
  const [editing, setEditing] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const response = await axios.get(`${backendURL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const { name, lastName, email, mobileNumber, profilePicture } = response.data.user;
          setFormData({ name, lastName, email, mobileNumber });
          setProfilePic(profilePicture);
          setUser(response.data.user); // Update context
        } else {
          toast.error(response.data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size (e.g., images only, max 5MB)
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setProfilePicFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePic = async () => {
    if (!profilePicFile) return;
    setUploadingPic(true);
    const formDataToSend = new FormData();
    formDataToSend.append("profilePic", profilePicFile);
    try {
      const response = await axios.post(`${backendURL}/api/user/profile-pic`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (response.data.success) {
        setProfilePic(response.data.profilePicture);
        setUser((prev) => ({ ...prev, profilePicture: response.data.profilePicture }));
        setProfilePicFile(null);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(response.data.message || "Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploadingPic(false);
    }
  };

  const removeProfilePic = async () => {
    if (!profilePic) return;
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    setRemovingPic(true);
    try {
      const response = await axios.delete(`${backendURL}/api/user/profile-pic`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setProfilePic(null);
        setUser((prev) => ({ ...prev, profilePicture: null }));
        toast.success("Profile picture removed successfully");
      } else {
        toast.error(response.data.message || "Failed to remove profile picture");
      }
    } catch (err) {
      console.error("Remove error:", err);
      toast.error(err.response?.data?.message || "Failed to remove profile picture");
    } finally {
      setRemovingPic(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await axios.put(`${backendURL}/api/user/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setUser((prev) => ({ ...prev, ...formData }));
        setEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-lg rounded-2xl p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Update your personal information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/128?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-4xl">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <FiCamera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
              {profilePic && (
                <button
                  onClick={removeProfilePic}
                  disabled={removingPic}
                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <FiX className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            {profilePicFile && (
              <button
                onClick={uploadProfilePic}
                disabled={uploadingPic}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {uploadingPic ? "Uploading..." : "Upload Photo"}
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                  <FiEdit3 className={`ml-1 ${editing ? "text-blue-500" : "text-gray-400"}`} />
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                      editing ? "bg-white" : "bg-gray-50"
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                  <FiEdit3 className={`ml-1 ${editing ? "text-blue-500" : "text-gray-400"}`} />
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                      editing ? "bg-white" : "bg-gray-50"
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                    editing ? "bg-white" : "bg-gray-50"
                  }`}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                    editing ? "bg-white" : "bg-gray-50"
                  }`}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      // Reset to original data if needed
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;