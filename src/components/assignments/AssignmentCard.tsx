import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import SubmitAssignmentDialog from "./SubmitAssignmentDialog";
import { supabase } from "@/integrations/supabase/client";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  courses?: { title: string };
}

interface AssignmentCardProps {
  assignment: Assignment;
  userId: string;
}

const AssignmentCard = ({ assignment, userId }: AssignmentCardProps) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    checkSubmission();
  }, [assignment.id, userId]);

  const checkSubmission = async () => {
    const { data: submission } = await supabase
      .from("submissions")
      .select("id, grades(grade, feedback)")
      .eq("assignment_id", assignment.id)
      .eq("student_id", userId)
      .maybeSingle();

    if (submission) {
      setHasSubmitted(true);
      const grades = submission.grades as any;
      if (grades && Array.isArray(grades) && grades.length > 0) {
        setGrade(grades[0].grade);
        setFeedback(grades[0].feedback || null);
      }
    }
  };

  const isOverdue = new Date(assignment.due_date) < new Date();

  return (
    <>
      <Card className="hover:shadow-card transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{assignment.courses?.title}</span>
              </div>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
            </div>
            {hasSubmitted && (
              <Badge variant={grade !== null ? "default" : "secondary"} className="ml-2">
                {grade !== null ? `Grade: ${grade}%` : "Submitted"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{assignment.description}</p>
          {feedback && (
            <div className="mb-4 p-3 bg-muted/60 rounded-lg text-sm border border-border/50">
              <span className="font-medium text-foreground">Teacher Feedback: </span>
              <span className="text-muted-foreground">{feedback}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className={isOverdue && !hasSubmitted ? "text-destructive font-medium" : "text-muted-foreground"}>
                Due: {format(new Date(assignment.due_date), "MMM dd, yyyy")}
              </span>
            </div>
            {!hasSubmitted ? (
              <Button size="sm" onClick={() => setShowSubmit(true)} disabled={isOverdue}>
                {isOverdue ? "Overdue" : "Submit"}
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Submitted</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SubmitAssignmentDialog
        open={showSubmit}
        onOpenChange={setShowSubmit}
        assignment={assignment}
        userId={userId}
        onSuccess={() => {
          checkSubmission();
          setShowSubmit(false);
        }}
      />
    </>
  );
};

export default AssignmentCard;
