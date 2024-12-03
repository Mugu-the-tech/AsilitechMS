/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  organizationName: string;
  organizationSlug: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    twoFactorEnabled?: boolean;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
}

export class AuthService {
  
  private static API_BASE_URL =  import.meta.env.VITE_BACKEND_URL  || 'http://localhost:3000'; 
  
  public static api = axios.create({
    baseURL: AuthService.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  static {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  static async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', data);
      this.setAuthData(response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed');
    }
  }

  static async login(credentials: LoginDto): Promise<AuthResponse> {
    try {

      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      this.setAuthData(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  static async loginWith2FA(credentials: LoginDto, token: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/verify-2fa', {
        ...credentials,
        token,
      });
      this.setAuthData(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '2FA verification failed');
    }
  }

  private static setAuthData(data: AuthResponse) {
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('organization', JSON.stringify(data.organization));
    this.api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
  }

  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    delete this.api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}