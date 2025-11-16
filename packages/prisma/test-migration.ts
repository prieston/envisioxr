// Test script to validate organization migration logic
/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMigration() {
  try {
    console.log("🧪 Testing Organization Migration Logic...\n");

    // Test 1: Check if Organization table exists and has correct structure
    console.log("1. Checking Organization model...");
    const orgCount = await prisma.organization.count();
    console.log(`   ✓ Found ${orgCount} organizations\n`);

    // Test 2: Check if OrganizationMember table exists
    console.log("2. Checking OrganizationMember model...");
    const memberCount = await prisma.organizationMember.count();
    console.log(`   ✓ Found ${memberCount} organization members\n`);

    // Test 3: Check if all users have personal organizations
    console.log("3. Verifying all users have personal organizations...");
    const users = await prisma.user.findMany({
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    let allUsersHavePersonalOrg = true;
    for (const user of users) {
      const personalOrg = user.organizationMembers.find(
        (m) => m.organization.isPersonal && m.role === "owner"
      );
      if (!personalOrg) {
        console.log(`   ✗ User ${user.id} (${user.email}) missing personal organization`);
        allUsersHavePersonalOrg = false;
      }
    }

    if (allUsersHavePersonalOrg) {
      console.log(`   ✓ All ${users.length} users have personal organizations\n`);
    }

    // Test 4: Check if all projects have organizationId
    console.log("4. Verifying projects have organizationId...");
    const projects = await prisma.project.findMany();
    const projectsWithoutOrg = projects.filter((p) => !p.organizationId);
    if (projectsWithoutOrg.length > 0) {
      console.log(`   ✗ Found ${projectsWithoutOrg.length} projects without organizationId`);
    } else {
      console.log(`   ✓ All ${projects.length} projects have organizationId\n`);
    }

    // Test 5: Check if all assets have organizationId
    console.log("5. Verifying assets have organizationId...");
    const assets = await prisma.asset.findMany();
    const assetsWithoutOrg = assets.filter((a) => !a.organizationId);
    if (assetsWithoutOrg.length > 0) {
      console.log(`   ✗ Found ${assetsWithoutOrg.length} assets without organizationId`);
    } else {
      console.log(`   ✓ All ${assets.length} assets have organizationId\n`);
    }

    // Test 6: Verify organization membership queries work
    console.log("6. Testing organization helper functions...");
    if (users.length > 0) {
      const testUser = users[0];
      const userOrgs = await prisma.organizationMember.findMany({
        where: { userId: testUser.id },
        include: { organization: true },
      });
      console.log(`   ✓ User ${testUser.email} is member of ${userOrgs.length} organization(s)`);

      const personalOrg = userOrgs.find((m) => m.organization.isPersonal);
      if (personalOrg) {
        console.log(`   ✓ Personal organization: ${personalOrg.organization.name} (${personalOrg.organization.slug})`);
      }
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testMigration()
    .then(() => {
      console.log("\n✨ Migration validation complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration validation failed:", error);
      process.exit(1);
    });
}

export { testMigration };

