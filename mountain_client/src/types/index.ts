// (#7)
export interface JwtPayload {
  sub: number;
  email: string;
  role: 'admin' | 'user';
  exp?: number;
}

// (#7)
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

// (#39)
export interface Mountain {
  id: number;
  name: string;
  height: number;
  location: string;
  difficultyLevel: number;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// (#46)
export interface Trail {
  id: number;
  mountainId: number;
  name: string;
  length: number;
  estimatedTime: number;
  difficultyLevel: number;
  isCircular: boolean;
}

// (#53)
export interface Review {
  id: number;
  mountainId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}


