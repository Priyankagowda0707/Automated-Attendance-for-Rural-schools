import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  CalendarDays,
  Loader2,
  UserPlus,
  AlertTriangle,
  User,
  Hash,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import api from "@/services/api";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  gender?: string;
  parentPhone?: string;
}

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female", "Other"];

const emptyForm = {
  name: "",
  rollNo: "",
  class: "",
  section: "",
  gender: "",
  parentPhone: "",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (name: string) => {
  const colors = [
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-purple-500",
  ];
  const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Move StudentForm outside to prevent re-creation and fix typing bug
const StudentForm = ({
  formData,
  setFormData,
  onSubmit,
  title,
  saving,
}: {
  formData: typeof emptyForm;
  setFormData: (data: typeof emptyForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  saving: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-5">
    {/* Student Info Section */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-indigo-200 flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Student Information
          </h3>
          <p className="text-xs text-slate-500">
            Basic details about the student
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          Full Name
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter student's full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="h-11 bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm font-medium transition-all"
        />
      </div>

      {/* Roll Number & Gender */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="rollNo"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            Roll Number
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rollNo"
            placeholder="e.g., 01"
            value={formData.rollNo}
            onChange={(e) =>
              setFormData({ ...formData, rollNo: e.target.value })
            }
            required
            className="h-11 bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm font-medium transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="gender"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(v) => setFormData({ ...formData, gender: v })}
          >
            <SelectTrigger
              id="gender"
              className="h-11 rounded-xl bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g} className="rounded-lg">
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <Separator className="bg-slate-200" />

    {/* Academic Info Section */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center shadow-sm">
          <GraduationCap className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Academic Details</h3>
          <p className="text-xs text-slate-500">
            Class and section information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="class"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Class
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.class}
            onValueChange={(v) => setFormData({ ...formData, class: v })}
            required
          >
            <SelectTrigger
              id="class"
              className="h-11 rounded-xl bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c} className="rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {c}
                    </span>
                    Class {c}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="section"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            Section
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.section}
            onValueChange={(v) => setFormData({ ...formData, section: v })}
            required
          >
            <SelectTrigger
              id="section"
              className="h-11 rounded-xl bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              {SECTIONS.map((s) => (
                <SelectItem key={s} value={s} className="rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                      {s}
                    </span>
                    Section {s}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <Separator className="bg-slate-200" />

    {/* Contact Info Section */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
          <Phone className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Contact Information
          </h3>
          <p className="text-xs text-slate-500">
            Parent or guardian details (optional)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="parentPhone"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          Parent's Phone Number
          <Badge
            variant="secondary"
            className="ml-auto text-[10px] h-5 px-1.5 bg-slate-100 text-slate-500"
          >
            Optional
          </Badge>
        </Label>
        <Input
          id="parentPhone"
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.parentPhone}
          onChange={(e) =>
            setFormData({ ...formData, parentPhone: e.target.value })
          }
          className="h-11 bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm font-medium transition-all"
        />
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          This will be used for notifications and updates
        </p>
      </div>
    </div>

    {/* Submit Button */}
    <div className="pt-2">
      <Button
        type="submit"
        className="w-full h-12 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 text-sm"
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>{title}</span>
          </>
        )}
      </Button>
    </div>
  </form>
);

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSection, setFilterSection] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === "all" || s.class === filterClass;
      const matchSection =
        filterSection === "all" || s.section === filterSection;
      return matchSearch && matchClass && matchSection;
    });
  }, [students, search, filterClass, filterSection]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/students", formData);
      toast.success(
        `${formData.name} added to Class ${formData.class}-${formData.section}`,
      );
      setAddOpen(false);
      setFormData(emptyForm);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setSaving(true);
    try {
      await api.put(`/students/${editStudent.id}`, formData);
      toast.success("Student updated successfully");
      setEditStudent(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStudent) return;
    try {
      await api.delete(`/students/${deleteStudent.id}`);
      toast.success(`${deleteStudent.name} removed`);
      setDeleteStudent(null);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const openEdit = (s: Student) => {
    setFormData({
      name: s.name,
      rollNo: s.rollNo,
      class: s.class,
      section: s.section,
      gender: s.gender || "",
      parentPhone: s.parentPhone || "",
    });
    setEditStudent(s);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-in">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              Students
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-11.5">
              {students.length} students enrolled
            </p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shrink-0 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 font-semibold"
                onClick={() => setFormData(emptyForm)}
              >
                <UserPlus className="w-4 h-4 mr-2" strokeWidth={2.5} /> Add
                Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-2xl p-0 gap-0 overflow-hidden border-slate-200 bg-white">
              {/* Header with white background */}
              <div className="bg-white px-6 py-5 border-b border-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <UserPlus
                        className="w-5 h-5 text-indigo-600"
                        strokeWidth={2.5}
                      />
                    </div>
                    Add New Student
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-sm mt-2">
                    Fill in the details below to enroll a new student in your
                    school.
                  </DialogDescription>
                </DialogHeader>
              </div>
              {/* Form content */}
              <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <StudentForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleAdd}
                  title="Add Student"
                  saving={saving}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + Filters */}
        <Card
          className="border-gray-100/80 shadow-sm fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-52">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-gray-50/80 border-gray-200/60 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm"
                />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats badges */}
        {!loading && students.length > 0 && (
          <div
            className="flex flex-wrap gap-2 fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {Array.from(new Set(students.map((s) => s.class)))
              .sort((a, b) => Number(a) - Number(b))
              .map((cls) => {
                const count = students.filter((s) => s.class === cls).length;
                const isActive = filterClass === cls;
                return (
                  <Badge
                    key={cls}
                    variant={isActive ? "default" : "secondary"}
                    className={`cursor-pointer transition-all text-xs font-semibold ${
                      isActive
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                    onClick={() =>
                      setFilterClass(filterClass === cls ? "all" : cls)
                    }
                  >
                    Class {cls}: {count}
                  </Badge>
                );
              })}
          </div>
        )}

        {/* Table */}
        <Card
          className="border-gray-100/80 shadow-sm overflow-hidden fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Parent Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="empty-state py-16">
                      <div className="icon-container">
                        <Users />
                      </div>
                      <p className="text-gray-600 font-semibold text-base">
                        {students.length === 0
                          ? "No students yet"
                          : "No students match your search"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {students.length === 0
                          ? "Add your first student to get started!"
                          : "Try adjusting your filters."}
                      </p>
                      {students.length === 0 && (
                        <Button
                          size="sm"
                          className="mt-4 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                          onClick={() => {
                            setFormData(emptyForm);
                            setAddOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add First Student
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-mono text-xs text-gray-400 font-semibold">
                      {student.rollNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback
                            className={`text-[10px] font-bold text-white bg-linear-to-br ${getAvatarColor(student.name)}`}
                          >
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-900 text-sm">
                          {student.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-indigo-600 border-indigo-200 bg-indigo-50/50 text-xs font-semibold"
                      >
                        {student.class}-{student.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {student.gender || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">
                      {student.parentPhone || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              onClick={() =>
                                navigate(`/attendance/history/${student.id}`)
                              }
                            >
                              <CalendarDays className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Attendance History</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              onClick={() => openEdit(student)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Student</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={() => setDeleteStudent(student)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Student</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={!!editStudent}
          onOpenChange={(o) => !o && setEditStudent(null)}
        >
          <DialogContent className="sm:max-w-xl rounded-2xl p-0 gap-0 overflow-hidden border-slate-200 bg-white">
            {/* Header with white background */}
            <div className="bg-white px-6 py-5 border-b border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Edit2
                      className="w-5 h-5 text-blue-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  Edit Student
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-sm mt-2">
                  Update the student information and save your changes.
                </DialogDescription>
              </DialogHeader>
            </div>
            {/* Form content */}
            <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <StudentForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleEdit}
                title="Save Changes"
                saving={saving}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteStudent}
          onOpenChange={(o) => !o && setDeleteStudent(null)}
        >
          <AlertDialogContent className="rounded-2xl border-slate-200 p-0 gap-0 overflow-hidden max-w-md">
            <div className="p-6 pb-4">
              <AlertDialogHeader className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center ring-8 ring-red-50">
                  <AlertTriangle
                    className="w-8 h-8 text-red-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="text-center space-y-2">
                  <AlertDialogTitle className="text-xl font-bold text-slate-900">
                    Delete Student?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                    You are about to permanently remove{" "}
                    <span className="font-semibold text-slate-900">
                      {deleteStudent?.name}
                    </span>{" "}
                    (Roll: {deleteStudent?.rollNo}) from Class{" "}
                    {deleteStudent?.class}-{deleteStudent?.section}.
                    <br />
                    <br />
                    All attendance records and data associated with this student
                    will be permanently deleted.
                    <span className="font-semibold text-red-600">
                      {" "}
                      This action cannot be undone.
                    </span>
                  </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-2">
              <AlertDialogCancel className="rounded-xl h-11 font-semibold border-slate-300 hover:bg-slate-100 sm:w-32">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl h-11 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 sm:w-40"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Student
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
