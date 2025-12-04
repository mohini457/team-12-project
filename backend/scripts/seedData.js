/**
 * Seed script to create sample data for testing
 * Run with: node scripts/seedData.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const Slot = require("../models/Slot");

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(
            process.env.MONGODB_URI ||
                "mongodb://localhost:27017/parking-slot-app"
        );
        console.log("Connected to MongoDB");

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await ParkingLot.deleteMany({});
        // await Slot.deleteMany({});

        // Create Admin User
        const adminPassword = await bcrypt.hash("admin123", 10);
        const admin = await User.findOneAndUpdate(
            { email: "admin@test.com" },
            {
                name: "Admin User",
                email: "admin@test.com",
                password: adminPassword,
                role: "admin",
                isVerified: true,
            },
            { upsert: true, new: true }
        );
        console.log("Admin user created:", admin.email);

        // Create Manager User
        const managerPassword = await bcrypt.hash("manager123", 10);
        const manager = await User.findOneAndUpdate(
            { email: "manager@test.com" },
            {
                name: "Parking Manager",
                email: "manager@test.com",
                password: managerPassword,
                role: "manager",
                isVerified: true,
            },
            { upsert: true, new: true }
        );
        console.log("Manager user created:", manager.email);

        // Create Driver User
        const driverPassword = await bcrypt.hash("driver123", 10);
        const driver = await User.findOneAndUpdate(
            { email: "driver@test.com" },
            {
                name: "Test Driver",
                email: "driver@test.com",
                password: driverPassword,
                role: "driver",
                isVerified: true,
                vehicleNumber: "ABC-1234",
            },
            { upsert: true, new: true }
        );
        console.log("Driver user created:", driver.email);

        // Create Sample Parking Lots
        const parkingLots = [
            {
                name: "Downtown Central Parking",
                manager: manager._id,
                address: {
                    street: "123 Main Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    zipCode: "400001",
                    country: "India",
                },
                location: {
                    latitude: 19.076,
                    longitude: 72.8777,
                },
                totalSlots: 100,
                availableSlots: 75,
                slotTypes: {
                    covered: 40,
                    openAir: 50,
                    evCharging: 5,
                    handicapAccessible: 5,
                },
                pricing: {
                    hourly: 50,
                    daily: 400,
                    monthly: 8000,
                },
                operatingHours: {
                    open: "06:00",
                    close: "22:00",
                },
                isActive: true,
            },
            {
                name: "Mall Parking Complex",
                manager: manager._id,
                address: {
                    street: "456 Shopping Avenue",
                    city: "Mumbai",
                    state: "Maharashtra",
                    zipCode: "400052",
                    country: "India",
                },
                location: {
                    latitude: 19.1077,
                    longitude: 72.8297,
                },
                totalSlots: 200,
                availableSlots: 150,
                slotTypes: {
                    covered: 100,
                    openAir: 80,
                    evCharging: 15,
                    handicapAccessible: 5,
                },
                pricing: {
                    hourly: 40,
                    daily: 300,
                    monthly: 6000,
                },
                operatingHours: {
                    open: "08:00",
                    close: "23:00",
                },
                isActive: true,
            },
            {
                name: "Airport Parking Zone",
                manager: manager._id,
                address: {
                    street: "Near Airport Terminal",
                    city: "Mumbai",
                    state: "Maharashtra",
                    zipCode: "400099",
                    country: "India",
                },
                location: {
                    latitude: 19.0896,
                    longitude: 72.8656,
                },
                totalSlots: 300,
                availableSlots: 200,
                slotTypes: {
                    covered: 200,
                    openAir: 80,
                    evCharging: 15,
                    handicapAccessible: 5,
                },
                pricing: {
                    hourly: 60,
                    daily: 500,
                    monthly: 10000,
                },
                operatingHours: {
                    open: "00:00",
                    close: "23:59",
                },
                isActive: true,
            },
        ];

        for (const lotData of parkingLots) {
            const lot = await ParkingLot.findOneAndUpdate(
                { name: lotData.name },
                lotData,
                { upsert: true, new: true }
            );
            console.log("Parking lot created:", lot.name);

            // Create slots for this parking lot
            const slots = [];
            const slotTypes = [
                "covered",
                "openAir",
                "evCharging",
                "handicapAccessible",
            ];

            for (let i = 1; i <= lot.totalSlots; i++) {
                // Distribute slot types
                let slotType = "openAir";
                if (i <= lot.slotTypes.covered) {
                    slotType = "covered";
                } else if (
                    i <=
                    lot.slotTypes.covered + lot.slotTypes.evCharging
                ) {
                    slotType = "evCharging";
                } else if (
                    i <=
                    lot.slotTypes.covered +
                        lot.slotTypes.evCharging +
                        lot.slotTypes.handicapAccessible
                ) {
                    slotType = "handicapAccessible";
                }

                // Make some slots occupied
                const status =
                    i <= lot.totalSlots - lot.availableSlots
                        ? "occupied"
                        : "available";

                slots.push({
                    slotNumber: `SL-${String(i).padStart(3, "0")}`,
                    parkingLot: lot._id,
                    type: slotType,
                    status: status,
                });
            }

            await Slot.insertMany(slots);
            console.log(`Created ${slots.length} slots for ${lot.name}`);
        }

        console.log("\n✅ Seed data created successfully!");
        console.log("\nTest Users:");
        console.log("Admin - Email: admin@test.com, Password: admin123");
        console.log("Manager - Email: manager@test.com, Password: manager123");
        console.log("Driver - Email: driver@test.com, Password: driver123");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
