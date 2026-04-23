import { useState, useEffect, useRef } from "react";
import { Users, Package, ShoppingBag, MessageCircle, Trash2, ShieldCheck, ShieldOff, BarChart2, FileText, Download, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import api from "../services/api.js";

const STATUS_COLORS = {
  pending:     "#f59e0b",
  confirmed:   "#3b82f6",
  in_progress: "#8b5cf6",
  completed:   "#10b981",
  cancelled:   "#6b7280",
  refunded:    "#ef4444",
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#6b7280", "#ef4444"];

function exportCSV(orders) {
  const header = ["ID", "Listing", "Buyer", "Seller", "Qty", "Total (PHP)", "Status", "Date"];
  const rows = orders.map((o) => [
    o.id,
    `"${o.listing_title}"`,
    `"${o.buyer_name}"`,
    `"${o.seller_name}"`,
    o.quantity,
    parseFloat(o.total_price).toFixed(2),
    o.status,
    new Date(o.created_at).toLocaleDateString("en-PH"),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transaction_history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(orders) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setTextColor(29, 78, 216);
  doc.text("NeighborHub — Transaction History Report", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`, 14, 23);
  autoTable(doc, {
    startY: 28,
    head: [["ID", "Listing", "Buyer", "Seller", "Qty", "Total (PHP)", "Status", "Date"]],
    body: orders.map((o) => [
      `#${o.id}`,
      o.listing_title,
      o.buyer_name,
      o.seller_name,
      o.quantity,
      `₱${parseFloat(o.total_price).toLocaleString("en-PH")}`,
      o.status.replace("_", " "),
      new Date(o.created_at).toLocaleDateString("en-PH"),
    ]),
    headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 244, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });
  doc.save("transaction_history.pdf");
}

function ExportDropdown({ orders }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={orders.length === 0}
        className="flex items-center gap-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[145px] overflow-hidden">
          <button
            onClick={() => { exportCSV(orders); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> Export as CSV
          </button>
          <button
            onClick={() => { exportPDF(orders); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]           = useState("overview");
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [loading, setLoading]   = useState(true);

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

  // Lazy-load analytics + reports data when those tabs are opened
  useEffect(() => {
    if (tab === "analytics" && !analytics) {
      api.get("/admin/analytics")
        .then(({ data }) => setAnalytics(data))
        .catch(() => toast.error("Failed to load analytics."));
    }
    if (tab === "reports" && allOrders.length === 0) {
      Promise.all([api.get("/admin/orders"), api.get("/admin/user-activity")])
        .then(([o, u]) => { setAllOrders(o.data.orders); setUserActivity(u.data.users); })
        .catch(() => toast.error("Failed to load reports."));
    }
  }, [tab, analytics, allOrders.length]);

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
    { key: "overview",  label: "Overview",             icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "analytics", label: "Analytics",            icon: <BarChart2 className="w-4 h-4" /> },
    { key: "reports",   label: "Reports",              icon: <FileText className="w-4 h-4" /> },
    { key: "users",     label: `Users (${users.length})`,     icon: <Users className="w-4 h-4" /> },
    { key: "listings",  label: `Listings (${listings.length})`, icon: <Package className="w-4 h-4" /> },
  ];

  const filteredOrders = orderFilter === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === orderFilter);

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
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.icon}{t.label}
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

          {/* ── Analytics ── */}
          {tab === "analytics" && (
            <div className="space-y-6">
              {!analytics ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Revenue summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <p className="text-xs text-gray-400 mb-1">Total Revenue (Completed Orders)</p>
                      <p className="text-3xl font-bold text-green-600">₱{parseFloat(analytics.revenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <p className="text-xs text-gray-400 mb-2">Top Sellers by Revenue</p>
                      <div className="space-y-1.5">
                        {analytics.topSellers.length === 0 ? (
                          <p className="text-sm text-gray-400">No completed orders yet.</p>
                        ) : analytics.topSellers.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700 truncate">{i + 1}. {s.name}</span>
                            <span className="text-green-600 font-semibold shrink-0 ml-2">₱{parseFloat(s.revenue).toLocaleString("en-PH")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Orders over time */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Orders — Last 30 Days</h2>
                    {analytics.ordersOverTime.length === 0 ? (
                      <p className="text-sm text-gray-400 py-8 text-center">No order data in the last 30 days.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={analytics.ordersOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip formatter={(v) => [v, "Orders"]} labelFormatter={(d) => new Date(d).toLocaleDateString("en-PH", { month: "long", day: "numeric" })} />
                          <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* New users over time */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">New Users — Last 30 Days</h2>
                    {analytics.usersOverTime.length === 0 ? (
                      <p className="text-sm text-gray-400 py-8 text-center">No new users in the last 30 days.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={analytics.usersOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip formatter={(v) => [v, "New Users"]} labelFormatter={(d) => new Date(d).toLocaleDateString("en-PH", { month: "long", day: "numeric" })} />
                          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Orders by status pie */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
                      {analytics.ordersByStatus.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No orders yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={analytics.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {analytics.ordersByStatus.map((entry, i) => (
                                <Cell key={i} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v, n) => [v, n]} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Category distribution bar */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h2 className="font-semibold text-gray-900 mb-4">Listings by Category</h2>
                      {analytics.categoryDistribution.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No listings yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={analytics.categoryDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                            <Tooltip formatter={(v) => [v, "Listings"]} />
                            <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Reports ── */}
          {tab === "reports" && (
            <div className="space-y-8">
              {/* Transaction History */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Transaction History</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Statuses</option>
                      {["pending","confirmed","in_progress","completed","cancelled","refunded"].map((s) => (
                        <option key={s} value={s}>{s.replace("_"," ")}</option>
                      ))}
                    </select>
                    <ExportDropdown orders={filteredOrders} />
                  </div>
                </div>
                {allOrders.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">Loading orders…</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">No orders match this filter.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["ID", "Listing", "Buyer", "Seller", "Qty", "Total", "Status", "Date"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 text-xs">#{o.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{o.listing_title}</td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{o.buyer_name}</td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{o.seller_name}</td>
                            <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                            <td className="px-4 py-3 text-primary-600 font-semibold">₱{parseFloat(o.total_price).toLocaleString("en-PH")}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>
                                {o.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* User Activity */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">User Activity Log</h2>
                </div>
                {userActivity.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">Loading user activity…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["User", "Email", "Role", "Listings", "Orders Placed", "Orders Received", "Messages Sent", "Joined"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userActivity.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                  <span className="text-primary-700 font-bold text-xs">{u.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-gray-900 truncate max-w-[100px]">{u.name}</span>
                                {u.is_verified ? <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /> : null}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[140px]">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">{u.listing_count}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{u.orders_placed}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{u.orders_received}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{u.messages_sent}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
