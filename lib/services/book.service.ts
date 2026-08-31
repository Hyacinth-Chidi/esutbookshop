import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { uploadImageBuffer, deleteImage, extractPublicId } from '../config/cloudinary';
import { generateSlug } from '../utils';

export const createBook = async (data: Record<string, string | boolean | number>, files: Record<string, Buffer[]>, adminId?: string) => {
  try {
    const quantity = data.quantity ? parseInt(data.quantity as string) : 0;
    const bookData: Prisma.BookCreateInput | any = {
      title: data.title,
      slug: generateSlug(data.title as string, data.courseCode as string),
      description: data.description || null,
      price: data.price ? parseFloat(data.price as string) : 0,
      courseCode: data.courseCode,
      departmentId: data.departmentId && data.departmentId !== '' ? data.departmentId : null,
      facultyId: data.facultyId && data.facultyId !== '' ? data.facultyId : null,
      categoryId: data.categoryId && data.categoryId !== '' ? data.categoryId : null,
      level: data.level,
      semester: data.semester,
      session: data.session,
      courseLecturer: data.courseLecturer || null,
      shelfLocation: data.shelfLocation || null,
      // Normalize booleans coming from form data (may be 'true'/'false' strings)
      hasManual: data.hasManual === 'true' || data.hasManual === true || false,
      manualPrice: data.manualPrice ? parseFloat(data.manualPrice as string) : null,
      quantity,
    };

    // Validate required files
    if (!files.frontCover || files.frontCover.length === 0) {
      throw new Error('Front cover is required');
    }
    
    // Validate manual cover if hasManual is true
    if (bookData.hasManual && (!files.manualFrontCover || files.manualFrontCover.length === 0)) {
      throw new Error('Manual front cover is required when hasManual is true');
    }

    // Build array of upload promises (only for images that exist)
    const uploadPromises: Promise<{url: string, publicId: string}>[] = [];
    const uploadKeys: string[] = []; // Track which key each promise corresponds to

    // Front cover (always required)
    uploadPromises.push(uploadImageBuffer(files.frontCover[0], 'esut-bookshop/books'));
    uploadKeys.push('frontCover');

    // Back cover (optional)
    if (files.backCover && files.backCover.length > 0) {
      uploadPromises.push(uploadImageBuffer(files.backCover[0], 'esut-bookshop/books'));
      uploadKeys.push('backCover');
    }

    // Manual cover (only if hasManual)
    if (bookData.hasManual && files.manualFrontCover && files.manualFrontCover.length > 0) {
      uploadPromises.push(uploadImageBuffer(files.manualFrontCover[0], 'esut-bookshop/manuals'));
      uploadKeys.push('manualFrontCover');
    }

    // Upload all images in parallel
    const uploadResults = await Promise.all(uploadPromises);

    // Map results back to bookData
    uploadKeys.forEach((key, index) => {
      bookData[key] = uploadResults[index].url;
    });

    // Create book in database
    const book = await prisma.book.create({
      data: bookData,
      include: {
        faculty: true,
        department: true,
        category: true,
      }
    });

    // Log inventory and audit if adminId is available
    if (adminId && quantity > 0) {
      await prisma.inventoryLog.create({
        data: {
          bookId: book.id,
          adminId,
          change: quantity,
          reason: 'Initial stock on book creation',
        },
      });
    }

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: 'CREATE',
          entity: 'Book',
          entityId: book.id,
          details: { title: book.title, courseCode: book.courseCode, quantity },
        },
      });
    }

    return book;
  } catch (error) {
    throw error;
  }
};

//Get all books with pagination and filtering
export const getAllBooks = async (query: Record<string, string | number | boolean | undefined> = {}) => {
  const {
    search,
    courseCode,
    departmentId,
    facultyId,
    categoryId,
    level,
    semester,
    session,
    hasManual,
    inStock,
    page = 1,
    limit = 30,
  } = query;

  // Build filter conditions
  const where: Prisma.BookWhereInput = {};

  if (search) {
    // Normalize search: create variations for course codes (e.g., CSC101 -> CSC 101, CSC 101 -> CSC101)
    const searchTrimmed = (search as string).trim();
    const searchNoSpaces = searchTrimmed.replace(/\s+/g, '');
    // Try to add space between letters and numbers (CSC101 -> CSC 101)
    const searchWithSpace = searchTrimmed.replace(/([A-Za-z]+)(\d+)/g, '$1 $2');
    
    // Build OR conditions for flexible matching
    const searchConditions = [
      { title: { contains: searchTrimmed, mode: 'insensitive' as any } },
      { courseCode: { contains: searchTrimmed, mode: 'insensitive' as any } },
    ];
    
    // Add variations if they differ from original
    if (searchNoSpaces !== searchTrimmed) {
      searchConditions.push({ courseCode: { contains: searchNoSpaces, mode: 'insensitive' as any } });
    }
    if (searchWithSpace !== searchTrimmed && searchWithSpace !== searchNoSpaces) {
      searchConditions.push({ courseCode: { contains: searchWithSpace, mode: 'insensitive' as any } });
    }
    
    where.OR = searchConditions;
  }

  if (courseCode) where.courseCode = courseCode as string;
  if (departmentId) where.departmentId = departmentId as string;
  if (facultyId) where.facultyId = facultyId as string;
  if (categoryId) where.categoryId = categoryId as string;
  if (level) where.level = level as string;
  if (semester) where.semester = semester as string;
  if (session) where.session = session as string;
  // normalize string boolean filters
  if (hasManual !== undefined && hasManual !== null && hasManual !== '') {
    // Accept 'true'|'false' or actual boolean
    where.hasManual = hasManual === 'true' || hasManual === true;
  }
  if (inStock !== undefined && inStock !== null && inStock !== '') {
    if (inStock === true || inStock === 'true') {
      where.quantity = { gt: 0 };
    } else {
      where.quantity = { lte: 0 };
    }
  }

  // Calculate pagination
  const skip = ((page as number) - 1) * (limit as number);

  // Fetch books and total count
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit as number,
      orderBy: { createdAt: 'desc' },
      include: {
        faculty: true,
        department: true,
        category: true,
      }
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil((total as number) / (limit as number)),
    },
  };
};

//Get book by ID or Slug
export const getBookById = async (idOrSlug: string) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  const book = await prisma.book.findFirst({
    where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    include: {
      faculty: true,
      department: true,
      category: true,
    }
  });

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

//Update book
export const updateBook = async (id: string, data: Record<string, string | boolean | number>, files: Record<string, Buffer[]> = {}, adminId?: string) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const existingBook = await prisma.book.findFirst({
    where: isUuid ? { id } : { slug: id },
  });

  if (!existingBook) {
    throw new Error('Book not found');
  }

  try {
    const updateData: Prisma.BookUpdateInput | any = { ...data };

    // Regenerate slug if title or courseCode changed
    if (data.title || data.courseCode) {
      updateData.slug = generateSlug(
        (data.title as string) || existingBook.title, 
        (data.courseCode as string) || existingBook.courseCode
      );
    }

    // Convert optional empty string fields to null
    if (updateData.departmentId === '') updateData.departmentId = null;
    if (updateData.facultyId === '') updateData.facultyId = null;
    if (updateData.categoryId === '') updateData.categoryId = null;

    if (updateData.price) updateData.price = parseFloat(updateData.price as string);

    // Normalize boolean-like fields
    if (updateData.hasManual !== undefined) {
      updateData.hasManual = updateData.hasManual === 'true' || updateData.hasManual === true;
    }
    
    // Handle manualPrice
    if (updateData.manualPrice) {
      updateData.manualPrice = parseFloat(updateData.manualPrice as string);
    } else if (updateData.hasManual === false) {
      updateData.manualPrice = null;
    }

    if (updateData.quantity !== undefined) updateData.quantity = parseInt(updateData.quantity as string);

    // Handle shelfLocation
    if (updateData.shelfLocation === '') updateData.shelfLocation = null;

    // Upload new front cover if provided
    if (files.frontCover && files.frontCover.length > 0) {
      // Delete old image from Cloudinary
      if (existingBook.frontCover) {
        const publicId = extractPublicId(existingBook.frontCover);
        if (publicId) await deleteImage(publicId);
      }

      const frontCoverResult = await uploadImageBuffer(files.frontCover[0], 'esut-bookshop/books');
      updateData.frontCover = frontCoverResult.url;
    }

    // Upload new back cover if provided
    if (files.backCover && files.backCover.length > 0) {
      // Delete old image from Cloudinary
      if (existingBook.backCover) {
        const publicId = extractPublicId(existingBook.backCover);
        if (publicId) await deleteImage(publicId);
      }

      const backCoverResult = await uploadImageBuffer(files.backCover[0], 'esut-bookshop/books');
      updateData.backCover = backCoverResult.url;
    }

    // Handle manual cover
    if (files.manualFrontCover && files.manualFrontCover.length > 0) {
      // Delete old manual cover from Cloudinary
      if (existingBook.manualFrontCover) {
        const publicId = extractPublicId(existingBook.manualFrontCover);
        if (publicId) await deleteImage(publicId);
      }

      const manualCoverResult = await uploadImageBuffer(files.manualFrontCover[0], 'esut-bookshop/manuals');
      updateData.manualFrontCover = manualCoverResult.url;
    }

    // Update book in database
    const updatedBook = await prisma.book.update({
      where: { id: existingBook.id },
      data: updateData,
      include: {
        faculty: true,
        department: true,
        category: true,
      }
    });

    // Log inventory change if quantity changed
    if (adminId && updateData.quantity !== undefined) {
      const quantityChange = updatedBook.quantity - existingBook.quantity;
      if (quantityChange !== 0) {
        await prisma.inventoryLog.create({
          data: {
            bookId: updatedBook.id,
            adminId,
            change: quantityChange,
            reason: 'Manual adjustment via book update',
          },
        });
      }
    }

    // Audit log
    if (adminId) {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: 'UPDATE',
          entity: 'Book',
          entityId: updatedBook.id,
          details: {
            changes: Object.keys(data).filter(k => !['frontCover', 'backCover', 'manualFrontCover'].includes(k)),
          },
        },
      });
    }

    return updatedBook;
  } catch (error) {
    throw error;
  }
};

//Delete book
export const deleteBook = async (id: string, adminId?: string) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const book = await prisma.book.findFirst({
    where: isUuid ? { id } : { slug: id },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  // Audit log before deletion
  if (adminId) {
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE',
        entity: 'Book',
        entityId: book.id,
        details: { title: book.title, courseCode: book.courseCode },
      },
    });
  }

  // Delete images from Cloudinary
  if (book.frontCover) {
    const publicId = extractPublicId(book.frontCover);
    if (publicId) await deleteImage(publicId);
  }

  if (book.backCover) {
    const publicId = extractPublicId(book.backCover);
    if (publicId) await deleteImage(publicId);
  }

  if (book.manualFrontCover) {
    const publicId = extractPublicId(book.manualFrontCover);
    if (publicId) await deleteImage(publicId);
  }

  // Delete book from database (InventoryLogs cascade-delete automatically)
  await prisma.book.delete({
    where: { id: book.id },
  });
};

//Get unique filter options (for frontend filters)
export const getFilterOptions = async () => {
  // Fetch from database
  const [departments, faculties, categories, levels, semesters, sessions] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, facultyId: true }
    }),
    prisma.faculty.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.book.findMany({
      distinct: ['level'],
      select: { level: true },
    }),
    prisma.book.findMany({
      distinct: ['semester'],
      select: { semester: true },
    }),
    prisma.book.findMany({
      distinct: ['session'],
      select: { session: true },
    }),
  ]);

  const result = {
    departments,
    faculties,
    categories,
    levels: levels.map((l) => l.level).sort(),
    semesters: semesters.map((s) => s.semester),
    sessions: sessions.map((s) => s.session).sort().reverse(),
  };

  return result;
};

// Get all books for report (no limit) - grouped by session/semester
export const getReportBooks = async (query: Record<string, string | undefined> = {}) => {
  const { session, semester } = query;

  // Build filter conditions
  const where: Prisma.BookWhereInput = {};
  if (session) where.session = session;
  if (semester) where.semester = semester;

  // Fetch ALL books without limit
  const books = await prisma.book.findMany({
    where,
    include: {
      department: {
        select: { id: true, name: true, facultyId: true }
      },
      faculty: {
        select: { id: true, name: true }
      },
      category: {
        select: { id: true, name: true }
      }
    },
    orderBy: [
      { faculty: { name: 'asc' } },
      { department: { name: 'asc' } },
      { level: 'asc' },
      { title: 'asc' }
    ]
  });

  return { books, total: books.length };
};
