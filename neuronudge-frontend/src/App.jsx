import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function NeuroNudgeApp() {
  const [task, setTask] = useState('');
  const [profile, setProfile] = useState('ADHD');
  const [energy, setEnergy] = useState('medium');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const responseRef = useRef(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('nudge-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/nudge', {
        task,
        profile,
        energy
      });
      setResponse('');
      const output = res.data.response;
      let i = 0;
      const typeOut = () => {
        if (i <= output.length) {
          setResponse(output.slice(0, i));
          i++;
          setTimeout(typeOut, 10);
        } else {
          const newEntry = { task, profile, energy, output };
          const updatedHistory = [newEntry, ...history].slice(0, 10);
          setHistory(updatedHistory);
          localStorage.setItem('nudge-history', JSON.stringify(updatedHistory));
        }
      };
      typeOut();
    } catch (error) {
      setResponse('Error generating response.');
    }
    setLoading(false);
  };

  const energyOptions = [
    { label: '😴 Low', value: 'low' },
    { label: '😊 Medium', value: 'medium' },
    { label: '⚡ High', value: 'high' }
  ];

  return (
    <div className={`min-h-screen transition-all ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-100 to-purple-200 text-gray-800'} flex flex-col items-center justify-center p-8`}>
      <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 bg-black/20 px-4 py-2 rounded-xl text-sm">
        {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1 className="text-4xl font-bold text-center mb-6">🧠 NeuroNudge</h1>
      <p className="mb-4 text-lg text-center">Personalized, energy-aware task plans for your neurotype.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 space-y-4">
        <input
          type="text"
          placeholder="What task do you want to do?"
          className="w-full p-3 border rounded-xl dark:text-black focus:outline-none"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />

        <div className="flex justify-between">
          <label>Profile:</label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="border p-2 rounded-xl text-black"
          >
            <option value="ADHD">ADHD</option>
            <option value="Autism">Autism</option>
            <option value="Dyslexia">Dyslexia</option>
          </select>
        </div>

        <div className="flex justify-between">
          <label>Energy Level:</label>
          <select
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
            className="border p-2 rounded-xl text-black"
          >
            {energyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-500 text-white w-full py-2 rounded-xl font-bold hover:bg-indigo-600"
        >
          {loading ? 'Thinking...' : 'Get My Plan'}
        </button>
      </form>

      {response && (
        <div ref={responseRef} className="mt-6 max-w-xl bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2">🧭 Your Personalized Nudge:</h2>
          <p className="whitespace-pre-wrap text-lg">{response}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-2">🕒 Previous Nudges</h3>
          <ul className="space-y-2">
            {history.map((h, idx) => (
              <li key={idx} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                <div className="font-semibold">{h.task}</div>
                <div className="text-sm opacity-75">{h.profile} | {h.energy}</div>
                <div className="text-sm mt-1 whitespace-pre-wrap">{h.output}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
