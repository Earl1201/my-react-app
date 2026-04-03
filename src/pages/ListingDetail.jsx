import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, ShieldCheck, Flag, ShoppingBag, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { listingService } from "../services/listingService.js";
import { messageService } from "../services/messageService.js";
import { orderService } from "../services/orderService.js";
import { formatPrice } from "../utils/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved]         = useState(false);
  const [ordering, setOrdering]   = useState(false);
  const [deleting, setDeleting]   = useState(false);

  // Review state
  const [canReview, setCanReview]       = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover]   = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone]     = useState(false);

  useEffect(() => {
    listingService.getById(id)
      .then(({ listing }) => setListing(listing))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Check saved state + whether user can leave a review
  useEffect(() => {
    if (!user || !listing) return;
    const isOwn = user.id === listing.seller?.id;
    if (!isOwn) {
      api.get(`/saved/${id}`).then(({ data }) => setSaved(data.saved)).catch(() => {});
      // Check if user has a completed order with this seller → can review
      api.get("/orders").then(({ data }) => {
        const hasCompleted = data.orders.some(
          (o) => o.seller_id === listing.seller?.id && o.status === "completed"
        );
        setCanReview(hasCompleted);
      }).catch(() => {});
    }
  }, [user, listing, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <span className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔎</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <Link to="/listings" className="text-primary-600 hover:underline text-sm">Back to listings</Link>
      </div>
    );
  }

  const { title, description, price, priceType, type, category, city, barangay, images, seller, condition, createdAt, status } = listing;

  const imgList = images?.length > 0 ? images : [{ url: "https://placehold.co/800x500?text=No+Image" }];
  const prevImg = () => setActiveImg((i) => (i - 1 + imgList.length) % imgList.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % imgList.length);

  const handleContact = async () => {
    if (!user) return navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
    try {
      const { conversationId } = await messageService.startConversation(listing.id, seller.id);
      navigate(`/messages?conv=${conversationId}`);
    } catch {
      toast.error("Could not start conversation.");
    }
  };

  const handleToggleSave = async () => {
    if (!user) return navigate("/login");
    try {
      const { data } = await api.post(`/saved/${id}`);
      setSaved(data.saved);
      toast.success(data.saved ? "Saved to wishlist!" : "Removed from wishlist.");
    } catch {
      toast.error("Could not update saved status.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) { toast.error("Please select a star rating."); return; }
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        sellerId:  listing.seller.id,
        listingId: listing.id,
        rating:    reviewRating,
        comment:   reviewComment.trim() || null,
      });
      toast.success("Review submitted!");
      setReviewDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleSold = async () => {
    const newStatus = listing.status === "sold" ? "active" : "sold";
    try {
      await listingService.updateStatus(id, newStatus);
      setListing((prev) => ({ ...prev, status: newStatus }));
      toast.success(newStatus === "sold" ? "Marked as sold!" : "Listing is active again.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await listingService.delete(id);
      toast.success("Listing deleted.");
      navigate("/profile");
    } catch {
      toast.error("Failed to delete listing.");
      setDeleting(false);
    }
  };

  const handleOrder = async () => {
    if (!user) return navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
    setOrdering(true);
    try {
      await orderService.create(listing.id);
      toast.success("Order placed! 🎉 Check your orders page.");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not place order.");
    } finally {
      setOrdering(false);
    }
  };

  const isOwnListing = user && user.id === seller?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link to="/listings" className="hover:text-gray-700">Listings</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={imgList[activeImg]?.url}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/800x500?text=No+Image"; }}
              />
              {imgList.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"><ChevronRight className="w-5 h-5" /></button>
                </>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type === "service" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                  {type === "service" ? "Service" : condition === "new" ? "New" : "Used"}
                </span>
                {status === "sold" && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">SOLD</span>}
              </div>
            </div>
            {imgList.length > 1 && (
              <div className="flex gap-2 p-3">
                {imgList.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)} className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${activeImg === idx ? "border-primary-500" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/64x48"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">{category}</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{title}</h1>
            <p className="text-3xl font-bold text-primary-600">{formatPrice(price, priceType)}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{barangay ? `${barangay}, ` : ""}{city}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />Posted {new Date(createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <p className="text-2xl font-bold text-primary-600">{formatPrice(price, priceType)}</p>

            {isOwnListing ? (
              <div className="space-y-2">
                <p className="text-xs text-center text-gray-400">This is your listing</p>
                <Link
                  to={`/listings/${id}/edit`}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <Pencil className="w-4 h-4" /> Edit Listing
                </Link>
                <button
                  onClick={handleToggleSold}
                  className={`w-full flex items-center justify-center gap-2 font-medium py-2.5 rounded-xl transition-colors text-sm border ${
                    listing.status === "sold"
                      ? "border-green-300 text-green-700 hover:bg-green-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {listing.status === "sold" ? "↩ Mark as Active" : "✓ Mark as Sold"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting…" : "Delete Listing"}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Message Seller
                </button>
                {type === "product" && status === "active" && (
                  <button
                    onClick={handleOrder}
                    disabled={ordering}
                    className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {ordering ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                    {ordering ? "Placing Order..." : "Buy Now"}
                  </button>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button onClick={handleToggleSave} className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm font-medium transition-colors ${saved ? "border-red-300 text-red-500 bg-red-50" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Transact safely — meet in public and inspect before paying.
            </div>
          </div>

          {/* Seller card */}
          {seller && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800">About the Seller</h3>
              <div className="flex items-center gap-3">
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt={seller.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-lg">{seller.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{seller.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{seller.barangay ? `${seller.barangay}, ` : ""}{seller.city}</p>
                </div>
              </div>
              {seller.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(seller.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}</div>
                  <span className="font-semibold text-gray-800">{seller.rating?.toFixed(1)}</span>
                  <span className="text-gray-500">({seller.reviewCount} reviews)</span>
                </div>
              )}
              <Link to={`/profile/${seller.id}`} className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 hover:border-primary-400 rounded-xl py-2 transition-colors">
                View Profile
              </Link>
            </div>
          )}

          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 mx-auto transition-colors">
            <Flag className="w-3 h-3" /> Report this listing
          </button>

          {/* ── Review Form (buyers with completed order) ── */}
          {canReview && !isOwnListing && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Leave a Review</h3>
              {reviewDone ? (
                <p className="text-sm text-green-600 text-center py-2">Thanks for your review!</p>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex gap-1 justify-center">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setReviewHover(s)}
                        onMouseLeave={() => setReviewHover(0)}
                      >
                        <Star className={`w-7 h-7 transition-colors ${s <= (reviewHover || reviewRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your experience (optional)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || reviewRating === 0}
                    className="w-full py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
