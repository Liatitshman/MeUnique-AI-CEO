import { ReactNode } from 'react';

export const metadata = {
    title: 'MeUnique Admin Dashboard',
    description: 'Admin control panel for MeUnique AI CEO system',
};

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
} 