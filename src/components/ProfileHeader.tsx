import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert 
} from 'react-native';
import { UserProfile } from '../services/profileService';

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
      return (
        <Image
          source={{ uri: profile.fotoPerfil }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }
    
    // Avatar padrão com iniciais
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
    if (profile.isMine) {
      return (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          disabled={isLoading}
        >
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.followButton,
            profile.isFollowing && styles.followingButton
          ]}
          onPress={onFollowPress}
          disabled={isLoading}
        >
          <Text style={[
            styles.followButtonText,
            profile.isFollowing && styles.followingButtonText
          ]}>
            {profile.isFollowing ? 'Seguindo' : 'Seguir'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={onMessagePress}
          disabled={isLoading}
        >
          <Text style={styles.messageButtonText}>Mensagem</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {renderAvatar()}
        
        <View style={styles.info}>
          <Text style={styles.name}>{profile.nome}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          
          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
          
          <Text style={styles.joinedAt}>
            Membro desde {formatDate(profile.joinedAt)}
          </Text>
          
          {profile.topTags && profile.topTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {profile.topTags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        {renderActionButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  defaultAvatar: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  joinedAt: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#e5e7eb',
  },
  followButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#374151',
  },
  messageButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
