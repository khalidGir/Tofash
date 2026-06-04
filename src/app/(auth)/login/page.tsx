'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { Button } from '@/components/ui/Button';
import OtpInput from '@/components/features/OtpInput';
import { ROUTES, USER_ROLES } from '@/lib/utils/constants';

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length <= 3) return `+251 ${d}`;
  if (d.length <= 5) return `+251 ${d.slice(3)} ${d.slice(0, 3)}`.trim();
  return `+251 ${d.slice(3, 5)} ${d.slice(5, 9)} ${d.slice(9)}`.trim();
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setSession, setProfile } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const phoneDisplay = phoneDigits ? `+251 ${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 5)} ${phoneDigits.slice(5, 9)}` : '';

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (phoneDigits.length < 9) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    setSending(true);
    try {
      const fullPhone = `+251${phoneDigits}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;
      setStep('otp');
      startCooldown();
      addToast({ type: 'info', message: 'OTP sent to your phone' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      if (message.toLowerCase().includes('supabase') || message.toLowerCase().includes('configuration')) {
        setPhoneError('Authentication is not configured. Please contact support.');
      } else {
        setPhoneError(message);
      }
      addToast({ type: 'error', message });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setOtpError('');
    setVerifying(true);
    try {
      const fullPhone = `+251${phoneDigits}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;

      setSession(data.session);

      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        setProfile(profile);
      }

      addToast({ type: 'success', message: 'Welcome back!' });

      const role = useAuthStore.getState().profile?.role;
      if (role === USER_ROLES.SELLER) router.push(ROUTES.SELLER.DASHBOARD);
      else if (role === USER_ROLES.ADMIN) router.push(ROUTES.ADMIN.SELLERS);
      else router.push(ROUTES.HOME);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code';
      setOtpError(message);
      addToast({ type: 'error', message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[90px] bg-pure-white p-8 sm:p-10">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3" aria-hidden="true">🍰</div>
        <h1 className="font-display text-2xl text-coral-crimson">Tofash</h1>
        <p className="mt-1 text-sm text-coral-crimson/60">Homemade Desserts</p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-coral-crimson">Phone Number</label>
            <div className="flex items-stretch gap-0">
              <div className="flex items-center rounded-l-[90px] border border-r-0 border-coral-crimson/20 bg-coral-crimson/5 px-5 text-base font-bold text-coral-crimson">
                +251
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="91 XXX XXXX"
                value={phoneRaw}
                onChange={(e) => { setPhoneRaw(e.target.value); setPhoneError(''); }}
                disabled={sending}
                className="block w-full rounded-r-[90px] border border-coral-crimson/20 bg-pure-white px-4 py-3.5 text-base text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
              />
            </div>
            {phoneError && (
              <p className="text-sm text-red-600" role="alert">{phoneError}</p>
            )}
            {!phoneError && phoneDigits.length > 0 && (
              <p className="text-xs text-coral-crimson/50">
                Full number: +251 {phoneDigits.slice(0, 2)} {phoneDigits.slice(2, 5)} {phoneDigits.slice(5, 9)}
              </p>
            )}
          </div>

          <Button type="submit" loading={sending} className="w-full">
            Send OTP
          </Button>

          <p className="text-center text-sm text-coral-crimson/60">
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.REGISTER} className="font-medium text-coral-crimson underline underline-offset-2 hover:text-brand-700">
              Register
            </Link>
          </p>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-coral-crimson/60">
              Enter the code sent to
            </p>
            <p className="mt-1 font-medium text-coral-crimson">{phoneDisplay}</p>
          </div>

          <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} error={otpError} disabled={verifying} />

          {otp.length === 6 && (
            <Button onClick={handleVerifyOtp} loading={verifying} className="w-full">
              Verify
            </Button>
          )}

          <div className="text-center">
            <button
              type="button"
              disabled={cooldown > 0 || sending}
              onClick={() => { setOtp(''); setOtpError(''); handleSendOtp({ preventDefault() {} } as FormEvent); }}
              className="text-sm text-coral-crimson underline underline-offset-2 hover:text-brand-700 disabled:opacity-40 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <p className="text-center text-sm text-coral-crimson/60">
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); setOtpError(''); }} className="underline underline-offset-2 hover:text-brand-700">
              Change phone number
            </button>
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-coral-crimson/40">
          Want to sell on Tofash?{' '}
          <Link href="/seller/apply" className="underline underline-offset-2 hover:text-coral-crimson/60">
            Apply as a seller
          </Link>
        </p>
      </div>
    </div>
  );
}
