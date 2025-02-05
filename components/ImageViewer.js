import React from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ImageZoom from 'react-native-image-zoom-viewer';

const ImageViewer = ({ image, onClose }) => {
  return (
    <Modal transparent={true} visible={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ImageZoom cropWidth={300} cropHeight={400} imageWidth={300} imageHeight={400}>
          <Image source={{ uri: image.uri }} style={styles.fullImage} />
        </ImageZoom>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  fullImage: { width: 300, height: 400 },
  closeButton: { position: 'absolute', top: 20, right: 20 },
  closeText: { color: 'white', fontSize: 18 },
});

export default ImageViewer;
