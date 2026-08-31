import { CSSProperties, ReactNode } from "react";

export type TInputSize = "sm" | "md" | "lg";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export interface IComponentCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  style?: CSSProperties;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  confirmPassword: string;
  roles: IUserRole[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  avatar?: string;
}

export interface ICategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface IUserCreate extends Omit<Partial<IUser>, "roles"> {
  roles: string[];
}

export interface IOtp {
  email: string;
  otp: string;
}
export interface ILoginData {
  email: string;
  password: string;
}

export interface ILoginResponseData extends Partial<IUser> {
  accessToken: string;
}

export interface ILoginResponse {
  message: string;
  data: ILoginResponseData;
  statusCode?: number;
  success?: boolean;
}

export interface IValidationConfig {
  [key: string]: {
    required?: boolean;
    matchField?: string;
    customValidation?: (value: string) => string | null;
    minLength?: number;
    maxLength?: number;
  };
}

export interface IFormBase {
  inputErrors: Record<string, string>;
  errorMessage?: string;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

export interface IUseLoginUserResponse extends IFormBase {
  userData: Partial<ILoginData>;
  showPassword: boolean;
  statusCode: number | null;
  togglePasswordVisibility: () => void;
  handleLogout: () => Promise<void>;
}

export interface IUseOtpVerificationResponse extends IFormBase {
  otp: string;
}

export interface IUseForgotPasswordResponse extends IFormBase {
  email: string;
}

export interface IUseSignUpResponse extends IFormBase {
  userData: Partial<IUser>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
}

export interface IUseResendOTPResponse {
  isDisabled: boolean;
  isLoading: boolean;
  errorMessage?: string;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  handleResendOTP: () => Promise<void>;
  handleSendOTP: (params: string) => Promise<void>;
}

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions?: IPermission[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface IUserRole {
  role: IRole;
}

export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
