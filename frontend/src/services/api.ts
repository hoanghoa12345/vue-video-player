export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const backendGraphQLURl = `${backendUrl}/graphql`;

export const uploadVideoUrl = `${backendUrl}/api/upload`;
export const uploadThumbnailUrl = `${backendUrl}/api/thumbnail`;

export const getVideoPath = (filePath: any) =>
  `${backendUrl}/video/${filePath}`;
