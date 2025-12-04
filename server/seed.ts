import { connectDB } from './db';
import { User } from './models/User';
import { Product } from './models/Product';

const sampleProducts = [
  {
    name: "The Enchanté Gown",
    price: 1200,
    description: "Elegant evening gown crafted from luxurious silk charmeuse with a flowing silhouette.",
    category: "Evening Wear",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    inStock: true,
    featured: true,
  },
  {
    name: "Midnight Silk Slip",
    price: 890,
    description: "Minimalist silk slip dress with delicate straps and a bias-cut design.",
    category: "Dresses",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    inStock: true,
    featured: true,
  },
  {
    name: "Classic Leather Tote",
    price: 590,
    description: "Timeless leather tote bag with structured silhouette and gold hardware.",
    category: "Accessories",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    inStock: true,
    featured: true,
  },
  {
    name: "Cashmere Wrap Coat",
    price: 2400,
    description: "Luxurious cashmere wrap coat in camel with a belted waist.",
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    inStock: true,
    featured: false,
  },
  {
    name: "Gold Chain Necklace",
    price: 350,
    description: "Delicate 14k gold chain necklace with a minimalist pendant.",
    category: "Jewelry",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    inStock: true,
    featured: false,
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('📦 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@lumiere.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });
    await adminUser.save();
    console.log('✅ Created admin user (admin@lumiere.com / admin123)');

    // Create sample user
    const sampleUser = new User({
      email: 'user@example.com',
      password: 'password123',
      name: 'Jane Doe',
      role: 'user',
    });
    await sampleUser.save();
    console.log('✅ Created sample user (user@example.com / password123)');

    // Create products
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
    }
    console.log(`✅ Created ${sampleProducts.length} sample products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('- Login as admin: admin@lumiere.com / admin123');
    console.log('- Login as user: user@example.com / password123');
    console.log('- Visit /admin for the admin dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
