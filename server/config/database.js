const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gsurvey', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user if not exists
    await createDefaultAdmin();
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gsurvey.com';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'System',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log(`👤 Default admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`Error creating default admin: ${error.message}`);
  }
};

module.exports = connectDB;
