import toast from 'react-hot-toast';
import React from 'react';
import SuccessToast from '@/components/ui/success-toast-notification';
import ErrorToast from '@/components/ui/error-toast-notification';
import InfoToast from '@/components/ui/info-toast-notification';

// Keep track of active messages to prevent duplicates
const activeToasts = new Set<string>();
const TOAST_COOLDOWN = 2000; // 2 seconds

export const showSuccess = (message: string, title?: string) => {
  if (activeToasts.has(message)) return;
  activeToasts.add(message);
  
  toast.custom((t) => (
    React.createElement(SuccessToast, { 
      message, 
      description: title, 
      onClose: () => toast.dismiss(t.id) 
    })
  ), { id: message, duration: TOAST_COOLDOWN });

  setTimeout(() => activeToasts.delete(message), TOAST_COOLDOWN);
};

export const showError = (message: string) => {
  if (activeToasts.has(message)) return;
  activeToasts.add(message);

  toast.custom((t) => (
    React.createElement(ErrorToast, { 
      message, 
      onClose: () => toast.dismiss(t.id) 
    })
  ), { id: message, duration: TOAST_COOLDOWN });

  setTimeout(() => activeToasts.delete(message), TOAST_COOLDOWN);
};

export const showInfo = (message: string) => {
  if (activeToasts.has(message)) return;
  activeToasts.add(message);

  toast.custom((t) => (
    React.createElement(InfoToast, { 
      message, 
      onClose: () => toast.dismiss(t.id) 
    })
  ), { id: message, duration: TOAST_COOLDOWN });

  setTimeout(() => activeToasts.delete(message), TOAST_COOLDOWN);
};
