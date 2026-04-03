import { useState, useEffect } from "react";
import { Users, Package, ShoppingBag, MessageCircle, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";

export default function AdminDashboard() {
  const [tab, setTab]         = useState("overview");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [s, u, l] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/listings"),
        ]);
        setStats(s.data);
        setUsers(u.data.users);
        setListings(l.data.listings);
      } catch {
        toast.error("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleVerified = async (userId, current) => {
    try {
      await api.put(`/admin/users/${userId}`, { isVerified: !current });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_verified: !current } : u));
      toast.success(current ? "User unverified." : "User verified.");
    } catch {
      toast.error("Failed to update user.");
    }
  };

  const deleteListing = async (id) => {
    if (!confirm("Remove this listing?")) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing removed.");
    } catch {
      toast.error("Failed to remove listing.");
    }
  };

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "users",    label: `Users (${users.length})` },
    { key: "listings", label: `Listings (${listings.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Platform management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "overview" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users",    value: stats.totalUsers,    icon: <Users className="w-6 h-6 text-blue-500" />,    bg: "bg-blue-50" },
                  { label: "Active Listings",value: stats.totalListings, icon: <Package className="w-6 h-6 text-green-500" />, bg: "bg-green-50" },
                  { label: "Total Orders",   value: stats.totalOrders,   icon: <ShoppingBag className="w-6 h-6 text-accent-500" />, bg: "bg-orange-50" },
                  { label: "Messages Sent",  value: stats.totalMessages, icon: <MessageCircle className="w-6 h-6 text-purple-500" />, bg: "bg-purple-50" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>{stat.icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Quick Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Verified Users</p>
                    <p className="font-bold text-gray-900">{users.filter((u) => u.is_verified).length} / {users.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Admin Accounts</p>
                    <p className="font-bold text-gray-900">{users.filter((u) => u.role === "admin").length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Avg Listings/User</p>
                    <p className="font-bold text-gray-900">
                      {users.length > 0 ? (stats.totalListings / users.length).toFixed(1) : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">City</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Listings</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                              <span className="text-primary-700 font-bold text-xs">{u.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-[120px]">{u.name}</span>
                            {u.is_verified ? <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">{u.email}</td>
                        <td className="px-4 py-3 text-gray-600">{u.city || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.listing_count}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleVerified(u.id, u.is_verified)}
                            title={u.is_verified ? "Remove verification" : "Verify user"}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {u.is_verified
                              ? <ShieldOff className="w-4 h-4 text-gray-400" />
                              : <ShieldCheck className="w-4 h-4 text-green-500" />
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Listings ── */}
          {tab === "listings" && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Seller</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Posted</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{l.title}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">{l.seller_name}</td>
                        <td className="px-4 py-3 text-gray-600">{l.category}</td>
                        <td className="px-4 py-3 text-primary-600 font-semibold">₱{parseFloat(l.price).toLocaleString("en-PH")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(l.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteListing(l.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
