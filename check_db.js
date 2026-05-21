const mongoose = require('mongoose');
require('dotenv').config({ override: true });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to:", mongoose.connection.name);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Check products
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log("Products count:", products.length);
    console.log("Products:", products);
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
check();
