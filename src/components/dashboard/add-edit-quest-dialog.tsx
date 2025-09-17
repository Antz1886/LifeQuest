
"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from '@/context/user-context';
import { Quest, QuestCategory } from '@/lib/types';
import { PlusCircle, Edit, CalendarIcon } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const questSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  category: z.enum(["Mind", "Strength", "Code", "Wisdom", "Legacy"]),
  xp: z.coerce.number().min(10, "XP must be at least 10.").max(200, "XP cannot exceed 200."),
  time: z.string().min(1, "Time is required."),
  date: z.date({ required_error: "A date is required." }),
});

type QuestFormData = z.infer<typeof questSchema>;

interface AddEditQuestDialogProps {
  quest?: Quest;
  mode: 'add' | 'edit';
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, '0')}:${minute} ${period}`;
});


export function AddEditQuestDialog({ quest, mode, children, open, onOpenChange }: AddEditQuestDialogProps) {
  const { addQuest, editQuest } = useUser();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: quest?.title || '',
      category: quest?.category || 'Mind',
      xp: quest?.xp || 50,
      time: quest?.time || '09:00 AM',
      date: quest ? new Date(quest.date) : new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      reset(quest ? {
        title: quest.title,
        category: quest.category,
        xp: quest.xp,
        time: quest.time,
        date: new Date(quest.date),
      } : {
        title: '',
        category: 'Mind',
        xp: 50,
        time: '09:00 AM',
        date: new Date(),
      });
    }
  }, [open, quest, reset]);


  const onSubmit = (data: QuestFormData) => {
    const questData = {
        ...data,
        date: formatISO(data.date, { representation: 'date' }),
    };

    if (mode === 'edit' && quest) {
        editQuest({ ...quest, ...questData });
    } else {
        addQuest(questData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            {mode === 'add' ? <PlusCircle /> : <Edit />}
            {mode === 'add' ? 'Add New Quest' : 'Edit Quest'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Forge a new task for your journey.' : 'Refine the details of your quest.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['Mind', 'Strength', 'Code', 'Wisdom', 'Legacy'] as QuestCategory[]).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>
            
          <div>
            <Label>Date</Label>
            <Controller
                name="date"
                control={control}
                render={({ field }) => (
                     <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    if(date) field.onChange(date)
                                    setIsCalendarOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
             {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="xp">XP</Label>
              <Input id="xp" type="number" {...register('xp')} />
              {errors.xp && <p className="text-red-500 text-sm mt-1">{errors.xp.message}</p>}
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
               <Controller
                name="time"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="time">
                        <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-72">
                        {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                    </Select>
                )}
                />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
            </div>
          </div>
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Quest</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
