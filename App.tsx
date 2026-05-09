import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [started, setStarted] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const [message, setMessage] = useState("Press START TEST to begin");

  const [tries, setTries] = useState(0);
  const [showJumpscare, setShowJumpscare] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const [sessionBest, setSessionBest] = useState<number | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  const [globalBest, setGlobalBest] = useState<number | null>(null);

  // 🧠 Rank system (FIXED)
  const getRank = (time: number) => {
    if (time <= 150) return "🔥 GOD MODE";
    if (time <= 180) return "💎 DIAMOND";
    if (time <= 220) return "🔷 PLATINUM";
    if (time <= 260) return "🟡 GOLD";
    if (time <= 300) return "⚪ SILVER";
    return "🟤 BRONZE";
  };

  const currentRank =
    sessionBest !== null ? getRank(sessionBest) : "";

  const startFakeTest = () => {
    setStarted(true);
    setCanTap(false);
    setMessage("Wait for GREEN...");

    const delay = Math.floor(Math.random() * 3000) + 2000;

    // JUMPSCARE ON 3RD ATTEMPT
    if (tries === 2) {
      const scareDelay = delay - 500;

      setTimeout(() => {
        setShowJumpscare(true);

        setTimeout(() => {
          setShowJumpscare(false);
          resetGame();
        }, 2500);
      }, scareDelay);

      return;
    }

    setTimeout(() => {
      setCanTap(true);
      setMessage("TAP NOW!");
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (!canTap || !startTime) return;

    const reactionTime = Date.now() - startTime;

    const updated = [...reactionTimes, reactionTime];
    setReactionTimes(updated);

    const newTry = tries + 1;
    setTries(newTry);

    setMessage(`Reaction Time: ${reactionTime}ms`);

    setStarted(false);
    setCanTap(false);
    setStartTime(null);

    // AFTER 3 ATTEMPTS
    if (newTry === 3) {
      const best = Math.min(...updated);
      setSessionBest(best);
      setSessionDone(true);

      if (globalBest === null || best < globalBest) {
        setGlobalBest(best);
      }
    }
  };

  const resetGame = () => {
    setStarted(false);
    setCanTap(false);
    setMessage("Press START TEST to begin");
    setTries(0);
    setStartTime(null);

    setReactionTimes([]);
    setSessionBest(null);
    setSessionDone(false);
  };

  return (
    <>
      <StatusBar hidden />

      {/* JUMPSCARE */}
      <Modal visible={showJumpscare} animationType="none">
        <View style={styles.jumpscareContainer}>
          <Image
            source={{
              uri: "https://i.pinimg.com/474x/d9/c8/a1/d9c8a174c2ee169ecc24cf652b04190b.jpg",
            }}
            style={styles.jumpscareImage}
          />
          <Text style={styles.jumpscareText}>BADING!!!</Text>
        </View>
      </Modal>

      {/* MAIN APP */}
      <LinearGradient
        colors={["#000000", "#0d0d0d", "#161616"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          
          {/* TOP */}
          <View style={styles.topSection}>
            <Text style={styles.icon}>⚡</Text>

            <Text style={styles.title}>REFLEX IQ</Text>

            <Text style={styles.subtitle}>
              Test your speed and reaction time
            </Text>

            {/* 🥇 GLOBAL BEST */}
            <Text style={styles.rankText}>
              🥇 Fastest: {globalBest ?? "--"}ms
            </Text>

            {/* 🏆 FINAL RANK (FIXED - ALWAYS SHOWS AFTER 3 TRIES) */}
            {sessionDone && sessionBest !== null && (
              <Text style={styles.finalRank}>
                🏆 Rank: {currentRank}
              </Text>
            )}
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {sessionDone ? "RESULTS" : canTap ? "TAP!" : "READY?"}
            </Text>

            <Text style={styles.cardDescription}>{message}</Text>

            <Text style={styles.tryText}>Attempt: {tries}/3</Text>

            {/* SESSION RESULT */}
            {sessionDone && (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: "#00e676", fontSize: 22, fontWeight: "bold" }}>
                  SESSION COMPLETE 🏁
                </Text>

                <Text style={{ color: "#fff", marginTop: 10 }}>
                  Best Score: {sessionBest}ms
                </Text>

                <Text style={{ color: "#aaa", marginTop: 10 }}>
                  Average:{" "}
                  {Math.floor(
                    reactionTimes.reduce((a, b) => a + b, 0) /
                      reactionTimes.length
                  )}
                  ms
                </Text>
              </View>
            )}

            {/* HISTORY */}
            {reactionTimes.length > 0 && (
              <View style={{ marginTop: 15 }}>
                <Text style={{ color: "#aaa", textAlign: "center" }}>
                  Recent Scores
                </Text>

                {reactionTimes
                  .slice(-5)
                  .reverse()
                  .map((time, index) => (
                    <Text
                      key={index}
                      style={{ color: "#fff", textAlign: "center" }}
                    >
                      #{index + 1}: {time}ms ({getRank(time)})
                    </Text>
                  ))}
              </View>
            )}

            {/* BUTTONS */}
            {!started && !sessionDone && (
              <TouchableOpacity style={styles.button} onPress={startFakeTest}>
                <Text style={styles.buttonText}>START TEST</Text>
              </TouchableOpacity>
            )}

            {canTap && (
              <TouchableOpacity
                style={[styles.tapArea, { backgroundColor: "#00c853" }]}
                onPress={handleTap}
              >
                <Text style={styles.tapText}>TAP!</Text>
              </TouchableOpacity>
            )}

            {sessionDone && (
              <TouchableOpacity style={styles.button} onPress={resetGame}>
                <Text style={styles.buttonText}>TRY AGAIN</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.footerText}>Challenge your friends</Text>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1 },

  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 40,
  },

  topSection: {
    alignItems: "center",
    marginTop: 20,
  },

  icon: { fontSize: 45, marginBottom: 15 },

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
  },

  subtitle: {
    color: "#8a8a8a",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },

  rankText: {
    color: "#ffd700",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },

  finalRank: {
    color: "#ffcc00",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#222",
    minHeight: 380,
    justifyContent: "center",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
  },

  cardDescription: {
    color: "#b0b0b0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  tryText: {
    color: "#666",
    textAlign: "center",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#ff2d2d",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  tapArea: {
    marginTop: 20,
    paddingVertical: 35,
    borderRadius: 20,
    alignItems: "center",
  },

  tapText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },

  footerText: {
    color: "#555",
    textAlign: "center",
    fontSize: 15,
  },

  jumpscareContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },

  jumpscareImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "cover",
  },

  jumpscareText: {
    color: "red",
    fontSize: 40,
    fontWeight: "900",
  },
});