'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface PaymentProofUploadProps {
 orderId: string;
 onUploadComplete: () => void;
}

export default function PaymentProofUpload({
 orderId,
 onUploadComplete,
}: PaymentProofUploadProps) {
 const [file, setFile] = useState<File | null>(null);
 const [preview, setPreview] = useState<string | null>(null);
 const [note, setNote] = useState('');
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
 const [dragOver, setDragOver] = useState(false);

 const handleFileSelect = useCallback((selectedFile: File) => {
 setError(null);
 if (!selectedFile.type.startsWith('image/')) {
 setError('Please select an image file');
 return;
 }
 if (selectedFile.size > 10 * 1024 * 1024) {
 setError('File must be under 10MB');
 return;
 }
 setFile(selectedFile);
 const reader = new FileReader();
 reader.onload = (e) => setPreview(e.target?.result as string);
 reader.readAsDataURL(selectedFile);
 }, []);

 const handleDrop = useCallback(
 (e: React.DragEvent) => {
 e.preventDefault();
 setDragOver(false);
 const droppedFile = e.dataTransfer.files[0];
 if (droppedFile) handleFileSelect(droppedFile);
 },
 [handleFileSelect]
 );

 const handleUpload = async () => {
 if (!file) return;
 setUploading(true);
 setError(null);

 try {
 const formData = new FormData();
 formData.append('file', file);
 formData.append('order_id', orderId);
 if (note) formData.append('note', note);

 const res = await fetch('/api/orders/upload-payment-proof', {
 method: 'POST',
 body: formData,
 });

 if (!res.ok) throw new Error('Upload failed');
 setSuccess(true);
 onUploadComplete();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Something went wrong');
 } finally {
 setUploading(false);
 }
 };

 if (success) {
 return (
 <div className="rounded-[90px] border border-green-200 bg-green-50 p-4 text-center">
 <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="mt-2 text-sm font-medium text-green-800">
 Payment proof uploaded successfully!
 </p>
 <p className="mt-1 text-xs text-green-600">
 Waiting for seller verification
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <div
 onDrop={handleDrop}
 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
 onDragLeave={() => setDragOver(false)}
 onClick={() => document.getElementById('proof-upload')?.click()}
 className={cn(
'flex cursor-pointer flex-col items-center justify-center rounded-[90px] border-2 border-dashed p-6 transition-colors',
 dragOver
 ? 'border-brand-500 bg-coral-crimson/5'
 : preview
 ? 'border-green-300 bg-green-50/50'
 : 'border-coral-crimson/20 hover:border-brand-400 hover:bg-brand-50/50'
 )}
 >
 {preview ? (
 <img
 src={preview}
 alt="Payment proof preview"
 className="max-h-48 rounded-[90px] object-contain"
 />
 ) : (
 <>
 <svg className="h-10 w-10 text-coral-crimson/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <p className="mt-2 text-sm text-coral-crimson/60">
 <span className="font-medium text-brand-600">Click to upload</span> or drag and drop
 </p>
 <p className="mt-1 text-xs text-coral-crimson/50">
 Screenshot of bank transfer or mobile money receipt
 </p>
 </>
 )}
 <input
 id="proof-upload"
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const selected = e.target.files?.[0];
 if (selected) handleFileSelect(selected);
 }}
 />
 </div>

 {file && (
 <div>
 <label className="block text-sm font-medium text-coral-crimson mb-1">
 Note (optional)
 </label>
 <textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="e.g. Sent via Telebirr to 0911XXXXXX"
 rows={2}
 className="w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
 />
 </div>
 )}

 {error && (
 <p className="text-sm text-red-600">{error}</p>
 )}

 <Button
 onClick={handleUpload}
 loading={uploading}
 disabled={!file}
 className="w-full"
 >
 Upload Payment Proof
 </Button>
 </div>
 );
}
