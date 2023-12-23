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
  image: string;
  token: string;
  refresh_token: string;
}
