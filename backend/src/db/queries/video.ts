import { eq, like, and, sql, desc } from "drizzle-orm";
import { db } from "../index.ts";
import { videos, signedUrls, channels, categories } from "../schema.ts";

export type VideoFilter = {
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type InsertVideo = typeof videos.$inferInsert;

export async function getVideos(filter: VideoFilter) {
  const { categoryId, search, limit = 10, offset = 0 } = filter;

  const query = db
    .select({
      id: videos.id,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      signedThumbnailUrl: signedUrls.thumbnailUrl,
      durationSeconds: videos.durationSeconds,
      videoVisibility: videos.videoVisibility,
      channel: {
        id: channels.id,
        name: channels.name,
        avatarImage: channels.avatarImage,
        coverImage: channels.coverImage,
      },
    })
    .from(videos)
    .leftJoin(signedUrls, eq(videos.id, signedUrls.videoId))
    .leftJoin(channels, eq(videos.channelId, channels.id));

  const conditions = [];
  if (categoryId && categoryId.trim() !== "") {
    conditions.push(eq(videos.categoryId, categoryId.trim()));
  }
  if (search && search.trim() !== "") {
    conditions.push(like(videos.title, `%${search.trim()}%`));
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const result = await query.limit(limit).offset(offset);

  const [countResult] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(videos)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    videos: result,
    total: countResult?.count ?? 0,
    limit,
    offset,
  };
}

export async function createVideo(data: InsertVideo) {
  const [newVideo] = await db.insert(videos).values(data).returning();
  return newVideo;
}

export async function getVideoById(id: string, userId?: string | null) {
  const signedUrlConditions = [eq(signedUrls.videoId, id)];
  if (userId) {
    signedUrlConditions.push(eq(signedUrls.userId, userId));
  }

  const rows = await db
    .select({
      video: {
        id: videos.id,
        title: videos.title,
        description: videos.description,
        durationSeconds: videos.durationSeconds,
        thumbnailUrl: videos.thumbnailUrl,
        isActive: videos.isActive,
        categoryId: videos.categoryId,
        userId: videos.userId,
        channelId: videos.channelId,
      },
      signedUrl: {
        id: signedUrls.id,
        thumbnailUrl: signedUrls.thumbnailUrl,
        signedVideoUrl: signedUrls.signedVideoUrl,
        expiresAt: signedUrls.expiresAt,
        used: signedUrls.used,
      },
      channel: {
        id: channels.id,
        name: channels.name,
        avatarImage: channels.avatarImage,
        coverImage: channels.coverImage,
      },
      category: {
        id: categories.id,
        name: categories.name,
        parentId: categories.parentId,
      },
    })
    .from(videos)
    .leftJoin(signedUrls, and(...signedUrlConditions))
    .leftJoin(channels, eq(videos.channelId, channels.id))
    .leftJoin(categories, eq(videos.categoryId, categories.id))
    .where(eq(videos.id, id))
    .orderBy(desc(signedUrls.createdAt))
    .limit(1);

  if (!rows || rows.length === 0) {
    return null;
  }

  const { video, signedUrl } = rows[0];

  return {
    ...video,
    signedId: signedUrl?.id || null,
    thumbnailUrl: signedUrl?.thumbnailUrl || video.thumbnailUrl || null,
    signedVideoUrl: signedUrl?.signedVideoUrl || null,
    signedUrlExpiresAt: signedUrl?.expiresAt || null,
  };
}

export async function getRawVideoById(id: string) {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);

  return video ?? null;
}

export async function upsertSignedUrl(data: {
  videoId: string;
  userId: string;
  thumbnailUrl?: string | null;
  signedVideoUrl?: string | null;
  expiresAt?: string | number;
}) {
  const expiresAt = String(data.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000);

  const existing = await db
    .select()
    .from(signedUrls)
    .where(
      and(
        eq(signedUrls.videoId, data.videoId),
        eq(signedUrls.userId, data.userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(signedUrls)
      .set({
        thumbnailUrl: data.thumbnailUrl,
        signedVideoUrl: data.signedVideoUrl,
        expiresAt: expiresAt,
        used: false,
      })
      .where(eq(signedUrls.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [inserted] = await db
      .insert(signedUrls)
      .values({
        id: crypto.randomUUID(),
        videoId: data.videoId,
        userId: data.userId,
        thumbnailUrl: data.thumbnailUrl,
        signedVideoUrl: data.signedVideoUrl,
        expiresAt: expiresAt,
        used: false,
      })
      .returning();
    return inserted;
  }
}
