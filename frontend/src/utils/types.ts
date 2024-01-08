export interface Video {
  _id: string;
  title: string;
  description: string;
  uploadedBy: User;
  filePath: string;
  duration: string;
  thumbnail: string;
  createdAt: string;
  privacy?: number;
  views: number;
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
