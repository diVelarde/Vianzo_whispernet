import React from "react";

export function Button ({ children, variant = "default", size = "md", className = "", ...props }) {
  // Tailwind base styles
  let base = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variant styles
  let variantClasses = "";
  switch (variant) {
    case "ghost":
      variantClasses = "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700";
      break;
    case "primary":
      variantClasses = "bg-purple-500 text-white hover:bg-purple-600";
      break;
    default:
      variantClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200";
  }

  // Size styles
  let sizeClasses = "";
  switch (size) {
    case "sm":
      sizeClasses = "px-3 py-1 text-sm";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-lg";
      break;
    default:
      sizeClasses = "px-4 py-2";
  }

  return (
    <button className={`${base} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
