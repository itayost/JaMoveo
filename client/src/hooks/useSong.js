// client/src/hooks/useSong.js
import { useState, useEffect, useCallback } from 'react';
import { songAPI, errorUtils } from '../services/api.service';

/**
 * Custom hook for fetching and managing song data
 * @param {string} [songId] - Optional song ID to fetch on mount
 * @returns {Object} Song hook state and methods
 */
export const useSong = (songId) => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(Boolean(songId));
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  /**
   * Fetch a song by ID
   * @param {string} id - Song ID to fetch
   */
  const fetchSong = useCallback(async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching song with ID: ${id}`);
      
      // Fetch song data using API service
      const response = await songAPI.getSong(id);
      
      if (response.data.success) {
        console.log('Song fetch successful:', response.data.song.title);
        setSong(response.data.song);
      } else {
        console.error('Song fetch failed with error:', response.data.message);
        setError(response.data.message || 'Failed to load song');
      }
    } catch (err) {
      console.error('Error fetching song:', err);
      
      // Get formatted error message
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      
      // For demo purposes - add sample data if API fails
      // REMOVE THIS IN PRODUCTION
      if (process.env.NODE_ENV === 'development' && retryCount === 0) {
        console.warn('Using sample song data for development');
        setTimeout(() => {
          setSong({
            id: id,
            title: "Imagine",
            artist: "John Lennon",
            language: "English",
            lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us only sky\nImagine all the people\nLiving for today...\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion too\nImagine all the people\nLiving life in peace...",
            chords: "C       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9e/Imagine_John_Lennon.jpg",
            year: 1971,
            genre: "Rock",
            key: "C"
          });
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  /**
   * Retry fetching the song
   */
  const retry = useCallback(() => {
    setRetryCount(count => count + 1);
    fetchSong(songId);
  }, [songId, fetchSong]);

  /**
   * Search for songs with optional filtering
   * @param {Object} params - Search parameters
   * @param {string} [params.query] - Search query
   * @param {string} [params.language] - Language filter
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Results per page
   * @returns {Promise<Array>} Array of song results
   */
  const searchSongs = useCallback(async ({ query, language, page, limit } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await songAPI.searchSongs(query, language, page, limit);
      
      if (response.data.success) {
        return {
          songs: response.data.songs || [],
          pagination: response.data.pagination || {}
        };
      } else {
        setError(response.data.message || 'Failed to search songs');
        return { songs: [], pagination: {} };
      }
    } catch (err) {
      console.error('Error searching songs:', err);
      setError(errorUtils.getErrorMessage(err));
      return { songs: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch song if ID is provided
  useEffect(() => {
    if (songId) {
      fetchSong(songId);
    }
  }, [songId, fetchSong]);

  return {
    song,
    loading,
    error,
    fetchSong,
    retry,
    searchSongs
  };
};

export default useSong;