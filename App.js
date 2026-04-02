import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated,
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

const MAX_DICE = 5;

export default function App() {
  const [selectedDie, setSelectedDie] = useState(DICE[1]);
  const [quantity, setQuantity]       = useState(1);
  const [results, setResults]         = useState([]);
  const [history, setHistory]         = useState([]);
  const [isRolling, setIsRolling]     = useState(false);

  const anims = useRef(
    Array.from({ length: MAX_DICE }, () => new Animated.Value(0))
  ).current;

  function roll() {
    if (isRolling) return;
    setIsRolling(true);

    const rolls = Array.from({ length: quantity }, () =>
      Math.floor(Math.random() * selectedDie.sides) + 1
    );

    anims.slice(0, quantity).forEach(a => a.setValue(0));

    const animations = anims.slice(0, quantity).map(a =>
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true }),
      ])
    );

    Animated.parallel(animations).start(() => setIsRolling(false));

    setResults(rolls);
    setHistory(prev => [{
      id: Date.now(),
      die:   selectedDie.label,
      color: selectedDie.color,
      qty:   quantity,
      rolls,
      total: rolls.reduce((s, v) => s + v, 0),
      time:  new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
    }, ...prev].slice(0, 30));
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
              {results.map((val, i) => {
                const scale = anims[i].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.4, 1],
                });
                const rotate = anims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                });
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.diceBox,
                      { borderColor: selectedDie.color },
                      { transform: [{ scale }, { rotate }] },
                    ]}
                  >
                    <Text style={[styles.diceVal, { color: selectedDie.color }]}>{val}</Text>
                    <Text style={[styles.diceLabel, { color: selectedDie.color + '99' }]}>
                      {selectedDie.label}
                    </Text>
                  </Animated.View>
                );
              })}
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
    gap: 12,
  },
  diceBox: {
    width: 90, height: 90,
    borderRadius: 18, borderWidth: 3,
    backgroundColor: '#16213e',
    alignItems: 'center', justifyContent: 'center',
  },
  diceVal:   { fontSize: 34, fontWeight: 'bold' },
  diceLabel: { fontSize: 12, marginTop: 2 },
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
