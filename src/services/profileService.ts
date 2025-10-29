import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getBaseURL } from '../config/api';

// Reutilizar a instância do axios do authService
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Token adicionado aos headers');
  } else {
    console.log('⚠️ Nenhum token encontrado');
  }
  return config;
});

// Interfaces para o perfil
export interface UserLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface UserStats {
  postsCount: number;
  likesReceived: number;
  followersCount: number;
  followingCount: number;
}

export interface UserProfile {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
  bio?: string;
  links: UserLinks;
  stats: UserStats;
  isMine: boolean;
  isFollowing: boolean;
  joinedAt: string;
  lastActiveAt: string;
  topTags: string[];
}

export interface FollowActionResponse {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Funções do serviço de perfil
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>('/api/users/me');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao obter perfil:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Se for erro 401, criar erro específico
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
      
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro no servidor');
      }
      
      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      
      if (axiosError.code === 'ENOTFOUND') {
        throw new Error('Servidor não encontrado. Verifique a configuração de rede.');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>(`/api/users/profile/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro no servidor');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const getUserStats = async (userId: number): Promise<UserStats> => {
  try {
    const response = await api.get<UserStats>(`/api/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro no servidor');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const followUser = async (userId: number): Promise<FollowActionResponse> => {
  try {
    const response = await api.post<FollowActionResponse>(`/api/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro no servidor');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const unfollowUser = async (userId: number): Promise<FollowActionResponse> => {
  try {
    const response = await api.delete<FollowActionResponse>(`/api/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro no servidor');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

// Objeto profileService para facilitar o uso
export const profileService = {
  getCurrentUserProfile,
  getUserProfile,
  getUserStats,
  followUser,
  unfollowUser,
};
