import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { CATEGORIES } from "../utils/constants.js";
import { listingService } from "../services/listingService.js";
import ListingCard from "../components/listings/ListingCard.jsx";

export default function Home() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    listingService.getAll({ limit: 4, sort: "newest" })
      .then((data) => setFeatured(data.listings))
      .catch(() => setFeatured([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/listings?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Buy, Sell &amp; Find Services <br className="hidden sm:block" />
            <span className="text-yellow-300">In Your Community</span>
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            NeighborHub connects your neighborhood — from second-hand items to local professionals.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button type="submit" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shrink-0">
              Search
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-5 text-sm">
            {["iPhone", "Tutor", "Plumber", "Furniture", "Clothes"].map((tag) => (
              <button key={tag} onClick={() => navigate(`/listings?q=${tag}`)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
          <Link to="/listings" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            All listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/listings?category=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all group">
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
          <Link to="/listings" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-gray-600 font-medium mb-2">No listings yet</p>
            <p className="text-sm text-gray-500 mb-4">Be the first to post something!</p>
            <Link to="/create-listing" className="inline-flex items-center gap-2 text-sm text-white bg-accent-500 hover:bg-accent-600 px-5 py-2.5 rounded-xl transition-colors font-semibold">
              Post a Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How NeighborHub Works</h2>
          <p className="text-gray-500 mb-10">Simple, safe, and local.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: <Users className="w-8 h-8 text-primary-600" />, title: "Create a Profile", desc: "Sign up in seconds. Add your location so buyers and sellers near you can find you easily." },
              { icon: <Search className="w-8 h-8 text-accent-500" />, title: "Browse or Post", desc: "Search thousands of local listings, or post your own item or service in under a minute." },
              { icon: <ShieldCheck className="w-8 h-8 text-green-600" />, title: "Connect Safely", desc: "Message sellers directly. Ratings and reviews keep everyone accountable." },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">{step.icon}</div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {/* <section className="py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-6">Join your neighbors on NeighborHub — it&apos;s free.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Sign Up Free</Link>
          <Link to="/listings" className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors">Browse Listings</Link>
        </div>
      </section> */}
    </div>
  );
}
