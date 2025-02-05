import React, { useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { initializeDatabase, addImage } from './db';
import Gallery from './Gallery';
import Map from './Map';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS } from 'react-native-permissions';

const App = () => {
  useEffect(() => {
    initializeDatabase();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    await request(PERMISSIONS.ANDROID.CAMERA);
    await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  };

  const addNewImage = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const uri = 'https://example.com/image.jpg';
        const timestamp = new Date().toISOString();
        addImage(uri, timestamp, latitude, longitude);
      },
      (error) => console.log(error),
      { enableHighAccuracy: true }
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Add New Image" onPress={addNewImage} />
      <Gallery />
      <Map locations={[{ latitude: 37.78825, longitude: -122.4324 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
});

export default App;
