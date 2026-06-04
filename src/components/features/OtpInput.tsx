'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const DIGIT_COUNT = 6;

export default function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(DIGIT_COUNT - value.length).fill(''));
  const focusedIndex = Math.min(value.length, DIGIT_COUNT - 1);

  const handleChange = (index: number, char: string) => {
    if (disabled) return;
    if (!/^\d$/.test(char)) return;
    const newValue = value.slice(0, index) + char + value.slice(index + 1);
    onChange(newValue);
    if (index < DIGIT_COUNT - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        const newValue = value.slice(0, index - 1) + value.slice(index);
        onChange(newValue);
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGIT_COUNT);
    if (!pasted) return;
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, DIGIT_COUNT - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length: DIGIT_COUNT }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digits[index] || ''}
            disabled={disabled}
            onFocus={() => {
              if (index < DIGIT_COUNT - 1 && !value[index]) {
                inputsRef.current[focusedIndex]?.focus();
              }
            }}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'h-12 w-10 sm:h-14 sm:w-12 rounded-[90px] border-2 text-center text-lg font-bold text-coral-crimson transition-colors outline-none',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-coral-crimson/20 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
