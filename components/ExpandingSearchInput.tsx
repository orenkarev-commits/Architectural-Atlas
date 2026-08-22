import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, spacing } from '../theme/tokens';
import { ui } from '../theme/typography';

const COLLAPSED_HEIGHT = 52;
const EXPANDED_MIN_HEIGHT = 68;
const GROW_EASING = Easing.bezier(0.175, 0.885, 0.32, 1.1);

// One line of ui.bodyLarge (15px × 1.6). The input is given an explicit height
// in multiples of this rather than being left to size itself — a multiline
// TextInput renders as a <textarea> on web, which reserves more height than one
// line needs and pins its text to the top of that box.
const LINE = 24;
const MAX_INPUT_HEIGHT = LINE * 4;

/**
 * A chat-style search field: a quiet pill at rest, that grows into a taller
 * multiline box with a send button once the user starts typing.
 */
export function ExpandingSearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Building, architect, style',
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(LINE);
  const inputRef = useRef<TextInput>(null);

  const expanded = focused || value.trim().length > 0;

  const height = useSharedValue(COLLAPSED_HEIGHT);
  const sendOpacity = useSharedValue(0);

  React.useEffect(() => {
    // 14px padding top and bottom, so a single line gives exactly 52.
    const target = expanded
      ? Math.max(EXPANDED_MIN_HEIGHT, inputHeight + 28)
      : COLLAPSED_HEIGHT;
    height.value = withTiming(target, { duration: 260, easing: GROW_EASING });
  }, [expanded, inputHeight, height]);

  React.useEffect(() => {
    sendOpacity.value = withTiming(value.trim().length > 0 ? 1 : 0, { duration: 180 });
  }, [value, sendOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const sendStyle = useAnimatedStyle(() => ({
    opacity: sendOpacity.value,
    transform: [{ scale: 0.7 + sendOpacity.value * 0.3 }],
  }));

  const submit = () => {
    if (value.trim().length === 0) return;
    onSubmit();
    inputRef.current?.blur();
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.pressable}>
      <Animated.View style={[styles.container, containerStyle, focused && styles.containerFocused]}>
        {!expanded ? <View style={styles.dot} /> : null}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={submit}
          onContentSizeChange={(e) =>
            setInputHeight(
              Math.min(MAX_INPUT_HEIGHT, Math.max(LINE, e.nativeEvent.contentSize.height))
            )
          }
          multiline={expanded}
          returnKeyType="search"
          blurOnSubmit
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          style={[styles.input, { height: inputHeight }]}
        />

        <Animated.View style={[styles.sendButton, sendStyle]} pointerEvents={value.trim() ? 'auto' : 'none'}>
          <Pressable onPress={submit} hitSlop={8} style={styles.sendPressable}>
            <Text style={styles.sendArrow}>↑</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    // Children align to the first line, not the middle of the box, so the dot
    // stays put on line one as the field grows downward.
    alignItems: 'flex-start',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: spacing.base,
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: colors.terracotta,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radii.circle,
    backgroundColor: colors.terracotta,
    // Optically centres the dot on the first line of text.
    marginTop: (LINE - 7) / 2,
  },
  input: {
    flex: 1,
    ...ui.bodyLarge,
    lineHeight: LINE,
    color: colors.ink,
    padding: 0,
    textAlign: 'center',
    // Height is set explicitly from content; never let the textarea size itself.
    textAlignVertical: 'top',
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
  sendPressable: {
    width: 30,
    height: 30,
    borderRadius: radii.circle,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrow: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
