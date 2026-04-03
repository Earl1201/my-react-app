export const CATEGORIES = [
  { id: 1, name: "Home & Garden",   slug: "home-garden",   icon: "🏡" },
  { id: 2, name: "Electronics",     slug: "electronics",   icon: "📱" },
  { id: 3, name: "Vehicles",        slug: "vehicles",      icon: "🚗" },
  { id: 4, name: "Fashion",         slug: "fashion",       icon: "👗" },
  { id: 5, name: "Tutoring",        slug: "tutoring",      icon: "📚" },
  { id: 6, name: "Home Repairs",    slug: "home-repairs",  icon: "🔧" },
  { id: 7, name: "Delivery",        slug: "delivery",      icon: "📦" },
  { id: 8, name: "Health & Beauty", slug: "health-beauty", icon: "💊" },
  { id: 9, name: "Food & Drinks",   slug: "food-drinks",   icon: "🍽️" },
  { id: 10, name: "Sports",         slug: "sports",        icon: "⚽" },
];

export const LISTING_TYPES = ["All", "Products", "Services"];

export const PRICE_RANGES = [
  { label: "Any Price",      min: 0,     max: Infinity },
  { label: "Under ₱500",     min: 0,     max: 500 },
  { label: "₱500 – ₱2,000",  min: 500,   max: 2000 },
  { label: "₱2,000 – ₱5,000",min: 2000,  max: 5000 },
  { label: "Over ₱5,000",    min: 5000,  max: Infinity },
];

export const MOCK_USERS = [
  {
    id: 1,
    name: "Maria Santos",
    avatar: "https://i.pravatar.cc/100?img=1",
    city: "Quezon City",
    barangay: "Batasan Hills",
    rating: 4.8,
    reviewCount: 34,
    joinedDate: "2023-03-15",
    bio: "Selling pre-loved items and homemade crafts. Fast transactions, legit seller!",
    listingCount: 12,
  },
  {
    id: 2,
    name: "Juan dela Cruz",
    avatar: "https://i.pravatar.cc/100?img=3",
    city: "Marikina",
    barangay: "Concepcion Uno",
    rating: 4.5,
    reviewCount: 18,
    joinedDate: "2023-07-20",
    bio: "Licensed electrician offering residential and commercial services.",
    listingCount: 5,
  },
  {
    id: 3,
    name: "Ana Reyes",
    avatar: "https://i.pravatar.cc/100?img=5",
    city: "Pasig",
    barangay: "Kapitolyo",
    rating: 5.0,
    reviewCount: 22,
    joinedDate: "2024-01-10",
    bio: "Math and Science tutor. College graduate, 3 years experience.",
    listingCount: 3,
  },
];

export const MOCK_LISTINGS = [
  {
    id: 1,
    userId: 1,
    seller: MOCK_USERS[0],
    categoryId: 2,
    category: "Electronics",
    type: "product",
    title: "iPhone 13 Pro — 128GB, Midnight",
    description:
      "In excellent condition, no scratches. Comes with original box, charger, and case. Battery health 91%. Selling because I upgraded.",
    price: 32000,
    priceType: "negotiable",
    condition: "used",
    city: "Quezon City",
    barangay: "Batasan Hills",
    images: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600",
    ],
    rating: 0,
    reviewCount: 0,
    status: "active",
    createdAt: "2024-03-20",
  },
  {
    id: 2,
    userId: 2,
    seller: MOCK_USERS[1],
    categoryId: 6,
    category: "Home Repairs",
    type: "service",
    title: "Licensed Electrician — Wiring, Panel, Outlets",
    description:
      "10+ years experience in residential and light commercial electrical work. Available weekdays and Saturdays. Free estimate for big jobs.",
    price: 800,
    priceType: "per_hour",
    condition: null,
    city: "Marikina",
    barangay: "Concepcion Uno",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600",
    ],
    rating: 4.9,
    reviewCount: 18,
    status: "active",
    createdAt: "2024-03-18",
  },
  {
    id: 3,
    userId: 3,
    seller: MOCK_USERS[2],
    categoryId: 5,
    category: "Tutoring",
    title: "Math & Science Tutor (Grade 7–12)",
    description:
      "Patient, result-oriented tutor. I specialize in Algebra, Geometry, Physics, and Chemistry. Online or face-to-face in Pasig area.",
    price: 350,
    priceType: "per_hour",
    condition: null,
    city: "Pasig",
    barangay: "Kapitolyo",
    images: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600",
    ],
    rating: 5.0,
    reviewCount: 22,
    status: "active",
    createdAt: "2024-03-17",
  },
  {
    id: 4,
    userId: 1,
    seller: MOCK_USERS[0],
    categoryId: 1,
    category: "Home & Garden",
    type: "product",
    title: "IKEA KALLAX Shelf Unit — White 4x4",
    description:
      "Barely used KALLAX shelf, perfect condition. Ideal for living room or bedroom storage. Self pick-up only in QC.",
    price: 4500,
    priceType: "fixed",
    condition: "used",
    city: "Quezon City",
    barangay: "Fairview",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    ],
    rating: 0,
    reviewCount: 0,
    status: "active",
    createdAt: "2024-03-15",
  },
  {
    id: 5,
    userId: 2,
    seller: MOCK_USERS[1],
    categoryId: 4,
    category: "Fashion",
    type: "product",
    title: "Nike Air Force 1 Low — Size 9 US",
    description:
      "Authentic Nike AF1, worn twice. No box. Selling because it's a half size too small for me.",
    price: 3200,
    priceType: "negotiable",
    condition: "used",
    city: "Marikina",
    barangay: "Shoe Ave",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    ],
    rating: 0,
    reviewCount: 0,
    status: "active",
    createdAt: "2024-03-14",
  },
  {
    id: 6,
    userId: 3,
    seller: MOCK_USERS[2],
    categoryId: 9,
    category: "Food & Drinks",
    type: "product",
    title: "Homemade Ube Halaya — 350g jar",
    description:
      "Made fresh every weekend with real ube from Benguet. No preservatives. Pre-order by Friday, pick-up Saturday in Pasig.",
    price: 180,
    priceType: "fixed",
    condition: "new",
    city: "Pasig",
    barangay: "Kapitolyo",
    images: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
    ],
    rating: 4.8,
    reviewCount: 9,
    status: "active",
    createdAt: "2024-03-12",
  },
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    reviewer: MOCK_USERS[1],
    rating: 5,
    comment: "Super legit seller! Item was exactly as described. Fast transaction, I'll buy from her again.",
    createdAt: "2024-03-10",
  },
  {
    id: 2,
    reviewer: MOCK_USERS[2],
    rating: 5,
    comment: "Very accommodating. The item was well-packed and she responded quickly to messages.",
    createdAt: "2024-02-28",
  },
  {
    id: 3,
    reviewer: MOCK_USERS[0],
    rating: 4,
    comment: "Good seller but took a while to confirm meetup schedule. Item was in good condition.",
    createdAt: "2024-02-15",
  },
];

export const formatPrice = (price, priceType) => {
  const formatted = `₱${price.toLocaleString("en-PH")}`;
  if (priceType === "per_hour") return `${formatted}/hr`;
  if (priceType === "negotiable") return `${formatted} (nego)`;
  if (priceType === "free") return "Free";
  return formatted;
};
