


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState("/images/default-avatar.png");
  const [tempAvatar, setTempAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const options = [
    {
      title: "Build Profile",
      desc: "Complete your personal and professional info",
      path: "/buildprofile",
    },
    {
      title: "Create Service",
      desc: "List your freelance offerings",
      path: "/service",
    },
    {
      title: "Explore Jobs",
      desc: "Find projects that match your skills",
      path: "/jobs",
    },
  ];

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${email}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          if (data.avatarUrl) setAvatar(data.avatarUrl);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const openFilePicker = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempAvatar(event.target.result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempAvatar(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const file = fileInputRef.current.files[0];
      const email = localStorage.getItem("userEmail");
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("email", email);

      const res = await fetch("http://localhost:5000/api/auth/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setAvatar(data.url);
        setTempAvatar(null);
        setIsEditing(false);
        setUser(data.user);
        alert("✅ Profile picture updated!");
      } else {
        alert("Upload failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong 😢");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome {" "}
              <span className="text-blue-600">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </span>
            </h1>
            {user?.details1?.location && (
              <p className="text-gray-500 text-sm">
                📍 {user.details1.location}
              </p>
            )}
          </div>

          {/* Profile Image */}
          <div className="relative group">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100">
              <img
                src={tempAvatar || avatar}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <button
              onClick={openFilePicker}
              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit photo"
            >
              ✏️
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {isEditing && (
              <div className="flex gap-2 mt-3 absolute -bottom-10 right-0">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-2 py-1 rounded bg-blue-600 text-white text-xs shadow-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 rounded bg-gray-200 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="cursor-pointer bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
