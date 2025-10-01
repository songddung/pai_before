import { View, StyleSheet } from "react-native";

export function Progress({ value }: { value: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.bar, { width: `${value}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
});
