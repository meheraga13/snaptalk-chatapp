import './index.css';
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useEffect, useState } from "react";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import React from 'react';

const App = () => {
  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset detail view when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setShowDetail(false);
    }
  }, [isMobile]);

  if (isLoading) return <div className="loading">Loading...</div>

  return (
    <div className='container'>
      {
        currentUser ? (
          <>
            {/* Desktop Layout */}
            {!isMobile ? (
              <>
                <List/>
                {chatId && <Chat/>}
                {chatId && <Detail/>}
              </>
            ) : (
              /* Mobile Layout */
              <>
                {!chatId ? (
                  <List/>
                ) : !showDetail ? (
                  <Chat onShowDetail={() => setShowDetail(true)}/>
                ) : (
                  <Detail onBack={() => setShowDetail(false)}/>
                )}
              </>
            )}
          </> 
        ) : (
          <Login />
        )}
      <Notification/>
    </div>
  )
}

export default App