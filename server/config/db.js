const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error('❌ MongoDB Atlas connection error:', err.message);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Fallback to local MongoDB / in-memory for local development
  const localUri = 'mongodb://localhost:27017/landestate';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`⚠️ Local MongoDB connection failed (${err.message}).`);
    console.log('🔄 Attempting fallback to in-memory MongoDB for local development/demo...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at ${memUri}`);

      // Auto-seed in-memory database with authentic Gorakhpur & UP sample data
      await seedInMemory();
      return conn;
    } catch (memErr) {
      console.error('❌ Could not connect to MongoDB:', memErr.message);
      console.log('\n💡 Note: Please ensure MongoDB is running locally, or configure a MongoDB Atlas connection string in server/.env');
      throw memErr;
    }
  }
};

const upSampleListings = [
  {
    title: 'GDA Approved Residential Plot in Taramandal, Gorakhpur',
    description: 'Prime GDA approved residential plot in high-demand Taramandal area. Excellent road connectivity, 2 minutes from Ramgarh Tal lakefront promenade. High-speed development zone with water, electricity and street lights.',
    location: 'Taramandal, Near Ramgarh Tal',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 1800,
    areaUnit: 'sqft',
    price: 4500000,
    landType: 'Residential',
    roadFacing: true,
    roadWidth: 30,
    nearbyLandmarks: ['Ramgarh Tal Lake', 'Planetarium Gorakhpur', 'Deoria Bypass Road', 'GDA Buddha Park'],
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7381, lng: 83.3986 },
  },
  {
    title: 'Commercial Land Facing Main Deoria Highway Near AIIMS Gorakhpur',
    description: 'High-visibility front commercial land situated directly on Gorakhpur-Deoria 4-lane highway. Within 1 km of AIIMS Gorakhpur and MMMUT. Ideal for hospital, hotel, showroom, nursing home or coaching institute.',
    location: 'Kunaura, Near AIIMS, Deoria Road',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 3200,
    areaUnit: 'sqft',
    price: 9600000,
    landType: 'Commercial',
    roadFacing: true,
    roadWidth: 50,
    nearbyLandmarks: ['AIIMS Gorakhpur (1 km)', 'MMMUT Engineering College', 'Deoria Highway', 'Airforce Station'],
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7329, lng: 83.4285 },
  },
  {
    title: 'Prime Corner Residential Plot in Rapti Nagar Phase 4, Gorakhpur',
    description: 'Beautiful corner residential plot located in developed colony of Rapti Nagar Phase 4. Near BRD Medical College with peaceful surroundings, broad roads, and immediate registry & possession.',
    location: 'Rapti Nagar Phase 4, Medical College Road',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 2160,
    areaUnit: 'sqft',
    price: 5800000,
    landType: 'Residential',
    roadFacing: true,
    roadWidth: 25,
    nearbyLandmarks: ['BRD Medical College', 'Asuran Chowk', 'Mughalaha Chauraha', 'St. Joseph School'],
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7872, lng: 83.3912 },
  },
  {
    title: 'Industrial & Warehouse Land on Gorakhpur-Lucknow Highway (GIDA, Sahjanwa)',
    description: 'Large commercial/industrial land parcel inside GIDA Sector 15 corridor on Lucknow-Gorakhpur National Highway (NH-28). Perfect for warehouse, factory, transport hub, or cold storage.',
    location: 'GIDA Sector 15, Sahjanwa',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 2,
    areaUnit: 'bigha',
    price: 18000000,
    landType: 'Industrial',
    roadFacing: true,
    roadWidth: 60,
    nearbyLandmarks: ['GIDA Industrial Corridor', 'Gorakhpur-Lucknow Expressway', 'Sahjanwa Railway Station'],
    images: ['https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7561, lng: 83.1842 },
  },
  {
    title: 'Fertile Agricultural Land with Private Borewell in Pipraich, Gorakhpur',
    description: '3 Bigha highly fertile agricultural farm land with operational deep tube-well and canal water connectivity. Ideal for farming, polyhouse, nursery or long-term highway appreciation.',
    location: 'Pipraich Road',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 3,
    areaUnit: 'bigha',
    price: 3600000,
    landType: 'Agricultural',
    roadFacing: false,
    roadWidth: 16,
    nearbyLandmarks: ['Pipraich Sugar Mill', 'Kushinagar Highway', 'Gorakhpur Outer Ring Road'],
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'],
    status: 'Available',
    isFeatured: false,
    coordinates: { lat: 26.8315, lng: 83.5284 },
  },
  {
    title: 'High-Demand Commercial Plot in Mohaddipur Commercial Hub, Gorakhpur',
    description: 'Prime commercial plot in the central commercial center of Gorakhpur city near Mohaddipur junction. Close to railway station and main bus terminus. Ideal for retail complex, hotel or corporate branch office.',
    location: 'Mohaddipur Junction',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    area: 2400,
    areaUnit: 'sqft',
    price: 14400000,
    landType: 'Commercial',
    roadFacing: true,
    roadWidth: 40,
    nearbyLandmarks: ['Gorakhpur Railway Station (2 km)', 'City Mall Golghar', 'University Chauraha', 'Gorakhnath Mandir (5 km)'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7548, lng: 83.3882 },
  },
  {
    title: 'LDA Approved Commercial Plot on Amar Shaheed Path, Lucknow',
    description: 'Premium LDA approved commercial plot on Amar Shaheed Path near Gomti Nagar Extension. High footfall and ultra-fast appreciating location in Uttar Pradesh capital.',
    location: 'Amar Shaheed Path, Gomti Nagar Extension',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    area: 3000,
    areaUnit: 'sqft',
    price: 18000000,
    landType: 'Commercial',
    roadFacing: true,
    roadWidth: 45,
    nearbyLandmarks: ['Ekana International Stadium', 'Lulu Mall Lucknow', 'Medanta Hospital Lucknow'],
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7922, lng: 80.9995 },
  },
  {
    title: 'Strategic Highway Investment Plot on Gorakhpur-Ayodhya Corridor, Ayodhya',
    description: 'Prime investment plot on Gorakhpur-Ayodhya 4-lane highway corridor. Located within 5 km of Shri Ram Janmabhoomi Mandir and Maharishi Valmiki International Airport. Ideal for tourist hotel, guest house or resort.',
    location: 'Highway Bypass, Near Naya Ghat',
    district: 'Ayodhya',
    state: 'Uttar Pradesh',
    area: 2500,
    areaUnit: 'sqft',
    price: 7500000,
    landType: 'Commercial',
    roadFacing: true,
    roadWidth: 30,
    nearbyLandmarks: ['Shri Ram Janmabhoomi Mandir', 'Ayodhya International Airport', 'Saryu River Ghat'],
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    status: 'Available',
    isFeatured: true,
    coordinates: { lat: 26.7981, lng: 82.2045 },
  },
  {
    title: 'VDA Approved Residential Land on Varanasi Ring Road, Shivpur',
    description: 'VDA approved residential plot with clear title near Babatpur Airport Road and Ring Road Phase 1. Ready for immediate house construction with all civic amenities.',
    location: 'Shivpur, Ring Road Phase 1',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    area: 1800,
    areaUnit: 'sqft',
    price: 5400000,
    landType: 'Residential',
    roadFacing: true,
    roadWidth: 25,
    nearbyLandmarks: ['Varanasi Cantt Station (6 km)', 'Babatpur Airport Road', 'Ring Road Phase 1'],
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    status: 'Available',
    isFeatured: false,
    coordinates: { lat: 25.3621, lng: 82.9641 },
  },
];

const seedInMemory = async () => {
  const User = require('../models/User');
  const Listing = require('../models/Listing');
  const Enquiry = require('../models/Enquiry');

  await Promise.all([User.deleteMany(), Listing.deleteMany(), Enquiry.deleteMany()]);

  console.log('🌱 Populating Gorakhpur & Uttar Pradesh data in MongoDB...');

  const admin = await User.create({
    name: 'Admin Gorakhpur',
    email: 'admin@landestate.in',
    password: 'admin123456',
    phone: '9839012345',
    role: 'admin',
  });

  const seller = await User.create({
    name: 'Manoj Tripathi',
    email: 'seller@landestate.in',
    password: 'seller123456',
    phone: '9450123456',
    role: 'user',
  });

  const createdListings = await Listing.insertMany(
    upSampleListings.map((l) => ({ ...l, seller: seller._id }))
  );

  await Enquiry.create({
    listing: createdListings[0]._id,
    name: 'Anand Shahi',
    email: 'anand.shahi@gmail.com',
    phone: '9838123456',
    message: 'Namaste, I am interested in this Taramandal plot. Please let me know if GDA map is sanctioned and when we can do a site inspection.',
    contactPreference: 'WhatsApp',
    status: 'New',
  });

  console.log(`✅ Loaded ${createdListings.length} authentic Gorakhpur & UP listings!`);
  console.log('   Admin Login:  admin@landestate.in / admin123456');
  console.log('   Seller Login: seller@landestate.in / seller123456');
};

module.exports = { connectDB, upSampleListings };
