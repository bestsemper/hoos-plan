"use client";
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-panel-bg p-8 rounded-lg shadow-sm border border-panel-border mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-uva-orange flex items-center justify-center text-white text-3xl font-bold shadow-md">
              U
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-heading">Hi, Mock User</h1>
              <p className="text-text-secondary text-lg font-medium">Computer Science (BA) • Class of 2026</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-uva-blue text-white px-5 py-2.5 rounded hover:bg-uva-blue-dark font-bold shadow-sm transition-colors cursor-pointer">
              Edit Profile
            </button>
            <button className="border-2 border-dashed border-panel-border-strong px-5 py-2.5 rounded hover:bg-hover-bg text-text-primary font-semibold transition-colors cursor-pointer">
              Upload Previous Classes
            </button>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-panel-bg-alt border border-panel-border-strong rounded-md hover:bg-hover-bg transition-colors text-text-primary font-semibold cursor-pointer shadow-sm"
        >
          {(!mounted ? false : !isDark) ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Dark Mode
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              Light Mode
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel-bg p-6 rounded-lg shadow-sm border border-panel-border">
          <h2 className="text-xl font-bold mb-5 text-heading">Activity Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3 border-panel-border">
              <span className="text-text-secondary font-medium">Plans Created</span>
              <span className="font-bold text-text-primary">1</span>
            </div>
            <div className="flex justify-between border-b pb-3 border-panel-border">
              <span className="text-text-secondary font-medium">Plans Published</span>
              <span className="font-bold text-text-primary">0</span>
            </div>
            <div className="flex justify-between border-b pb-3 border-panel-border">
              <span className="text-text-secondary font-medium">Forum Posts</span>
              <span className="font-bold text-text-primary">3</span>
            </div>
          </div>
        </div>

        <div className="bg-panel-bg p-6 rounded-lg shadow-sm border border-panel-border">
          <h2 className="text-xl font-bold mb-5 text-heading">Badges</h2>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-badge-orange-bg text-uva-orange px-3 py-2 rounded-md flex items-center gap-2 text-sm font-bold border border-uva-orange/30 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Early Adopter
            </div>
            <div className="bg-badge-blue-bg text-badge-blue-text px-3 py-2 rounded-md flex items-center gap-2 text-sm font-bold border border-uva-blue/20 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> Active Participant
            </div>
            <div className="bg-panel-bg-alt text-gray-500 px-3 py-2 rounded-md text-sm border-2 border-panel-border-strong border-dashed flex items-center gap-2 font-semibold cursor-pointer hover:border-uva-orange hover:text-uva-orange transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Earn more badges
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
