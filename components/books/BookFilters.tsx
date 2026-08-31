'use client';

import { useFilterOptions } from '@/hooks/useBooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function BookFilters({ filters, onFilterChange, onClearFilters }) {
  // TanStack Query - fetch filter options
  const { data: options, isLoading } = useFilterOptions();

  const handleChange = (filterName, value) => {
    onFilterChange({ ...filters, [filterName]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Prepare options for Select components
  const categoryOptions = [
    { value: '', label: 'All Materials' },
    ...(options?.categories || []).map(c => ({ value: c.id, label: c.name }))
  ];

  const facultyOptions = [
    { value: '', label: 'All Faculties' },
    ...(options?.faculties || []).map(f => ({ value: f.id, label: f.name }))
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...(options?.departments || [])
      .filter(d => !filters.facultyId || d.facultyId === filters.facultyId)
      .map(d => ({ value: d.id, label: d.name }))
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    ...(options?.levels || []).map(l => ({ value: l, label: l }))
  ];

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    ...(options?.semesters || []).map(s => ({ value: s, label: s }))
  ];

  const sessionOptions = [
    { value: '', label: 'All Sessions' },
    ...(options?.sessions || []).map(s => ({ value: s, label: s }))
  ];

  const availabilityOptions = [
    { value: '', label: 'All Materials' },
    { value: 'true', label: 'In Stock Only' },
    { value: 'false', label: 'Out of Stock' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-24 mb-2" />
            <div className="h-10 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary-dark transition-smooth flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Category</label>
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(val) => handleChange('categoryId', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white capitalize">
            <SelectValue placeholder="All Materials" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(opt => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"} className="capitalize">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Faculty Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Faculty</label>
        <Select
          value={filters.facultyId || "all"}
          onValueChange={(val) => handleChange('facultyId', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Faculties" />
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

      {/* Department Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Department</label>
        <Select
          value={filters.departmentId || "all"}
          onValueChange={(val) => handleChange('departmentId', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Departments" />
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

      {/* Level Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Level</label>
        <Select
          value={filters.level || "all"}
          onValueChange={(val) => handleChange('level', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Levels" />
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

      {/* Semester Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Semester</label>
        <Select
          value={filters.semester || "all"}
          onValueChange={(val) => handleChange('semester', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Semesters" />
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

      {/* Session Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Session</label>
        <Select
          value={filters.session || "all"}
          onValueChange={(val) => handleChange('session', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Sessions" />
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

      {/* Availability Filter */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Availability</label>
        <Select
          value={filters.inStock || "all"}
          onValueChange={(val) => handleChange('inStock', val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Books" />
          </SelectTrigger>
          <SelectContent>
            {availabilityOptions.map(opt => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Has Manual */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasManual === 'true'}
            onChange={(e) => handleChange('hasManual', e.target.checked ? 'true' : '')}
            className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-neutral-900">Has Manual</span>
        </label>
      </div>
    </div>
  );
}