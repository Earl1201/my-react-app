import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { formatPrice } from "../../utils/constants.js";

export default function ListingCard({ listing }) {
  const { id, title, price, priceType, type, category, city, barangay, images, seller, rating, reviewCount, condition } = listing;

  // images can be an array of { url, isPrimary } objects or plain strings (mock data)
  const imgSrc = images?.[0]?.url || images?.[0] || "https://placehold.co/400x300?text=No+Image";

  const sellerRating      = seller?.rating      ?? 0;
  const sellerReviewCount = seller?.reviewCount ?? reviewCount ?? 0;

  return (
    <Link
      to={`/listings/${id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
        />
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          type === "service" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
        }`}>
          {type === "service" ? "Service" : condition === "new" ? "New" : "Used"}
        </span>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{category}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">{title}</h3>
        <p className="text-primary-600 font-bold text-base mb-2">{formatPrice(price, priceType)}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {barangay ? `${barangay}, ` : ""}{city}
          </span>
          {sellerReviewCount > 0 && (
            <span className="flex items-center gap-0.5 shrink-0 ml-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {sellerRating.toFixed(1)} ({sellerReviewCount})
            </span>
          )}
        </div>

        {seller && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {seller.avatarUrl ? (
              <img src={seller.avatarUrl} alt={seller.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-700 font-bold text-[9px]">{seller.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="text-xs text-gray-600 truncate">{seller.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
