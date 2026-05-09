import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function GifScreen() {
  return (
    <View style={styles.container}>
      <Image
        source="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
        style={styles.gif}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 200,
    height: 200,
  },
});