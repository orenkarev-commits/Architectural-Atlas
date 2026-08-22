import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/tokens';
import { ui } from '../theme/typography';

const MIN = 1;
const MAX = 6;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Full-screen, zoomable viewer for an archival drawing — so plans and elevations
 * can actually be studied. Works with a mouse (drag to pan, wheel or +/− to zoom,
 * double-click to toggle) and with touch (drag to pan, pinch to zoom).
 */
export function PlanViewer({
  visible,
  source,
  caption,
  onClose,
}: {
  visible: boolean;
  source: ImageSourcePropType | null;
  caption?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // Committed transform + gesture bookkeeping (refs so PanResponder sees latest).
  const sRef = useRef(1);
  const baseTx = useRef(0);
  const baseTy = useRef(0);
  const pinch = useRef({ startDist: 0, startScale: 1 });
  const lastTap = useRef(0);
  const stageRef = useRef<View>(null);

  const reset = () => {
    sRef.current = 1;
    baseTx.current = 0;
    baseTy.current = 0;
    setScale(1);
    setTx(0);
    setTy(0);
  };

  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  const zoomBy = (factor: number) => {
    const next = clamp(sRef.current * factor, MIN, MAX);
    sRef.current = next;
    if (next === 1) {
      baseTx.current = 0;
      baseTy.current = 0;
      setTx(0);
      setTy(0);
    }
    setScale(next);
  };

  // Desktop: wheel to zoom. Attach to the DOM node on web.
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const node = stageRef.current as unknown as HTMLElement | null;
    if (!node || !node.addEventListener) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [visible]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          zoomBy(sRef.current > 1.5 ? 1 / sRef.current : 2.5); // double-tap toggle
        }
        lastTap.current = now;
        pinch.current.startDist = 0;
      },
      onPanResponderMove: (e, g) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          const d = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          if (!pinch.current.startDist) {
            pinch.current = { startDist: d, startScale: sRef.current };
          } else {
            const next = clamp((pinch.current.startScale * d) / pinch.current.startDist, MIN, MAX);
            sRef.current = next;
            setScale(next);
          }
        } else if (sRef.current > 1) {
          setTx(baseTx.current + g.dx);
          setTy(baseTy.current + g.dy);
        }
      },
      onPanResponderRelease: (_e, g) => {
        if (sRef.current > 1) {
          baseTx.current += g.dx;
          baseTy.current += g.dy;
        }
        pinch.current.startDist = 0;
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View ref={stageRef} style={styles.stage} {...responder.panHandlers}>
          {source ? (
            <Image
              source={source}
              resizeMode="contain"
              style={[
                styles.image,
                { transform: [{ translateX: tx }, { translateY: ty }, { scale }] },
              ]}
            />
          ) : null}
        </View>

        {caption ? (
          <View style={styles.captionBar} pointerEvents="none">
            <Text style={styles.caption}>{caption}</Text>
          </View>
        ) : null}

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={() => zoomBy(1 / 1.4)}>
            <Text style={styles.btnText}>−</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={reset}>
            <Text style={styles.btnTextSmall}>Reset</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => zoomBy(1.4)}>
            <Text style={styles.btnText}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,17,15,0.94)' },
  stage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : null),
  },
  image: { width: '100%', height: '100%' },
  captionBar: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  caption: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    minWidth: 46,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.white, fontSize: 22, fontWeight: '300' },
  btnTextSmall: { color: colors.white, fontSize: 13, letterSpacing: 0.5 },
  close: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.white, fontSize: 16 },
});
