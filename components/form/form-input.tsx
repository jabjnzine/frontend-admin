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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FormInput({
  control,
  name,
  label,
  placeholder,
  type = "text",
  description,
  icon,
  className,
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel className="text-slate-700 font-medium">{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {icon}
                </div>
              )}
              <Input
                type={type}
                placeholder={placeholder}
                className={cn(
                  "transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  icon && "pl-10"
                )}
                {...field}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="text-red-600" />
        </FormItem>
      )}
    />
  );
}
