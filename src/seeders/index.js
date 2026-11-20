import adminSeeder from "./admin.seeder.js";

const runSeeders = async () => {
  try {
    console.log("Starting seeders...");

    await adminSeeder();

    console.log("All seeders completed successfully");
  } catch (error) {
    console.error("Seeder failed:", error.message);
    throw error;
  }
};

export default runSeeders;