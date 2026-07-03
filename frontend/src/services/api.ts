import { IObject, Objects } from "@/utils/types";
import request from "./request";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

export const backendGraphQLURl = `${backendUrl}/graphql`;

export const uploadVideoUrl = `${backendUrl}/api/upload`;
export const uploadThumbnailUrl = `${backendUrl}/api/thumbnail`;

export const getVideoPath = (filePath: any) =>
  `${backendUrl}/video/${filePath}`;

const api = {
  getListVideo: () => {
    const query = {
      type: "videos",
    };
    const url = "/objects";
    const params = {
      pretty: true,
      query: JSON.stringify(query),
      limit: 10,
      depth: 1,
      props: "id,slug,title,thumbnail,created_at,created_by",
    };
    return request.get<Objects>(url, {
      params,
    });
  },
  getVideoById: (id: string) => {
    const url = "/objects/" + id;
    const params = {
      depth: 1,
      props: "id,slug,title,metadata,thumbnail,created_at,",
    };
    return request.get<IObject>(url, { params });
  },
  getRelatedVideos: (id: string) => {
    const query = {
      type: "videos",
      id: {
        $ne: id,
      },
    };
    const url = "/objects";
    const params = {
      pretty: true,
      query: JSON.stringify(query),
      limit: 10,
      depth: 1,
      props: "id,slug,title,thumbnail,created_at,created_by",
    };
    return request.get<Objects>(url, {
      params,
    });
  },
  searchVideosByKeyword: (keyword: string) => {
    const query = {
      type: "videos",
      title: {
        $regex: keyword,
        $options: "i",
      },
    };
    const url = "/objects";
    const params = {
      pretty: true,
      query: JSON.stringify(query),
      limit: 10,
      depth: 1,
      props: "id,slug,title,thumbnail,created_at,created_by",
    };
    return request.get<Objects>(url, {
      params,
    });
  },
  getAppSettings: () => {
    const query = {
      type: "videos",
      slug: "settings"
    };
    const url = "/objects";
    const params = {
      pretty: true,
      query: JSON.stringify(query),
      limit: 1,
      props: "slug,title,metadata,type",
    };
    return request.get<Objects>(url, {
      params,
    });
  }
};

export default api;
