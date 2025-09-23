import './global.css';
import { Providers } from '@/providers';

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
          {children}
        </Providers>
      </body>
    </html>
  );
}
