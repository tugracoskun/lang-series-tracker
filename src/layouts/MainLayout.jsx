import React from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../store/useAppStore';
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner';

const MainLayout = ({ children }) => {
    const { sidebarCollapsed, user } = useAppStore();

    return (
        <>
            <div className="liquid-bg" />
            {/* Sidebar - Desktop'ta her zaman görünür, mobilde drawer */}
            <Sidebar />

            {/* Email Verification Banner */}
            <EmailVerificationBanner user={user} />

            {/* Main Content - Desktop'ta sidebar için padding */}
            <div className={`min-h-screen relative z-10 transition-[padding] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {children}
            </div>
        </>
    );
};

export default MainLayout;
