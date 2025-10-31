"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart, Trash2, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Id } from "@/convex/_generated/dataModel";

interface Photo {
  _id: Id<"photos">;
  imageUrl: string;
  storageId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  likes: number;
  likedBy: string[];
  createdAt: number;
}

interface PhotoCardProps {
  photo: Photo;
  userId: string;
  showDelete?: boolean;
}

export default function PhotoCard({
  photo,
  userId,
  showDelete = false,
}: PhotoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const toggleLike = useMutation(api.photos.toggleLike);
  const deletePhoto = useMutation(api.photos.deletePhoto);

  const hasLiked = photo.likedBy.includes(userId);

  const handleLike = async () => {
    await toggleLike({ photoId: photo._id, userId });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!hasLiked) {
        handleLike();
      }
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    setLastTap(now);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePhoto({ photoId: photo._id, userId });
    } catch (error) {
      console.error("Failed to delete photo:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {/* User Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {photo.userAvatar ? (
                <img
                  src={photo.userAvatar}
                  alt={photo.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {photo.username}
            </span>
          </div>

          {/* Image */}
          <div className="relative aspect-square bg-gray-100" onTouchEnd={handleDoubleTap}>
            <Image
              src={photo.imageUrl}
              alt="Photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={false}
            />

            {/* Double-tap heart animation */}
            <AnimatePresence>
              {showHeartAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions and Info */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 group transition-transform active:scale-95"
                aria-label={hasLiked ? "Unlike" : "Like"}
              >
                <motion.div
                  whileTap={{ scale: 1.2 }}
                  transition={{ duration: 0.1 }}
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      hasLiked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  />
                </motion.div>
                <span className="text-sm font-semibold text-gray-900">
                  {photo.likes}
                </span>
              </button>

              {showDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {new Date(photo.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Photo?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
