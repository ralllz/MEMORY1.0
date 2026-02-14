import { Cloud, CheckCircle, AlertCircle } from 'lucide-react';

export type CloudStatusType = 'idle' | 'saving' | 'success' | 'error';

interface CloudStatusProps {
  status: CloudStatusType;
  message?: string;
}

export function CloudStatus({ status, message }: CloudStatusProps) {
  if (status === 'idle') return null;

  let icon = null;
  let bgColor = 'bg-blue-100';
  let textColor = 'text-blue-700';
  let borderColor = 'border-blue-300';
  let displayMessage = message || 'Menyimpan...';

  switch (status) {
    case 'saving':
      icon = <Cloud className="w-4 h-4 animate-pulse" />;
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-300';
      displayMessage = 'Menyimpan ke cloud...';
      break;
    case 'success':
      icon = <CheckCircle className="w-4 h-4" />;
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      borderColor = 'border-green-300';
      displayMessage = 'Tersimpan';
      break;
    case 'error':
      icon = <AlertCircle className="w-4 h-4" />;
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      borderColor = 'border-red-300';
      displayMessage = 'Gagal menyimpan';
      break;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg border-2 flex items-center gap-2 ${bgColor} ${textColor} ${borderColor} shadow-lg transition-all duration-300`}
    >
      {icon}
      <span className="text-sm font-medium">{displayMessage}</span>
    </div>
  );
}
