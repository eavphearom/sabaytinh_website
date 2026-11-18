
import apiClient from "./apiClient";

// Profile API uses /api/v1/users/me,
// not /api/v1/web/users/me.
const apiOrigin = new URL(
  import.meta.env.VITE_API_BASE_URL,
  window.location.origin
).origin;

const PROFILE_API_URL = `${apiOrigin}/api/v1/users/me`;

const updateProfile = async (fields) => {
  const formData = new FormData();

  // Add account information
  formData.append("username", fields.username.trim());
  formData.append("email", fields.email.trim());
  formData.append("phone", fields.phone.trim());

  // Add profile image if selected
  if (fields.profile instanceof File) {
    formData.append("profile", fields.profile);
  }

  // Send multipart/form-data request
  const { data } = await apiClient.put(
    PROFILE_API_URL,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
      timeout: 60000,
    }
  );

  // Handle backend errors
  if (data.error) {
    throw new Error(
      data.message || "Unable to update profile."
    );
  }

  // Return updated account information
  return data.data;
};

export default {
  updateProfile,
};
