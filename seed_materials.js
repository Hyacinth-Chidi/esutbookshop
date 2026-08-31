require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
};

const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];
const semesters = ["First Semester", "Second Semester"];
const sessions = ["2023/2024", "2024/2025"];
const placeholders = "https://placehold.co/600x800/png";

async function main() {
  console.log("Fetching faculties, departments, and categories...");
  
  const faculties = await prisma.faculty.findMany({ include: { departments: true } });
  const categories = await prisma.category.findMany();

  if (faculties.length === 0 || categories.length === 0) {
    console.error("Please ensure faculties and categories are seeded first.");
    return;
  }

  const materialsData = [
    { title: "Introduction to Computer Science", courseCode: "CSC101" },
    { title: "Advanced Engineering Mathematics", courseCode: "MTH201" },
    { title: "Fundamentals of Thermodynamics", courseCode: "MEE203" },
    { title: "Principles of Macroeconomics", courseCode: "ECO102" },
    { title: "Business Communication Skills", courseCode: "BUS105" },
    { title: "Structural Mechanics", courseCode: "CVE301" },
    { title: "Introduction to Psychology", courseCode: "PSY101" },
    { title: "Digital Logic Design", courseCode: "EEE201" },
    { title: "Organic Chemistry I", courseCode: "CHM201" },
    { title: "Urban Planning Principles", courseCode: "URP101" },
    { title: "Microbiology Laboratory Manual", courseCode: "MCB201" },
    { title: "Data Structures and Algorithms", courseCode: "CSC202" },
    { title: "Engineering Drawing & Graphics", courseCode: "ENG103" },
    { title: "Introduction to Mass Communication", courseCode: "MAC101" },
    { title: "Financial Accounting I", courseCode: "ACC101" },
  ];

  console.log("Seeding 15 materials...");

  for (let i = 0; i < materialsData.length; i++) {
    const data = materialsData[i];
    
    // Pick random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Pick random faculty and department
    const faculty = faculties[Math.floor(Math.random() * faculties.length)];
    const department = faculty.departments[Math.floor(Math.random() * faculty.departments.length)];
    
    const level = levels[Math.floor(Math.random() * levels.length)];
    const semester = semesters[Math.floor(Math.random() * semesters.length)];
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    const price = Math.floor(Math.random() * 4000) + 1000; // Between 1000 and 5000
    const quantity = Math.floor(Math.random() * 100) + 10; // Between 10 and 110

    const book = await prisma.book.create({
      data: {
        title: data.title,
        slug: generateSlug(data.title),
        description: `This is a placeholder description for ${data.title}. This material covers essential topics for the course.`,
        price: price,
        courseCode: data.courseCode,
        facultyId: faculty.id,
        departmentId: department.id,
        categoryId: category.id,
        level: level,
        semester: semester,
        session: session,
        frontCover: placeholders,
        quantity: quantity,
        shelfLocation: `Aisle ${Math.floor(Math.random() * 5) + 1}, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        courseLecturer: "Dr. Placeholder"
      }
    });

    console.log(`Created Material: ${book.title} (${book.courseCode})`);
  }

  console.log("Material seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
