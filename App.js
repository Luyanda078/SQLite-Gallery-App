import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as SQLite from 'expo-sqlite';
import MapView, { Marker } from 'react-native-maps';
import ImageView from 'react-native-image-viewing';

// ✅ Corrected: Use only expo-sqlite
const db = SQLite.openDatabase('imageGallery.db');

const Stack = createStackNavigator();

export default function App() {
  // ✅ Ensure table is created on app start
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, latitude REAL, longitude REAL, timestamp TEXT)',
        [],
        () => console.log('Table created successfully'),
        (_, error) => console.error('Error creating table:', error)
      );
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus === 'granted');

      if (locationStatus === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && location) {
      const photo = await cameraRef.current.takePictureAsync();
      const { latitude, longitude } = location.coords;

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO images (uri, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)',
          [photo.uri, latitude, longitude, new Date().toISOString()],
          () => console.log('Image saved to database'),
          (_, error) => console.error('Error saving image:', error)
        );
      });
    }
  };

  if (!hasCameraPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Button title="Take Picture" onPress={takePicture} />
          <Button title="View Gallery" onPress={() => navigation.navigate('Gallery')} />
        </View>
      </Camera>
    </View>
  );
}

function GalleryScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM images',
        [],
        (_, { rows: { _array } }) => setImages(_array),
        (_, error) => console.error('Error fetching images:', error)
      );
    });
  };

  useEffect(() => {
    const filtered = images.filter(image =>
      image.timestamp.includes(searchQuery) ||
      image.latitude.toString().includes(searchQuery) ||
      image.longitude.toString().includes(searchQuery)
    );
    setFilteredImages(filtered);
  }, [searchQuery, images]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by date or location"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredImages}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => { setSelectedImageIndex(index); setVisible(true); }}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TouchableOpacity>
        )}
      />
      <Button title="View Map" onPress={() => navigation.navigate('Map')} />
      <ImageView
        images={filteredImages.map(image => ({ uri: image.uri }))}
        imageIndex={selectedImageIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  );
}

function MapScreen() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM images',
        [],
        (_, { rows: { _array } }) => setImages(_array),
        (_, error) => console.error('Error fetching images:', error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{
        latitude: images.length ? images[0].latitude : 37.78825,
        longitude: images.length ? images[0].longitude : -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
        {images.map((image, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: image.latitude, longitude: image.longitude }}
            title={`Image ${index + 1}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  buttonContainer: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', margin: 20 },
  image: { width: 100, height: 100, margin: 5 },
  searchBar: { height: 40, borderColor: 'gray', borderWidth: 1, margin: 10, padding: 10 },
  map: { flex: 1 },
});
