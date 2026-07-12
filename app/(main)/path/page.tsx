import type { Metadata } from 'next';
import { CinematicPath } from '@/components/path/CinematicPath';
import './path.css';

export const metadata: Metadata = {
  title: 'The Path',
  description:
    'A cinematic Sage Ideas story: one path from idea to system to market.',
  alternates: { canonical: 'https://www.sageideas.dev/path' },
};

export default function PathPage() {
  return <CinematicPath />;
}
