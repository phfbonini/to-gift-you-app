import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../schemas/registerSchema';
import { PasswordInput } from '../components/PasswordInput';
import { register } from '../services/authService';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreenNew: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // Refs para foco automático
  const usernameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      username: '',
      email: '',
      senha: '',
      confirmacaoSenha: '',
    },
  });

  const senha = watch('senha');

  const onSubmit = async (data: RegisterFormData) => {
    Keyboard.dismiss();

    try {
      const response = await register({
        nome: data.nome,
        username: data.username,
        email: data.email,
        senha: data.senha,
        confirmacaoSenha: data.confirmacaoSenha,
      });

      Alert.alert('Sucesso!', response.mensagem);

      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Tente novamente.';
      Alert.alert('Erro no Cadastro', errorMessage);

      // Destacar campo com erro baseado na mensagem
      if (errorMessage.includes('Username') || errorMessage.includes('username')) {
        control.setError('username', { message: 'Username já está em uso.' });
        usernameRef.current?.focus();
      } else if (errorMessage.includes('e-mail') || errorMessage.includes('Email')) {
        control.setError('email', { message: 'E-mail já cadastrado.' });
        emailRef.current?.focus();
      } else if (errorMessage.includes('senha') || errorMessage.includes('Senha')) {
        control.setError('senha', { message: 'Senha inválida.' });
        passwordRef.current?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Logo/Título */}
        <Text variant="headlineLarge" style={styles.logo}>To Gift You</Text>
        <Text variant="titleLarge" style={styles.title}>Crie Sua Conta</Text>

        {/* Input Nome Completo */}
        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Nome completo"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.nome}
                mode="outlined"
                left={<TextInput.Icon icon="account-outline" />}
                style={styles.input}
                theme={theme}
              />
              <HelperText type="error" visible={!!errors.nome}>
                {errors.nome?.message}
              </HelperText>
            </>
          )}
        />

        {/* Input Username */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                ref={usernameRef}
                label="Username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.username}
                mode="outlined"
                autoCapitalize="none"
                left={<TextInput.Icon icon="at" />}
                style={styles.input}
                theme={theme}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username?.message}
              </HelperText>
              <HelperText type="info" visible={!!value && !errors.username}>
                Apenas letras minúsculas, números, pontos e underscores
              </HelperText>
            </>
          )}
        />

        {/* Input Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                ref={emailRef}
                label="seu@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
                theme={theme}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email?.message}
              </HelperText>
            </>
          )}
        />

        {/* Input Senha */}
        <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <PasswordInput
                inputRef={passwordRef}
                label="Senha"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  // Validar confirmação quando senha mudar
                  trigger('confirmacaoSenha');
                }}
                onBlur={onBlur}
                error={errors.senha?.message}
              />
            </>
          )}
        />

        {/* Input Confirmar Senha */}
        <Controller
          control={control}
          name="confirmacaoSenha"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <PasswordInput
                inputRef={confirmPasswordRef}
                label="Confirme sua senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmacaoSenha?.message}
                confirmPassword={true}
              />
            </>
          )}
        />
        
        {/* Botão de Cadastro */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          theme={{ colors: { primary: colors.primary } }}
        >
          {isSubmitting ? 'Criando Conta...' : 'Criar Conta'}
        </Button>

        {/* Link para Login */}
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          disabled={isSubmitting}
          style={styles.linkButton}
          labelStyle={{ color: colors.primary }}
        >
          Já tem conta? Faça login
        </Button>

      </ScrollView>
    </View>
  );
};

const theme = {
  colors: {
    primary: colors.primary,
    error: colors.error,
    outline: colors.border,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
  }
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
    color: colors.primary,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
    color: colors.text.secondary,
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
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  linkButton: {
    marginTop: 10,
  },
});

