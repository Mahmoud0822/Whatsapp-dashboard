'use client';

import { useState } from 'react';
import axios from 'axios';

export default function BroadcastPage() {
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const phoneList = numbers.split(',').map(n => n.trim()).filter(n => n);

    if (!phoneList.length || !message.trim()) {
      setStatus('Please fill both fields');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const res = await axios.post('http://localhost:5000/api/broadcast', {
        numbers: phoneList,
        message: message.trim(),
      });

      setStatus(`Sent to ${res.data.sent} numbers`);
    } catch (err) {
      setStatus('Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Broadcast Message</h2>

      <textarea
        placeholder="Comma-separated phone numbers"
        value={numbers}
        onChange={e => setNumbers(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        rows={3}
      />

      <textarea
        placeholder="Your message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        rows={4}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
