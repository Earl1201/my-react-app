import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Calendar, Package, Edit3, ShieldCheck, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ListingCard from "../components/listings/ListingCard";

export default function Profile() {
  const { id }              = useParams();
  const { user: authUser }  = useAuth();
  const [profile, setProfile]   = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [saved, setSaved]       = useState([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [loading, setLoading]   = useState(true);

  // Determine whose profile to show:
  // /profile      → own profile (authUser.id)
  // /profile/:id  → that user's profile
  const profileId = id ? Number(id) : authUser?.id;
  const isOwnProfile = authUser && profileId === authUser.id;

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    api.get(`/users/${profileId}`)
      .then(({ data }) => {
        setProfile(data.user);
        setListings(data.listings);
        setReviews(data.reviews);
        // Load saved listings only for own profile
        if (!id && authUser?.id) {
          api.get("/saved").then(({ data: s }) => setSaved(s.listings)).catch(() => {});
        }
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">👤</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">User not found</h2>
        <Link to="/" className="text-primary-600 hover:underline text-sm">Back to home</Link>
      </div>
    );
  }

  const tabs = [
    { key: "listings", label: `Listings (${listings.length})` },
    { key: "reviews",  label: `Reviews (${reviews.length})` },
    ...(isOwnProfile ? [{ key: "saved", label: `Saved (${saved.length})` }] : []),
  ];

  // Normalise listing shape so ListingCard works
  const normalisedListings = listings.map((l) => ({
    ...l,
    image:    l.image || null,
    category: l.category || "Other",
    priceType: l.price_type || "fixed",
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Profile Header ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-400" />

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-primary-100 shadow-md flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-4xl">
                    {profile.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <Link
                  to="/edit-profile"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow"
                  title="Edit profile"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white" />
                </Link>
              )}
            </div>

            <div className="flex-1 sm:mb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                  {profile.name}
                  {profile.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-green-500" title="Verified user" />
                  )}
                </h1>
                {isOwnProfile && (
                  <Link
                    to="/edit-profile"
                    className="text-xs font-medium text-primary-600 border border-primary-200 px-3 py-1 rounded-full hover:bg-primary-50 transition-colors w-fit"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                {(profile.city || profile.barangay) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {[profile.barangay, profile.city].filter(Boolean).join(", ")}
                  </span>
                )}
                {profile.avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-800">{profile.avgRating.toFixed(1)}</span>
                    <span className="text-gray-500">({profile.reviewCount} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  {profile.listingCount} listing{profile.listingCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed mt-4 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { label: "Listings", value: profile.listingCount },
              { label: "Reviews",  value: profile.reviewCount },
              { label: "Rating",   value: profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "—" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-gray-50 rounded-xl py-3">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Listings Tab ── */}
      {activeTab === "listings" && (
        <>
          {normalisedListings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No listings yet</p>
              {isOwnProfile && (
                <Link to="/create-listing" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                  Post your first listing
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalisedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Saved Tab ── */}
      {activeTab === "saved" && isOwnProfile && (
        <>
          {saved.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No saved listings yet</p>
              <Link to="/listings" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                Browse listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {saved.map((l) => (
                <ListingCard key={l.id} listing={{ ...l, priceType: l.price_type, image: l.image || null }} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Reviews Tab ── */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No reviews yet</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  {rev.reviewer_avatar ? (
                    <img src={rev.reviewer_avatar} alt={rev.reviewer_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-primary-700 font-bold text-sm">{rev.reviewer_name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{rev.reviewer_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  {rev.comment && <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
