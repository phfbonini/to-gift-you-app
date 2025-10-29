import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { ProfileHeaderSkeleton, ProfileStatsSkeleton } from '../components/ProfileSkeleton';
import { profileService, UserProfile } from '../services/profileService';

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

      const profileData = await profileService.getUserProfile(userId);
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

  const handleRefresh = () => {
    loadProfile(true);
  };

  const handleFollowPress = async () => {
    if (!profile) return;

    setActionLoading(true);
    try {
      const response = profile.isFollowing
        ? await profileService.unfollowUser(userId)
        : await profileService.followUser(userId);

      // Atualizar estado otimisticamente
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: response.isFollowing,
        stats: {
          ...prev.stats,
          followersCount: response.followersCount,
          followingCount: response.followingCount,
        }
      } : null);

      // Mostrar feedback
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
    // TODO: Implementar navegação para tela de edição
    Alert.alert(
      'Em breve',
      'A funcionalidade de edição de perfil será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleMessagePress = () => {
    // TODO: Implementar navegação para mensagens
    Alert.alert(
      'Em breve',
      'A funcionalidade de mensagens será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleStatPress = (statType: 'posts' | 'followers' | 'following' | 'likes') => {
    // TODO: Implementar navegação para listas específicas
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadProfile()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>👤</Text>
          <Text style={styles.errorTitle}>Usuário não encontrado</Text>
          <Text style={styles.errorMessage}>
            O perfil que você está procurando não existe ou foi removido.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
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
        
        {/* Seção de posts - placeholder */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsIcon}>📝</Text>
            <Text style={styles.emptyPostsText}>
              {profile.isMine 
                ? 'Você ainda não fez nenhum post'
                : `${profile.nome} ainda não fez nenhum post`
              }
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  skeletonContainer: {
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  postsSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyPostsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
