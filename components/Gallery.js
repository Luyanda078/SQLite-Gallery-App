import React, { useState, useEffect } from 'react';
import { FlatList, Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getImages } from './db';
import ImageViewer from './ImageViewer';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getImages((data) => setImages(data));
  }, []);

  const openImageViewer = (image) => {
    setSelectedImage(image);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openImageViewer(item)}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TouchableOpacity>
        )}
      />
      {selectedImage && (
        <ImageViewer image={selectedImage} onClose={closeImageViewer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  image: { width: 100, height: 100, margin: 5, borderRadius: 10 },
});

export default Gallery;
