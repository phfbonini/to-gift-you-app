import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserStats } from '../services/profileService';

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
    >
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
