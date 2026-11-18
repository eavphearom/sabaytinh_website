
import { useContext, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";

import Input from "../../components/ui/Input";
import profileService from "../../services/profileService";
import AuthContext from "../../context/AuthContext";

const inputClass =
  "mt-2 h-11 rounded-xl border-[#E5EAF0] bg-[#FAFBFC] px-4 text-sm text-[#07182E] focus:border-[#E96400] focus:ring-[#E96400]/10";

const getUserFields = (user) => ({
  username: user?.username ?? user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
});

export default function Profile() {
  const { user } = useContext(AuthContext);

  // Initialize form data from authenticated user.
  const [fields, setFields] = useState(() => getUserFields(user));

  // Keep original values for Reset.
  const [initialFields, setInitialFields] = useState(() =>
    getUserFields(user)
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedImage, setSavedImage] = useState(
    user?.profile ?? null
  );

  const fileInputRef = useRef(null);

  // Generate preview URL for selected image.
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!selectedFile) return;

    const url = URL.createObjectURL(selectedFile);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Update text inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Select profile image.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please select a PNG or JPG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile image must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Save updated profile to Flask backend.
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const updatedUser = await profileService.updateProfile({
        username: fields.username.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        profile: selectedFile,
      });

      const updatedFields = {
        username: updatedUser?.username ?? fields.username,
        email: updatedUser?.email ?? fields.email,
        phone: updatedUser?.phone ?? fields.phone,
      };

      setFields(updatedFields);
      setInitialFields(updatedFields);

      if (updatedUser?.profile) {
        setSavedImage(updatedUser.profile);
      } else if (selectedFile) {
        setSavedImage(preview);
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Restore last saved profile values.
  const handleReset = () => {
    setFields({ ...initialFields });
    setSelectedFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initials = (fields.username || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-6">

      {/* Page heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E96400]">
          Profile
        </p>

        <h1 className="mt-3 font-michroma text-2xl font-semibold text-[#07182E] sm:text-3xl">
          Edit Profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
          Keep your personal details up to date for faster checkout and order updates.
        </p>
      </div>

      {/* Profile image section */}
      <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FFF3E8] text-xl font-semibold text-[#E96400]">
            {preview || savedImage ? (
              <img
                src={preview || savedImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#07182E]">
              Profile photo
            </p>

            <p className="mt-1 text-xs font-medium text-[#64748B]">
              PNG or JPG up to 2MB.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className="inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E5EAF0] bg-white px-4 text-sm font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400] disabled:opacity-60"
        >
          <Camera size={16} />
          Change Image
        </button>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSave}
        className="mt-7 grid gap-4 md:grid-cols-2"
      >
        <Input
          name="username"
          label="Username"
          value={fields.username}
          onChange={handleChange}
          required
          className={inputClass}
        />

        <Input
          name="email"
          type="email"
          label="Email"
          value={fields.email}
          onChange={handleChange}
          disabled
          className={`${inputClass} disabled:bg-[#EEF2F6] disabled:text-[#94A3B8]`}
        />

        <Input
          name="phone"
          label="Phone"
          value={fields.phone}
          onChange={handleChange}
          className={inputClass}
        />

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row md:col-span-2">

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E96400] px-5 text-sm font-semibold text-white transition hover:bg-[#C95500] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E5EAF0] bg-white px-5 text-sm font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400]"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
