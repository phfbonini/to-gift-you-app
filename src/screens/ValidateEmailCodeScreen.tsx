import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileService } from '../services/profileService';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ValidateCode: { email: string };
  ValidateEmailCode: { newEmail: string };
  ResetPassword: { token: string };
  Profile: { userId: number };
  EditProfile: { profile: any };
};

interface ValidateEmailCodeScreenProps {
  navigation: any;
  route: {
    params: {
      newEmail: string;
    };
  };
}

export const ValidateEmailCodeScreen: React.FC<ValidateEmailCodeScreenProps> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  const newEmail = route.params?.newEmail;
  const inputRefs = useRef<RNTextInput[]>([]);

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
      const response = await profileService.validateEmailChangeCode(code);
      
      if (response.valid && response.token) {
        setToken(response.token);
        // Confirmar mudança de email
        await profileService.confirmEmailChange(response.token);
        
        Alert.alert(
          'Email alterado!',
          'Seu email foi alterado com sucesso. Você precisará fazer login novamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Voltar para a tela de edição de perfil
                navigation.goBack();
                navigation.goBack(); // Voltar duas vezes (ValidateEmailCode -> EditProfile)
              }
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
    if (!newEmail || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    try {
      await profileService.requestEmailChange(newEmail);
      setResendCooldown(60);
      Alert.alert('Sucesso', 'Código reenviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      Alert.alert('Erro', error.message || 'Erro ao reenviar código');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').substring(0, 6);
    setCode(numericText);
    setErrors({});

    // Auto-focus next input
    if (numericText.length === 6) {
      Keyboard.dismiss();
    } else if (numericText.length > 0) {
      const nextIndex = numericText.length;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderCodeInputs = () => {
    const inputs = [];
    for (let i = 0; i < 6; i++) {
      inputs.push(
        <TextInput
          key={i}
          ref={(ref) => {
            if (ref) inputRefs.current[i] = ref as RNTextInput;
          }}
          value={code[i] || ''}
          onChangeText={(text) => {
            const newCode = code.split('');
            newCode[i] = text;
            handleCodeChange(newCode.join(''));
          }}
          onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.codeInput}
          mode="outlined"
          textAlign="center"
          selectTextOnFocus
        />
      );
    }
    return inputs;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirmar Mudança de Email</Text>
        <Text style={styles.subtitle}>
          Digite o código de 6 dígitos enviado para:
        </Text>
        <Text style={styles.email}>{newEmail}</Text>

        <View style={styles.codeContainer}>
          {renderCodeInputs()}
        </View>

        {errors.code && (
          <HelperText type="error" visible={!!errors.code} style={styles.errorText}>
            {errors.code}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleValidateCode}
          loading={loading}
          disabled={loading || code.length !== 6}
          style={styles.button}
        >
          Confirmar
        </Button>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código?</Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resendLoading || resendCooldown > 0}
          >
            <Text style={[
              styles.resendButton,
              (resendLoading || resendCooldown > 0) && styles.resendButtonDisabled
            ]}>
              {resendCooldown > 0
                ? `Reenviar em ${resendCooldown}s`
                : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    height: 60,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: colors.onBackground,
  },
  resendButton: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: colors.onBackground,
    opacity: 0.5,
  },
  backButton: {
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
});

