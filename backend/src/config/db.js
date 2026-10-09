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
          url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
          category: 'Fleet',
          order: 1,
          isCover: true
        },
        {
          title: 'Spacious Captain Seats Interior',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
          category: 'Interior',
          order: 2,
          isCover: false
        },
        {
          title: 'Scenic Hill Station Outstation Tour',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
          category: 'Tours',
          order: 3,
          isCover: false
        },
        {
          title: 'Premium Wedding Convoy Experience',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
          category: 'Events',
          order: 4,
          isCover: false
        },
        {
          title: 'Airport Transfer On-Time Service',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
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
