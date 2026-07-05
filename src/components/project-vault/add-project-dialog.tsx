
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from '@/context/user-context';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectDialog({ children, open, onOpenChange }: AddProjectDialogProps) {
  const { addProject } = useUser();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
      });
    }
  }, [open, reset]);


  const onSubmit = (data: ProjectFormData) => {
    try {
        addProject(data);
        toast({ title: "Project Added!", description: "Your new project has been added to the vault." });
        onOpenChange(false);
    } catch (error) {
         toast({ title: "An error occurred.", description: "Could not save the project. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <PlusCircle />
            Add New Project
          </DialogTitle>
          <DialogDescription>
            Define a new long-term goal or campaign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., 'Launch Health Coaching Biz'" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="A brief summary of your project's objectives."/>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
          
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
