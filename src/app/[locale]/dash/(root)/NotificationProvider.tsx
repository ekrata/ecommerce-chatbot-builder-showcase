import 'react-toastify/dist/ReactToastify.css';

import { createContext, PropsWithChildren, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const NotificationContext = createContext(toast)
export const useNotificationContext = () => useContext(NotificationContext)

export const NotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {

  return (
    <NotificationContext.Provider value={toast}>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {children}
    </NotificationContext.Provider>
  )
}
