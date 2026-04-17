import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Bell, MessageCircle, Plus, LogOut, ShoppingBag, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [search, setSearch]           = useState("");
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const notifRef                      = useRef(null);

  // Fetch notifications & poll every 30s
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setNotifications([]); setUnreadCount(0); return; }
    const fetchNotifs = () => {
      api.get("/notifications")
        .then(({ data }) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/listings?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out.");
    navigate("/");
    setMenuOpen(false);
  };

  const handleOpenNotif = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && unreadCount > 0) {
      try {
        await api.put("/notifications/read");
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      } catch { /* silent */ }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NH</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">NeighborHub</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleOpenNotif}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-sm text-gray-900">Notifications</span>
                        {notifications.length > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" /> All read</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-primary-50" : ""}`}
                            >
                              {n.link ? (
                                <Link to={n.link} onClick={() => setNotifOpen(false)} className="block">
                                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                </Link>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/messages" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full" title="Messages">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link to="/orders" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full" title="Orders">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-90">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary-500" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-500 flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-full transition-colors">
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/create-listing"
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-3 py-2" onClick={() => setMenuOpen(false)}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </Link>
              <Link to="/messages" className="flex items-center gap-2 text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                <MessageCircle className="w-4 h-4" /> Messages
              </Link>
              <Link to="/orders" className="flex items-center gap-2 text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                <ShoppingBag className="w-4 h-4" /> My Orders
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                <Bell className="w-4 h-4" /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 py-2 w-full">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="text-sm font-medium text-primary-600 py-2 block" onClick={() => setMenuOpen(false)}>
                Sign up free
              </Link>
            </>
          )}
          <Link
            to="/create-listing"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-accent-500 px-4 py-2 rounded-full w-fit"
            onClick={() => setMenuOpen(false)}
          >
            <Plus className="w-4 h-4" /> Post a Listing
          </Link>
        </div>
      )}
    </header>
  );
}
