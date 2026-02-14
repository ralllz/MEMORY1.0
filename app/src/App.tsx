import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi ambil data dari Supabase
  const ambilData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Memories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setMemories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Bagian Tampilan kamu di sini */}
      <h1 className="text-center pt-10 text-2xl font-bold text-pink-600">💖 Semua Kenangan 💖</h1>
      
      <div className="p-5 grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center">Memuat memori...</p>
        ) : memories.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm">
            <img src={item.image_url} alt={item.title} className="rounded-lg w-full h-48 object-cover" />
            <p className="mt-2 font-medium text-gray-700">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;