import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator, HelperText } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { validateEmail, validateUsername } from '../utils/validation';
import { PasswordInput } from '../components/PasswordInput';
import { register, RegisterData } from '../services/authService';
import { colors } from '../theme/colors';

// Tipagem de Navegação (Ajuste conforme seu RootStackParamList)
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  // Refs para Foco Automático
  const nameRef = useRef<RNTextInput>(null);
  const usernameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  // Estado do Formulário
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estado de Validação/Erros
  const [errors, setErrors] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);

  // Funções de Validação
  const validateField = useCallback((field: keyof typeof errors, value: string): string => {
    switch (field) {
      case 'nome':
        return value.length < 3 ? 'O nome deve ter no mínimo 3 caracteres.' : '';
      case 'username':
        if (value.length < 3) return 'Username deve ter no mínimo 3 caracteres.';
        if (value.length > 30) return 'Username deve ter no máximo 30 caracteres.';
        return !validateUsername(value) ? 'Username deve conter apenas letras minúsculas, números, pontos e underscores.' : '';
      case 'email':
        return !validateEmail(value) ? 'Insira um formato de e-mail válido.' : '';
      case 'senha':
        return value.length < 8 ? 'A senha deve ter no mínimo 8 caracteres.' : '';
      case 'confirmarSenha':
        return value !== senha ? 'As senhas não coincidem.' : '';
      default:
        return '';
    }
  }, [senha]);

  // Handler de Validação no Blur
  const handleBlur = useCallback((field: keyof typeof errors, value: string) => {
    const errorMsg = validateField(field, value);
    setErrors(e => ({ ...e, [field]: errorMsg }));
  }, [validateField]);

  // Validação em Tempo Real: Senha
  const handlePasswordChange = (text: string) => {
    setSenha(text);
    // Remove erro de confirmação se o campo de senha for modificado
    if (errors.confirmarSenha && confirmarSenha.length > 0) {
      handleBlur('confirmarSenha', confirmarSenha);
    }
    const errorMsg = text.length < 8 ? 'A senha deve ter no mínimo 8 caracteres.' : '';
    setErrors(e => ({ ...e, senha: errorMsg }));
  };

  // Status de Validação Global
  const hasErrors = Object.values(errors).some(e => e.length > 0);
  const areAllFieldsFilled = nome.length > 0 && username.length > 0 && email.length > 0 && senha.length > 0 && confirmarSenha.length > 0;
  const isFormValid = areAllFieldsFilled && !hasErrors;

  // Lógica de Submissão
  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();

    // Forçar validação de todos os campos
    const initialErrors = {
      nome: validateField('nome', nome),
      username: validateField('username', username),
      email: validateField('email', email),
      senha: validateField('senha', senha),
      confirmarSenha: validateField('confirmarSenha', confirmarSenha),
    };

    setErrors(initialErrors);

    if (!isFormValid) {
      // 1. Foco automático no primeiro campo com erro
      if (initialErrors.nome) nameRef.current?.focus();
      else if (initialErrors.username) usernameRef.current?.focus();
      else if (initialErrors.email) emailRef.current?.focus();
      else if (initialErrors.senha) passwordRef.current?.focus();
      else if (initialErrors.confirmarSenha) confirmPasswordRef.current?.focus();
      return;
    }

    // Submissão
    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        nome,
        username,
        email,
        senha,
        confirmacaoSenha: confirmarSenha,
      };

      const response = await register(registerData);

      // Sucesso
      Alert.alert('Sucesso!', response.mensagem);

      // Navegação automática para Login após 2s
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);

    } catch (error) {
      // Tratamento de erro real
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.';
      Alert.alert('Erro no Cadastro', errorMessage);
      
      // Destacar campo com erro baseado na mensagem
      if (errorMessage.includes('Username') || errorMessage.includes('username')) {
        setErrors(e => ({ ...e, username: 'Username já está em uso.' }));
        usernameRef.current?.focus();
      } else if (errorMessage.includes('e-mail') || errorMessage.includes('Email')) {
        setErrors(e => ({ ...e, email: 'E-mail já cadastrado.' }));
        emailRef.current?.focus();
      } else if (errorMessage.includes('senha') || errorMessage.includes('Senha')) {
        setErrors(e => ({ ...e, senha: 'Senha inválida.' }));
        passwordRef.current?.focus();
      }

    } finally {
      setIsLoading(false);
    }
  }, [nome, username, email, senha, confirmarSenha, isFormValid, navigation, validateField]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Logo/Título */}
        <Text variant="headlineLarge" style={[styles.logo, { color: colors.primary }]}>To Gift You</Text>
        <Text variant="titleLarge" style={[styles.title, { color: colors.text.secondary }]}>Crie Sua Conta</Text>

        {/* Input Nome Completo */}
        <TextInput
          ref={nameRef}
          label="Nome completo"
          value={nome}
          onChangeText={setNome}
          onBlur={() => handleBlur('nome', nome)}
          error={!!errors.nome}
          mode="outlined"
          disabled={isLoading}
          left={<TextInput.Icon icon="account-outline" />}
          style={[styles.input, { backgroundColor: colors.background }]}
          theme={{
            colors: {
              primary: colors.primary,
              error: colors.error,
              outline: colors.border,
            }
          }}
        />
        <HelperText type="error" visible={!!errors.nome} theme={{ colors: { error: colors.error } }}>
          {errors.nome}
        </HelperText>

        {/* Input Username */}
        <TextInput
          ref={usernameRef}
          label="Username"
          value={username}
          onChangeText={setUsername}
          onBlur={() => handleBlur('username', username)}
          error={!!errors.username}
          mode="outlined"
          disabled={isLoading}
          autoCapitalize="none"
          left={<TextInput.Icon icon="at" />}
          style={[styles.input, { backgroundColor: colors.background }]}
          theme={{
            colors: {
              primary: colors.primary,
              error: colors.error,
              outline: colors.border,
            }
          }}
        />
        <HelperText type="error" visible={!!errors.username} theme={{ colors: { error: colors.error } }}>
          {errors.username}
        </HelperText>
        <HelperText type="info" visible={username.length > 0 && !errors.username} theme={{ colors: { onSurface: colors.text.secondary } }}>
          Apenas letras minúsculas, números, pontos e underscores
        </HelperText>

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
            }
          }}
        />
        <HelperText type="error" visible={!!errors.email} theme={{ colors: { error: colors.error } }}>
          {errors.email}
        </HelperText>

        {/* Input Senha */}
        <PasswordInput
          inputRef={passwordRef}
          label="Senha (mínimo 8 caracteres)"
          value={senha}
          onChangeText={handlePasswordChange}
          onBlur={() => handleBlur('senha', senha)}
          error={errors.senha}
          disabled={isLoading}
        />

        {/* Input Confirmar Senha */}
        <PasswordInput
          inputRef={confirmPasswordRef}
          label="Confirme sua senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          onBlur={() => handleBlur('confirmarSenha', confirmarSenha)}
          error={errors.confirmarSenha}
          confirmPassword={true}
          disabled={isLoading}
        />
        
        {/* Botão de Cadastro */}
        <Button
          mode="contained"
          onPress={handleRegister}
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
          {isLoading ? 'Criando Conta...' : 'Criar Conta'}
        </Button>

        {/* Link para Login */}
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
          style={styles.linkButton}
          labelStyle={{ color: colors.primary }}
        >
          Já tem conta? Faça login
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