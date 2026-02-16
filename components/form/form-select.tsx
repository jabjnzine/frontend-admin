"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
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
} from "@/components/ui/select-radix";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export function FormSelect({
  control,
  name,
  label,
  placeholder,
  description,
  options,
  className,
}: FormSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && (
            <FormLabel className="text-slate-700 font-semibold text-sm leading-none">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative group">
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder || "เลือก..."} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Focus indicator line */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg opacity-0 scale-x-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:opacity-100 group-focus-within:scale-x-100 motion-reduce:transition-none pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-slate-500 mt-1.5">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-red-600 text-xs font-medium mt-1.5" />
        </FormItem>
      )}
    />
  );
}
