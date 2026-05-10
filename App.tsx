import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "./supabase";

export default function App() {
  /* ================= IGN ================= */
  const [ign, setIgn] = useState("");
  const [ready, setReady] = useState(false);

  /* ================= GAME ================= */
  const [started, setStarted] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const [message, setMessage] = useState("Press START");

  const [tries, setTries] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [bestTime, setBestTime] = useState<number | null>(null);

  const [done, setDone] = useState(false);
  const [jumpscare, setJumpscare] = useState(false);

  /* ================= LEADERBOARD ================= */
  const [board, setBoard] = useState<any[]>([]);

  /* ================= FETCH ================= */
  const fetchBoard = async () => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("best_time", { ascending: true });

    if (error) {
      console.log("FETCH ERROR:", error.message);
      return;
    }

    console.log("📊 LOADED DATA:", data);
    setBoard(data || []);
  };

  /* ================= INIT ================= */
  useEffect(() => {
    fetchBoard();

    const channel = supabase
      .channel("board-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => fetchBoard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= SAVE SCORE ================= */
  const saveScore = async (time: number) => {
    console.log("🚀 SAVING:", { ign, time });

    const { data, error } = await supabase
      .from("leaderboard")
      .insert([
        {
          ign: ign.trim(),
          best_time: time,
        },
      ])
      .select();

    if (error) {
      console.log("❌ SAVE ERROR:", error.message);
    } else {
      console.log("✅ SAVED:", data);
    }
  };

  /* ================= START GAME ================= */
  const startGame = () => {
    setStarted(true);
    setCanTap(false);
    setMessage("Wait...");

    const delay = Math.floor(Math.random() * 3000) + 2000;

    // 💀 jumpscare at 3rd attempt
    if (tries === 2) {
      const scareDelay = delay - 500;

      setTimeout(() => {
        setJumpscare(true);

        setTimeout(() => {
          setJumpscare(false);
          resetGame();
        }, 2500);
      }, scareDelay);

      return;
    }

    setTimeout(() => {
      setCanTap(true);
      setMessage("TAP!");
      setStartTime(Date.now());
    }, delay);
  };

  /* ================= TAP ================= */
  const handleTap = () => {
    if (!canTap || !startTime) return;

    const reaction = Date.now() - startTime;

    const newTry = tries + 1;
    setTries(newTry);

    // 🧠 compute best instantly (NO STATE BUG)
    const currentBest =
      bestTime === null ? reaction : Math.min(bestTime, reaction);

    setBestTime(currentBest);

    setMessage(`${reaction}ms`);

    setStarted(false);
    setCanTap(false);
    setStartTime(null);

    if (newTry === 3) {
      setDone(true);

      console.log("🏁 FINAL BEST:", currentBest);

      saveScore(currentBest);
    }
  };

  /* ================= RESET ================= */
  const resetGame = () => {
    setStarted(false);
    setCanTap(false);
    setMessage("Press START");
    setTries(0);
    setStartTime(null);
    setBestTime(null);
    setDone(false);
  };

  /* ================= IGN SCREEN ================= */
  if (!ready) {
    return (
      <LinearGradient colors={["#000", "#111"]} style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.title}>REFLEX IQ</Text>

          <TextInput
            placeholder="Enter IGN"
            placeholderTextColor="#888"
            style={styles.input}
            value={ign}
            onChangeText={setIgn}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (ign.trim().length < 3) {
                alert("IGN too short");
                return;
              }
              setReady(true);
            }}
          >
            <Text style={styles.btnText}>START</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  /* ================= MAIN ================= */
  return (
    <>
      <StatusBar hidden />

      {/* JUMPSCARE */}
      <Modal visible={jumpscare} animationType="none">
        <View style={styles.jumpscare}>
          <Image
            source={{
              uri: "https://us-tuna-sounds-images.voicemod.net/b3d28416-2174-4bb9-9dbd-9f8f57e00e93-1680877216674.png",
            }}
            style={styles.jumpscareImg}
          />
          <Text style={styles.jumpscareText}>BOO!</Text>
        </View>
      </Modal>

      <LinearGradient colors={["#000", "#111", "#222"]} style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.ignText}>Player: {ign}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {done ? "RESULT" : "REACTION TEST"}
            </Text>

            <Text style={styles.message}>{message}</Text>

            <Text style={styles.try}>Try: {tries}/3</Text>

            {!started && !done && (
              <TouchableOpacity style={styles.button} onPress={startGame}>
                <Text style={styles.btnText}>START TEST</Text>
              </TouchableOpacity>
            )}

            {canTap && (
              <TouchableOpacity style={styles.tap} onPress={handleTap}>
                <Text style={styles.tapText}>TAP</Text>
              </TouchableOpacity>
            )}

            {done && (
              <TouchableOpacity style={styles.button} onPress={resetGame}>
                <Text style={styles.btnText}>TRY AGAIN</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* LEADERBOARD */}
          <ScrollView>
            <Text style={styles.boardTitle}>🏆 Leaderboard</Text>

            {board.length === 0 ? (
              <Text style={{ color: "#aaa", textAlign: "center" }}>
                No scores yet
              </Text>
            ) : (
              board.map((item, i) => (
                <Text key={item.id} style={styles.item}>
                  #{i + 1} {item.ign} — {item.best_time}ms
                </Text>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, padding: 20, justifyContent: "center" },

  title: { color: "#fff", fontSize: 30, textAlign: "center" },

  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  button: {
    backgroundColor: "#ff2d2d",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  ignText: { color: "#0f0", textAlign: "center", marginBottom: 10 },

  card: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  cardTitle: { color: "#fff", fontSize: 22, textAlign: "center" },

  message: { color: "#aaa", textAlign: "center", marginVertical: 10 },

  try: { color: "#888", textAlign: "center" },

  tap: {
    backgroundColor: "#00c853",
    padding: 30,
    borderRadius: 10,
  },

  tapText: { color: "#fff", textAlign: "center", fontSize: 20 },

  boardTitle: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    marginTop: 20,
  },

  item: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
  },

  jumpscare: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },

  jumpscareImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  jumpscareText: {
    color: "red",
    fontSize: 40,
    fontWeight: "900",
  },
});