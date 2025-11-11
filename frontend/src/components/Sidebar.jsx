

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("/images/default-avatar.png");

  // 🧠 Fetch user info from backend
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(`http://localhost:5000/api/auth/user/${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUser(data);
          if (data.avatarUrl) setAvatar(data.avatarUrl);
        }
      })
      .catch((err) => console.error("Sidebar user fetch error:", err));
  }, []);

  // 🚪 Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <aside className="w-64 border-r p-5 bg-white shadow-md flex flex-col items-center">
      {/* 👤 Profile Section (Image + Name + Location) */}
      {/* <div className="text-center">
        <h4 className="mt-4 font-semibold text-lg">
          {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
        </h4>
        <p className="text-sm text-gray-500">
          {user?.details1?.location ? `📍 ${user.details1.location}` : ""}
        </p>
      </div> */}
      <br /><br /><br /><br />

      {/* Navigation Menu */}
      <nav className="mt-8 w-full">
        <ul className="flex flex-col gap-2 text-center">
          <li>
            <Link to="/dashboard" className="block py-2 hover:bg-blue-100 rounded">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/profile" className="block py-2 hover:bg-blue-100 rounded">
              Profile
            </Link>
          </li>
          <li>
            <Link to="/service" className="block py-2 hover:bg-blue-100 rounded">
              Service
            </Link>
          </li>
          <li>
            <Link to="/skill-hub" className="block py-2 hover:bg-blue-100 rounded">
              Skill Hub
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block py-2 hover:bg-blue-100 rounded">
              Settings
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full py-2 text-red-600 hover:bg-red-100 rounded transition"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
