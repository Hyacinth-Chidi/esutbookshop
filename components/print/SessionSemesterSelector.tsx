/**
 * ============================================
 * SESSION SEMESTER SELECTOR COMPONENT
 * ============================================
 * Reusable dropdown selectors for session and semester
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SessionSemesterSelector({
  sessionOptions,
  semesterOptions,
  selectedSession,
  selectedSemester,
  onSessionChange,
  onSemesterChange,
  disabled = false,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Session</label>
        <Select
          value={selectedSession || "all"}
          onValueChange={(val) => onSessionChange(val === "all" ? null : val)}
          disabled={disabled}
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

      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-700">Semester</label>
        <Select
          value={selectedSemester || "all"}
          onValueChange={(val) => onSemesterChange(val === "all" ? null : val)}
          disabled={disabled}
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
    </div>
  );
}
