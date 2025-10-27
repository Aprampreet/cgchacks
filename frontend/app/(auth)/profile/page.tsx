'use client';
import React, { useEffect, useState } from "react";
import { fetchProfile } from "@/utlis/api"; 
import { UpdateProfile } from "@/utlis/api";
interface UserProfile {
  avatar_url?: string;
  username: string;
  email: string;
  bio?: string;
  phone_number?: string;
  type_of_user?: string;
}



export default function ProfilePage() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData,setFormData] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
  const loadProfile = async () => {
    try {
      const profile = await fetchProfile() as UserProfile; 
      setData(profile);
      setFormData({
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        type_of_user: profile.type_of_user || "",
        avatar: null
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };
  loadProfile();
}, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await UpdateProfile(formData);
      const profile = await fetchProfile();
      setData(profile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setFormData({
      bio: data?.bio || "",
      phone_number: data?.phone_number || "",
      type_of_user: data?.type_of_user || "",
      avatar: null
    });
    setPreview(null);
    setIsEditing(false);
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-6 rounded-lg border border-gray-700 bg-gray-900/50 flex items-center justify-center space-x-3 shadow-lg">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-400">Loading profile data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 rounded-lg border border-red-700 bg-red-900/30 text-center shadow-2xl">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
        <p className="text-red-300">{error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
      <div className="w-full max-w-md bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border border-neutral-700 rounded-xl p-8 space-y-8">
                <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={preview || data.avatar_url || "/default-avatar.png"}
              alt={`${data.username}'s Avatar`}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-cyan-500 ring-offset-4 ring-offset-gray-900"
            />
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-2 py-1 rounded cursor-pointer">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            {data.username}
          </h1>
          <p className="text-sm font-medium text-cyan-400 mt-1 uppercase tracking-wider">
            {data.type_of_user || "Guest"}
          </p>
        </div>

        <div className="h-px bg-gray-700 w-full" />

        <div className="space-y-3">
          <label className="block text-white/90 font-medium">Bio</label>
          <textarea
            name="bio"
            disabled={!isEditing}
            value={formData.bio || ""}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border bg-gray-800/60 text-gray-200 ${isEditing ? 'border-cyan-500 focus:ring focus:ring-cyan-400' : 'border-gray-700'} resize-none`}
            rows={3}
          />
        </div>

        <div className="h-px bg-gray-700 w-full" />

        <div className="space-y-4">
          <div>
            <label className="block text-white/90 font-medium">Phone Number</label>
            <input
              name="phone_number"
              disabled={!isEditing}
              value={formData.phone_number || ""}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border bg-gray-800/60 text-gray-200 ${isEditing ? 'border-cyan-500 focus:ring focus:ring-cyan-400' : 'border-gray-700'}`}
            />
          </div>

          <div>
          <label className="block text-white/90 font-medium">User Type</label>
          <select
            name="type_of_user"
            disabled={!isEditing}
            value={formData.type_of_user || ""}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border bg-gray-800/60 text-gray-200 ${
              isEditing
                ? "border-cyan-500 focus:ring focus:ring-cyan-400"
                : "border-gray-700"
            }`}
          >
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
            <option value="Student">Student</option>
          </select>
        </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-300 rounded-lg transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}