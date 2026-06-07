import { View, ActivityIndicator, StyleSheet } from 'react-native';
import React from 'react';
import { FlashList } from '@shopify/flash-list';
import Colors from '@/constants/colors';

type HorizontalCardListProps<T> = {
  data: T[];
  itemWidth: number;
  itemHeight: number;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactElement;
  isLoadMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  skeletonCount?: number;
};

const SKELETON_CARD_STYLE = (width: number, height: number) => ({
  width,
  height,
  marginRight: 16,
  backgroundColor: Colors.cardBackground,
  borderRadius: 16,
  opacity: 0.5,
});

/**
 * Reusable horizontal FlashList for card rows.
 * Eliminates the duplicated inner components in HomeScreen.
 */
function HorizontalCardList<T>({
  data,
  itemWidth,
  itemHeight,
  keyExtractor,
  renderItem,
  isLoadMore,
  error,
  onLoadMore,
  skeletonCount = 3,
}: HorizontalCardListProps<T>) {
  return (
    <View style={{ height: itemHeight + 24 }}>
      <FlashList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        onEndReachedThreshold={0.5}
        onEndReached={onLoadMore}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth + 16, paddingRight: 16 }}>
            {renderItem(item, index)}
          </View>
        )}
        ListHeaderComponent={() => <View style={styles.headerSpacer} />}
        ListEmptyComponent={() =>
          !error ? (
            <View style={styles.skeletonRow}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <View
                  key={i}
                  style={SKELETON_CARD_STYLE(itemWidth, itemHeight)}
                />
              ))}
            </View>
          ) : null
        }
        ListFooterComponent={() =>
          isLoadMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator color={Colors.accentYellow} />
            </View>
          ) : (
            <View style={styles.endSpacer} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingLeft: 10,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 10,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  loadingFooter: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endSpacer: {
    width: 20,
  },
});

export default HorizontalCardList;
