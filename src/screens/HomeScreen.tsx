import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../theme/colors';
import { logout, getTokens, isAuthenticated } from '../services/authService';
import * as SecureStore from 'expo-secure-store';

// Tipagem de Navegação
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};
type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        navigation.navigate('Login');
        return;
      }

      const tokens = await getTokens();
      if (tokens.accessToken) {
        // Aqui você pode decodificar o token ou fazer uma requisição para obter dados do usuário
        // Por simplicidade, vamos apenas mostrar que está logado
        setUserInfo({ message: 'Usuário logado com sucesso!' });
      }
    } catch (error) {
      console.error('Erro ao carregar informações do usuário:', error);
      navigation.navigate('Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const tokens = await getTokens();
      if (tokens.refreshToken) {
        await logout({ refreshToken: tokens.refreshToken });
      }
      
      // Limpar tokens localmente
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      Alert.alert('Logout', 'Logout realizado com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
            Bem-vindo ao To Gift You!
          </Text>
          
          <Text variant="bodyLarge" style={[styles.message, { color: colors.text.secondary }]}>
            {userInfo?.message || 'Você está logado!'}
          </Text>

          <Text variant="bodyMedium" style={[styles.info, { color: colors.text.secondary }]}>
            Sistema de autenticação JWT funcionando perfeitamente! 🎉
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
        >
          Fazer Logout
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 50,
    marginBottom: 30,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 15,
  },
  info: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutButton: {
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
