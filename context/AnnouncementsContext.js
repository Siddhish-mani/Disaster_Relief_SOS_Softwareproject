import React, { createContext, useContext, useMemo, useState } from 'react';

const AnnouncementsContext = createContext(null);

export function AnnouncementsProvider({ children }) {
  const [announcements, setAnnouncements] = useState([
    { id: 'a1', title: 'Welcome', body: 'Stay safe and follow official updates.' },
  ]);

  const addAnnouncement = (title, body) => {
    const id = `a${Date.now()}`;
    setAnnouncements((prev) => [{ id, title, body }, ...prev]);
  };

  const value = useMemo(() => ({ announcements, addAnnouncement }), [announcements]);

  return (
    <AnnouncementsContext.Provider value={value}>{children}</AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementsContext);
  if (!ctx) throw new Error('useAnnouncements must be used within AnnouncementsProvider');
  return ctx;
}




