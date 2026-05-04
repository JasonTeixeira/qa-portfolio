'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { Button } from '@/components/portal/ui/button';
import { Check, RefreshCcw } from 'lucide-react';

interface Props {
  documentId: string;
  signerName: string;
  signerEmail: string;
  onSigned?: () => void;
}

export function SignaturePad({ documentId, signerName, signerEmail, onSigned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [empty, setEmpty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      padRef.current?.clear();
      setEmpty(true);
    };
    const pad = new SignaturePadLib(canvas, {
      penColor: '#fafafa',
      backgroundColor: 'rgba(0,0,0,0)',
      minWidth: 0.7,
      maxWidth: 2.4,
    });
    pad.addEventListener('endStroke', () => setEmpty(pad.isEmpty()));
    padRef.current = pad;
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const clear = () => {
    padRef.current?.clear();
    setEmpty(true);
  };

  const submit = async () => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    setSubmitting(true);
    setError(null);
    try {
      const dataUrl = padRef.current.toDataURL('image/png');
      const res = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_data: dataUrl,
          signer_name: signerName,
          signer_email: signerEmail,
          user_agent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to sign');
      setDone(true);
      onSigned?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/5 p-6 flex items-center gap-3">
        <Check className="w-6 h-6 text-[#10b981]" />
        <div>
          <div className="font-medium text-[#fafafa]">Signed</div>
          <div className="text-xs text-[#a1a1aa]">
            We&apos;ve recorded your signature with full audit trail.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#3f3f46] bg-[#0a0a0c] p-4">
        <div className="text-xs uppercase tracking-wider text-[#71717a] mb-2">
          Sign as {signerName}
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none rounded-lg bg-[#09090B] border border-[#27272a]"
        />
        <div className="flex items-center justify-between mt-3">
          <Button variant="ghost" size="sm" onClick={clear} disabled={empty}>
            <RefreshCcw className="w-3.5 h-3.5" /> Clear
          </Button>
          <Button onClick={submit} disabled={empty || submitting} size="sm">
            {submitting ? 'Recording…' : 'Sign &amp; submit'}
          </Button>
        </div>
        {error && <div className="text-xs text-[#ef4444] mt-2">{error}</div>}
      </div>
      <p className="text-xs text-[#71717a] leading-relaxed">
        By signing you agree to be bound by this document. We log your IP, browser, and timestamp
        for the audit trail. Your signature is legally binding under the U.S. ESIGN Act.
      </p>
    </div>
  );
}
