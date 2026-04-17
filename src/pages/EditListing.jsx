import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, DollarSign, MapPin, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { listingService } from "../services/listingService.js";
import { CATEGORIES } from "../utils/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function EditListing() {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors]     = useState({});
  const [form, setForm]         = useState(null);

  // Load existing listing
  useEffect(() => {
    listingService.getById(id)
      .then(({ listing }) => {
        // Guard: only the owner can edit
        if (listing.seller?.id !== user?.id) {
          toast.error("You can only edit your own listings.");
          navigate(`/listings/${id}`);
          return;
        }
        setForm({
          listingType:  listing.type        || "product",
          title:        listing.title       || "",
          description:  listing.description || "",
          price:        listing.price       || "",
          priceType:    listing.priceType   || "fixed",
          condition:    listing.condition   || "used",
          categoryId:   listing.categoryId  || "",
          city:         listing.city        || "",
          barangay:     listing.barangay    || "",
        });
      })
      .catch(() => {
        toast.error("Could not load listing.");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, user?.id, navigate]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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

    setSaving(true);
    try {
      await listingService.update(id, {
        listingType: form.listingType,
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       form.price,
        priceType:   form.priceType,
        condition:   form.listingType === "product" ? form.condition : null,
        categoryId:  form.categoryId,
        city:        form.city.trim(),
        barangay:    form.barangay.trim(),
      });
      toast.success("Listing updated!");
      navigate(`/listings/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to update listing.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await listingService.delete(id);
      toast.success("Listing deleted.");
      navigate("/profile");
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 ${errors[field] ? "border-red-400" : "border-gray-300"}`;

  if (loading || !form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <span className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/listings/${id}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-xs text-gray-500">Update your listing details below</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Listing Type (display only — can't change type after creation) ── */}
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

        {/* ── Title ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="e.g. iPhone 13 Pro 128GB"
            value={form.title}
            onChange={set("title")}
            disabled={saving}
            className={inputClass("title")}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* ── Category ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="w-3.5 h-3.5 inline mr-1" />Category
          </label>
          <select value={form.categoryId} onChange={set("categoryId")} disabled={saving} className={inputClass("categoryId")}>
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
            placeholder="Describe your item or service..."
            value={form.description}
            onChange={set("description")}
            disabled={saving}
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
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={set("price")}
              disabled={saving}
              className={inputClass("price")}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
            <select value={form.priceType} onChange={set("priceType")} disabled={saving} className={inputClass("priceType")}>
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
                  <input
                    type="radio"
                    name="condition"
                    value={c}
                    checked={form.condition === c}
                    onChange={set("condition")}
                    className="accent-primary-600"
                  />
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
            <input
              type="text"
              placeholder="e.g. Mandaue City"
              value={form.city}
              onChange={set("city")}
              disabled={saving}
              className={inputClass("city")}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barangay <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Looc"
              value={form.barangay}
              onChange={set("barangay")}
              disabled={saving}
              className={inputClass("barangay")}
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Link
            to={`/listings/${id}`}
            className="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
