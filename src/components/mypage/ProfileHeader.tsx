import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Check, Pencil, X } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import { NICKNAME_MAX_LENGTH, useSettingsStore } from '@/stores/settingsStore';

const SUBTITLE = '디바이스 ID 기반 자동 연동';
const AVATAR_SIZE_CLASS = 'h-14 w-14';
const EDIT_BTN_SIZE_CLASS = 'h-6 w-6';
const ACTION_BTN_SIZE_CLASS = 'h-7 w-7';

export default function ProfileHeader() {
  const { isDark } = useTheme();
  const nickname = useSettingsStore((s) => s.nickname);
  const setNickname = useSettingsStore((s) => s.setNickname);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);

  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const avatarBg = isDark ? 'bg-blue-900/60' : 'bg-blue-100';
  const avatarText = isDark ? 'text-blue-400' : 'text-blue-600';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const editBtnBg = isDark ? 'bg-zinc-700' : 'bg-zinc-100';
  const editIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc400;
  const inputUnderline = isDark ? 'border-blue-400' : 'border-blue-500';
  const cancelBtnBg = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  const cancelIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;

  const beginEdit = () => {
    setDraft(nickname);
    setIsEditing(true);
  };
  const commitEdit = () => {
    setNickname(draft);
    setIsEditing(false);
  };
  const cancelEdit = () => {
    setDraft(nickname);
    setIsEditing(false);
  };

  return (
    <View className={`border-b px-5 py-6 ${cardBg}`}>
      <View className="flex-row items-center gap-4">
        <View
          className={`${AVATAR_SIZE_CLASS} items-center justify-center rounded-full ${avatarBg}`}
        >
          <Text className={`text-xl font-black ${avatarText}`}>{nickname.charAt(0)}</Text>
        </View>

        <View className="flex-1">
          {isEditing ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={commitEdit}
                autoFocus
                maxLength={NICKNAME_MAX_LENGTH}
                placeholder="닉네임 입력"
                placeholderTextColor={isDark ? PALETTE.zinc500 : PALETTE.zinc400}
                className={`flex-1 border-b-2 py-0.5 text-xl font-bold ${inputUnderline} ${headingText}`}
              />
              <Pressable
                onPress={commitEdit}
                accessibilityRole="button"
                accessibilityLabel="닉네임 저장"
                className={`${ACTION_BTN_SIZE_CLASS} items-center justify-center rounded-full bg-blue-500 active:opacity-70`}
              >
                <Check size={ICON_SIZE.card} color={PALETTE.white} />
              </Pressable>
              <Pressable
                onPress={cancelEdit}
                accessibilityRole="button"
                accessibilityLabel="닉네임 편집 취소"
                className={`${ACTION_BTN_SIZE_CLASS} items-center justify-center rounded-full active:opacity-70 ${cancelBtnBg}`}
              >
                <X size={ICON_SIZE.card} color={cancelIconColor} />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className={`text-xl font-bold ${headingText}`} numberOfLines={1}>
                {nickname}님
              </Text>
              <Pressable
                onPress={beginEdit}
                accessibilityRole="button"
                accessibilityLabel="닉네임 편집"
                className={`${EDIT_BTN_SIZE_CLASS} items-center justify-center rounded-full active:opacity-70 ${editBtnBg}`}
              >
                <Pencil size={ICON_SIZE.caption} color={editIconColor} />
              </Pressable>
            </View>
          )}
          <Text className={`mt-0.5 text-sm ${subText}`}>{SUBTITLE}</Text>
        </View>
      </View>
    </View>
  );
}
