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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

// Thumbnails de posts para o grid do perfil
export interface PostThumbnail {
  id: number;
  thumbnailUrl: string; // url da miniatura
}

export interface FollowActionResponse {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  message: string;
}

export interface ProfileUpdateRequest {
  username?: string;
  nome?: string;
  bio?: string;
  fotoPerfil?: string;
  links?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface EmailChangeRequest {
  newEmail: string;
}

export interface ValidateCodeEmailRequest {
  code: string;
}

export interface ValidateCodeEmailResponse {
  valid: boolean;
  token?: string;
  message: string;
}

export interface EmailChangeConfirmRequest {
  token: string;
}

export interface UploadPhotoResponse {
  url: string;
  error?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  errors?: FieldError[];
  fieldErrors?: FieldError[];
  validationErrors?: Record<string, string>;
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

// Buscar thumbnails dos posts do usuário (limite padrão: 9)
export const getUserPostThumbnails = async (
  userId: number,
  limit: number = 9
): Promise<PostThumbnail[]> => {
  try {
    const response = await api.get<PostThumbnail[]>(`/api/users/${userId}/posts`, {
      params: { limit },
    });

    // Ajustar possíveis URLs com localhost para baseURL correta no mobile
    const baseURL = getBaseURL();
    return (response.data || []).map((item) => {
      let url = item.thumbnailUrl;
      if (url && url.includes('localhost')) {
        url = url.replace(/https?:\/\/localhost:\d+/, baseURL);
      }
      return { ...item, thumbnailUrl: url };
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      // Se o endpoint ainda não existe ou não foi implementado, retornar lista vazia para não quebrar a UI
      if (axiosError.response?.status === 404 || axiosError.response?.status === 501) {
        return [];
      }
      const apiError = axiosError.response?.data;
      if (apiError && apiError.message) {
        throw new Error(apiError.message);
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

export const updateProfile = async (data: ProfileUpdateRequest): Promise<UserProfile> => {
  try {
    const response = await api.put<UserProfile>('/api/users/profile', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
      
      if (axiosError.response?.status === 400) {
        // Erro de validação - tentar obter detalhes
        const apiError = axiosError.response?.data;
        
        // Se for erro de validação com FieldError (errors é o nome correto do campo)
        if (apiError && Array.isArray(apiError.errors)) {
          const fieldErrors = apiError.errors
            .map((fe: any) => `${fe.field}: ${fe.message}`)
            .join(', ');
          throw new Error(`Validação falhou: ${fieldErrors}`);
        }
        
        // Fallback para fieldErrors se existir
        if (apiError && Array.isArray(apiError.fieldErrors)) {
          const fieldErrors = apiError.fieldErrors
            .map((fe: any) => `${fe.field}: ${fe.message}`)
            .join(', ');
          throw new Error(`Validação falhou: ${fieldErrors}`);
        }
        
        if (apiError?.message) {
          throw new Error(`Validação falhou: ${apiError.message}`);
        }
        
        throw new Error('Erro de validação. Verifique os campos preenchidos.');
      }
      
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro ao atualizar perfil');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const checkUsernameAvailability = async (username: string): Promise<UsernameAvailabilityResponse> => {
  try {
    const response = await api.get<UsernameAvailabilityResponse>('/api/users/username/check', {
      params: { username }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
    }
    throw new Error('Erro ao verificar disponibilidade do username');
  }
};

export const requestEmailChange = async (newEmail: string): Promise<void> => {
  try {
    await api.post('/api/users/email/change-request', { newEmail });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
      
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro ao solicitar mudança de email');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const validateEmailChangeCode = async (code: string): Promise<ValidateCodeEmailResponse> => {
  try {
    const response = await api.post<ValidateCodeEmailResponse>('/api/users/email/validate-code', null, {
      params: { code }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
    }
    throw new Error('Erro ao validar código');
  }
};

export const confirmEmailChange = async (token: string): Promise<void> => {
  try {
    await api.post('/api/users/email/confirm', { token });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
      
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro ao confirmar mudança de email');
      }
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
};

export const uploadPhoto = async (uri: string): Promise<string> => {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);
    
    const response = await api.post<UploadPhotoResponse>('/api/users/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Converter URL de localhost para o IP correto do mobile
    let imageUrl = response.data.url;
    const baseURL = getBaseURL();
    
    // Se a URL contém localhost, substituir pelo baseURL
    if (imageUrl && imageUrl.includes('localhost')) {
      imageUrl = imageUrl.replace(/https?:\/\/localhost:\d+/, baseURL);
    }
    
    return imageUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 401) {
        throw new Error('401: Token inválido ou expirado');
      }
      
      const apiError = axiosError.response?.data;
      
      if (apiError) {
        throw new Error(apiError.message || 'Erro ao fazer upload da foto');
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
  updateProfile,
  checkUsernameAvailability,
  requestEmailChange,
  validateEmailChangeCode,
  confirmEmailChange,
  uploadPhoto,
  getUserPostThumbnails,
};
