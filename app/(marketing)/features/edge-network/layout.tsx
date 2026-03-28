import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edge Network - Ovmon',
  description: 'Global edge network with 150+ locations for ultra-low latency.',
  robots: { index: false, follow: false },
};

export default function EdgeNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
