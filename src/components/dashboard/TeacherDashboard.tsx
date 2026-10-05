import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, FileText, LogOut, Plus, ClipboardList, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateCourseDialog from "@/components/courses/CreateCourseDialog";
import CreateAssignmentDialog from "@/components/assignments/CreateAssignmentDialog";
import TeacherCourseCard from "@/components/courses/TeacherCourseCard";
import SubmissionCard from "@/components/submissions/SubmissionCard";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  teacher_id: string;
}

interface TeacherAssignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  courses?: { title: string };
}

interface Submission {
  id: string;
  content: string;
  file_url: string | null;
  submitted_at: string;
  assignment_id: string;
  student_id: string;
  assignments?: { title: string; courses?: { title: string } };
  profiles?: { full_name: string };
  grades?: { grade: number; feedback: string }[];
}

const TeacherDashboard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userName, setUserName] = useState("");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchCourses();
    fetchTeacherAssignments();
    fetchSubmissions();

    // Set up realtime for courses
    const coursesChannel = supabase
      .channel("teacher-courses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => {
        fetchCourses();
        fetchTeacherAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
    };
  }, [userId]);

  const fetchUserProfile = async () => {
    const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
    if (data) setUserName(data.full_name);
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });
    if (data) {
      setCourses(data);
    }
  };

  const fetchTeacherAssignments = async () => {
    const { data: teacherCourses } = await supabase
      .from("courses")
      .select("id")
      .eq("teacher_id", userId);

    if (!teacherCourses || teacherCourses.length === 0) {
      setAssignments([]);
      return;
    }

    const courseIds = teacherCourses.map((c) => c.id);
    const { data } = await supabase
      .from("assignments")
      .select("*, courses(title)")
      .in("course_id", courseIds)
      .order("due_date", { ascending: true });

    if (data) setAssignments(data as any);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*, assignments(title, courses(title)), profiles(full_name), grades(grade, feedback)")
      .order("submitted_at", { ascending: false });
    if (data) setSubmissions(data as any);
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message || "Failed to delete assignment");
    } else {
      toast.success("Assignment deleted successfully!");
      fetchTeacherAssignments();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EduLearn</h1>
              <p className="text-sm text-muted-foreground">Welcome, {userName || "Teacher"}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1">Teacher</Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              My Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Assignments ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="w-4 h-4" />
              Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Manage your courses and student assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCreateCourse(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateAssignment(true)}
                      disabled={courses.length === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <TeacherCourseCard
                      key={course.id}
                      course={course}
                      onUpdate={() => {
                        fetchCourses();
                        fetchTeacherAssignments();
                      }}
                    />
                  ))}
                  {courses.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      You haven't created any courses yet. Click "Create Course" to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Assignments</CardTitle>
                    <CardDescription>View and manage assignments created for your courses</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowCreateAssignment(true)}
                    disabled={courses.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-card transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{assignment.courses?.title || "Course"}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </Card>
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      {courses.length === 0
                        ? "Create a course first before adding assignments."
                        : "You haven't created any assignments yet."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>Review and grade student work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} onUpdate={fetchSubmissions} />
                  ))}
                  {submissions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <CreateCourseDialog
        open={showCreateCourse}
        onOpenChange={setShowCreateCourse}
        teacherId={userId}
        onSuccess={() => {
          fetchCourses();
          fetchTeacherAssignments();
        }}
      />
      <CreateAssignmentDialog
        open={showCreateAssignment}
        onOpenChange={setShowCreateAssignment}
        courses={courses}
        onSuccess={fetchTeacherAssignments}
      />
    </div>
  );
};

export default TeacherDashboard;
