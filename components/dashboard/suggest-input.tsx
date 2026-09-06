"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SuggestInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  suggestions: string[];
};

type ListBoxRect = {
  top: number;
  left: number;
  width: number;
};

/**
 * Single-line Input with a typeahead list (whole-value replace on select).
 */
export function SuggestInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  maxLength,
  placeholder,
  className,
  "aria-invalid": ariaInvalid,
  suggestions,
}: SuggestInputProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [listBox, setListBox] = useState<ListBoxRect | null>(null);

  const showList = open && !disabled && suggestions.length > 0;

  const updateListBox = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setListBox({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [value, open]);

  useLayoutEffect(() => {
    if (!showList) {
      setListBox(null);
      return;
    }
    updateListBox();
  }, [showList, value, suggestions.length, updateListBox]);

  useEffect(() => {
    if (!showList) return;

    function onReposition() {
      updateListBox();
    }

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [showList, updateListBox]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (inputRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function selectSuggestion(item: string) {
    onChange(item);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        );
        break;
      case "Enter":
        if (suggestions[activeIndex]) {
          event.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
    }
  }

  const list =
    mounted && showList && listBox
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: listBox.top,
              left: listBox.left,
              width: listBox.width,
            }}
            className="z-50 max-h-60 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {suggestions.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={item}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full min-h-11 items-center rounded-md px-3 py-2 text-left text-sm",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(item);
                    }}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && suggestions[activeIndex]
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        aria-invalid={ariaInvalid}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={className}
        value={value}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => onBlur?.(), 0);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {list}
    </div>
  );
}

type SuggestLinesInputProps = Omit<SuggestInputProps, "suggestions"> & {
  suggestions: string[];
  rows?: number;
  applySuggestion: (value: string, suggestion: string) => string;
};

/**
 * Multiline field with typeahead that replaces the active line only.
 */
export function SuggestLinesInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  maxLength,
  placeholder,
  className,
  "aria-invalid": ariaInvalid,
  suggestions,
  applySuggestion,
  rows = 3,
}: SuggestLinesInputProps) {
  const listId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [listBox, setListBox] = useState<ListBoxRect | null>(null);

  const showList = open && !disabled && suggestions.length > 0;

  const updateListBox = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setListBox({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [value, open]);

  useLayoutEffect(() => {
    if (!showList) {
      setListBox(null);
      return;
    }
    updateListBox();
  }, [showList, value, suggestions.length, updateListBox]);

  useEffect(() => {
    if (!showList) return;

    function onReposition() {
      updateListBox();
    }

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [showList, updateListBox]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (inputRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function selectSuggestion(item: string) {
    onChange(applySuggestion(value, item));
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showList) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        );
        break;
      case "Enter":
        if (suggestions[activeIndex] && !event.shiftKey) {
          event.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
    }
  }

  const list =
    mounted && showList && listBox
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: listBox.top,
              left: listBox.left,
              width: listBox.width,
            }}
            className="z-50 max-h-60 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {suggestions.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={item}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full min-h-11 items-center rounded-md px-3 py-2 text-left text-sm",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(item);
                    }}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <Textarea
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && suggestions[activeIndex]
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        aria-invalid={ariaInvalid}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
        className={className}
        value={value}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => onBlur?.(), 0);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {list}
    </div>
  );
}
