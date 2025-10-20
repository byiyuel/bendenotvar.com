import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-2 py-1 text-sm rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-secondary-800`}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = 'İçerik...', className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    const clean = DOMPurify.sanitize(html, { ALLOWED_ATTR: ['href', 'target', 'rel', 'class'], ALLOWED_TAGS: ['b','strong','i','em','u','p','br','ul','ol','li','a','span','div'] });
    onChange(clean);
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const onLink = () => {
    const url = window.prompt('Bağlantı URL');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-1 border border-gray-300 rounded-t-md px-2 py-1 bg-white dark:bg-secondary-900 dark:border-secondary-800">
        <ToolbarButton onClick={() => exec('bold')}>B</ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')}>I</ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')}>U</ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1 dark:bg-secondary-700" />
        <ToolbarButton onClick={() => exec('insertUnorderedList')}>• Liste</ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')}>1. Liste</ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1 dark:bg-secondary-700" />
        <ToolbarButton onClick={onLink}>Link</ToolbarButton>
      </div>
      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable
        data-placeholder={placeholder}
        className="min-h-[140px] w-full px-3 py-2 border border-t-0 border-gray-300 rounded-b-md bg-white leading-6 focus:outline-none dark:bg-secondary-900 dark:border-secondary-800 dark:text-gray-100"
        suppressContentEditableWarning
      />
      <style>
        {`[contenteditable][data-placeholder]:empty:before{content:attr(data-placeholder);color:#9ca3af;}`}
      </style>
    </div>
  );
};

export default RichTextEditor;





