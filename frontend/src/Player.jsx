import React, { useRef, useState, useContext } from "react";
import AuthContext from './AuthContext.jsx';
import apiFetch from './api';
import './Player.css';

function Player() {
  const videoRef = useRef(null);
  const { user, isAuthenticated } = useContext(AuthContext);

  const [videoUrl, setVideoUrl] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState({ date: '', start_time: '', end_time: '', camera_id: '', plate: '' });

  const performSearch = async (e) => {
    e && e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => { if (v) params.append(k, v); });

    try {
      const res = await apiFetch('/search?' + params.toString());
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Search failed');
        return;
      }

      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Network error');
    }
  };

  const loadVideo = async (video_id) => {
    try {
      const res = await apiFetch(`/video/decrypted/${video_id}`);
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to load video');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setTimeout(() => videoRef.current && videoRef.current.play(), 100);
    } catch (err) {
      alert('Network error');
    }
  };

  if (!isAuthenticated) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Please sign in to view videos.</div>;
  }

 return (
  <div className="app-container">
    <h1>Secure Video Viewer</h1>

    <form className="search-card" onSubmit={performSearch}>

      <div className="input-group">
        <label>Date</label>
        <input
          type="date"
          value={query.date}
          onChange={e => setQuery({ ...query, date: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Start Time</label>
        <input
          type="time"
          step="1"
          value={query.start_time}
          onChange={e => setQuery({ ...query, start_time: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>End Time</label>
        <input
          type="time"
          step="1"
          value={query.end_time}
          onChange={e => setQuery({ ...query, end_time: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Camera</label>
        <select
          value={query.camera_id}
          onChange={e => setQuery({ ...query, camera_id: e.target.value })}
        >
          <option value="">Select Camera</option>
          <option value="1">Camera 1</option>
          <option value="2">Camera 2</option>
          <option value="3">Camera 3</option>
        </select>
      </div>

      <div className="input-group">
        <label>Plate</label>
        <input
          type="text"
          placeholder="Enter plate"
          value={query.plate}
          onChange={e => setQuery({ ...query, plate: e.target.value })}
        />
      </div>

      <button className="search-btn" type="submit">
        Search
      </button>

    </form>

    <div className="content-section">

      <div className="results-card">
        <h3>Results</h3>
        {searchResults.length === 0 && <div>No results</div>}
        <ul>
          {searchResults.map(r => (
            <li key={r.video_id}>
              <strong>{r.filename}</strong><br />
              {r.upload_date_ist} — {r.camera_id}
              <br />
              <button onClick={() => loadVideo(r.video_id)}>
                Load
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="player-card">
        <h3>Player</h3>
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl} controls width="100%" />
        ) : (
          <div className="video-placeholder">
            No video loaded
          </div>
        )}
      </div>

    </div>
  </div>
);
}


export default Player;