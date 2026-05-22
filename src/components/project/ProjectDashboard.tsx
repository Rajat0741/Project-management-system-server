import { useState, useMemo } from "react";
import { ProjectRow } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import type { ProjectListItem } from "@/types";
import { FolderOpen, Search, X, SlidersHorizontal, Plus, ShieldCheck, User as UserIcon } from "lucide-react";
import { useUserStore } from "@/store/userData";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { CreateProjectSchema, type CreateProjectData } from "@/schemas/project.schema";
import { useCreateProject } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/types";

type FilterRole = UserRole | "all";
type SortOrder = "newest" | "oldest" | "name-asc" | "name-desc";

interface ProjectDashboardProps {
  projects: ProjectListItem[];
}

export function ProjectDashboard({ projects = [] }: ProjectDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { userData } = useUserStore();

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // 1. Filter by Role
    if (filterRole !== "all") {
      result = result.filter((p) => p.role === filterRole);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.projects.name.toLowerCase().includes(query));
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.projects.createdAt).getTime() - new Date(a.projects.createdAt).getTime();
        case "oldest":
          return new Date(a.projects.createdAt).getTime() - new Date(b.projects.createdAt).getTime();
        case "name-asc":
          return a.projects.name.localeCompare(b.projects.name);
        case "name-desc":
          return b.projects.name.localeCompare(a.projects.name);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, filterRole, searchQuery, sortOrder]);

  const activeFilterCount = (filterRole !== "all" ? 1 : 0) + (sortOrder !== "newest" ? 1 : 0);

  const totalProjects = projects.length;
  const adminCount = projects.filter((p) => p.role === "admin").length;
  const memberCount = projects.filter((p) => p.role === "member").length;
  const firstName = userData?.fullName?.split(" ")[0] || "there";

  return (
    <main className="mx-auto max-w-400 px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="meta-text mt-1">
          You have {totalProjects} project{totalProjects !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Projects", value: totalProjects, icon: FolderOpen },
          { label: "Admin", value: adminCount, icon: ShieldCheck },
          { label: "Member", value: memberCount, icon: UserIcon },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="stat-value text-lg">{stat.value}</p>
              <p className="meta-text">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col  sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left: Search */}
        <ProjectSearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Right: Actions (Filters & View) */}
        <div className="flex items-center gap-2">
          <ProjectFiltersSection
            filterRole={filterRole}
            sortOrder={sortOrder}
            activeFilterCount={activeFilterCount}
            onFilterRoleChange={setFilterRole}
            onSortOrderChange={setSortOrder}
            onResetFilters={() => {
              setFilterRole("all");
              setSortOrder("newest");
            }}
          />
          <CreateProjectFormSection />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="rounded-xl border divide-y">
          {filteredProjects.map((item, index) => (
            <ProjectRow key={item.projects._id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-muted">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <FolderOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">No projects found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            There are no projects matching your current filter.
          </p>
          <Button onClick={() => setFilterRole("all")}>View all projects</Button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">
          Showing {filteredProjects.length} of {totalProjects} projects
        </p>
      </div>
    </main>
  );
}

// --- Sub-components ---

interface ProjectSearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ProjectSearchSection({ searchQuery, onSearchChange }: ProjectSearchSectionProps) {
  return (
    <div className="relative flex-1 max-w-md p-2">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <Input
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 pr-9 bg-white dark:bg-transparent w-full"
      />
      {searchQuery && (
        <Button
          onClick={() => onSearchChange("")}
          className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 p-0 text-slate-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-transparent hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface ProjectFiltersSectionProps {
  filterRole: FilterRole;
  sortOrder: SortOrder;
  activeFilterCount: number;
  onFilterRoleChange: (role: FilterRole) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onResetFilters: () => void;
}

function ProjectFiltersSection({
  filterRole,
  sortOrder,
  activeFilterCount,
  onFilterRoleChange,
  onSortOrderChange,
  onResetFilters,
}: ProjectFiltersSectionProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-10 px-3 bg-white dark:bg-neutral-700 dark:hover:bg-neutral-800 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 rounded-sm px-1 font-normal h-5 min-w-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-4 " align="end">
        <div className="space-y-4">
          {/* Sort Section */}
          <div className="space-y-2">
            <h4 className="font-medium text-xs text-muted-foreground">sort</h4>
            <ToggleGroup
              value={[sortOrder]}
              onValueChange={(value: string[]) => {
                if (value.length > 0) onSortOrderChange(value[0] as SortOrder);
              }}
              className="justify-start flex-wrap gap-2"
            >
              <ToggleGroupItem value="newest" size="sm" variant="outline" className="h-8">
                Newest
              </ToggleGroupItem>
              <ToggleGroupItem value="oldest" size="sm" variant="outline" className="h-8">
                Oldest
              </ToggleGroupItem>
              <ToggleGroupItem value="name-asc" size="sm" variant="outline" className="h-8">
                A-Z
              </ToggleGroupItem>
              <ToggleGroupItem value="name-desc" size="sm" variant="outline" className="h-8">
                Z-A
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Role Section */}
          <div className="space-y-2">
            <h4 className="font-medium text-xs text-muted-foreground">role</h4>
            <ToggleGroup
              value={[filterRole]}
              onValueChange={(value: string[]) => {
                if (value.length > 0) onFilterRoleChange(value[0] as FilterRole);
              }}
              className="justify-start gap-2"
            >
              <ToggleGroupItem value="all" size="sm" variant="outline" className="h-8">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="admin" size="sm" variant="outline" className="h-8">
                Admin
              </ToggleGroupItem>
              <ToggleGroupItem value="member" size="sm" variant="outline" className="h-8">
                Member
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {(filterRole !== "all" || sortOrder !== "newest") && (
            <>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 text-sm"
                onClick={onResetFilters}
              >
                Reset Filters
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CreateProjectFormSection() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectData>({
    resolver: zodResolver(CreateProjectSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createProjectMutation = useCreateProject();

  const handleFormSubmit = (data: CreateProjectData) => {
    createProjectMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" className="bg-white dark:bg-neutral-700 dark:hover:bg-neutral-800">
            <Plus className="h-4 w-4 " />
            New Project
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm bg-muted ">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill out the details for your new project. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" placeholder="My Project" required {...register("name")} />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input id="description" placeholder="Project description (optional)" {...register("description")} />
              <FieldError errors={errors.description ? [errors.description] : []} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
