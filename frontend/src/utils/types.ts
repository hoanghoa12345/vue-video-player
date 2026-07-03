export interface Video {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  description: string;
  uploadedBy?: User;
  filePath: string;
  duration: string;
  thumbnail: string;
  createdAt: string;
  privacy?: number;
  views: number;
  created_at: Date;
  metadata: Metadata;
  created_by: string;
}
export interface VideoInput {
  title: string;
  description: string;
  filePath: string;
  thumbnail: string;
  duration: string;
  uploadedBy: string;
  privacy: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  profilePic: string;
  token: string;
  refresh_token: string;
}

export interface Comment {
  _id: string;
  body: string;
  user: User;
  createdAt: string;
  replies?: Comment[];
}

export interface Objects<T = Video> {
  objects: T[];
  total: number;
}

export interface IObject {
  object: Video;
}

export interface Metadata {
  video_url: string;
  video_description: string;
  channel: Channel;
  play_times: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  avatar_image: string;
  createdAt: string;
  createdBy: string;
}

export interface AppSettings {
  metadata: {
    config: {
      pages: {
        [key: string]: {
          [key: string]: string;
        };
      };
      backend_url: string;
    };
  };
}
