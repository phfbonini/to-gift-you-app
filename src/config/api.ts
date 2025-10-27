import { Platform } from 'react-native';

// Configuração da API
export const API_CONFIG = {
  // Para desenvolvimento local
  DEVELOPMENT: {
    // Para emulador Android
    ANDROID_EMULATOR: 'http://10.0.2.2:8080',
    // Para iOS Simulator
    IOS_SIMULATOR: 'http://localhost:8080',
    // Para dispositivo físico (substitua pelo IP da sua máquina)
    PHYSICAL_DEVICE: 'http://192.168.15.3:8080', // IP da sua máquina
  },
  // Para produção
  PRODUCTION: 'https://your-production-api.com',
};

// Função para obter a URL base
export const getBaseURL = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Para emulador Android, use o IP especial 10.0.2.2
      const url = API_CONFIG.DEVELOPMENT.ANDROID_EMULATOR;
      console.log('🔗 Usando URL para Android (emulador):', url);
      return url;
      
      // Se estiver usando dispositivo físico Android, descomente a linha abaixo e configure o IP correto:
      // const url = API_CONFIG.DEVELOPMENT.PHYSICAL_DEVICE;
      // console.log('🔗 Usando URL para Android (dispositivo físico):', url);
      // return url;
    }
    const url = API_CONFIG.DEVELOPMENT.IOS_SIMULATOR;
    console.log('🔗 Usando URL para iOS:', url);
    return url;
  }
  return API_CONFIG.PRODUCTION;
};

// Função para obter o IP da máquina (para dispositivos físicos)
export const getLocalIP = (): string => {
  // Substitua pelo IP da sua máquina na rede local
  // Para descobrir: no Windows: ipconfig, no Mac/Linux: ifconfig
  return '192.168.15.3'; // IP da sua máquina
};
