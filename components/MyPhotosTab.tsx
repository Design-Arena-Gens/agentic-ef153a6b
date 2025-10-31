"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PhotoCard from "./PhotoCard";
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

interface MyPhotosTabProps {
  userId: string;
}

export default function MyPhotosTab({ userId }: MyPhotosTabProps) {
  const photos = useQuery(api.photos.getUserPhotos, { userId }) as Photo[] | undefined;

  if (photos === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <p className="text-gray-500 text-lg mb-2">No photos yet</p>
        <p className="text-gray-400 text-sm">
          Upload your first photo to get started
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6">
        {photos.map((photo) => (
          <PhotoCard
            key={photo._id}
            photo={photo}
            userId={userId}
            showDelete={true}
          />
        ))}
      </div>
    </div>
  );
}
