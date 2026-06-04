'use client';

import { useCallback, useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils/cn';

interface FileUploadProps {
 accept?: string;
 maxSize?: number;
 maxFiles?: number;
 value?: File[];
 onChange?: (files: File[]) => void;
 label?: string;
 error?: string;
 className?: string;
}

export default function FileUpload({
 accept = 'image/*',
 maxSize = 5 * 1024 * 1024,
 maxFiles = 5,
 value = [],
 onChange,
 label,
 error,
 className,
}: FileUploadProps) {
 const [dragOver, setDragOver] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);

 const processFiles = useCallback(
 (fileList: FileList) => {
 const files = Array.from(fileList);
 const valid = files.filter((f) => {
 if (f.size > maxSize) return false;
 return true;
 });
 const combined = [...value, ...valid].slice(0, maxFiles);
 onChange?.(combined);
 },
 [value, maxSize, maxFiles, onChange]
 );

 const handleDrop = useCallback(
 (e: DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 setDragOver(false);
 processFiles(e.dataTransfer.files);
 },
 [processFiles]
 );

 const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 setDragOver(true);
 }, []);

 const handleDragLeave = useCallback(() => {
 setDragOver(false);
 }, []);

 const handleClick = () => {
 inputRef.current?.click();
 };

 const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 processFiles(e.target.files);
 }
 };

 const removeFile = (index: number) => {
 const updated = value.filter((_, i) => i !== index);
 onChange?.(updated);
 };

 return (
 <div className={cn('space-y-2', className)}>
 {label && (
 <label className="block text-sm font-medium text-coral-crimson">
 {label}
 </label>
 )}
 <div
 onDrop={handleDrop}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onClick={handleClick}
 className={cn(
'flex cursor-pointer flex-col items-center justify-center rounded-[90px] border-2 border-dashed border-coral-crimson/20 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50',
 dragOver && 'border-brand-500 bg-coral-crimson/5',
 error && 'border-red-500'
 )}
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === '') handleClick();
 }}
 aria-label="Upload files"
 >
 <svg
 className="h-8 w-8 text-coral-crimson/50 mb-2"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={1.5}
 d="M12 16v-6m0 0l-3 3m3-3l3 3M5 13v3a2 2 0 002 2h10a2 2 0 002-2v-3"
 />
 </svg>
 <p className="text-sm text-coral-crimson/60">
 <span className="font-medium text-brand-600">Click to upload</span> or
 drag and drop
 </p>
 <p className="text-xs text-coral-crimson/50 mt-1">
 PNG, JPG, WebP up to {maxSize / 1024 / 1024}MB
 </p>
 <input
 ref={inputRef}
 type="file"
 accept={accept}
 multiple
 onChange={handleChange}
 className="hidden"
 />
 </div>
 {value.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {value.map((file, index) => (
 <div
 key={`${file.name}-${index}`}
 className="relative flex items-center gap-2 rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2"
 >
 {file.type.startsWith('image/') && (
 <img
 src={URL.createObjectURL(file)}
 alt={file.name}
 className="h-8 w-8 rounded-[90px] object-cover"
 />
 )}
 <span className="text-sm text-coral-crimson truncate max-w-[120px]">
 {file.name}
 </span>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 removeFile(index);
 }}
 className="ml-1 text-coral-crimson/50 hover:text-red-500 transition-colors"
 aria-label={`Remove ${file.name}`}
 >
 <svg
 className="h-4 w-4"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 </div>
 ))}
 </div>
 )}
 {error && <p className="text-sm text-red-600">{error}</p>}
 </div>
 );
}
