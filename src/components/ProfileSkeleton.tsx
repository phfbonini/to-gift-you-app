import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProfileSkeletonProps {
  width?: number;
  height?: number;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ 
  width = 200, 
  height = 20 
}) => {
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
      ]}
    />
  );
};

export const ProfileAvatarSkeleton: React.FC = () => {
  return (
    <View style={styles.avatarContainer}>
      <ProfileSkeleton width={100} height={100} />
    </View>
  );
};

export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <View style={styles.headerSkeleton}>
      <ProfileAvatarSkeleton />
      <View style={styles.infoSkeleton}>
        <ProfileSkeleton width={150} height={24} />
        <View style={styles.spacing} />
        <ProfileSkeleton width={100} height={16} />
        <View style={styles.spacing} />
        <ProfileSkeleton width={200} height={16} />
        <View style={styles.spacing} />
        <ProfileSkeleton width={180} height={16} />
      </View>
    </View>
  );
};

export const ProfileStatsSkeleton: React.FC = () => {
  return (
    <View style={styles.statsSkeleton}>
      <View style={styles.statItem}>
        <ProfileSkeleton width={40} height={20} />
        <ProfileSkeleton width={60} height={14} />
      </View>
      <View style={styles.statItem}>
        <ProfileSkeleton width={40} height={20} />
        <ProfileSkeleton width={60} height={14} />
      </View>
      <View style={styles.statItem}>
        <ProfileSkeleton width={40} height={20} />
        <ProfileSkeleton width={60} height={14} />
      </View>
      <View style={styles.statItem}>
        <ProfileSkeleton width={40} height={20} />
        <ProfileSkeleton width={60} height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSkeleton: {
    alignItems: 'center',
    padding: 20,
  },
  infoSkeleton: {
    alignItems: 'center',
    width: '100%',
  },
  spacing: {
    height: 8,
  },
  statsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
});
