import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';

interface ValidateCodeScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export const ValidateCodeScreen: React.FC<ValidateCodeScreenProps> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  const email = route.params?.email;
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!code.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.code = 'Código deve ter exatamente 6 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidateCode = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.validateCode(code);
      
      if (response.valid && response.token) {
        setToken(response.token);
        Alert.alert(
          'Código Válido',
          'Agora você pode definir sua nova senha',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.navigate('ResetPassword', { token: response.token })
            }
          ]
        );
      } else {
        Alert.alert('Erro', response.message || 'Código inválido');
      }
    } catch (error: any) {
      console.error('Erro ao validar código:', error);
      Alert.alert('Erro', error.message || 'Erro ao validar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setResendLoading(true);
    try {
      await authService.forgotPassword({ email });
      setResendCooldown(60); // 60 segundos de cooldown
      Alert.alert('Sucesso', 'Novo código enviado para seu email');
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      Alert.alert('Erro', error.message || 'Erro ao reenviar código');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Remove caracteres não numéricos
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Limita a 6 dígitos
    if (numericText.length <= 6) {
      setCode(numericText);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Verificar Código</Text>
            <Text style={styles.subtitle}>
              Digite o código de 6 dígitos enviado para:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de Verificação</Text>
              <View style={styles.codeInputContainer}>
                <TextInput
                  style={[
                    styles.codeInput,
                    errors.code && styles.codeInputError
                  ]}
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="000000"
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                  editable={!loading}
                  selectTextOnFocus
                />
              </View>
              {errors.code && (
                <Text style={styles.errorText}>{errors.code}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleValidateCode}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Verificar Código</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Não recebeu o código?</Text>
              <TouchableOpacity
                style={[styles.resendButton, (resendLoading || resendCooldown > 0) && styles.resendButtonDisabled]}
                onPress={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? (
                  <ActivityIndicator color="#6366f1" size="small" />
                ) : (
                  <Text style={styles.resendButtonText}>
                    {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar Código'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeInputContainer: {
    alignItems: 'center',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    width: 200,
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  codeInputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
});
