"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UploadModal({
  isOpen,
  onClose,
  userId,
}: UploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const uploadPhoto = useMutation(api.photos.uploadPhoto);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Convex
      setUploading(true);
      setUploadProgress(10);

      try {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();
        setUploadProgress(30);

        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        setUploadProgress(60);

        const { storageId } = await result.json();
        setUploadProgress(80);

        // Get the URL for the uploaded file
        const imageUrl = new URL(uploadUrl);
        imageUrl.pathname = `/api/storage/${storageId}`;

        // Save photo metadata
        const username =
          localStorage.getItem("photostream_username") ||
          `User${userId.slice(-4)}`;
        localStorage.setItem("photostream_username", username);

        await uploadPhoto({
          imageUrl: imageUrl.toString(),
          storageId,
          userId,
          username,
        });

        setUploadProgress(100);
        setUploadSuccess(true);

        // Close modal after success
        setTimeout(() => {
          handleClose();
        }, 1500);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [generateUploadUrl, uploadPhoto, userId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleClose = () => {
    if (!uploading) {
      setPreviewUrl(null);
      setUploadProgress(0);
      setUploadSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Photo
              </h2>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!previewUrl ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload
                    className={`w-16 h-16 mx-auto mb-4 ${
                      isDragActive ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive
                      ? "Drop your photo here"
                      : "Drag and drop your photo"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: PNG, JPG, GIF, WebP
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {uploadSuccess ? "Upload complete!" : "Uploading..."}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${
                            uploadSuccess ? "bg-green-500" : "bg-blue-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">
                        Photo uploaded successfully!
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {!uploading && !uploadSuccess && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPreviewUrl(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            'input[type="file"]'
                          ) as HTMLInputElement;
                          if (input?.files?.[0]) {
                            onDrop([input.files[0]]);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>
                  )}

                  {uploading && !uploadSuccess && (
                    <div className="flex items-center justify-center gap-2 text-gray-600 py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Please wait...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
