import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const [unread, setUnread]               = useState(0);
  const dropdownRef                       = useRef(null);
  const clientRef                         = useRef(null);
  const username                          = localStorage.getItem('username');
  const token                             = localStorage.getItem('token');

  useEffect(() => {
    // Connect to WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(
          `/user/${username}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            setNotifications(prev => [{
              id:      Date.now(),
              message: notification.message,
              title:   notification.complaintTitle,
              time:    new Date().toLocaleTimeString(),
              read:    false,
            }, ...prev].slice(0, 10));
            setUnread(prev => prev + 1);
          }
        );
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [username, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  return (
    <div ref={dropdownRef} style={s.wrapper}>
      {/* Bell Button */}
      <button style={s.bell} onClick={handleOpen}>
        🔔
        {unread > 0 && (
          <span style={s.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={s.dropdown}>
          <div style={s.dropdownHeader}>
            <span style={s.dropdownTitle}>Notifications</span>
            {notifications.length > 0 && (
              <span
                style={s.clearBtn}
                onClick={() => setNotifications([])}
              >
                Clear all
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
              <p style={{ color: '#6b9e80', fontSize: '13px', margin: 0 }}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div style={s.list}>
              {notifications.map(n => (
                <div key={n.id} style={s.notifItem}>
                  <div style={s.notifIcon}>🔔</div>
                  <div style={s.notifContent}>
                    <div style={s.notifTitle}>{n.title}</div>
                    <div style={s.notifMessage}>{n.message}</div>
                    <div style={s.notifTime}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const s = {
  wrapper:       { position: 'relative' },
  bell:          { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 12px', fontSize: '18px', cursor: 'pointer', position: 'relative', color: '#fff' },
  badge:         { position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropdown:      { position: 'absolute', top: '48px', right: 0, width: '320px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5', boxShadow: '0 8px 32px rgba(26,71,49,0.15)', zIndex: 1000, overflow: 'hidden' },
  dropdownHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e0ede5' },
  dropdownTitle: { fontSize: '15px', fontWeight: '700', color: '#1a2e1f' },
  clearBtn:      { fontSize: '12px', color: '#6b9e80', cursor: 'pointer' },
  empty:         { padding: '40px 20px', textAlign: 'center' },
  list:          { maxHeight: '360px', overflowY: 'auto' },
  notifItem:     { display: 'flex', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #f0f7f0', transition: 'background 0.15s' },
  notifIcon:     { fontSize: '20px', flexShrink: 0 },
  notifContent:  { flex: 1 },
  notifTitle:    { fontSize: '13px', fontWeight: '700', color: '#1a2e1f', marginBottom: '2px' },
  notifMessage:  { fontSize: '12px', color: '#6b9e80', lineHeight: '1.4', marginBottom: '4px' },
  notifTime:     { fontSize: '11px', color: '#b0c4ba' },
};

export default NotificationBell;