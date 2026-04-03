import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, DollarSign, MapPin, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { listingService } from "../services/listingService.js";
import { CATEGORIES } from "../utils/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { file, preview }
  const [form, setForm] = useState({
    listingType: "product",
    title: "", description: "", price: "", priceType: "fixed",
    condition: "used", categoryId: "", city: user?.city || "", barangay: user?.barangay || "",
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Max 5 images allowed.");
      return;
    }
    const newImgs = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages([...images, ...newImgs]);
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(images[idx].preview);
    setImages(images.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      errs.price = "Enter a valid price.";
    if (!form.categoryId)         errs.categoryId  = "Select a category.";
    if (!form.city.trim())        errs.city        = "City is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img.file));

      const { listingId } = await listingService.create(fd);
      toast.success("Listing posted! 🎉");
      navigate(`/listings/${listingId}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to post listing.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 ${errors[field] ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Listing</h1>
      <p className="text-sm text-gray-500 mb-8">Fill in the details below to list your item or service.</p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Listing Type ── */}
        <div className="flex gap-3">
          {["product", "service"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, listingType: t })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                form.listingType === t
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "product" ? "📦 Product" : "🔧 Service"}
            </button>
          ))}
        </div>

        {/* ── Images ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos <span className="text-gray-400 font-normal">(up to 5)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5">
                    Main
                  </span>
                )}
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Add photo</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        </div>

        {/* ── Title ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" placeholder="e.g. iPhone 13 Pro 128GB" value={form.title} onChange={set("title")} disabled={loading} className={inputClass("title")} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* ── Category ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="w-3.5 h-3.5 inline mr-1" />Category
          </label>
          <select value={form.categoryId} onChange={set("categoryId")} disabled={loading} className={inputClass("categoryId")}>
            <option value="">Select a category...</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            placeholder="Describe your item or service. Include condition, features, or availability..."
            value={form.description}
            onChange={set("description")}
            disabled={loading}
            className={`${inputClass("description")} resize-none`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* ── Price ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-3.5 h-3.5 inline mr-1" />Price (₱)
            </label>
            <input type="number" min="0" placeholder="0.00" value={form.price} onChange={set("price")} disabled={loading} className={inputClass("price")} />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
            <select value={form.priceType} onChange={set("priceType")} disabled={loading} className={inputClass("priceType")}>
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
              <option value="free">Free</option>
              <option value="per_hour">Per Hour</option>
            </select>
          </div>
        </div>

        {/* ── Condition (products only) ── */}
        {form.listingType === "product" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <div className="flex gap-3">
              {["new", "used", "refurbished"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="condition" value={c} checked={form.condition === c} onChange={set("condition")} className="accent-primary-600" />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Location ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />City
            </label>
            <input type="text" placeholder="e.g. Quezon City" value={form.city} onChange={set("city")} disabled={loading} className={inputClass("city")} />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barangay <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="e.g. Batasan Hills" value={form.barangay} onChange={set("barangay")} disabled={loading} className={inputClass("barangay")} />
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Posting...</>
          ) : (
            "Post Listing"
          )}
        </button>
      </form>
    </div>
  );
}
