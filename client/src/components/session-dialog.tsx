import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSessionSchema, type InsertSession } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Literature",
  "Language",
  "Art",
  "Music",
  "Other",
];

export function SessionDialog({ open, onOpenChange }: SessionDialogProps) {
  const { toast } = useToast();

  const form = useForm<InsertSession>({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      subject: "",
      duration: 30,
      date: new Date(),
      notes: "",
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: InsertSession) => {
      return await apiRequest("POST", "/api/sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Session logged successfully",
        description: "Your study session has been recorded.",
      });
      form.reset({
        subject: "",
        duration: 30,
        date: new Date(),
        notes: "",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSession) => {
    const payload: InsertSession = {
      ...data,
      duration: Number(data.duration),
      date: data.date instanceof Date ? data.date : new Date(data.date),
    };
    createSessionMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Study Session</DialogTitle>
          <DialogDescription>
            Record your study session details to track your learning progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem
                          key={subject}
                          value={subject}
                          data-testid={`select-option-${subject.toLowerCase()}`}
                        >
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="30"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || val === null || val === undefined) {
                            field.onChange(undefined);
                          } else {
                            const num = Number(val);
                            field.onChange(isNaN(num) ? undefined : num);
                          }
                        }}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="justify-start gap-2 font-normal"
                            data-testid="button-date-picker"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you study? Any key takeaways?"
                      className="min-h-[100px] resize-none"
                      {...field}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createSessionMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSessionMutation.isPending}
                data-testid="button-submit-session"
              >
                {createSessionMutation.isPending
                  ? "Logging..."
                  : "Log Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
