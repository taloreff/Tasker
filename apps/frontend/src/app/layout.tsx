import './global.css';
import { Providers } from '@/providers';
import ConditionalLayout from '@/components/conditional-layout';

export const metadata = {
  title: 'Tasker - Project Management',
  description: 'A powerful project management and collaboration tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
