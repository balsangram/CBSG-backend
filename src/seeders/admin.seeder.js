import env from "../config/env.js";
import Admin from "../model/admin.model.js";


const adminSeeder = async () => {
  try {
    const exists = await Admin.findOne({
      email: env.ADMIN_EMAIL,
    });

    if (exists) {
      console.log("Admin already exists");
      return;
    }

    await Admin.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      phoneNo: env.ADMIN_MOBILE,
      password: env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Admin seeder failed:", error.message);
    throw error;
  }
};

export default adminSeeder;