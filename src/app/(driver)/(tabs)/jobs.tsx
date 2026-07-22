import { View, Text, StyleSheet } from "react-native";

export default function DriverJobs() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jobs</Text>
      <Text style={styles.body}>Available jobs will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  body: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
