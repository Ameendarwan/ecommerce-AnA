"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Code,
  Minus,
  RemoveFormatting,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  className,
  minHeight = "min-h-[300px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync external value with editor content
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    if (typeof window === "undefined" || isHtmlMode) return;
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
  }, [isHtmlMode]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateActiveFormats();
  };

  const execCmd = (command: string, arg?: string) => {
    if (isHtmlMode || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const setHeading = (tag: string) => {
    if (isHtmlMode || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("formatBlock", false, `<${tag}>`);
    handleInput();
  };

  const handleAddLink = () => {
    if (isHtmlMode || !editorRef.current) return;
    const url = prompt("Enter URL (e.g. https://... or /path):");
    if (url) {
      execCmd("createLink", url);
    }
  };

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring bg-background flex flex-col rounded-lg border text-sm transition-colors",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="border-border bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCmd("undo")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCmd("redo")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="size-4" />
        </Button>

        <div className="bg-border mx-1 h-5 w-px" />

        <Button
          type="button"
          variant={activeFormats.bold ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("bold")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.bold && "bg-muted font-bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.italic ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("italic")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.italic && "bg-muted")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.underline ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("underline")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.underline && "bg-muted")}
          title="Underline (Ctrl+U)"
        >
          <Underline className="size-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.strikeThrough ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("strikeThrough")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.strikeThrough && "bg-muted")}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </Button>

        <div className="bg-border mx-1 h-5 w-px" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHeading("h2")}
          disabled={isHtmlMode}
          className="h-8 px-2 text-xs font-semibold"
          title="Heading 2"
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHeading("h3")}
          disabled={isHtmlMode}
          className="h-8 px-2 text-xs font-semibold"
          title="Heading 3"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHeading("h4")}
          disabled={isHtmlMode}
          className="h-8 px-2 text-xs font-semibold"
          title="Heading 4"
        >
          <Heading3 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHeading("p")}
          disabled={isHtmlMode}
          className="h-8 px-2 text-xs font-normal"
          title="Paragraph"
        >
          Normal
        </Button>

        <div className="bg-border mx-1 h-5 w-px" />

        <Button
          type="button"
          variant={activeFormats.insertUnorderedList ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("insertUnorderedList")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.insertUnorderedList && "bg-muted")}
          title="Bulleted List"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.insertOrderedList ? "secondary" : "ghost"}
          size="sm"
          onClick={() => execCmd("insertOrderedList")}
          disabled={isHtmlMode}
          className={cn("h-8 w-8 p-0", activeFormats.insertOrderedList && "bg-muted")}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHeading("blockquote")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCmd("insertHorizontalRule")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Horizontal Line"
        >
          <Minus className="size-4" />
        </Button>

        <div className="bg-border mx-1 h-5 w-px" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddLink}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <LinkIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCmd("unlink")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Remove Link"
        >
          <Unlink className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCmd("removeFormat")}
          disabled={isHtmlMode}
          className="h-8 w-8 p-0"
          title="Clear Formatting"
        >
          <RemoveFormatting className="size-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant={isHtmlMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              if (isHtmlMode && editorRef.current) {
                editorRef.current.innerHTML = value || "";
              }
              setIsHtmlMode(!isHtmlMode);
            }}
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            title="Toggle HTML code mode"
          >
            {isHtmlMode ? (
              <>
                <Eye className="size-3.5" />
                Visual
              </>
            ) : (
              <>
                <Code className="size-3.5" />
                HTML
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "bg-muted/10 font-mono text-xs leading-relaxed p-4 w-full resize-y outline-none focus:ring-0",
            minHeight,
          )}
          placeholder="Paste or write raw HTML here..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder={placeholder}
          className={cn(
            "prose prose-neutral dark:prose-invert max-w-none p-4 text-sm leading-relaxed outline-none focus:outline-none overflow-y-auto",
            "[&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2",
            "[&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
            "[&_h4]:text-foreground [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1",
            "[&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
            "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none",
            minHeight,
          )}
        />
      )}
    </div>
  );
}
