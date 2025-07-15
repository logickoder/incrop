import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { Toast, useToast } from './ToastContext';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'flex items-center gap-3 p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform backdrop-blur-sm';

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-success/10 border-success/30 text-success backdrop-blur-sm shadow-success/20`;
      case 'error':
        return `${baseStyles} bg-error/10 border-error/30 text-error backdrop-blur-sm shadow-error/20`;
      case 'warning':
        return `${baseStyles} bg-warning/10 border-warning/30 text-warning backdrop-blur-sm shadow-warning/20`;
      case 'info':
        return `${baseStyles} bg-info/10 border-info/30 text-info backdrop-blur-sm shadow-info/20`;
      default:
        return `${baseStyles} bg-base-200 border-base-300 text-base-content`;
    }
  };

  const getIcon = () => {
    const iconClass = 'w-5 h-5 flex-shrink-0';

    switch (toast.type) {
      case 'success':
        return <CheckCircle className={iconClass} />;
      case 'error':
        return <XCircle className={iconClass} />;
      case 'warning':
        return <AlertTriangle className={iconClass} />;
      case 'info':
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-current hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-current/10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
