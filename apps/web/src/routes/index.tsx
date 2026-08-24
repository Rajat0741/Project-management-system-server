import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SparklesCore } from "@/components/ui/sparkles";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WobbleCard } from "@/components/ui/wobble-card";
import { motion } from "motion/react";
import {
  FolderKanban,
  ListChecks,
  Users,
  ShieldCheck,
  Paperclip,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const flipWords = ["projects", "tasks", "teams", "workflows"];

  return (
    <div className="w-full overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] bg-black overflow-hidden">
        {/* Sparkles background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-black mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-neutral-300">
              Project management, simplified
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl md:text-9xl font-bold text-white tracking-tight"
          >
            Tasky
          </motion.h1>

          {/* Sparkles line under the title */}
          <div className="w-[20rem] md:w-160 h-10 relative -mt-4">
            <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-linear-to-r from-transparent via-indigo-500 to-transparent h-0.5 w-3/4 blur-sm" />
            <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-linear-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-30 md:inset-x-60 top-0 bg-linear-to-r from-transparent via-sky-500 to-transparent h-1.25 w-1/4 blur-sm" />
            <div className="absolute inset-x-30 md:inset-x-60 top-0 bg-linear-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>

          {/* Subtitle with flip words */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-2xl text-neutral-400 text-center max-w-2xl"
          >
            <span>The smarter way to manage your</span>
            <FlipWords words={flipWords} className="text-white font-semibold" />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-4"
          >
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="bg-black text-white flex items-center gap-2 px-6 py-3 text-base font-medium"
              onClick={() => navigate({ to: "/login" })}
            >
              <LayoutDashboard className="size-4" />
              Get Started
              <ArrowRight className="size-4" />
            </HoverBorderGradient>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-neutral-500">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border-2 border-neutral-600 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 rounded-full bg-neutral-400"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      <Separator />

      {/* ===== FEATURES INTRO ===== */}
      <section className="bg-neutral-950 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-indigo-400 tracking-wider uppercase">
              Why Tasky?
            </span>
          </motion.div>
          <TextGenerateEffect
            words="Everything you need to manage projects, track tasks, and collaborate with your team — all in one place."
            className="mt-4 text-center"
            duration={0.3}
          />
        </div>
      </section>

      {/* ===== WOBBLE CARDS FEATURES ===== */}
      <section className="bg-neutral-950 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1 - Project Management (Wide) */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 bg-indigo-800 min-h-[300px]"
            className=""
          >
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <FolderKanban className="size-6 text-white" />
                </div>
                <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-tight text-white">
                  Project Management
                </h2>
              </div>
              <p className="text-left text-base text-neutral-200">
                Create and organize projects with ease. Set descriptions, manage
                deadlines, and keep everything structured. Your projects, your
                way.
              </p>
            </div>
            <div className="absolute -right-4 lg:-right-[10%] -bottom-10 hidden md:block">
              <FolderKanban className="size-48 text-white/5" strokeWidth={0.5} />
            </div>
          </WobbleCard>

          {/* Card 2 - Task Tracking */}
          <WobbleCard containerClassName="col-span-1 bg-pink-800 min-h-[300px]">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <ListChecks className="size-6 text-white" />
                </div>
                <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-tight text-white">
                  Task Tracking
                </h2>
              </div>
              <p className="text-left text-base text-neutral-200">
                Track tasks with statuses like To-Do, In Progress, and Done.
                Break them down with subtasks and never lose sight of progress.
              </p>
            </div>
          </WobbleCard>

          {/* Card 3 - Team Collaboration */}
          <WobbleCard containerClassName="col-span-1 bg-emerald-800 min-h-[300px]">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Users className="size-6 text-white" />
                </div>
                <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-tight text-white">
                  Team Collaboration
                </h2>
              </div>
              <p className="text-left text-base text-neutral-200">
                Invite team members, assign roles, and work together seamlessly.
                Everyone stays in sync with real-time project updates.
              </p>
            </div>
          </WobbleCard>

          {/* Card 4 - Role-based Access (Wide) */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 bg-violet-900 min-h-[300px]"
            className=""
          >
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <ShieldCheck className="size-6 text-white" />
                </div>
                <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-tight text-white">
                  Role-Based Access Control
                </h2>
              </div>
              <p className="text-left text-base text-neutral-200">
                Admins can manage settings, members, and tasks. Members can view
                and collaborate. Fine-grained permissions keep your project
                secure and organized.
              </p>
            </div>
            <div className="absolute -right-4 lg:-right-[10%] -bottom-10 hidden md:block">
              <ShieldCheck
                className="size-48 text-white/5"
                strokeWidth={0.5}
              />
            </div>
          </WobbleCard>
        </div>
      </section>

      <Separator />

      {/* ===== MORE FEATURES LIST ===== */}
      <section className="bg-neutral-950 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-indigo-400 tracking-wider uppercase">
              Packed with features
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-white">
              Everything you need, nothing you don&apos;t
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FolderKanban,
                title: "Project Dashboard",
                description:
                  "View all your projects at a glance with search, filters, and sorting options.",
              },
              {
                icon: ListChecks,
                title: "Subtasks & Checklists",
                description:
                  "Break down complex tasks into manageable subtasks with toggle completion.",
              },
              {
                icon: Users,
                title: "Member Management",
                description:
                  "Add members by email, promote to admin, or remove them — all from one place.",
              },
              {
                icon: Paperclip,
                title: "File Attachments",
                description:
                  "Attach files to tasks and download them with a single click. Bulk downloads supported.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Authentication",
                description:
                  "Email verification, password reset, and secure session management built-in.",
              },
              {
                icon: LayoutDashboard,
                title: "Clean Interface",
                description:
                  "A minimal, intuitive design with dark mode support. Focus on what matters.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ===== FEATURE BULLETS ===== */}
      <section className="bg-neutral-950 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              Built for teams who ship
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Create unlimited projects",
              "Assign tasks to team members",
              "Track progress with subtasks",
              "Upload & download attachments",
              "Admin & member role system",
              "Email verification & security",
              "Dark mode support",
              "Search, filter & sort projects",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/2 border border-white/5"
              >
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <span className="text-neutral-300 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ===== FOOTER ===== */}
      <footer className="bg-black border-t border-white/5 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black flex size-8 items-center justify-center rounded-lg">
              <ListChecks className="size-5" />
            </div>
            <span className="text-xl font-bold text-white">Tasky</span>
          </div>
          <p className="text-neutral-500 text-sm text-center">
            Manage projects. Track tasks. Collaborate with your team.
          </p>
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => navigate({ to: "/login" })}
              className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate({ to: "/register" })}
              className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}