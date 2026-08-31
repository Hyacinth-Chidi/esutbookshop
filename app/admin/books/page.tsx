'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBooks, useDeleteBook, useFilterOptions } from '@/hooks/useBooks';
import { useFaculties, useCategories } from '@/hooks/useFaculties';
import { useSystemSettings } from '@/hooks/useSettings';
import { useAdminPreferences } from '@/context/AdminPreferencesContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ActionsDropdown from '@/components/admin/ActionsDropdown';
import { formatPrice } from '@/lib/utils';
import { Plus, Search, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminBooksPage() {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, book: null });
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Read category from URL search params (set by sidebar sub-menu)
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');

  // Use global preferences state
  const { 
    selectedSession, setSelectedSession, 
    selectedSemester, setSelectedSemester,
    selectedFaculty, setSelectedFaculty,
    selectedDepartment, setSelectedDepartment,
    selectedLevel, setSelectedLevel,
  } = useAdminPreferences();

  // TanStack Query books
  const { data: faculties = [] } = useFaculties();
  const { data: categories = [] } = useCategories();
  const { data: filterOptions } = useFilterOptions();
  const { data: settings } = useSystemSettings();

  // Resolve the URL category name (e.g. 'textbook') to a categoryId
  const activeCategoryId = urlCategory
    ? (categories.find((c: any) => c.name === urlCategory)?.id || undefined)
    : undefined;

  // Derive the page title from the URL category
  const CATEGORY_TITLES: Record<string, string> = {
    textbook: 'Manage Textbooks',
    handout: 'Manage Handouts',
    'past questions': 'Manage Past Questions',
  };
  const pageTitle = urlCategory ? (CATEGORY_TITLES[urlCategory] || 'Manage Materials') : 'Manage Materials';
  
  // Derived state for available departments
  const availableDepartments = selectedFaculty 
    ? faculties.find(f => f.id === selectedFaculty)?.departments || [] 
    : [];
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { data, isLoading, isFetching } = useBooks({
    page,
    limit,
    search: debouncedSearch,
    categoryId: activeCategoryId,
    facultyId: selectedFaculty,
    departmentId: selectedDepartment,
    level: selectedLevel || undefined,
    session: selectedSession || settings?.currentSession,
    semester: selectedSemester || settings?.currentSemester,
  });
  const books = data?.books || [];
  const pagination = data?.pagination || { page: 1, limit: 50, totalPages: 1, total: 0 };

  const deleteBookMutation = useDeleteBook();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;
    setSelectedFaculty(facultyId);
    setSelectedDepartment('');
    setPage(1); // Reset to page 1 on filter
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, book: null });
  };

  const handleDelete = async () => {
    deleteBookMutation.mutate(deleteModal.book.id, {
      onSuccess: () => {
        closeDeleteModal();
      },
    });
  };

  const facultyOptions = [
    { value: '', label: 'All Faculties' },
    ...faculties.map(f => ({ value: f.id, label: f.name }))
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...availableDepartments.map(d => ({ value: d.id, label: d.name }))
  ];

  // Level options from filter options
  const levelOptions = [
    { value: '', label: 'All Levels' },
    ...(filterOptions?.levels || []).map(l => ({ value: l, label: l }))
  ];

  // Session options
  const sessionOptions = [
    { value: '', label: `Current (${settings?.currentSession || '...'})` },
    ...(filterOptions?.sessions || [])
      .filter(s => s !== settings?.currentSession)
      .map(s => ({ value: s, label: s }))
  ];

  // Semester options (static)
  const semesterOptions = [
    { value: '', label: `Current (${settings?.currentSemester || '...'})` },
    { value: 'First Semester', label: 'First Semester' },
    { value: 'Second Semester', label: 'Second Semester' },
  ].filter((opt, index) => {
    if (index === 0) return true;
    return opt.value !== settings?.currentSemester;
  });

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col p-2 sm:p-4 pb-1 sm:pb-4 overflow-hidden relative">
      {/* Decorative page background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-info/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Unified Header & Filters Card */}
      <div className="relative mb-4 z-20">
        {/* Glass background layer (traps overflow for the decorative line) */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-neutral-100 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-info to-success opacity-20" />
        </div>
        
        {/* Content layer (allows dropdowns to escape) */}
        <div className="relative z-10 p-3 sm:p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-primary">
                {pageTitle}
              </h1>
              {isFetching && !isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary opacity-70" />}
            </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors border lg:hidden ${
                showFilters || searchQuery || selectedFaculty || selectedLevel || selectedSession
                  ? 'bg-primary/5 border-primary/20 text-primary'
                  : 'hover:bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <Link href="/admin/books/create">
              <Button variant="default" className="text-sm py-2 px-3">
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-end transition-all ${
          showFilters ? 'block' : 'hidden lg:grid'
        }`}>
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <label className="block text-xs font-medium text-neutral-500 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Title/Code..."
              className="w-full pl-7 pr-2 h-7 sm:h-8 text-xs"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Faculty</label>
          <Select
            value={selectedFaculty || "all"}
            onValueChange={(val) => handleFacultyChange({ target: { value: val === "all" ? "" : val } })}
          >
            <SelectTrigger className="h-7 sm:h-8 text-xs bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {facultyOptions.map(opt => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Department</label>
          <Select
            value={selectedDepartment || "all"}
            onValueChange={(val) => { setSelectedDepartment(val === "all" ? "" : val); setPage(1); }}
            disabled={!selectedFaculty}
          >
            <SelectTrigger className="h-7 sm:h-8 text-xs bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(opt => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Level</label>
          <Select
            value={selectedLevel || "all"}
            onValueChange={(val) => { setSelectedLevel(val === "all" ? "" : val); setPage(1); }}
          >
            <SelectTrigger className="h-7 sm:h-8 text-xs bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map(opt => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Session</label>
          <Select
            value={selectedSession || "all"}
            onValueChange={(val) => { setSelectedSession(val === "all" ? "" : val); setPage(1); }}
          >
            <SelectTrigger className="h-7 sm:h-8 text-xs bg-white">
              <SelectValue placeholder="Current" />
            </SelectTrigger>
            <SelectContent>
              {sessionOptions.map(opt => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Semester</label>
          <Select
            value={selectedSemester || "all"}
            onValueChange={(val) => { setSelectedSemester(val === "all" ? "" : val); setPage(1); }}
          >
            <SelectTrigger className="h-7 sm:h-8 text-xs bg-white">
              <SelectValue placeholder="Current" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map(opt => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>
        </div>
      </div>

      {/* Table Container - Flex Grow with Internal Scroll */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Glass background layer */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-neutral-100 pointer-events-none" />
        
        {/* Content layer with internal scroll */}
        <div className="relative z-10 flex-1 overflow-auto overscroll-contain rounded-2xl">
          <Table>
            <TableHeader className="bg-neutral-50/80 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-[11px] font-bold text-neutral-500 uppercase">S/N</TableHead>
                <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Material</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-bold text-neutral-500 uppercase">Course</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-bold text-neutral-500 uppercase">Department</TableHead>
                <TableHead className="text-[11px] font-bold text-neutral-500 uppercase">Price</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-bold text-neutral-500 uppercase">Qty</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-bold text-neutral-500 uppercase">Stock</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-neutral-500 text-sm">
                    Loading materials...
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-neutral-500 text-sm">
                    No materials found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book, index) => (
                  <TableRow key={book.id} className="hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-mono text-xs text-neutral-400 group-hover:text-primary transition-colors">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-neutral-900 text-xs whitespace-normal group-hover:text-primary transition-colors">{book.title}</div>
                      <div className="text-[11px] font-medium text-neutral-500 mt-0.5">{book.level}</div>
                      <div className="text-[10px] text-neutral-400 sm:hidden mt-0.5">{book.courseCode}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-medium text-neutral-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px]">{book.courseCode}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-neutral-600">
                      <span className="block max-w-[180px] xl:max-w-none truncate" title={book.department ? book.department.name : ''}>
                        {book.department ? book.department.name : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-bold text-neutral-900">
                      {formatPrice(book.price)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-medium text-neutral-700">
                      {book.quantity}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell whitespace-nowrap">
                      {book.quantity > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/15 text-error border border-error/30">
                          Out of Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionsDropdown
                        book={book}
                        onDelete={(book) => setDeleteModal({ isOpen: true, book })}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Separate Sticky Footer */}
      {!isLoading && pagination.total > 0 && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-neutral-100 rounded-xl shadow-sm text-xs shrink-0 mt-2">
          <div className="text-neutral-500 font-medium tracking-wide">
            <span className="font-bold text-neutral-900">{Math.min((page - 1) * limit + 1, pagination.total)}</span> -{' '}
            <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-primary text-white border border-primary'
                          : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (
                  (pageNum === page - 2 && pageNum > 2) ||
                  (pageNum === page + 2 && pageNum < pagination.totalPages - 1)
                ) {
                  return <span key={pageNum} className="px-1 text-neutral-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.book?.title || 'Book'}?`}
        description="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        loading={deleteBookMutation.isPending}
      />
    </div>
  );
}