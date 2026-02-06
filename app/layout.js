import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ThemeRegistry from '@/components/ThemeRegistry';
import './globals.css';

export const metadata = {
  title: 'Health Time Clinic',
  description: 'Clinic Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <ThemeRegistry>
            <Toaster position="top-right" />
            {children}
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
