const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Settings = require('../models/Settings');
const { defaultServices } = require('../controllers/serviceController');
const { defaultSettings } = require('../controllers/settingsController');

const seedDatabaseIfEmpty = async () => {
  try {
    // Seed Admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log(' Seeding initial Default Admin user...');
      await Admin.create({
        username: 'admin',
        email: 'admin@jaisaitravels.com',
        password: 'Admin@12345',
        role: 'admin'
      });
      console.log('✅ Default Admin seeded (username: admin, password: Admin@12345)');
    }

    // Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('🌱 Seeding default services...');
      const cleanServices = defaultServices.map(({ _id, ...rest }) => rest);
      await Service.insertMany(cleanServices);
      console.log('✅ Default Services seeded');
    }

    // Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('🌱 Seeding default settings...');
      await Settings.create(defaultSettings);
      console.log('✅ Default Settings seeded');
    }

    // Seed Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      console.log('🌱 Seeding default gallery...');
      await Gallery.insertMany([
        {
          title: 'Toyota Innova Crysta Luxury Fleet',
          type: 'image',
          url: '/uploads/photo-1791458143672-606816611.jpeg',
          thumbnail: '/uploads/photo-1791458143672-606816611.jpeg',
          category: 'Fleet',
          order: 1,
          isCover: true
        },
        {
          title: 'Spacious Captain Seats Interior',
          type: 'image',
          url: '/uploads/mediaFile-1791533753450-102575456.jpeg',
          thumbnail: '/uploads/mediaFile-1791533753450-102575456.jpeg',
          category: 'Interior',
          order: 2,
          isCover: false
        },
        {
          title: 'Scenic Hill Station Outstation Tour',
          type: 'image',
          url: '/uploads/mediaFile-1791533848304-759768466.jpeg',
          thumbnail: '/uploads/mediaFile-1791533848304-759768466.jpeg',
          category: 'Tours',
          order: 3,
          isCover: false
        },
        {
          title: 'Premium Wedding Convoy Experience',
          type: 'image',
          url: '/uploads/mediaFile-1791533808495-47979531.jpeg',
          thumbnail: '/uploads/mediaFile-1791533808495-47979531.jpeg',
          category: 'Events',
          order: 4,
          isCover: false
        },
        {
          title: 'Airport Transfer On-Time Service',
          type: 'image',
          url: '/uploads/mediaFile-1791533000897-234390317.jpeg',
          thumbnail: '/uploads/mediaFile-1791533000897-234390317.jpeg',
          category: 'Airport',
          order: 5,
          isCover: false
        },
        {
          title: 'Jai Sai Travels Luxury Journey Experience',
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
          category: 'Videos',
          order: 6,
          isCover: false
        }
      ]);
      console.log('✅ Default Gallery items seeded');
    }
  } catch (seedErr) {
    console.error('⚠️ Database seed notice:', seedErr.message);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables.');
    return;
  }

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
      await seedDatabaseIfEmpty();
    } catch (error) {
      console.warn(`⚠️ MongoDB connection note (${error.message}). Retrying in 5s...`);
      setTimeout(tryConnect, 5000);
    }
  };

  await tryConnect();
};

module.exports = connectDB;
