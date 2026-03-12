// Auth types for the application

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'candidat' | 'employeur' | 'admin';
  profileImage?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  // For social login role selection flow
  needsRoleSelection?: boolean;
  email?: string;
  provider?: string;
  userExists?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface SocialAuthData {
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role?: string;
  token: string;
  provider: string;
  googleId?: string;
  facebookId?: string;
  linkedinId?: string;
  checkOnly?: boolean;
}
