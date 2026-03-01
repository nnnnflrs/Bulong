"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm text-bulong-300">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg text-sm resize-none
            bg-bulong-800 border border-bulong-600
            text-white placeholder-bulong-500
            focus:outline-none focus:border-bulong-400 focus:ring-1 focus:ring-bulong-400
            transition-colors duration-150
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
