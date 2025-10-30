import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Animated,
} from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { UserProfile } from '../services/profileService';
import { colors } from '../theme/colors';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditPress?: () => void;
  onFollowPress?: () => void;
  onMessagePress?: () => void;
  isLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditPress,
  onFollowPress,
  onMessagePress,
  isLoading = false,
}) => {
  const [bioExpanded, setBioExpanded] = React.useState(false);
  const followScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(followScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(followScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
  }, [profile.isFollowing]);
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mês${months > 1 ? 'es' : ''} atrás`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ano${years > 1 ? 's' : ''} atrás`;
    }
  };

  const renderAvatar = () => {
    if (profile.fotoPerfil) {
      // Converter URL de localhost para o IP correto se necessário
      let imageUrl = profile.fotoPerfil;
      if (imageUrl.includes('localhost')) {
        const { getBaseURL } = require('../config/api');
        const baseURL = getBaseURL();
        imageUrl = imageUrl.replace(/https?:\/\/localhost:\d+/, baseURL);
      }
      
      console.log('🖼️ Renderizando avatar com URL:', imageUrl);
      
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.avatar}
          resizeMode="cover"
          onError={(error) => {
            console.error('❌ Erro ao carregar imagem:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('✅ Imagem carregada com sucesso');
          }}
        />
      );
    }
    
    const initials = profile.nome
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return (
      <View style={[styles.avatar, styles.defaultAvatar]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderActionButton = () => {
    // Verificar se é o próprio perfil
    if (profile.isMine) {
      return (
        <Button
          mode="contained"
          onPress={onEditPress}
          disabled={isLoading}
          style={[styles.actionButton, styles.fullWidthButton, { backgroundColor: colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
          icon="pencil"
        >
          Editar Perfil
        </Button>
      );
    }

    // Não é o próprio perfil - mostrar botões de seguir/mensagem
    return (
      <View style={styles.actionButtons}>
        <Animated.View style={{ transform: [{ scale: followScale }], flex: 1 }}>
          <Button
          mode={profile.isFollowing ? "outlined" : "contained"}
          onPress={onFollowPress}
          disabled={isLoading}
          style={[
            styles.actionButton,
            profile.isFollowing 
              ? { borderColor: colors.primary }
              : { backgroundColor: colors.primary }
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={[
            styles.buttonLabel,
            profile.isFollowing 
              ? { color: colors.primary }
              : { color: colors.onPrimary }
          ]}
          icon={profile.isFollowing ? "check" : "account-plus"}
        >
          {profile.isFollowing ? 'Seguindo' : 'Seguir'}
          </Button>
        </Animated.View>
        
        <Button
          mode="outlined"
          onPress={onMessagePress}
          disabled={isLoading}
          style={[styles.actionButton, { borderColor: colors.border }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: colors.text.primary }]}
          icon="message-text"
        >
          Mensagem
        </Button>
      </View>
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.background }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {renderAvatar()}
          
          <View style={styles.info}>
            <Text variant="headlineSmall" style={[styles.name, { color: colors.text.primary }]}>
              {profile.nome}
            </Text>
            <Text variant="bodyMedium" style={[styles.username, { color: colors.text.secondary }]}>
              @{profile.username}
            </Text>
            
            {profile.bio && (
              <>
                <Text
                  variant="bodyMedium"
                  style={[styles.bio, { color: colors.text.primary }]}
                  numberOfLines={bioExpanded ? undefined : 3}
                >
                  {profile.bio}
                </Text>
                {profile.bio.length > 120 && (
                  <TouchableOpacity onPress={() => setBioExpanded(prev => !prev)}>
                    <Text variant="bodySmall" style={[styles.seeMore, { color: colors.primary }]}>
                      {bioExpanded ? 'ver menos' : 'ver mais'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            <Text variant="bodySmall" style={[styles.joinedAt, { color: colors.text.secondary }]}>
              Membro desde {formatDate(profile.joinedAt)}
            </Text>
            
            {profile.topTags && profile.topTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {profile.topTags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.border + '40' }]}>
                    <Text variant="bodySmall" style={[styles.tagText, { color: colors.text.secondary }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          {renderActionButton()}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  defaultAvatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.onPrimary,
    fontSize: 40,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  seeMore: {
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 8,
    fontWeight: '600',
  },
  joinedAt: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontWeight: '500',
  },
  actions: {
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
