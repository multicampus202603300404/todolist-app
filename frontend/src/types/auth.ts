export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  created_at: string;
}
