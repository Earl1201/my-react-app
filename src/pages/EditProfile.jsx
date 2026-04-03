import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate        = useNavigate();

  const [form, setForm] = useState({
    name:     user?.name     || "",
    city:     user?.city     || "",
    barangay: user?.barangay || "",
    bio:      user?.bio      || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/users/me", form);
      // Keep AuthContext (navbar name etc.) in sync
      updateUser({ name: form.name.trim(), city: form.city.trim(), barangay: form.barangay.trim(), bio: form.bio.trim() });
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-xs text-gray-500">Update your public profile information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
        {/* Avatar preview (placeholder — upload not implemented here) */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-200" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-100 border-2 border-primary-200 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PH", { month: "long", year: "numeric" }) : "—"}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">City / Municipality</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Cebu City"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Barangay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay</label>
          <input
            type="text"
            name="barangay"
            value={form.barangay}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Lahug"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Tell your neighbors a little about yourself..."
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            to="/profile"
            className="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
