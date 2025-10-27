import axios from "axios";

const BASE_URL = "http://localhost:8000/api/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

 
export const registerUser = async (username: string, password: string, email?: string) => {
  const res = await axiosInstance.post("auth/register", { username, password, email });
  return res.data;
};

export const loginUser = async (username: string, password: string) => {
  const res = await axiosInstance.post("auth/login", { username, password });
  return res.data;
};

export const fetchHealth = async () => {
  const res = await axiosInstance.get("core/health");
  return res.data;
};

export const fetchProfile = async () =>{
  const res = await axiosInstance.get('auth/profile');
  return res.data;
}

export const UpdateProfile = async (profileData: any) => {
  const formData = new FormData();
  if (profileData.bio) formData.append("bio", profileData.bio);
  if (profileData.phone_number) formData.append("phone_number", profileData.phone_number);
  if (profileData.type_of_user) formData.append("type_of_user", profileData.type_of_user);
  if (profileData.avatar) formData.append("avatar", profileData.avatar);

  const res = await axiosInstance.post("auth/profile-update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const logoutUser = async (refreshToken: string) => {
  try {
    const res = await axiosInstance.post("auth/logout", {
      refresh_token: refreshToken,
    });
    return res.data;
  } catch (err) {
    console.error("Logout failed:", err);
    throw err;
  }
};

export const uploadMedia = async (mediaType: string, file: File) => {
  const formData = new FormData();
  formData.append("media_type", mediaType);
  formData.append("file", file);

  const res = await axiosInstance.post("core/media-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


export const getScanStatus = async (sessionId: number) => {
  const res = await axiosInstance.get(`/core/show-result?session_id=${sessionId}`);
  return res.data;
};

export const getUserSessions = async () =>{
  const res = await axiosInstance.get('core/show-history');
  return res.data;
}
export const extensionScan = async (url: string, mediaType: string) => {
  const res = await axiosInstance.post("core/extension-scan", { url, media_type: mediaType });
  return res.data;
}
export default axiosInstance;
