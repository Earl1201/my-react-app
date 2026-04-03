import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">NH</span>
              </div>
              <span className="font-bold text-white text-base">NeighborHub</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your local community marketplace for buying, selling, and finding services nearby.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="hover:text-white transition-colors">All Listings</Link></li>
              <li><Link to="/listings?type=product" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/listings?type=service" className="hover:text-white transition-colors">Services</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/create-listing" className="hover:text-white transition-colors">Post a Listing</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Safety Tips</span></li>
              <li><span className="cursor-default">Contact Support</span></li>
              <li><span className="cursor-default">Report a Listing</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center">
          © {new Date().getFullYear()} NeighborHub. Built for the community.
        </div>
      </div>
    </footer>
  );
}
