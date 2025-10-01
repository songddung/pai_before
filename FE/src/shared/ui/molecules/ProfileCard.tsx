import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ProfileResponse } from 'shared-types';
import { Text } from '../atoms/Text';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';
import { Card } from './Card';

export interface ProfileCardProps {
  profile: ProfileResponse;
  onPress?: () => void;
  onEditPress?: () => void;
  isSelected?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onPress,
  onEditPress,
  isSelected = false,
  isLoading = false,
  disabled = false,
}) => {
  const isParent = profile.profile_type === 'PARENT';
  const age = profile.birth_date ?
    new Date().getFullYear() - new Date(profile.birth_date).getFullYear() :
    null;

  return (
    <Card
      variant={isSelected ? 'outlined' : 'elevated'}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Avatar
            size={56}
            source={profile.avatar_media_id ?
              { uri: `https://your-media-service.com/media/${profile.avatar_media_id}` } :
              undefined
            }
            name={profile.name}
            backgroundColor={isParent ? "#EDE9FE" : "#DCFCE7"}
            textColor={isParent ? "#8B5CF6" : "#10B981"}
          />
          <Badge
            variant={isParent ? "secondary" : "success"}
            size="sm"
            shape="pill"
            style={styles.typeBadge}
          >
            {isParent ? '부모' : '아이'}
          </Badge>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text variant="h6" color="text">{profile.name}</Text>
          {age && (
            <Text variant="body2" color="textSecondary">
              {age}세
            </Text>
          )}
        </View>

        {/* Loading Indicator */}
        {isSelected && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#3B82F6" size="small" />
          </View>
        )}

        {/* Edit Button */}
        {onEditPress && (
          <Icon
            name="settings-outline"
            size={20}
            color="#6B7280"
            onPress={onEditPress}
            disabled={disabled}
            containerStyle={styles.editButton}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  loadingContainer: {
    marginRight: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});