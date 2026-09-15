import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const triggerDownload = () => {
    if (!url.trim()) {
      alert("Please paste a valid link first!");
      return;
    }

    setStatus('⚡ Python is extracting and stitching streams... Please wait (this takes about a minute).');
    
    // This connects your React website interface straight to your Node backend
    // This automatically switches between localhost and your live Render URL
        const backendBaseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:4000' 
      : 'https://yt-downloader-cyvj.onrender.com'; // <-- Your live link goes here

    window.location.href = `${backendBaseUrl}/download?url=${encodeURIComponent(url)}`;


    // Clear the status text after a short delay
    setTimeout(() => setStatus(''), 12000);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '120px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ff0000', fontSize: '36px', marginBottom: '10px' }}>HQ YouTube Web Downloader</h1>
      <p style={{ color: '#555', fontSize: '18px', marginTop: '0' }}>Powered by React and Python Core</p>
      <br />
      
      <input 
        type="text" 
        placeholder="Paste your YouTube link here..." 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '500px', padding: '14px', fontSize: '16px', borderRadius: '6px', border: '2px solid #ccc', outline: 'none' }}
      />
      <br /><br />
      
      <button 
        onClick={triggerDownload} 
        style={{ padding: '14px 28px', fontSize: '16px', backgroundColor: '#ff0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Download Video
      </button>

      {status && (
        <p style={{ marginTop: '25px', color: '#e65c00', fontWeight: 'bold', fontStyle: 'italic' }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default App;
