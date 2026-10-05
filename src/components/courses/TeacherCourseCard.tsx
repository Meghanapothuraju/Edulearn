import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
}

interface TeacherCourseCardProps {
  course: Course;
  onUpdate: () => void;
}

const TeacherCourseCard = ({ course, onUpdate }: TeacherCourseCardProps) => {
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEnrollmentCount();
  }, [course.id]);

  const fetchEnrollmentCount = async () => {
    const { count } = await supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("course_id", course.id);
    setEnrollmentCount(count || 0);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? All associated assignments and enrollments will also be removed.`)) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) {
      toast.error(error.message || "Failed to delete course");
      setIsDeleting(false);
    } else {
      toast.success("Course deleted successfully!");
      onUpdate();
    }
  };

  return (
    <Card className="hover:shadow-elevated transition-all duration-300 flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <Badge variant="secondary">{course.duration}</Badge>
            </div>
          </div>
          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{enrollmentCount} student{enrollmentCount !== 1 ? "s" : ""} enrolled</span>
          </div>
        </CardContent>
      </div>
      <CardFooter className="pt-0 border-t border-border/40 mt-3 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Course"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeacherCourseCard;
