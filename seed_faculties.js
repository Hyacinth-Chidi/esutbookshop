require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const data = [
    {
      name: "Faculty of Engineering",
      departments: [
        "Computer Engineering",
        "Civil Engineering",
        "Mechanical Engineering",
        "Electrical and Electronics Engineering",
        "Chemical Engineering",
      ],
    },
    {
      name: "Faculty of Science",
      departments: [
        "Computer Science",
        "Industrial Chemistry",
        "Microbiology",
        "Mathematics",
        "Physics",
      ],
    },
    {
      name: "Faculty of Management Sciences",
      departments: [
        "Accountancy",
        "Business Administration",
        "Banking and Finance",
        "Marketing",
        "Public Administration",
      ],
    },
    {
      name: "Faculty of Social Sciences",
      departments: [
        "Economics",
        "Political Science",
        "Sociology",
        "Psychology",
        "Mass Communication",
      ],
    },
    {
      name: "Faculty of Environmental Sciences",
      departments: [
        "Architecture",
        "Estate Management",
        "Surveying and Geoinformatics",
        "Urban and Regional Planning",
        "Building Technology",
      ],
    }
  ];

  console.log("Seeding faculties and departments...");

  for (const facultyData of data) {
    // Upsert faculty so it doesn't fail if it exists
    const faculty = await prisma.faculty.upsert({
      where: { name: facultyData.name },
      update: {},
      create: {
        name: facultyData.name,
      },
    });

    console.log(`Created/Found Faculty: ${faculty.name}`);

    // Create departments
    for (const deptName of facultyData.departments) {
      const existingDept = await prisma.department.findFirst({
        where: {
          name: deptName,
          facultyId: faculty.id,
        },
      });

      if (!existingDept) {
        await prisma.department.create({
          data: {
            name: deptName,
            facultyId: faculty.id,
          },
        });
        console.log(`  - Created Department: ${deptName}`);
      } else {
        console.log(`  - Department exists: ${deptName}`);
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
