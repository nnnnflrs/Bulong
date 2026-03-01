"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm text-bulong-300">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg text-sm
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

Input.displayName = "Input";
