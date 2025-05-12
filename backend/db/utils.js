const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Ensure write operation completes successfully
const ensureWrite = (operation) => {
  try {
    const result = operation();
    db.writeSync(); // Force synchronous write to ensure data is saved
    return result;
  } catch (err) {
    console.error('Database operation error:', err);
    // Try to create a backup of the current state in case of failure
    try {
      const backupPath = path.join(__dirname, `db_backup_${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(db.getState(), null, 2));
      console.log(`Database backup created at: ${backupPath}`);
    } catch (backupErr) {
      console.error('Failed to create database backup:', backupErr);
    }
    throw err;
  }
};

// Helper to create a new item with a unique ID
const createItem = (collection, data) => {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const newItem = { 
    _id: id, 
    ...data, 
    createdAt: timestamp 
  };
  
  return ensureWrite(() => {
    db.get(collection)
      .push(newItem)
      .write();
    
    console.log(`Created new ${collection} item with ID: ${id}`);
    return newItem;
  });
};

// Helper to get all items in a collection
const getAllItems = (collection) => {
  return db.get(collection).value();
};

// Helper to get a single item by ID
const getItemById = (collection, id) => {
  return db.get(collection)
    .find({ _id: id })
    .value();
};

// Helper to get items filtered by criteria
const getItemsByFilter = (collection, filterObj) => {
  return db.get(collection)
    .filter(filterObj)
    .value();
};

// Helper to update an item
const updateItem = (collection, id, updates) => {
  const item = getItemById(collection, id);
  
  if (!item) return null;
  
  const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
  
  return ensureWrite(() => {
    db.get(collection)
      .find({ _id: id })
      .assign(updatedItem)
      .write();
    
    console.log(`Updated ${collection} item with ID: ${id}`);
    return updatedItem;
  });
};

// Helper to delete an item
const deleteItem = (collection, id) => {
  const item = getItemById(collection, id);
  
  if (!item) return false;
  
  return ensureWrite(() => {
    db.get(collection)
      .remove({ _id: id })
      .write();
    
    console.log(`Deleted ${collection} item with ID: ${id}`);
    return true;
  });
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getItemsByFilter,
  updateItem,
  deleteItem
};
