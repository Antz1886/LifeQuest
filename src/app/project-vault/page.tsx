
"use client";

import { useState } from "react";
import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, PlusCircle, Check, Circle } from "lucide-react";
import { AddProjectDialog } from "@/components/project-vault/add-project-dialog";
import { useUser } from "@/context/user-context";
import { Progress } from "@/components/ui/progress";

function AddTaskForm({ projectId }: { projectId: string }) {
    const [taskText, setTaskText] = useState("");
    const { addProjectTask } = useUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProjectTask(projectId, taskText);
        setTaskText("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                placeholder="Add a new task..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
            />
            <Button type="submit" size="sm">Add</Button>
        </form>
    );
}

function ProjectVaultContent() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { projects, toggleProjectTask } = useUser();
    
    return (
        <main className="p-4 lg:p-6 space-y-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Archive className="text-primary"/>
                        Your Projects
                    </CardTitle>
                    <CardDescription>
                        Manage your long-term projects and goals here.
                    </CardDescription>
                </div>
                <AddProjectDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New Project
                    </Button>
                </AddProjectDialog>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                            <Archive className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold text-muted-foreground">Your Project Vault is Empty</h3>
                            <p className="text-muted-foreground mt-2">Add your first project to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => {
                            const completedTasks = project.tasks.filter(t => t.isCompleted).length;
                            const totalTasks = project.tasks.length;
                            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                            return (
                                <Card key={project.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="font-headline">{project.title}</CardTitle>
                                        <CardDescription>{project.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                                <span className="text-sm font-medium text-accent">{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2 [&>div]:bg-accent" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Tasks</h4>
                                            {project.tasks.length > 0 ? project.tasks.map(task => (
                                                <div key={task.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleProjectTask(project.id, task.id)}>
                                                    {task.isCompleted ? <Check className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-muted-foreground/50" />}
                                                    <span className={`text-sm ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
                                                </div>
                                            )) : <p className="text-sm text-muted-foreground italic">No tasks yet.</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <AddTaskForm projectId={project.id} />
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </CardContent>
            </Card>
        </main>
    )
}

export default function ProjectVaultPage() {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Project Vault</h1>
            </header>
            <ProjectVaultContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
