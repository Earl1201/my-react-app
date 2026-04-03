import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { formatPrice } from "../../utils/constants.js";

export default function ListingCard({ listing }) {
  const { id, title, price, priceType, price_type, type, listing_type, category,
          city, barangay, images, image, seller, reviewCount, condition, status } = listing;

  // Support both formats:
  // - Full listing (from /api/listings): images = [{ url, isPrimary }]
  // - Profile/saved listing (from /api/users/:id or /api/saved): image = filename string
  let imgSrc = "https://placehold.co/400x300?text=No+Image";
  if (images?.[0]?.url)  imgSrc = images[0].url;
  else if (image)         imgSrc = image.startsWith("http") ? image : `http://localhost:5000/uploads/${image}`;

  const resolvedType        = type        || listing_type || "product";
  const resolvedPriceType   = priceType   || price_type   || "fixed";
  const sellerRating        = seller?.rating      ?? 0;
  const sellerReviewCount   = seller?.reviewCount ?? reviewCount ?? 0;
  const isSold              = status === "sold";

  return (
    <Link
      to={`/listings/${id}`}
      className={`group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 ${
        isSold ? "border-gray-200 opacity-75" : "border-gray-200 hover:border-primary-300"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-300 ${!isSold ? "group-hover:scale-105" : ""}`}
          onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
        />
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isSold
            ? "bg-gray-800 text-white"
            : resolvedType === "service"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
        }`}>
          {isSold ? "Sold" : resolvedType === "service" ? "Service" : condition === "new" ? "New" : "Used"}
        </span>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{category}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">{title}</h3>
        <p className={`font-bold text-base mb-2 ${isSold ? "text-gray-400 line-through" : "text-primary-600"}`}>
          {formatPrice(price, resolvedPriceType)}
        </p>

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
