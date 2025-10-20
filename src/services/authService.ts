import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getBaseURL } from '../config/api';

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Aumentar timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fila de requisições pendentes para evitar múltiplos refresh simultâneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de request para adicionar token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está renovando, adicionar à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/api/auth/refresh', {
          refreshToken: refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Salvar novos tokens
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        // Processar fila de requisições pendentes
        processQueue(null, accessToken);

        // Repetir requisição original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Se refresh falhou, limpar tokens e redirecionar para login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        processQueue(refreshError, null);
        
        // Aqui você pode adicionar navegação para tela de login
        // navigation.navigate('Login');
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para outros erros, retry automático em caso de erro de rede
    if ((axios.isCancel(error) || error.code === 'ECONNABORTED' || error.response?.status >= 500) && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest); 
    }

    return Promise.reject(error);
  }
);

// Interfaces
export interface LoginData {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  user: {
    id: number;
    nome: string;
    email: string;
    username: string;
    roles: string[];
  };
}

export interface RefreshData {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface LogoutData {
  refreshToken: string;
}

export interface RegisterData {
  nome: string;
  username: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
}

export interface RegisterResponse {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  mensagem: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  senha: string;
  confirmacaoSenha: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ValidateCodeData {
  code: string;
}

export interface ValidateCodeResponse {
  message: string;
  token: string | null;
  valid: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

// Funções de autenticação
export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: data.email,
      senha: data.senha,
    });
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

export const refreshToken = async (data: RefreshData): Promise<RefreshResponse> => {
  try {
    const response = await api.post<RefreshResponse>('/api/auth/refresh', {
      refreshToken: data.refreshToken,
    });
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

export const logout = async (data: LogoutData): Promise<void> => {
  try {
    await api.post('/api/auth/logout', {
      refreshToken: data.refreshToken,
    });
  } catch (error) {
    // Mesmo se der erro no servidor, limpar tokens localmente
    console.warn('Erro ao fazer logout no servidor:', error);
  } finally {
    // Sempre limpar tokens localmente
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>('/api/auth/register', {
      nome: data.nome,
      username: data.username,
      email: data.email,
      senha: data.senha,
      confirmacaoSenha: data.confirmacaoSenha,
    });
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

// Função para verificar se está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return !!(accessToken && refreshToken);
  } catch (error) {
    return false;
  }
};

// Função para obter tokens
export const getTokens = async (): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return { accessToken, refreshToken };
  } catch (error) {
    return { accessToken: null, refreshToken: null };
  }
};

// Funções de reset de senha
export const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  try {
    console.log('📧 Enviando solicitação de reset para:', data.email);
    console.log('🌐 URL base:', getBaseURL());
    
    const response = await api.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
      email: data.email,
    });
    
    console.log('✅ Resposta recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro na solicitação de reset:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('📡 Status HTTP:', axiosError.response?.status);
      console.error('📡 Dados da resposta:', axiosError.response?.data);
      console.error('📡 URL da requisição:', axiosError.config?.url);
      
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

export const resetPassword = async (token: string, senha: string, confirmacaoSenha: string): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>('/api/auth/reset-password', {
      token: token,
      senha: senha,
      confirmacaoSenha: confirmacaoSenha,
    });
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

export const validateCode = async (code: string): Promise<ValidateCodeResponse> => {
  try {
    const response = await api.post<ValidateCodeResponse>('/api/auth/validate-code', {
      code: code,
    });
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

// Objeto authService para facilitar o uso
export const authService = {
  login,
  refreshToken,
  logout,
  register,
  forgotPassword,
  resetPassword,
  validateCode,
  isAuthenticated,
  getTokens,
};