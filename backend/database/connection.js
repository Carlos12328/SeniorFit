'use strict';

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

const dbPath = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(__dirname, 'seniorfit.sqlite');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({ filename: dbPath, driver: sqlite3.Database });
    await dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

async function closeDb() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

module.exports = { getDb, closeDb, dbPath };
