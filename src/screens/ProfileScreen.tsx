import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { ProfileHeaderSkeleton, ProfileStatsSkeleton } from '../components/ProfileSkeleton';
import { profileService, UserProfile } from '../services/profileService';
import { colors } from '../theme/colors';

interface ProfileScreenProps {
  navigation: any;
  route: {
    params: {
      userId: number;
    };
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const theme = useTheme();
  const { userId } = route.params;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Obter o perfil atual para comparar IDs e determinar se é o próprio perfil
      let currentUserProfile: UserProfile | null = null;
      try {
        currentUserProfile = await profileService.getCurrentUserProfile();
      } catch (e) {
        // Se não conseguir obter o perfil atual, continuar normalmente
        console.warn('Não foi possível obter perfil atual:', e);
      }

      const profileData = await profileService.getUserProfile(userId);
      
      // Garantir que isMine está correto
      if (currentUserProfile && currentUserProfile.id === userId) {
        profileData.isMine = true;
      } else if (currentUserProfile && currentUserProfile.id !== userId) {
        profileData.isMine = false;
      }
      // Se não conseguiu obter currentUserProfile, confiar no backend
      
      // Converter URL de localhost para o IP correto se necessário
      if (profileData.fotoPerfil && profileData.fotoPerfil.includes('localhost')) {
        const { getBaseURL } = require('../config/api');
        const baseURL = getBaseURL();
        profileData.fotoPerfil = profileData.fotoPerfil.replace(/https?:\/\/localhost:\d+/, baseURL);
        console.log('🔄 URL convertida:', profileData.fotoPerfil);
      }
      
      console.log('📋 Perfil carregado:', { 
        id: profileData.id, 
        fotoPerfil: profileData.fotoPerfil,
        isMine: profileData.isMine 
      });
      
      setProfile(profileData);
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err);
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    loadProfile(true);
  };

  const handleFollowPress = async () => {
    if (!profile || profile.isMine) return; // Não permitir seguir o próprio perfil

    setActionLoading(true);
    try {
      const response = profile.isFollowing
        ? await profileService.unfollowUser(userId)
        : await profileService.followUser(userId);

      setProfile(prev => prev ? {
        ...prev,
        isFollowing: response.isFollowing,
        stats: {
          ...prev.stats,
          followersCount: response.followersCount,
          followingCount: response.followingCount,
        }
      } : null);

      Alert.alert(
        'Sucesso',
        response.message,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Erro na ação de seguir:', err);
      Alert.alert(
        'Erro',
        err.message || 'Erro ao executar ação',
        [{ text: 'OK' }]
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPress = () => {
    if (profile) {
      navigation.navigate('EditProfile', { profile });
    }
  };

  const handleMessagePress = () => {
    Alert.alert(
      'Em breve',
      'A funcionalidade de mensagens será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleStatPress = (statType: 'posts' | 'followers' | 'following' | 'likes') => {
    Alert.alert(
      'Em breve',
      `A funcionalidade de visualizar ${statType} será implementada em breve.`,
      [{ text: 'OK' }]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.skeletonContainer}>
          <ProfileHeaderSkeleton />
          <ProfileStatsSkeleton />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text variant="displaySmall" style={styles.errorIcon}>😔</Text>
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: colors.text.primary }]}>
            Ops! Algo deu errado
          </Text>
          <Text variant="bodyMedium" style={[styles.errorMessage, { color: colors.text.secondary }]}>
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={() => loadProfile()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            Tentar novamente
          </Button>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text variant="displaySmall" style={styles.errorIcon}>👤</Text>
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: colors.text.primary }]}>
            Usuário não encontrado
          </Text>
          <Text variant="bodyMedium" style={[styles.errorMessage, { color: colors.text.secondary }]}>
            O perfil que você está procurando não existe ou foi removido.
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Voltar
          </Button>
        </View>
      );
    }

    return (
      <>
        <ProfileHeader
          profile={profile}
          onEditPress={handleEditPress}
          onFollowPress={handleFollowPress}
          onMessagePress={handleMessagePress}
          isLoading={actionLoading}
        />
        <ProfileStats
          stats={profile.stats}
          onStatPress={handleStatPress}
        />
        
        <Card style={[styles.postsSection, { backgroundColor: colors.background, marginHorizontal: 16, marginTop: 8 }]}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Posts
            </Text>
            <View style={styles.emptyPosts}>
              <Text variant="displaySmall" style={styles.emptyPostsIcon}>📝</Text>
              <Text variant="bodyLarge" style={[styles.emptyPostsText, { color: colors.text.secondary }]}>
                {profile.isMine 
                  ? 'Você ainda não fez nenhum post'
                  : `${profile.nome} ainda não fez nenhum post`
                }
              </Text>
            </View>
          </Card.Content>
        </Card>
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  skeletonContainer: {
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  backButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  postsSection: {
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostsIcon: {
    marginBottom: 16,
  },
  emptyPostsText: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
