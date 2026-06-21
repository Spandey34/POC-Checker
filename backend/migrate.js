require('dotenv').config();
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Initialize the Prisma 7 Database Adapter
const connectionString = process.env.DATABASE_URL.includes('sslmode') 
  ? process.env.DATABASE_URL 
  : `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}sslmode=require`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const User = require('./src/models/User');
const POC = require('./src/models/POC');
const Recent = require('./src/models/Recent');

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB (Source)');
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL (Destination)');

    // 1. Clean Slate
    console.log('🧹 Clearing Postgres destination to ensure a clean run...');
    await prisma.recent.deleteMany();
    await prisma.pOC.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create the "N/A" Fallback User
    console.log('🧑‍💻 Creating "N/A" fallback user...');
    const fallbackUser = await prisma.user.create({
      data: {
        clerkId: 'N/A_deleted_user',
        email: 'N/A@system.local', // Requires unique string
        firstName: 'N/A',
        lastName: 'N/A',
        role: 'user',
        isVerified: false,
      }
    });
    const fallbackUserId = fallbackUser.id;
    console.log(`✅ Fallback User created with ID: ${fallbackUserId}`);

    // 3. Migrate Users
    console.log('⏳ Migrating valid Users...');
    const users = await User.find().lean();
    const validUserIds = new Set(); 

    for (const u of users) {
      const userId = u._id.toString();
      await prisma.user.create({
        data: {
          id: userId,
          clerkId: u.clerkId,
          email: u.email,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          role: u.role,
          isVerified: u.isVerified,
          lastVisit: u.lastVisit,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        },
      });
      validUserIds.add(userId);
    }
    console.log(`✅ Migrated ${users.length} Users.`);

    // 4. Migrate POCs
    console.log('⏳ Migrating POCs...');
    const pocs = await POC.find().lean();
    let reassignedPocs = 0;

    for (const p of pocs) {
      const addedById = p.addedBy ? p.addedBy.toString() : null;
      let finalAddedById = addedById;

      // Check if user is missing, if so, map to fallback ID
      if (!addedById || !validUserIds.has(addedById)) {
        finalAddedById = fallbackUserId;
        reassignedPocs++;
      }

      await prisma.pOC.create({
        data: {
          id: p._id.toString(),
          name: p.name,
          nameLower: p.nameLower || p.name.toLowerCase().trim(),
          aliases: p.aliases || [],
          acronyms: p.acronyms || [],
          branch: p.branch,
          addedById: finalAddedById,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
      });
    }
    console.log(`✅ Migrated ${pocs.length} POCs. (Reassigned ${reassignedPocs} to "N/A" user)`);

    // 5. Migrate Recent Activities
    console.log('⏳ Migrating Recent Activities...');
    const recents = await Recent.find().lean();
    let reassignedRecents = 0;
    let skippedRecents = 0;

    // Gather valid POC IDs to ensure we don't map to a deleted POC
    const validPocIds = new Set((await prisma.pOC.findMany({ select: { id: true } })).map(p => p.id));

    for (const r of recents) {
      const actionById = r.actionBy ? r.actionBy.toString() : null;
      const pocId = r.POCId ? r.POCId.toString() : null;
      
      let finalActionById = actionById;

      // If the POC itself doesn't exist, we must skip the recent activity
      if (!pocId || !validPocIds.has(pocId)) {
        skippedRecents++;
        continue;
      }

      // If the User doesn't exist, map to fallback ID
      if (!actionById || !validUserIds.has(actionById)) {
        finalActionById = fallbackUserId;
        reassignedRecents++;
      }

      await prisma.recent.create({
        data: {
          id: r._id.toString(),
          POCName: r.POCName,
          POCBranch: r.POCBranch,
          actionType: r.actionType,
          POCId: pocId,
          actionById: finalActionById,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
      });
    }
    console.log(`✅ Migrated ${recents.length - skippedRecents} Recent Activities. (Reassigned ${reassignedRecents} to "N/A" user. Skipped ${skippedRecents} due to missing POCs.)`);

    console.log('🎉 MIGRATION COMPLETE!');

  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  }
}

runMigration();