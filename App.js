import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DICE = [
  { label: 'D4',  sides: 4,  color: '#FF6B6B' },
  { label: 'D6',  sides: 6,  color: '#FFD93D' },
  { label: 'D8',  sides: 8,  color: '#6BCB77' },
  { label: 'D10', sides: 10, color: '#4D96FF' },
  { label: 'D12', sides: 12, color: '#C77DFF' },
  { label: 'D20', sides: 20, color: '#FF9F43' },
];

const SHAPE_CONFIG = {
  D4:  { w: 72,  h: 72,  borderRadius: 4,  rotate: '45deg' },
  D6:  { w: 88,  h: 88,  borderRadius: 10, rotate: null },
  D8:  { w: 78,  h: 78,  borderRadius: 16, rotate: '45deg' },
  D10: { w: 66,  h: 84,  borderRadius: 8,  rotate: '45deg' },
  D12: { w: 88,  h: 88,  borderRadius: 44, rotate: null },
  D20: { w: 88,  h: 88,  borderRadius: 20, rotate: '22deg' },
};

const MAX_DICE = 5;

function DieFace({ die, value, anim }) {
  const scale = anim.interpolate({
    inputRange:  [0, 0.15, 0.85, 1],
    outputRange: [1,  1.3,  1.3, 1],
  });
  const rollRotate = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const cfg = SHAPE_CONFIG[die.label];
  const counterRotate = cfg.rotate
    ? [{ rotate: `-${cfg.rotate}` }]
    : [];

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: rollRotate }] }}>
      <View style={[
        styles.dieShape,
        {
          width: cfg.w,
          height: cfg.h,
          borderRadius: cfg.borderRadius,
          borderColor: die.color,
          transform: cfg.rotate ? [{ rotate: cfg.rotate }] : [],
        },
      ]}>
        <View style={[styles.dieInner, { transform: counterRotate }]}>
          <Text style={[styles.diceVal, { color: die.color }]}>{value}</Text>
          <Text style={[styles.diceLabel, { color: die.color + '99' }]}>
            {die.label}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function App() {
  const [selectedDie, setSelectedDie] = useState(DICE[1]);
  const [quantity, setQuantity]       = useState(1);
  const [results, setResults]         = useState([]);
  const [history, setHistory]         = useState([]);
  const [isRolling, setIsRolling]     = useState(false);

  const anims = useRef(
    Array.from({ length: MAX_DICE }, () => new Animated.Value(0))
  ).current;
  const intervalRef = useRef(null);

  function roll() {
    if (isRolling) return;
    setIsRolling(true);

    const finalRolls = Array.from({ length: quantity }, () =>
      Math.floor(Math.random() * selectedDie.sides) + 1
    );

    anims.slice(0, quantity).forEach(a => a.setValue(0));

    // Affiche immédiatement les dés avec des valeurs aléatoires
    setResults(Array.from({ length: quantity }, () =>
      Math.floor(Math.random() * selectedDie.sides) + 1
    ));

    // Effet "slot machine" : change les chiffres rapidement pendant le lancer
    intervalRef.current = setInterval(() => {
      setResults(Array.from({ length: quantity }, () =>
        Math.floor(Math.random() * selectedDie.sides) + 1
      ));
    }, 80);

    const animations = anims.slice(0, quantity).map(a =>
      Animated.timing(a, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start(() => {
      clearInterval(intervalRef.current);
      setResults(finalRolls);
      setHistory(prev => [{
        id: Date.now(),
        die:   selectedDie.label,
        color: selectedDie.color,
        qty:   quantity,
        rolls: finalRolls,
        total: finalRolls.reduce((s, v) => s + v, 0),
        time:  new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }),
      }, ...prev].slice(0, 30));
      setIsRolling(false);
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>Lanceur de Dés</Text>

      {/* Sélecteur de type */}
      <View style={styles.typeRow}>
        {DICE.map(die => {
          const active = selectedDie.label === die.label;
          return (
            <TouchableOpacity
              key={die.label}
              style={[styles.typeBtn, { borderColor: die.color }, active && { backgroundColor: die.color }]}
              onPress={() => { setSelectedDie(die); setResults([]); }}
            >
              <Text style={[styles.typeTxt, active && styles.typeTxtActive]}>
                {die.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quantité */}
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => { setQuantity(q => Math.max(1, q - 1)); setResults([]); }}
        >
          <Text style={styles.qtyBtnTxt}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyTxt}>{quantity} dé{quantity > 1 ? 's' : ''}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => { setQuantity(q => Math.min(MAX_DICE, q + 1)); setResults([]); }}
        >
          <Text style={styles.qtyBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Zone de résultats */}
      <View style={styles.resultsArea}>
        {results.length === 0 ? (
          <View style={styles.emptyArea}>
            <Text style={styles.emptyEmoji}>🎲</Text>
            <Text style={styles.emptyTxt}>Appuie pour lancer !</Text>
          </View>
        ) : (
          <>
            <View style={styles.diceRow}>
              {results.map((val, i) => (
                <DieFace
                  key={i}
                  die={selectedDie}
                  value={val}
                  anim={anims[i]}
                />
              ))}
            </View>
            {quantity > 1 && (
              <Text style={styles.totalTxt}>
                Total :{' '}
                <Text style={{ color: selectedDie.color, fontWeight: 'bold' }}>
                  {results.reduce((a, b) => a + b, 0)}
                </Text>
              </Text>
            )}
          </>
        )}
      </View>

      {/* Bouton lancer */}
      <TouchableOpacity
        style={[
          styles.rollBtn,
          { backgroundColor: selectedDie.color },
          isRolling && styles.rollBtnDisabled,
        ]}
        onPress={roll}
        disabled={isRolling}
      >
        <Text style={styles.rollBtnTxt}>{isRolling ? '…' : 'Lancer !'}</Text>
      </TouchableOpacity>

      {/* Historique */}
      {history.length > 0 && (
        <View style={styles.historyWrap}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Historique</Text>
            <TouchableOpacity onPress={() => setHistory([])}>
              <Text style={styles.clearTxt}>Effacer</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
            {history.map(entry => (
              <View key={entry.id} style={styles.historyEntry}>
                <View style={[styles.historyDot, { backgroundColor: entry.color }]} />
                <Text style={styles.historyTxt}>
                  {entry.qty > 1 ? `${entry.qty}× ` : ''}{entry.die} → {entry.rolls.join(' + ')}
                  {entry.qty > 1 ? ` = ${entry.total}` : ''}
                </Text>
                <Text style={styles.historyTime}>{entry.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },

  /* Type selector */
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeBtn: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 46,
    alignItems: 'center',
  },
  typeTxt:       { color: '#aaa', fontWeight: '700', fontSize: 13 },
  typeTxtActive: { color: '#1a1a2e' },

  /* Quantity */
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#16213e',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnTxt: { color: '#e0e0e0', fontSize: 24, fontWeight: '300' },
  qtyTxt: {
    color: '#e0e0e0', fontSize: 18, fontWeight: '600',
    minWidth: 80, textAlign: 'center',
  },

  /* Results */
  resultsArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  emptyArea:  { alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTxt:   { color: '#555', fontSize: 16 },
  diceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  dieShape: {
    borderWidth: 3,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  dieInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceVal:   { fontSize: 34, fontWeight: 'bold' },
  diceLabel: { fontSize: 11, marginTop: 2 },
  totalTxt:  { color: '#aaa', fontSize: 18, marginTop: 16 },

  /* Roll button */
  rollBtn: {
    marginVertical: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
  },
  rollBtnDisabled: { opacity: 0.6 },
  rollBtnTxt: {
    color: '#1a1a2e', fontSize: 20,
    fontWeight: 'bold', letterSpacing: 1,
  },

  /* History */
  historyWrap:   { maxHeight: 200, marginBottom: 20 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    color: '#aaa', fontSize: 13, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  clearTxt:    { color: '#555', fontSize: 13 },
  historyScroll: { flex: 1 },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
    gap: 10,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyTxt:  { flex: 1, color: '#ccc', fontSize: 14 },
  historyTime: { color: '#555', fontSize: 12 },
});
