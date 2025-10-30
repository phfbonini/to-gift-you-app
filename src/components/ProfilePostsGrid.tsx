import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, RefreshControl } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { colors } from '../theme/colors';
import { profileService, PostThumbnail } from '../services/profileService';

interface ProfilePostsGridProps {
  userId: number;
  limit?: number;
  onPressPost?: (postId: number) => void;
  onPressSeeAll?: () => void;
}

const numColumns = 3;
const spacing = 2;
const size = Math.floor((Dimensions.get('window').width - (spacing * (numColumns + 1))) / numColumns);

export const ProfilePostsGrid: React.FC<ProfilePostsGridProps> = ({
  userId,
  limit = 9,
  onPressPost,
  onPressSeeAll,
}) => {
  const [posts, setPosts] = useState<PostThumbnail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(async (showRefresh = false) => {
    try {
      setError(null);
      showRefresh ? setRefreshing(true) : setLoading(true);
      const data = await profileService.getUserPostThumbnails(userId, limit);
      setPosts(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: PostThumbnail }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => onPressPost?.(item.id)}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={() => { /* silenciar erro visual */ }}
      />
    </TouchableOpacity>
  );

  const keyExtractor = (item: PostThumbnail) => String(item.id);

  if (loading) {
    return (
      <View style={styles.container}>        
        <View style={styles.gridSkeleton}>
          {Array.from({ length: limit }).map((_, idx) => (
            <View key={idx} style={styles.skeleton} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: 12 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => load()} style={{ borderRadius: 12, backgroundColor: colors.primary }}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={{ color: colors.text.secondary, textAlign: 'center' }}>
          Você ainda não publicou nada
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        columnWrapperStyle={{ gap: spacing }}
        contentContainerStyle={{ paddingHorizontal: spacing, gap: spacing }}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          onPressSeeAll ? (
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={onPressSeeAll}
                style={{ borderRadius: 12, borderColor: colors.border }}
              >
                Ver todos os posts
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing,
  },
  skeleton: {
    width: size,
    height: size,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  item: {
    width: size,
    height: size,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    marginTop: 12,
    marginBottom: 4,
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});

export default ProfilePostsGrid;

