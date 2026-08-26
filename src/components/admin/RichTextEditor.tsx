"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FC,
  MouseEvent,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Code,
  Eye,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write product description...",
  className,
  minHeight = "160px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync value into contentEditable when value prop changes from outside (e.g. initial load or reset)
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isSourceMode]);

  const updateActiveFormats = useCallback(() => {
    if (typeof document === "undefined" || isSourceMode) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    } catch {
      // ignore
    }
  }, [isSourceMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // If editor contains only empty paragraph or break, treat as empty
      const clean =
        html === "<p><br></p>" || html === "<br>" || html.trim() === ""
          ? ""
          : html;
      onChange(clean);
      updateActiveFormats();
    }
  };

  const executeCommand = (
    command: string,
    val: string | undefined = undefined,
    e?: MouseEvent,
  ) => {
    if (e) e.preventDefault();
    if (isSourceMode) return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (command === "createLink") {
      const url = window.prompt("Enter URL:", "https://");
      if (url && url !== "https://") {
        document.execCommand(command, false, url);
      }
    } else if (command === "formatBlock") {
      document.execCommand(command, false, `<${val}>`);
    } else {
      document.execCommand(command, false, val);
    }

    handleInput();
  };

  return (
    <div
      className={cn(
        "border-input bg-background overflow-hidden rounded-md border text-sm shadow-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-colors",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="bg-muted/40 border-border flex flex-wrap items-center gap-0.5 border-b p-1.5">
        <ToolbarButton
          icon={<Bold className="size-3.5" />}
          label="Bold"
          active={activeFormats.bold}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("bold", undefined, e)}
        />
        <ToolbarButton
          icon={<Italic className="size-3.5" />}
          label="Italic"
          active={activeFormats.italic}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("italic", undefined, e)}
        />
        <ToolbarButton
          icon={<Underline className="size-3.5" />}
          label="Underline"
          active={activeFormats.underline}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("underline", undefined, e)}
        />
        <ToolbarButton
          icon={<Strikethrough className="size-3.5" />}
          label="Strikethrough"
          active={activeFormats.strikeThrough}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("strikeThrough", undefined, e)}
        />

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          icon={<Pilcrow className="size-3.5" />}
          label="Paragraph"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("formatBlock", "p", e)}
        />
        <ToolbarButton
          icon={<Heading2 className="size-3.5" />}
          label="Heading 2"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("formatBlock", "h2", e)}
        />
        <ToolbarButton
          icon={<Heading3 className="size-3.5" />}
          label="Heading 3"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("formatBlock", "h3", e)}
        />

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          icon={<List className="size-3.5" />}
          label="Bullet List"
          active={activeFormats.insertUnorderedList}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("insertUnorderedList", undefined, e)}
        />
        <ToolbarButton
          icon={<ListOrdered className="size-3.5" />}
          label="Numbered List"
          active={activeFormats.insertOrderedList}
          disabled={isSourceMode}
          onClick={(e) => executeCommand("insertOrderedList", undefined, e)}
        />
        <ToolbarButton
          icon={<Quote className="size-3.5" />}
          label="Quote"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("formatBlock", "blockquote", e)}
        />
        <ToolbarButton
          icon={<Minus className="size-3.5" />}
          label="Horizontal Line"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("insertHorizontalRule", undefined, e)}
        />

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          icon={<LinkIcon className="size-3.5" />}
          label="Add Link"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("createLink", undefined, e)}
        />
        <ToolbarButton
          icon={<Unlink className="size-3.5" />}
          label="Remove Link"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("unlink", undefined, e)}
        />
        <ToolbarButton
          icon={<RemoveFormatting className="size-3.5" />}
          label="Clear Formatting"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("removeFormat", undefined, e)}
        />

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          icon={<RotateCcw className="size-3.5" />}
          label="Undo"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("undo", undefined, e)}
        />
        <ToolbarButton
          icon={<RotateCw className="size-3.5" />}
          label="Redo"
          disabled={isSourceMode}
          onClick={(e) => executeCommand("redo", undefined, e)}
        />

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-background/80 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
              isSourceMode && "bg-background text-foreground shadow-2xs font-semibold",
            )}
            title={isSourceMode ? "Switch to Visual Editor" : "Switch to HTML Source"}
          >
            {isSourceMode ? (
              <>
                <Eye className="size-3" />
                <span>Visual</span>
              </>
            ) : (
              <>
                <Code className="size-3" />
                <span>HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isSourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="font-mono text-xs w-full resize-y bg-transparent p-3 outline-none focus:outline-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className={cn(
            "p-3 outline-none focus:outline-none",
            "prose prose-sm dark:prose-invert max-w-none",
            "[&_p]:my-1.5 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-2.5 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold",
            "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2",
            "[&_a]:text-primary [&_a]:underline [&_hr]:my-3 [&_hr]:border-border",
            "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none empty:before:block",
          )}
        />
      )}
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: (e: MouseEvent) => void;
}

function ToolbarButton({
  icon,
  label,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-background/80 inline-flex size-7 items-center justify-center rounded transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40",
        active && "bg-background text-foreground shadow-2xs font-bold",
      )}
    >
      {icon}
    </button>
  );
}
