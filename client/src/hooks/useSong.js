// client/src/hooks/useSong.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useSong = (songId) => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't fetch if no songId
    if (!songId) {
      setLoading(false);
      return;
    }

    const fetchSong = async () => {
      try {
        setLoading(true);
        
        // Fetch song data using API utility
        const response = await api.get(`/songs/${songId}`);
        
        if (response.data.success) {
          setSong(response.data.song);
        } else {
          setError(response.data.message || 'Failed to load song');
        }
      } catch (err) {
        console.error('Error fetching song:', err);
        setError(err.response?.data?.message || 'Error loading song');
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [songId]);

  return { song, loading, error };
};