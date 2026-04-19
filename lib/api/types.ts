export type MobileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  isActive?: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: MobileUser;
};

export type ProfileResponse = {
  user: MobileUser;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
};
