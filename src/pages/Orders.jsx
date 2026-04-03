import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "../services/orderService.js";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  confirmed:   "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed:   "bg-green-100 text-green-700",
  cancelled:   "bg-gray-100 text-gray-600",
  refunded:    "bg-red-100 text-red-700",
};

const SELLER_NEXT = {
  pending:     ["confirmed", "cancelled"],
  confirmed:   ["in_progress", "cancelled"],
  in_progress: ["completed"],
};
const BUYER_NEXT = {
  pending:   ["cancelled"],
  confirmed: ["cancelled"],
};

const STATUS_LABELS = {
  confirmed:   "Confirm Order",
  in_progress: "Mark In Progress",
  completed:   "Mark Completed",
  cancelled:   "Cancel Order",
};

function StatusDropdown({ orderId, nextStatuses, updating, onUpdate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!nextStatuses.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={updating === orderId}
        className="flex items-center gap-1.5 text-xs font-medium border border-gray-300 hover:border-primary-400 hover:text-primary-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {updating === orderId ? "Updating..." : "Update Status"}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => { onUpdate(orderId, s); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              {STATUS_LABELS[s] || s.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [tab, setTab]           = useState("buying");
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async (t = tab) => {
    setLoading(true);
    try {
      const data = t === "buying"
        ? await orderService.getMyOrders()
        : await orderService.getSellingOrders();
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(tab); }, [tab]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order marked as ${status.replace("_", " ")}.`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update order.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { key: "buying",  label: "Buying",  icon: <ShoppingBag className="w-4 h-4" /> },
          { key: "selling", label: "Selling", icon: <Package className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">No {tab === "buying" ? "purchases" : "sales"} yet</p>
          {tab === "buying" && (
            <Link to="/listings" className="text-sm text-primary-600 hover:underline mt-2 inline-block">Browse listings</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatuses = tab === "buying"
              ? (BUYER_NEXT[order.status] || [])
              : (SELLER_NEXT[order.status] || []);

            const otherName   = tab === "buying" ? order.seller_name  : order.buyer_name;
            const otherAvatar = tab === "buying" ? order.seller_avatar : order.buyer_avatar;

            // Build full image URL
            const imgUrl = order.listing_image
              ? `http://localhost:5000/uploads/${order.listing_image}`
              : null;

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <Link to={`/listings/${order.listing_id}`} className="w-full sm:w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 block">
                  {imgUrl ? (
                    <img src={imgUrl} alt={order.listing_title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display="none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <Link to={`/listings/${order.listing_id}`} className="font-semibold text-gray-900 text-sm hover:text-primary-600 transition-colors">
                        {order.listing_title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {otherAvatar ? (
                          <img src={otherAvatar} alt={otherName} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 text-[9px] font-bold">{otherName?.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{tab === "buying" ? "Seller" : "Buyer"}: {otherName}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[order.status]}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-primary-600">₱{parseFloat(order.total_price).toLocaleString("en-PH")}</span>
                      <span className="text-gray-400 ml-2">×{order.quantity}</span>
                      <span className="text-xs text-gray-400 ml-3">
                        {new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <StatusDropdown
                      orderId={order.id}
                      nextStatuses={nextStatuses}
                      updating={updating}
                      onUpdate={handleStatusChange}
                    />
                  </div>

                  {order.notes && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">Note: {order.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
