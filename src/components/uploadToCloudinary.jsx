// components/ImageUploader.jsx
import { useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Props:
//   onUpload(url)   → called with the Cloudinary secure_url
//                     after a successful upload
//   currentImage    → existing URL to preview (for edit mode)
// ─────────────────────────────────────────────────────────────

const cloud_name =  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

function ImageUploader({ onUpload, currentImage = "" }) {
  const [loading,  setLoading]  = useState(false);
  const [preview,  setPreview]  = useState(currentImage);


  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Vk Bakes"); // your unsigned preset

    setLoading(true);

    // show local preview immediately while uploading
    setPreview(URL.createObjectURL(file));

    toast.promise(
      fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Upload failed");
          return res.json();
        })
        .then((data) => {
          setLoading(false);
          setPreview(data.secure_url);

          // ✅ KEY FIX — pass URL back to the parent form
          // Parent (ItemForm) stores it and includes it in the save payload
          onUpload?.(data.secure_url);

          return data; // toast.promise needs the resolved value
        })
        .catch((err) => {
          setLoading(false);
          setPreview(currentImage); // revert preview on error
          throw err;
        }),
      {
        loading: "Uploading image…",
        success: "Image uploaded!",
        error:   "Upload failed — please try again",
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Preview */}
      {preview && (
        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 bg-orange-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium animate-pulse">
                Uploading…
              </span>
            </div>
          )}
        </div>
      )}

      {/* File input */}
      <label
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm font-medium
          ${loading
            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
            : "border-red-200 text-red-500 hover:bg-red-50"
          }`}
      >
        {loading ? "Uploading…" : preview ? "Change image" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  );
}

export default ImageUploader;