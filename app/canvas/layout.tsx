// Canvas layout - prevents static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

