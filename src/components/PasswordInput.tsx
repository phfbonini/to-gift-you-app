import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { getPasswordStrength, PasswordStrength } from '../utils/validation';
import { colors } from '../theme/colors';


interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  confirmPassword?: boolean;
  inputRef?: React.RefObject<RNTextInput | null>; 
  disabled?: boolean;
  showStrengthIndicator?: boolean;
}

const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'Muito Fraca': return colors.error;
    case 'Fraca': return colors.warning;
    case 'Média': return colors.info;
    case 'Forte': return colors.success;
    default: return colors.text.disabled;
  }
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  confirmPassword = false,
  inputRef,
  disabled = false,
  showStrengthIndicator = true,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const strength = getPasswordStrength(value);
  const strengthColor = getStrengthColor(strength);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef as any}
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        mode="outlined"
        secureTextEntry={!visible}
        disabled={disabled}
        left={<TextInput.Icon icon="lock-outline" />}
        right={<TextInput.Icon 
          icon={visible ? 'eye-off' : 'eye'} 
          onPress={() => setVisible(p => !p)} 
          color={colors.text.secondary}
        />}
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
      
      {/* Indicador de Força (Apenas para o campo Senha) */}
      {!confirmPassword && value.length > 0 && showStrengthIndicator && (
        <View style={styles.strengthIndicatorContainer}>
          <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Força:</Text>
          <View style={[styles.strengthBar, { width: `${value.length * 5}%`, backgroundColor: strengthColor }]} />
          <Text style={[styles.strengthText, { color: strengthColor }]}>{strength}</Text>
        </View>
      )}

      {/* Mensagem de Erro */}
      <HelperText type="error" visible={!!error} theme={{ colors: { error: colors.error } }}>
        {error}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
  },
  strengthIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingRight: 12,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
    minWidth: 10,
    maxWidth: 80,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
