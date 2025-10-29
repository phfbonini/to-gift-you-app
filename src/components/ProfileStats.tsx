import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { UserStats } from '../services/profileService';
import { colors } from '../theme/colors';

interface ProfileStatsProps {
  stats: UserStats;
  onStatPress?: (statType: 'posts' | 'followers' | 'following' | 'likes') => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  stats, 
  onStatPress 
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const StatItem: React.FC<{
    value: number;
    label: string;
    statType: 'posts' | 'followers' | 'following' | 'likes';
  }> = ({ value, label, statType }) => (
    <TouchableOpacity
      style={styles.statItem}
      onPress={() => onStatPress?.(statType)}
      disabled={!onStatPress}
      activeOpacity={onStatPress ? 0.7 : 1}
    >
      <Text variant="headlineSmall" style={[styles.statValue, { color: colors.text.primary }]}>
        {formatNumber(value)}
      </Text>
      <Text variant="bodyMedium" style={[styles.statLabel, { color: colors.text.secondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Card style={[styles.card, { backgroundColor: colors.background }]}>
      <Card.Content style={styles.container}>
        <StatItem 
          value={stats.postsCount} 
          label="Posts" 
          statType="posts" 
        />
        <StatItem 
          value={stats.followersCount} 
          label="Seguidores" 
          statType="followers" 
        />
        <StatItem 
          value={stats.followingCount} 
          label="Seguindo" 
          statType="following" 
        />
        <StatItem 
          value={stats.likesReceived} 
          label="Curtidas" 
          statType="likes" 
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
});
