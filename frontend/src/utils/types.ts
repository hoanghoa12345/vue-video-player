export interface Video {
  _id: string;
  title: string;
  description: string;
  uploadedBy: User;
  filePath: string;
  duration: string;
  thumbnail: string;
  createdAt: string;
  views: number;
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
