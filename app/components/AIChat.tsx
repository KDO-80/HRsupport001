'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [dataType, setDataType] = useState<'contracts' | 'vehicles' | 'rentals'>('contracts');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, data_type: dataType })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류 발생했습니다' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8000/api/ai-reset', { method: 'POST' });
      setMessages([]);
    } catch (error) {
      console.error('Reset failed');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto border rounded-lg p-4 bg-white">
      <div className="mb-4 flex gap-2">
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="contracts">계약</option>
          <option value="vehicles">차량</option>
          <option value="rentals">렌탈</option>
        </select>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          초기화
        </button>
      </div>

      <div className="h-96 overflow-y-auto border rounded mb-4 p-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">질문을 입력하세요...</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="질문을 입력하세요"
          disabled={loading}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '대기중...' : '전송'}
        </button>
      </div>
    </div>
  );
}
