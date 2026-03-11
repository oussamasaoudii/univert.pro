import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Ovmon - Website Hosting Platform',
  description: 'Learn about Ovmon, the modern platform for deploying and managing websites with integrated provisioning, monitoring, and domain management.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
