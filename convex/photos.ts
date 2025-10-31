import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const uploadPhoto = mutation({
  args: {
    imageUrl: v.string(),
    storageId: v.string(),
    userId: v.string(),
    username: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const photoId = await ctx.db.insert("photos", {
      imageUrl: args.imageUrl,
      storageId: args.storageId,
      userId: args.userId,
      username: args.username,
      userAvatar: args.userAvatar,
      likes: 0,
      likedBy: [],
      createdAt: Date.now(),
    });
    return photoId;
  },
});

export const getPhotos = query({
  args: {
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .order("desc")
      .paginate(args.paginationOpts || { numItems: 20, cursor: null });

    return photos;
  },
});

export const getUserPhotos = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return photos;
  },
});

export const toggleLike = mutation({
  args: {
    photoId: v.id("photos"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error("Photo not found");

    const hasLiked = photo.likedBy.includes(args.userId);
    const newLikedBy = hasLiked
      ? photo.likedBy.filter((id) => id !== args.userId)
      : [...photo.likedBy, args.userId];

    await ctx.db.patch(args.photoId, {
      likedBy: newLikedBy,
      likes: hasLiked ? photo.likes - 1 : photo.likes + 1,
    });

    return !hasLiked;
  },
});

export const deletePhoto = mutation({
  args: {
    photoId: v.id("photos"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error("Photo not found");
    if (photo.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.photoId);
    await ctx.storage.delete(photo.storageId as any);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
