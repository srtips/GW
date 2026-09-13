require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const City = require('../models/City');
const Manufacturer = require('../models/Manufacturer');
const Product = require('../models/Product');
const AdminUser = require('../models/AdminUser');
const SiteSetting = require('../models/SiteSetting');

const categories = [
  { name: 'Engineering & Machinery', slug: 'engineering-machinery', icon: '⚙️', displayOrder: 1, description: 'CNC parts, pumps, auto components, castings, and precision machinery from Gujarat.' },
  { name: 'Kitchenware', slug: 'kitchenware', icon: '🍳', displayOrder: 2, description: 'Steel utensils, cookware, and kitchen equipment.' },
  { name: 'Garden & Outdoor', slug: 'garden-outdoor', icon: '🌿', displayOrder: 3, description: 'Garden tools, equipment, and outdoor products.' },
  { name: 'Textiles & Yarn', slug: 'textiles-yarn', icon: '🧵', displayOrder: 4, description: 'Raw yarn, fabrics, and textile materials.' },
  { name: 'Imitation Jewelry', slug: 'imitation-jewelry', icon: '💍', displayOrder: 5, description: 'Fashion jewelry, bangles, and accessories.' }
];

const cities = [
  { name: 'Rajkot', slug: 'rajkot', famousFor: 'Auto parts, CNC machining, castings, kitchenware, engineering goods' },
  { name: 'Ahmedabad', slug: 'ahmedabad', famousFor: 'Textiles, chemicals, pharmaceuticals, machinery' },
  { name: 'Surat', slug: 'surat', famousFor: 'Diamonds, textiles, synthetic fabrics' },
  { name: 'Jamnagar', slug: 'jamnagar', famousFor: 'Brass parts, oil refining, engineering components' },
  { name: 'Vadodara', slug: 'vadodara', famousFor: 'Industrial equipment, chemicals, heavy machinery' },
  { name: 'Morbi', slug: 'morbi', famousFor: 'Ceramics, tiles, wall clocks' },
  { name: 'Bhavnagar', slug: 'bhavnagar', famousFor: 'Diamond polishing, plastics, ship breaking' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (safe for first-time seed only — comment out after go-live)
    await Promise.all([
      Category.deleteMany({}), City.deleteMany({}), Manufacturer.deleteMany({}),
      Product.deleteMany({}), SiteSetting.deleteMany({})
    ]);

    // Insert categories and cities
    const createdCategories = await Category.insertMany(categories);
    const createdCities = await City.insertMany(cities);
    console.log(`Seeded ${createdCategories.length} categories, ${createdCities.length} cities`);

    const rajkot = createdCities.find(c => c.slug === 'rajkot')._id;
    const jamnagar = createdCities.find(c => c.slug === 'jamnagar')._id;
    const engineeringCat = createdCategories.find(c => c.slug === 'engineering-machinery')._id;
    const kitchenwareCat = createdCategories.find(c => c.slug === 'kitchenware')._id;

    // Sample manufacturer
    const manufacturer = await Manufacturer.create({
      companyName: 'Shree Engineering Works',
      slug: 'shree-engineering-works',
      city: rajkot,
      contactPerson: 'Ramesh Patel',
      phone: '+919999999999',
      whatsapp: '+919999999999',
      email: 'contact@shreeengineering.example',
      description: 'Established manufacturer of CNC parts, pumps, and precision engineering components in Rajkot.',
      establishedYear: 2008,
      employeeCount: '50-200',
      productionCapacity: '5,000 units/month',
      certifications: ['ISO 9001'],
      isVerified: true,
      verificationDate: new Date(),
      verifiedBy: 'Gujarat Wholesale Team',
      isFeatured: true
    });

    // Sample products
    await Product.insertMany([
      {
        manufacturer: manufacturer._id,
        category: engineeringCat,
        name: 'Mini Chakki Ata Machine',
        slug: 'mini-chakki-ata-machine',
        shortDescription: 'Domestic and commercial flour milling machine',
        priceMin: 2800, priceMax: 4500,
        moq: 50,
        isFeatured: true
      },
      {
        manufacturer: manufacturer._id,
        category: engineeringCat,
        name: 'Submersible Pump 1HP',
        slug: 'submersible-pump-1hp',
        shortDescription: 'Reliable 1HP submersible water pump',
        priceMin: 3200, priceMax: 5100,
        moq: 100
      }
    ]);

    console.log('Seeded 1 manufacturer and 2 sample products');

    // Default site settings
    await SiteSetting.insertMany([
      { key: 'site_name', value: 'Gujarat Wholesale', group: 'general' },
      { key: 'site_tagline', value: 'Verified factories. Wholesale prices. Any quantity.', group: 'general' },
      { key: 'contact_phone', value: '', group: 'contact' },
      { key: 'contact_whatsapp', value: '', group: 'contact' },
      { key: 'contact_email', value: 'info@gujaratwholesale.com', group: 'contact' },
      { key: 'office_address', value: 'Rajkot, Gujarat, India', group: 'contact' }
    ]);
    console.log('Seeded site settings');

    // Create the first admin user (only if none exists yet)
    const adminExists = await AdminUser.findOne({ email: 'admin@gujaratwholesale.com' });
    if (!adminExists) {
      const passwordHash = await AdminUser.hashPassword('ChangeThisPassword123!');
      await AdminUser.create({
        name: 'Admin User',
        email: 'admin@gujaratwholesale.com',
        passwordHash,
        role: 'super_admin'
      });
      console.log('Created default admin user: admin@gujaratwholesale.com / ChangeThisPassword123!');
      console.log('⚠️  IMPORTANT: Log in and change this password immediately after first login.');
    }

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
