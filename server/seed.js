/**
 * Seed script — populates MongoDB with authentic Gorakhpur & Uttar Pradesh data
 * Run: node server/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const Enquiry = require('./models/Enquiry');
const { upSampleListings } = require('./config/db');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/landestate';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Listing.deleteMany(), Enquiry.deleteMany()]);
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin Gorakhpur',
    email: 'admin@landestate.in',
    password: 'admin123456',
    phone: '9839012345',
    role: 'admin',
  });

  // Create seller
  const seller = await User.create({
    name: 'Manoj Tripathi',
    email: 'seller@landestate.in',
    password: 'seller123456',
    phone: '9450123456',
    role: 'user',
  });

  console.log('Created users:', admin.email, seller.email);

  // Create listings
  const listings = await Listing.insertMany(
    upSampleListings.map((l) => ({ ...l, seller: seller._id }))
  );
  console.log(`Created ${listings.length} Gorakhpur & UP listings`);

  // Create a sample enquiry
  await Enquiry.create({
    listing: listings[0]._id,
    name: 'Anand Shahi',
    email: 'anand.shahi@gmail.com',
    phone: '9838123456',
    message: 'Namaste, I am interested in this Taramandal plot. Please let me know if GDA map is sanctioned and when we can do a site inspection.',
    contactPreference: 'WhatsApp',
    status: 'New',
  });
  console.log('Created sample enquiry');

  console.log('\n✅ Gorakhpur & UP Seed completed successfully!');
  console.log('Admin login:  admin@landestate.in / admin123456');
  console.log('Seller login: seller@landestate.in / seller123456');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  mongoose.disconnect();
});
