import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '', productName: '' });

  const showToast = (message, productName) => {
    setToast({ visible: true, message, productName });
    setTimeout(() => {
      setToast({ visible: false, message: '', productName: '' });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);