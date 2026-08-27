import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  type?: string;
  containerClassName?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  iconClassName?: string;
  clearButtonClassName?: string;
  icon?: React.ReactNode;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      onChange,
      onClear,
      showClearButton = true,
      iconClassName,
      clearButtonClassName,
      icon,
      type = "text",
      ...props
    },
    ref
  ) => {
    const internalInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

    const hasValue = Boolean(
      value !== undefined
        ? String(value).length > 0
        : internalInputRef.current?.value && internalInputRef.current.value.length > 0
    );

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...internalInputRef.current, value: "" },
          currentTarget: { ...internalInputRef.current, value: "" },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      if (internalInputRef.current) {
        internalInputRef.current.value = "";
        internalInputRef.current.focus();
      }
    };

    return (
      <div className={cn("relative w-full", containerClassName)}>
        {icon !== undefined ? (
          icon
        ) : (
          <Search
            className={cn(
              "text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2",
              iconClassName
            )}
            aria-hidden="true"
          />
        )}
        <Input
          ref={internalInputRef}
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "pl-10",
            showClearButton && hasValue ? "pr-10" : "pr-3",
            className
          )}
          {...props}
        />
        {showClearButton && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              clearButtonClassName
            )}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
