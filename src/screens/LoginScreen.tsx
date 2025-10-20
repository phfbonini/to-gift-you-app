import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator, HelperText } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { validateEmail } from '../utils/validation';
import { PasswordInput } from '../components/PasswordInput';
import { login, LoginData } from '../services/authService';
import { colors } from '../theme/colors';
import * as SecureStore from 'expo-secure-store';

// Tipagem de Navegação
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};
type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  // Refs para Foco Automático
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  // Estado do Formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estado de Validação/Erros
  const [errors, setErrors] = useState({
    email: '',
    senha: '',
  });

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se já está logado
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        // Se tem refresh token, tentar renovar o access token
        // Isso será implementado no authService
        navigation.navigate('Home');
      }
    } catch (error) {
      // Ignorar erro, usuário precisa fazer login
    }
  };

  // Funções de Validação
  const validateField = useCallback((field: keyof typeof errors, value: string): string => {
    switch (field) {
      case 'email':
        return !validateEmail(value) ? 'Insira um formato de e-mail válido.' : '';
      case 'senha':
        return value.length === 0 ? 'A senha é obrigatória.' : '';
      default:
        return '';
    }
  }, []);

  // Handler de Validação no Blur
  const handleBlur = useCallback((field: keyof typeof errors, value: string) => {
    const errorMsg = validateField(field, value);
    setErrors(e => ({ ...e, [field]: errorMsg }));
  }, [validateField]);

  // Status de Validação Global
  const hasErrors = Object.values(errors).some(e => e.length > 0);
  const areAllFieldsFilled = email.length > 0 && senha.length > 0;
  const isFormValid = areAllFieldsFilled && !hasErrors;

  // Lógica de Submissão
  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();

    // Forçar validação de todos os campos
    const initialErrors = {
      email: validateField('email', email),
      senha: validateField('senha', senha),
    };

    setErrors(initialErrors);

    if (!isFormValid) {
      // 1. Foco automático no primeiro campo com erro
      if (initialErrors.email) emailRef.current?.focus();
      else if (initialErrors.senha) passwordRef.current?.focus();
      return;
    }

    // Submissão
    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email,
        senha,
      };

      const response = await login(loginData);

      // Sucesso - salvar tokens
      await SecureStore.setItemAsync('accessToken', response.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.refreshToken);

      // Navegação para Home
      navigation.navigate('Home');

    } catch (error) {
      // Tratamento de erro
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.';
      Alert.alert('Erro no Login', errorMessage);
      
      // Destacar campo com erro baseado na mensagem
      if (errorMessage.includes('e-mail') || errorMessage.includes('Email') || errorMessage.includes('credenciais')) {
        setErrors(e => ({ ...e, email: 'Email ou senha incorretos.' }));
        emailRef.current?.focus();
      } else if (errorMessage.includes('senha') || errorMessage.includes('Senha')) {
        setErrors(e => ({ ...e, senha: 'Email ou senha incorretos.' }));
        passwordRef.current?.focus();
      }

    } finally {
      setIsLoading(false);
    }
  }, [email, senha, isFormValid, navigation, validateField]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Logo/Título */}
        <Text variant="headlineLarge" style={[styles.logo, { color: colors.primary }]}>To Gift You</Text>
        <Text variant="titleLarge" style={[styles.title, { color: colors.text.secondary }]}>Faça seu Login</Text>

        {/* Input Email */}
        <TextInput
          ref={emailRef}
          label="seu@email.com"
          value={email}
          onChangeText={setEmail}
          onBlur={() => handleBlur('email', email)}
          error={!!errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          disabled={isLoading}
          left={<TextInput.Icon icon="email-outline" />}
          style={[styles.input, { backgroundColor: colors.background }]}
          theme={{
            colors: {
              primary: colors.primary,
              error: colors.error,
              outline: colors.border,
              onSurface: colors.text.primary,
              onSurfaceVariant: colors.text.secondary,
            }
          }}
        />
        <HelperText type="error" visible={!!errors.email} theme={{ colors: { error: colors.error } }}>
          {errors.email}
        </HelperText>

        {/* Input Senha */}
        <PasswordInput
          inputRef={passwordRef}
          label="Sua senha"
          value={senha}
          onChangeText={setSenha}
          onBlur={() => handleBlur('senha', senha)}
          error={errors.senha}
          disabled={isLoading}
          showStrengthIndicator={false}
        />
        
        {/* Botão de Login */}
        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
          style={[styles.button, { backgroundColor: colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
          theme={{
            colors: {
              primary: colors.primary,
            }
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        {/* Links */}
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
          style={styles.linkButton}
          labelStyle={{ color: colors.primary }}
        >
          Esqueci minha senha
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
          style={styles.linkButton}
          labelStyle={{ color: colors.primary }}
        >
          Não tem conta? Cadastre-se
        </Button>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    minHeight: '100%',
  },
  logo: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 0,
    backgroundColor: colors.background,
  },
  button: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 10,
  },
});
