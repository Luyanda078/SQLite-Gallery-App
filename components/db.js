import SQLite from 'react-native-sqlite-storage';

// Open SQLite database
const db = SQLite.openDatabase(
  { name: 'imageGallery.db', location: 'default' },
  () => console.log('Database opened'),
  (error) => console.log('Error opening database', error)
);

// Initialize the database with necessary tables
export const initializeDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, timestamp TEXT, latitude REAL, longitude REAL)',
      [],
      () => console.log('Table created successfully'),
      (tx, error) => console.log('Error creating table', error)
    );
  });
};

// CRUD operations
export const addImage = (uri, timestamp, latitude, longitude) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO images (uri, timestamp, latitude, longitude) VALUES (?, ?, ?, ?)',
      [uri, timestamp, latitude, longitude],
      (tx, results) => {
        console.log('Image added to DB');
      }
    );
  });
};

export const getImages = (callback) => {
  db.transaction((tx) => {
    tx.executeSql('SELECT * FROM images', [], (tx, results) => {
      const rows = results.rows.raw(); // Get rows as array
      callback(rows);
    });
  });
};

export const updateImage = (id, newUri) => {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE images SET uri = ? WHERE id = ?',
      [newUri, id],
      () => console.log('Image updated'),
      (tx, error) => console.log('Error updating image', error)
    );
  });
};

export const deleteImage = (id) => {
  db.transaction((tx) => {
    tx.executeSql(
      'DELETE FROM images WHERE id = ?',
      [id],
      () => console.log('Image deleted'),
      (tx, error) => console.log('Error deleting image', error)
    );
  });
};
