import { View, Text, StyleSheet } from "react-native";

export default function OwnerListingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listings</Text>
      <Text style={styles.subtitle}>Manage your vehicle listings here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
});
