"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PhotoCard from "./PhotoCard";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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

interface StreamTabProps {
  userId: string;
}

export default function StreamTab({ userId }: StreamTabProps) {
  const [loadedPages, setLoadedPages] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const photosPage = useQuery(api.photos.getPhotos, {
    paginationOpts: cursor ? { numItems: 20, cursor } : { numItems: 20, cursor: null },
  });

  useEffect(() => {
    if (photosPage) {
      setLoadedPages((prev) => {
        const existingIds = new Set(
          prev.flatMap((p) => (p.page as Photo[]).map((photo) => photo._id))
        );
        const newPhotos = (photosPage.page as Photo[]).filter(
          (photo) => !existingIds.has(photo._id)
        );
        if (newPhotos.length > 0) {
          return [...prev, photosPage];
        }
        return prev;
      });
      setHasMore(photosPage.continueCursor !== null);
      if (photosPage.continueCursor) {
        setCursor(photosPage.continueCursor);
      }
    }
  }, [photosPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && photosPage) {
          if (photosPage.continueCursor) {
            setCursor(photosPage.continueCursor);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, photosPage]);

  const allPhotos = loadedPages.flatMap((p) => p.page);

  if (!photosPage && loadedPages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (allPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <p className="text-gray-500 text-lg mb-2">No photos yet</p>
        <p className="text-gray-400 text-sm">
          Be the first to share a moment!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6">
        {allPhotos.map((photo) => (
          <PhotoCard key={photo._id} photo={photo} userId={userId} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
