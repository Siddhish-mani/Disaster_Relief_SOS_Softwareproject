import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const RequestsContext = createContext(null);

// Mock volunteers - in a real app, this would come from an API
const MOCK_VOLUNTEERS = [
  { id: 'v1', name: 'John' },
  { id: 'v2', name: 'Sarah' },
  { id: 'v3', name: 'Mike' },
];

export function RequestsProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatuses, setRequestStatuses] = useState({}); // Track status per request
  const [assignedVolunteers, setAssignedVolunteers] = useState({}); // Track volunteer assignments

  // Determine base URL - same logic as LoginScreen
  // 1) If provided in app config (app.json -> expo.extra.apiUrl), use that
  // 2) Otherwise, default to emulator-friendly addresses
  const configuredUrl = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiUrl)
    || (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.apiUrl);
  const BASE_URL = configuredUrl || Platform.select({
    android: 'http://10.0.2.2:4000', // Android emulator loopback to host
    ios: 'http://localhost:4000',    // iOS simulator
    default: 'http://localhost:4000',
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/data-entries`);
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function addEntry(entry) {
    const res = await fetch(`${BASE_URL}/api/data-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to create entry');
    const created = await res.json();
    setEntries((prev) => [created, ...prev]);
    return created;
  }

  // Transform entries into requests format for admin dashboard
  const requests = useMemo(() => {
    return entries.map((entry) => {
      const entryId = entry.id?.toString() || entry.id;
      const status = requestStatuses[entryId] || 'Pending';
      const assignedVolunteerId = assignedVolunteers[entryId];
      
      // Parse location if it's in "lat, lng" format
      let coords = null;
      if (entry.location) {
        const parts = entry.location.split(',').map(s => s.trim());
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            coords = { latitude: lat, longitude: lng };
          }
        }
      }

      // Determine urgency based on message content or default to medium
      let urgency = 'medium';
      const messageLower = (entry.message || '').toLowerCase();
      if (messageLower.includes('urgent') || messageLower.includes('emergency') || messageLower.includes('critical')) {
        urgency = 'high';
      } else if (messageLower.includes('low') || messageLower.includes('minor')) {
        urgency = 'low';
      }

      return {
        id: entryId,
        resource: entry.message || 'SOS Request',
        urgency,
        status,
        coords,
        location: entry.location || 'Unknown',
        name: entry.name || 'Unknown',
        contact: entry.contact || null,
        assignedVolunteerId,
        createdAt: entry.created_at,
      };
    });
  }, [entries, requestStatuses, assignedVolunteers]);

  // Assign a volunteer to a request
  function assignVolunteer(requestId, volunteerId) {
    setAssignedVolunteers((prev) => ({
      ...prev,
      [requestId]: volunteerId,
    }));
    // Update status to Accepted when volunteer is assigned
    setRequestStatuses((prev) => ({
      ...prev,
      [requestId]: 'Accepted',
    }));
  }

  // Resolve a request
  function resolveRequest(requestId) {
    setRequestStatuses((prev) => ({
      ...prev,
      [requestId]: 'Resolved',
    }));
  }

  useEffect(() => {
    load();
  }, []);

  const value = useMemo(() => ({
    entries,
    loading,
    error,
    load,
    addEntry,
    // Admin dashboard properties
    requests,
    volunteers: MOCK_VOLUNTEERS,
    assignVolunteer,
    resolveRequest,
  }), [entries, loading, error, requests]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
}











