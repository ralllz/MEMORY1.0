import { Heart, Sparkles } from 'lucide-react';

interface StorySectionProps {
  theme: string;
}

export function StorySection({ theme }: StorySectionProps) {
  const stories = [
    {
      year: 2021,
      title: "Awal Pertemuan",
      content: "Di tahun 2021, kisah indah kita dimulai. Dua jiwa yang tak sengaja bertemu, namun saling melengkapi. Nak Pungut dan Nak Soa, nama yang kini selalu bersama dalam setiap doa.",
    },
    {
      year: 2022,
      title: "Mengenal Lebih Dekat",
      content: "Tahun 2022 menjadi saksi bagaimana kita saling mengenal lebih dalam. Setiap tawa, setiap air mata, semua menjadi bagian dari perjalanan cinta kita.",
    },
    {
      year: 2023,
      title: "Bersama Melangkah",
      content: "Di tahun 2023, kita belajar bahwa cinta bukan hanya tentang kata-kata manis, tapi juga tentang bersama-sama menghadapi setiap tantangan.",
    },
    {
      year: 2024,
      title: "Membangun Mimpi",
      content: "Tahun 2024 adalah tahun di mana kita mulai membangun mimpi-mimpi bersama. Setiap rencana, setiap harapan, kita ukir bersama-sama.",
    },
    {
      year: 2025,
      title: "Semakin Kuat",
      content: "Di tahun 2025, ikatan kita semakin kuat. Kita belajar bahwa cinta sejati adalah tentang menerima kekurangan dan menyempurnakan kelebihan satu sama lain.",
    },
    {
      year: 2026,
      title: "Menuju Masa Depan",
      content: "Tahun 2026 dan seterusnya, kita melangkah menuju masa depan yang penuh harapan. Bersama-sama, kita akan menulis kisah cinta yang abadi.",
    },
  ];

  const getThemeStyles = () => {
    switch (theme) {
      case 'love':
        return 'from-pink-100 to-rose-100 border-rose-200';
      case 'love-sea':
        return 'from-cyan-100 to-blue-100 border-cyan-200';
      case 'sakura':
        return 'from-pink-50 to-purple-50 border-pink-200';
      case 'space':
        return 'from-indigo-100 to-purple-100 border-indigo-200';
      case 'cat':
        return 'from-orange-100 to-yellow-100 border-orange-200';
      default:
        return 'from-gray-100 to-slate-100 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Our Love Story
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </h2>
        <p className="text-gray-500 mt-2">Perjalanan cinta kita dari waktu ke waktu</p>
      </div>

      <div className="space-y-6">
        {stories.map((story, index) => (
          <div
            key={story.year}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${getThemeStyles()} border-2 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02]`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Year Badge */}
            <div className="absolute -top-3 left-6 px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
              {story.year}
            </div>

            <div className="mt-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                {story.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {story.content}
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-2 right-2 opacity-20">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
