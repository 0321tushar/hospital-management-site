import { seedHospitalData } from '../seeder.js';

// In-Memory dataset fallback store if local MongoDB is offline
export const memoryStore = JSON.parse(JSON.stringify(seedHospitalData));

let mongoLive = false;

export const setMongoLive = (status) => {
  mongoLive = status;
};

export const getIsMongoLive = () => mongoLive;
