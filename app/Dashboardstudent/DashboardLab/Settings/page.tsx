"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SettingsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // Image states
  const [currentPicture, setCurrentPicture] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserId(u.user_id || u.id);
        setEmail(u.email || "");
        
        // แยกชื่อกับนามสกุลจากฟิลด์ name
        const nameParts = (u.name || "").split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        
        setCurrentPicture(u.picture || null);
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // สร้างลิงก์สำหรับพรีวิว
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    if (newFile) {
      formData.append("file", newFile);
    }

    try {
      const res = await fetch(`${API}/student/profile/${userId}`, {
        method: "PUT",
        body: formData, // ใช้ FormData แนบรูปได้เลย
      });
      const json = await res.json();
      
      if (json.success) {
        setSuccessMsg("บันทึกข้อมูลสำเร็จ");
        
        // อัปเดตข้อมูลใน localStorage เพื่อให้ Topbar เปลี่ยนตาม
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.name = `${firstName} ${lastName}`.trim();
          u.email = email;
          // ถ้ามีการอัปโหลดรูปใหม่ เอา URL จาก Backend มาเซฟ
          if (json.picture) {
            u.picture = `${API}${json.picture}`; 
            setCurrentPicture(u.picture);
          }
          localStorage.setItem("user", JSON.stringify(u));
        }
        
        // เคลียร์ค่าพรีวิว
        setNewFile(null);
        setPreviewUrl(null);
      } else {
        setErrorMsg(json.error || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      setErrorMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลด...</div>;

  const displayImage = previewUrl || currentPicture || "https://ui-avatars.com/api/?name=" + firstName;

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-4xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#14213F]">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile, preferences, and notifications.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E3E6F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E3E6F0]">
            <h2 className="text-lg font-bold text-[#14213F]">Personal Information</h2>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-8">
            
            {/* Profile Image Area */}
            <div className="flex flex-col items-center shrink-0">
              <div 
                className="relative h-32 w-32 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img 
                  src={displayImage} 
                  alt="Profile" 
                  className="h-full w-full rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={28} />
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 mt-3 text-center">คลิกรูปเพื่อเปลี่ยนโปรไฟล์</p>
            </div>

            {/* Form Area */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-[#D9DBE6] px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-[#D9DBE6] px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#D9DBE6] px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-[#F7F8FC] border-t border-[#E3E6F0] flex items-center justify-between">
            <div>
              {successMsg && (
                <p className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle2 size={16} /> {successMsg}
                </p>
              )}
              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving || !firstName.trim() || !email.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}