import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: __DEV__ ? 'http://10.0.2.2:8080' : 'http://localhost:8080', // 10.0.2.2 é o localhost do emulador Android
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para retry automático em caso de erro de rede
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if ((axios.isCancel(error) || error.code === 'ECONNABORTED' || error.response?.status >= 500) && !config._retry) {
      config._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(config); 
    }
    return Promise.reject(error);
  }
);

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

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

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