import { Shield } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
      <Shield className="h-7 w-7 text-primary" />
      <span className="text-xl font-semibold tracking-tight">Study Safe</span>
    </Link>
  );
}
