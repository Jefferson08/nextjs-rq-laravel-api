"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { formatDatePPP } from "@/lib/date-format";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { Post } from "@/lib/api/types";

// Schema de validação baseado nas regras do PostController
const postSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required"),
  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author must be less than 100 characters"),
  status: z.enum(["draft", "published", "archived"]),
  published_at: z.date().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface UpsertPostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null;
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UpsertPost({
  open,
  onOpenChange,
  post,
  onSubmit,
  isLoading = false,
}: UpsertPostProps) {
  const isEditing = Boolean(post);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      author: "",
      status: "draft",
      published_at: undefined,
    },
  });

  // Reset form quando o modal abrir/fechar ou quando o post mudar
  useEffect(() => {
    if (open) {
      if (isEditing && post) {
        form.reset({
          title: post.title,
          content: post.content,
          author: post.author,
          status: post.status as "draft" | "published" | "archived",
          published_at: post.published_at
            ? new Date(post.published_at)
            : undefined,
        });
      } else {
        form.reset({
          title: "",
          content: "",
          author: "",
          status: "draft",
          published_at: undefined,
        });
      }
    }
  }, [open, isEditing, post, form]);

  const handleSubmit = async (data: PostFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // Error handling will be managed by the parent component
      console.error("Error submitting post:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Post" : "Create New Post"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to the post and click save when you're done."
              : "Fill in the details below to create a new post."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Published At */}
            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => {
                const handleDateSelect = (selectedDate: Date | undefined) => {
                  if (!selectedDate) {
                    field.onChange(undefined);
                    return;
                  }

                  // Se já existe uma data, preservar o horário
                  if (field.value) {
                    const currentTime = field.value;
                    selectedDate.setHours(
                      currentTime.getHours(),
                      currentTime.getMinutes(),
                      currentTime.getSeconds(),
                      currentTime.getMilliseconds()
                    );
                  } else {
                    // Se não existe data, usar horário atual
                    const now = new Date();
                    selectedDate.setHours(
                      now.getHours(),
                      now.getMinutes(),
                      0,
                      0
                    );
                  }
                  
                  field.onChange(selectedDate);
                };

                const handleTimeChange = (timeString: string) => {
                  if (!field.value) {
                    // Se não há data selecionada, usar hoje com o horário escolhido
                    const today = new Date();
                    const [hours, minutes] = timeString.split(':').map(Number);
                    today.setHours(hours, minutes, 0, 0);
                    field.onChange(today);
                    return;
                  }

                  const newDate = new Date(field.value);
                  const [hours, minutes] = timeString.split(':').map(Number);
                  newDate.setHours(hours, minutes, 0, 0);
                  field.onChange(newDate);
                };

                const formatTime = (date: Date) => {
                  return date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                };

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Published Date & Time (Optional)</FormLabel>
                    
                    {/* Data Selector */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              <span>
                                {formatDatePPP(field.value)} às {formatTime(field.value)}
                              </span>
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleDateSelect}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Time Selector - só aparece se uma data foi selecionada */}
                    {field.value && (
                      <div className="flex items-center gap-2 mt-2">
                        <IconClock className="h-4 w-4 opacity-50" />
                        <Input
                          type="time"
                          value={formatTime(field.value)}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const now = new Date();
                            handleTimeChange(formatTime(now));
                          }}
                        >
                          Agora
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(undefined)}
                        >
                          Limpar
                        </Button>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Post"
                    : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
