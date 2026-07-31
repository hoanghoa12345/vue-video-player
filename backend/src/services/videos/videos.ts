import { Hono } from "hono";
import type { Env } from "../../types/env.ts";
import {
  getVideos,
  getVideoById,
  getRawVideoById,
  createVideo,
  upsertSignedUrl,
} from "../../db/queries/video.ts";

const app = new Hono<Env>();

// GET /v1/videos
app.get("/", async (c) => {
  const categoryIdParam =
    c.req.query("categoryId") || c.req.query("category_id");
  const search = c.req.query("search") || c.req.query("q");
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset") || c.req.query("page");

  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  const filter = {
    categoryId: categoryIdParam ? categoryIdParam.trim() : undefined,
    search: search ? search.trim() : undefined,
    limit: !isNaN(limit) && limit > 0 ? limit : 10,
    offset: !isNaN(offset) && offset >= 0 ? offset : 0,
  };

  try {
    const data = await getVideos(filter);
    return c.json(data);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
});

// GET /v1/videos/:id
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  if (!id || id.trim() === "") {
    return c.json({ error: "Video ID is required" }, 400);
  }

  const authUser = c.get("user");
  const userId = authUser?.id ?? null;

  try {
    const video = await getVideoById(id, userId);

    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json({
      ...video,
      thumbnailUrl: video.thumbnailUrl,
      signedVideoUrl: video.signedVideoUrl,
    });
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return c.json({ error: "Failed to fetch video" }, 500);
  }
});

// POST /v1/videos
app.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    if (
      !body.title ||
      typeof body.title !== "string" ||
      body.title.trim() === ""
    ) {
      return c.json({ error: "Title is required" }, 400);
    }

    const authUser = c.get("user");
    const userId = authUser.id;

    const videoData = {
      title: body.title.trim(),
      description: body.description,
      assetId: body.assetId,
      assetType: body.assetType,
      durationSeconds: body.durationSeconds,
      sizeBytes: body.sizeBytes,
      thumbnailUrl: body.thumbnailUrl,
      videoVisibility: body.videoVisibility,
      isActive: body.isActive,
      categoryId: body.categoryId,
      metadata:
        typeof body.metadata === "object"
          ? JSON.stringify(body.metadata)
          : body.metadata ?? null,
      channelId: body.channelId,
      userId,
    };

    const newVideo = await createVideo(videoData);
    return c.json(newVideo, 201);
  } catch (error) {
    console.error("Error creating video:", error);
    return c.json({ error: "Failed to create video" }, 500);
  }
});

// POST /v1/videos/:id/signed-url
app.post("/:id/signed-url", async (c) => {
  const id = c.req.param("id");

  if (!id || id.trim() === "") {
    return c.json({ error: "Video ID is required" }, 400);
  }

  const authUser = c.get("user");
  let userId = authUser?.id ?? null;

  try {
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const video = await getRawVideoById(id);

    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    if (!userId) {
      userId = video.userId ?? null;
    }

    if (!userId) {
      return c.json(
        { error: "User ID is required to generate signed URL" },
        401
      );
    }

    const thumbnailUrl = body.thumbnail_url;
    const signedVideoUrl = body.signed_video_url;
    const expiresAt = body.expires_at ?? Date.now() + 24 * 60 * 60 * 1000;

    const savedSignedUrl = await upsertSignedUrl({
      videoId: video.id,
      userId,
      thumbnailUrl,
      signedVideoUrl,
      expiresAt,
    });

    return c.json(savedSignedUrl, 200);
  } catch (_error) {
    return c.json({ error: "Error saving signed URL" }, 500);
  }
});

export default app;
