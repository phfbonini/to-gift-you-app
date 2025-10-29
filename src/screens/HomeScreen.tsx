import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../theme/colors';
import { logout, getTokens, isAuthenticated } from '../services/authService';
import { profileService, UserProfile } from '../services/profileService';
import * as SecureStore from 'expo-secure-store';

// Tipagem de Navegação
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: { userId: number };
};
type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listener para quando a tela recebe foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTimeout(() => {
        loadUserProfile();
      }, 500);
    });

    return unsubscribe;
  }, [navigation]);
  
  // Carregar perfil quando a tela monta
  useEffect(() => {
    setTimeout(() => {
      loadUserProfile();
    }, 1000);
  }, []);

  const loadUserProfile = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        navigation.navigate('Login');
        return;
      }

      // Verificar se o token existe e não está vazio
      const tokens = await getTokens();
      if (!tokens.accessToken || tokens.accessToken.trim() === '') {
        navigation.navigate('Login');
        return;
      }
      
      const profile = await profileService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      
      // Se for erro 401, limpar tokens e ir para login
      if (error instanceof Error && error.message.includes('401')) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        navigation.navigate('Login');
        return;
      }
      
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
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

  const handleViewProfile = () => {
    if (userProfile) {
      navigation.navigate('Profile', { userId: userProfile.id });
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      (navigation as any).navigate('EditProfile', { profile: userProfile });
    }
  };

  const handleEmergencyLogout = async () => {
    try {
      console.log('🚨 Logout de emergência - limpando todos os tokens...');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      console.log('✅ Tokens limpos com sucesso');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro no logout de emergência:', error);
      navigation.navigate('Login');
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
            Bem-vindo ao To Gift You! 🎁
          </Text>
          
          {userProfile && (
            <>
              <Text variant="bodyLarge" style={[styles.message, { color: colors.text.secondary }]}>
                Olá, {userProfile.nome}! 👋
              </Text>
              
              <Text variant="bodyMedium" style={[styles.info, { color: colors.text.secondary }]}>
                @{userProfile.username}
              </Text>
              
              {userProfile.bio && (
                <Text variant="bodyMedium" style={[styles.bio, { color: colors.text.secondary }]}>
                  "{userProfile.bio}"
                </Text>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleViewProfile}
          style={[styles.profileButton, { backgroundColor: colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
          icon="account"
        >
          Ver Meu Perfil
        </Button>
        
        <Button
          mode="contained"
          onPress={handleEditProfile}
          style={[styles.editButton, { backgroundColor: colors.secondary }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
          icon="pencil"
        >
          Editar Perfil
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.error }]}
          icon="logout"
        >
          Fazer Logout
        </Button>
        
        <Button
          mode="text"
          onPress={handleEmergencyLogout}
          style={styles.emergencyButton}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.emergencyLabel, { color: colors.error }]}
          icon="alert-circle"
        >
          🚨 Logout de Emergência
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
    marginBottom: 8,
    fontWeight: '600',
  },
  info: {
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  bio: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },
  profileButton: {
    borderRadius: 12,
    elevation: 2,
  },
  editButton: {
    borderRadius: 12,
    elevation: 2,
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
  emergencyButton: {
    marginTop: 8,
  },
  emergencyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
