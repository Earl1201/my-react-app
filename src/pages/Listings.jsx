import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { CATEGORIES, PRICE_RANGES } from "../utils/constants.js";
import { listingService } from "../services/listingService.js";
import ListingCard from "../components/listings/ListingCard.jsx";

export default function Listings() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedType, setSelectedType]         = useState(searchParams.get("type") || "");
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [sortBy, setSortBy]                     = useState("newest");

  const q = searchParams.get("q") || "";

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const range = PRICE_RANGES[selectedPriceIdx];
      const params = {
        ...(q              && { q }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedType   && { type: selectedType }),
        ...(range.min > 0  && { minPrice: range.min }),
        ...(range.max !== Infinity && { maxPrice: range.max }),
        sort: sortBy,
        limit: 30,
      };
      const data = await listingService.getAll(params);
      setListings(data.listings);
      setTotal(data.total);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [q, selectedCategory, selectedType, selectedPriceIdx, sortBy]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedType("");
    setSelectedPriceIdx(0);
    setSortBy("newest");
  };

  const hasActiveFilters = selectedCategory || selectedType || selectedPriceIdx > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : "All Listings"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${total} listing${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} sm:block w-full sm:w-56 shrink-0 space-y-6`}>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <FilterSection title="Type">
              {[{ label: "All", value: "" }, { label: "Products", value: "product" }, { label: "Services", value: "service" }].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="type" value={opt.value} checked={selectedType === opt.value} onChange={() => setSelectedType(opt.value)} className="accent-primary-600" />
                  {opt.label}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Category">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="category" value="" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} className="accent-primary-600" />
                All Categories
              </label>
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="category" value={cat.slug} checked={selectedCategory === cat.slug} onChange={() => setSelectedCategory(cat.slug)} className="accent-primary-600" />
                  <span>{cat.icon} {cat.name}</span>
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Price Range">
              {PRICE_RANGES.map((range, idx) => (
                <label key={range.label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="price" checked={selectedPriceIdx === idx} onChange={() => setSelectedPriceIdx(idx)} className="accent-primary-600" />
                  {range.label}
                </label>
              ))}
            </FilterSection>
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No listings found</h3>
              <p className="text-sm text-gray-500 mb-4">Try different keywords or adjust your filters.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">Clear filters</button>
                <Link to="/create-listing" className="flex items-center gap-1.5 text-sm text-white bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-full transition-colors">
                  <Plus className="w-4 h-4" /> Post the first one
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-2">
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}
