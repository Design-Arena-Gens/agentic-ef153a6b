"use client";

import { useState, useEffect } from "react";
import { Home, User, Plus } from "lucide-react";
import StreamTab from "./StreamTab";
import MyPhotosTab from "./MyPhotosTab";
import UploadModal from "./UploadModal";

type Tab = "stream" | "my-photos";

export default function PhotoStreamApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    let storedUserId = localStorage.getItem("photostream_userId");
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("photostream_userId", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          PhotoStream
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "stream" && <StreamTab userId={userId} />}
        {activeTab === "my-photos" && <MyPhotosTab userId={userId} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("stream")}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px] ${
              activeTab === "stream"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-label="Stream"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Stream</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg min-w-[64px]"
            aria-label="Upload Photo"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">Upload</span>
          </button>

          <button
            onClick={() => setActiveTab("my-photos")}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px] ${
              activeTab === "my-photos"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-label="My Photos"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">My Photos</span>
          </button>
        </div>
      </nav>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}
