import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { workoutService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Workout {
  id: number;
  name: string;
  body_part: string;
  target_area: string;
  equipment: string | null;
  level: string;
  description: string | null;
  gif_link: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const WorkoutsScreen = () => {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  useEffect(() => {
    loadWorkouts();
  }, [pagination.page]);

  const loadWorkouts = async () => {
    try {
      if (!token) return;
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: 5,
      };

      const result = await workoutService.getWorkouts(token, params);

      if (result.success) {
        setWorkouts(result.data);
        setPagination(result.pagination);
      }
    } catch (error: any) {
      console.error('Failed to load workouts:', error);
      Alert.alert('Error', error.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.page) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const goToNextPage = () => goToPage(pagination.page + 1);
  const goToPreviousPage = () => goToPage(pagination.page - 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);

  const renderPageNumbers = () => {
    if (!pagination || pagination.totalPages === 0) return null;
    
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    // Show first page
    if (currentPage > 2) {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
    }

    // Show pages around current page
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(i);
    }

    // Show last page
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <Text key={`dots-${index}`} style={styles.pageNumberDots}>
            ...
          </Text>
        );
      }

      return (
        <TouchableOpacity
          key={page}
          style={[
            styles.pageNumber,
            page === currentPage && styles.pageNumberActive,
          ]}
          onPress={() => goToPage(page as number)}
        >
          <Text
            style={[
              styles.pageNumberText,
              page === currentPage && styles.pageNumberTextActive,
            ]}
          >
            {page}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    return (
      <View style={styles.workoutCard}>
        {item.gif_link && (
          <Image source={{ uri: item.gif_link }} style={styles.workoutGif} />
        )}
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutDetail}>
            <Ionicons name="body" size={14} color="#666" /> {item.body_part} - {item.target_area}
          </Text>
          {item.equipment && (
            <Text style={styles.workoutDetail}>
              <Ionicons name="barbell" size={14} color="#666" /> {item.equipment}
            </Text>
          )}
          <Text style={styles.workoutDetail}>
            <Ionicons name="trophy" size={14} color="#666" /> {item.level}
          </Text>
          {item.description && (
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No workouts found</Text>
          </View>
        }
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <>
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.navButton, pagination.page === 1 && styles.navButtonDisabled]}
              onPress={goToFirstPage}
              disabled={pagination.page === 1}
            >
              <Ionicons name="play-back" size={20} color={pagination.page === 1 ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, pagination.page === 1 && styles.navButtonDisabled]}
              onPress={goToPreviousPage}
              disabled={pagination.page === 1}
            >
              <Ionicons name="chevron-back" size={20} color={pagination.page === 1 ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>

            <View style={styles.pageNumbersContainer}>{renderPageNumbers()}</View>

            <TouchableOpacity
              style={[
                styles.navButton,
                pagination.page === pagination.totalPages && styles.navButtonDisabled,
              ]}
              onPress={goToNextPage}
              disabled={pagination.page === pagination.totalPages}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={pagination.page === pagination.totalPages ? '#ccc' : '#007AFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                pagination.page === pagination.totalPages && styles.navButtonDisabled,
              ]}
              onPress={goToLastPage}
              disabled={pagination.page === pagination.totalPages}
            >
              <Ionicons
                name="play-forward"
                size={20}
                color={pagination.page === pagination.totalPages ? '#ccc' : '#007AFF'}
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} workouts)
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutGif: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  workoutInfo: {
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  workoutDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  navButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  pageNumberActive: {
    backgroundColor: '#007AFF',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  pageNumberDots: {
    paddingHorizontal: 8,
    color: '#999',
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
});

export default WorkoutsScreen;
