import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MouseGlow from "@/components/MouseGlow";
import { User, GraduationCap, BookOpen } from "lucide-react";

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const educationSystems = ["CBSE", "ICSE", "IB", "IGCSE", "State Board", "Cambridge", "AP", "Other"];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher" | "">("");
  const [educationSystem, setEducationSystem] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!age || !grade || !userType) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const isGuest = localStorage.getItem("membrance_guest") === "true";

    if (isGuest) {
      localStorage.setItem("membrance_profile", JSON.stringify({ age, grade, userType, educationSystem }));
      navigate("/dashboard");
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from("profiles").update({
            age: parseInt(age),
            grade,
            user_type: userType,
            education_system: educationSystem || null,
          }).eq("user_id", user.id);
          if (error) throw error;
        }
        navigate("/dashboard");
      } catch (err: any) {
        toast.error(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <MouseGlow />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-10 w-full max-w-lg glow-box relative z-10"
      >
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Tell us about yourself</h2>
        <p className="text-muted-foreground text-sm mb-8">Step {step} of 2 — {step === 1 ? "Personal Info" : "Education System"}</p>

        {step === 1 && (
          <div className="space-y-6">
            {/* Age */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">How old are you?</label>
              <input
                type="number" min={5} max={100} value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">What grade are you in?</label>
              <div className="grid grid-cols-4 gap-2">
                {grades.map((g) => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      grade === g ? "bg-primary/20 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/30"
                    }`}>{g}</button>
                ))}
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "student" as const, label: "Student", icon: GraduationCap },
                  { value: "teacher" as const, label: "Teacher", icon: User },
                ].map((t) => (
                  <button key={t.value} onClick={() => setUserType(t.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                      userType === t.value ? "bg-primary/15 text-primary neon-border-active glow-box" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
                    }`}>
                    <t.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { if (!age || !grade || !userType) { toast.error("Please fill all fields"); return; } setStep(2); }}
              disabled={!age || !grade || !userType}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors glow-box-strong disabled:opacity-50 mt-4"
            >Next</motion.button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Education System */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> What institution is your school run by?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {educationSystems.map((sys) => (
                  <button key={sys} onClick={() => setEducationSystem(sys)}
                    className={`py-2.5 rounded-lg text-xs font-medium transition-all ${
                      educationSystem === sys ? "bg-primary/20 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/30"
                    }`}>{sys}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-border/50 text-muted-foreground hover:text-foreground py-3 rounded-xl transition-all text-sm">
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors glow-box-strong disabled:opacity-50"
              >{loading ? "Saving..." : "Get Started"}</motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
