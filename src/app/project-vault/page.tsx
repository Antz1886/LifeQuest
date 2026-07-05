
"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, PlusCircle, Check, Circle, Trash2 } from "lucide-react";
import { AddProjectDialog } from "@/components/project-vault/add-project-dialog";
import { useUser } from "@/context/user-context";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AddTaskForm({ projectId }: { projectId: string }) {
    const [taskText, setTaskText] = useState("");
    const { addProjectTask } = useUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskText.trim()) return;
        addProjectTask(projectId, taskText);
        setTaskText("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input
                placeholder="Add a new task..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="flex-grow"
            />
            <Button type="submit" size="sm">Add</Button>
        </form>
    );
}

function ProjectVaultContent() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { projects, toggleProjectTask, deleteProjectTask } = useUser();
    
    return (
        <main className="p-4 lg:p-6 space-y-6">
            <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Archive className="text-primary"/>
                        Your Projects
                    </CardTitle>
                    <CardDescription>
                        Manage your long-term projects and goals here.
                    </CardDescription>
                </div>
                 {projects.length > 0 && (
                    <AddProjectDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full md:w-auto">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add New Project
                        </Button>
                    </AddProjectDialog>
                 )}
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                            <Archive className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold text-muted-foreground">Your Project Vault is Empty</h3>
                            <p className="text-muted-foreground mt-2 mb-6">Add your first project to get started!</p>
                             <AddProjectDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add New Project
                                </Button>
                            </AddProjectDialog>
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
                                                <div key={task.id} className="flex items-center gap-2 group">
                                                    <div className="flex-grow flex items-center gap-2 cursor-pointer" onClick={() => toggleProjectTask(project.id, task.id)}>
                                                        {task.isCompleted ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
                                                        <span className={`text-sm break-all ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
                                                    </div>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-destructive/80 hover:text-destructive">
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the task: "{task.text}". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteProjectTask(project.id, task.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
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
        <AppShell>
            <AppHeader title="Project Vault" />
            <ProjectVaultContent />
        </AppShell>
  )
}
