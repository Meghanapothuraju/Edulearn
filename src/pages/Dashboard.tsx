import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (data?.role) {
          setUserRole(data.role);
        } else {
          // If profile hasn't been created yet by trigger, fallback to metadata
          const metaRole = (session.user.user_metadata?.role as "student" | "teacher") || "student";
          setUserRole(metaRole);

          // Ensure profile row exists in database
          await supabase.from("profiles").upsert({
            id: session.user.id,
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            role: metaRole,
          });
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        const metaRole = (session.user.user_metadata?.role as "student" | "teacher") || "student";
        setUserRole(metaRole);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserRole();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return userRole === "student" ? (
    <StudentDashboard userId={session!.user.id} />
  ) : (
    <TeacherDashboard userId={session!.user.id} />
  );
};

export default Dashboard;
