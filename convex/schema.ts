import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  photos: defineTable({
    imageUrl: v.string(),
    storageId: v.string(),
    userId: v.string(),
    username: v.string(),
    userAvatar: v.optional(v.string()),
    likes: v.number(),
    likedBy: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_creation_time", ["createdAt"])
    .index("by_user", ["userId"]),

  users: defineTable({
    userId: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),
});
