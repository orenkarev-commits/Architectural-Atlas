import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { MotionGradient } from '../components/MotionGradient';
import { askAtlas, assistantEnabled, type ChatMsg, type Citation } from '../lib/assistant';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

type Turn = ChatMsg & { citations?: Citation[] };

function openCitation(c: Citation) {
  if (c.type === 'building' && c.id != null) {
    router.push({ pathname: '/locating', params: { buildingId: String(c.id) } });
  } else if (c.type === 'architect') {
    router.push({ pathname: '/architects/[name]', params: { name: c.name } });
  }
}

export default function Ask() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const insets = useSafeAreaInsets();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const started = useRef(false);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput('');
    setError(null);
    const history: ChatMsg[] = [...turns.map((t) => ({ role: t.role, content: t.content })), { role: 'user', content: question }];
    setTurns((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await askAtlas(history);
      setTurns((prev) => [...prev, { role: 'assistant', content: res.answer, citations: res.citations }]);
    } catch {
      setError('The assistant is unavailable right now. Try the search, or ask again later.');
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  useEffect(() => {
    if (!started.current && q && assistantEnabled) {
      started.current = true;
      void send(String(q));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <MotionGradient variant="warm" opacity={0.4}>
      <BackButton />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <Text style={styles.kicker}>Ask the Atlas</Text>
          <Text style={styles.lede}>
            Questions answered only from the Atlas — who built it, why it matters, how it was made. Every claim is
            tied to a record.
          </Text>

          {!assistantEnabled ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                The research assistant isn’t switched on yet. Once its endpoint is deployed it answers here.
              </Text>
            </View>
          ) : null}

          {turns.map((t, i) =>
            t.role === 'user' ? (
              <View key={i} style={[styles.bubble, styles.user]}>
                <Text style={styles.userText}>{t.content}</Text>
              </View>
            ) : (
              <View key={i} style={[styles.bubble, styles.assistant]}>
                <Text style={styles.assistantText}>{t.content}</Text>
                {t.citations && t.citations.length > 0 ? (
                  <View style={styles.cites}>
                    {t.citations.map((c, j) => (
                      <Pressable key={j} onPress={() => openCitation(c)} style={({ pressed }) => [styles.cite, pressed && styles.citePressed]}>
                        <Text style={styles.citeKind}>{c.type === 'architect' ? 'Architect' : 'Building'}</Text>
                        <Text style={styles.citeName} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.citeChevron}>›</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            )
          )}

          {loading ? (
            <View style={[styles.bubble, styles.assistant, styles.loadingRow]}>
              <ActivityIndicator color={colors.terracotta} />
              <Text style={styles.loadingText}>Reading the Atlas…</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={assistantEnabled ? 'Ask about any building…' : 'Assistant not configured'}
            placeholderTextColor={colors.muted}
            editable={assistantEnabled && !loading}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            multiline
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!assistantEnabled || loading || !input.trim()}
            style={({ pressed }) => [styles.sendBtn, (!input.trim() || loading) && styles.sendDisabled, pressed && styles.citePressed]}
          >
            <Text style={styles.sendArrow}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </MotionGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  kicker: { ...ui.label, color: colors.terracotta },
  lede: { ...ui.bodySmall, color: colors.body, marginBottom: spacing.sm, maxWidth: 340 },
  noticeCard: {
    backgroundColor: colors.glassFillStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
  },
  noticeText: { ...ui.body, color: colors.muted },
  bubble: { borderRadius: radii.lg, padding: spacing.lg, maxWidth: '92%' },
  user: { alignSelf: 'flex-end', backgroundColor: colors.terracotta },
  userText: { ...ui.body, color: colors.white },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    gap: spacing.md,
  },
  assistantText: { ...ui.body, color: colors.ink, lineHeight: 23 },
  cites: { gap: spacing.sm },
  cite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  citePressed: { opacity: 0.6 },
  citeKind: { ...ui.metadataSmall, color: colors.terracotta, textTransform: 'uppercase', letterSpacing: 0.6 },
  citeName: { ...editorial.cardTitle, fontSize: 14, color: colors.ink, flex: 1 },
  citeChevron: { ...ui.body, fontSize: 18, color: colors.muted },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loadingText: { ...ui.bodySmall, color: colors.muted },
  errorText: { ...ui.bodySmall, color: colors.terracottaDark, textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  input: {
    ...ui.body,
    flex: 1,
    maxHeight: 120,
    color: colors.ink,
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  sendArrow: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
