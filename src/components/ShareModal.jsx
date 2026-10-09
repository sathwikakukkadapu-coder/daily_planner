import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Wifi, Users, Smartphone, Globe, RefreshCw, Share2, Server } from 'lucide-react';
import QRCode from 'qrcode';
import { getBackendUrl, getCustomApiUrl, setCustomApiUrl, isNativeApp } from '../utils/apiConfig';

export default function ShareModal({
  isOpen,
  onClose,
  roomId,
  onJoinRoom,
  isLiveConnected,
  onlineUserCount,
  myIdentity,
  onSetIdentity,
  user1,
  user2,
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  
  // Custom backend URL state (especially helpful on Android APK)
  const [serverUrlInput, setServerUrlInput] = useState(() => getCustomApiUrl() || getBackendUrl());
  const [serverSaved, setServerSaved] = useState(false);

  // Get shareable URL
  const getShareUrl = (rId) => {
    const backend = getBackendUrl();
    const activeRoom = rId || roomId;
    if (isNativeApp() && backend) {
      return `${backend}/?room=${encodeURIComponent(activeRoom)}`;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/?room=${encodeURIComponent(activeRoom)}`;
  };

  useEffect(() => {
    if (isOpen) {
      setInputRoomId(roomId);
      setServerUrlInput(getCustomApiUrl() || getBackendUrl());

      const backend = getBackendUrl();
      const apiUrl = backend ? `${backend}/api/network-info` : '/api/network-info';

      // Fetch network IP for mobile testing on same Wi-Fi
      fetch(apiUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Network info not available');
          return res.json();
        })
        .then((data) => setNetworkInfo(data))
        .catch(() => {});
    }
  }, [isOpen, roomId]);

  // Generate QR Code
  useEffect(() => {
    if (isOpen && (roomId || inputRoomId)) {
      const activeId = inputRoomId || roomId;
      const targetUrl = networkInfo?.localIp
        ? `http://${networkInfo.localIp}:${networkInfo.port || 3001}/?room=${encodeURIComponent(activeId)}`
        : getShareUrl(activeId);

      QRCode.toDataURL(targetUrl, { width: 180, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, roomId, inputRoomId, networkInfo]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = getShareUrl(inputRoomId || roomId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  const handleNativeShare = async () => {
    const url = getShareUrl(inputRoomId || roomId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DuoHabit Tracker',
          text: `Join my DuoHabit tracker room (${inputRoomId || roomId})!`,
          url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleGenerateNewRoom = () => {
    const randomCode = 'DUO-' + Math.floor(1000 + Math.random() * 9000);
    setInputRoomId(randomCode);
    onJoinRoom(randomCode);
  };

  const handleApplyRoom = (e) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      onJoinRoom(inputRoomId.trim());
    }
  };

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    setCustomApiUrl(serverUrlInput.trim());
    setServerSaved(true);
    setTimeout(() => setServerSaved(false), 2000);
    // Reload or rejoin to reconnect socket
    onJoinRoom(inputRoomId || roomId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Live Sync with Friend</h3>
              <p className="text-xs text-slate-500">Track and see each other's progress in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* Real-time Connection Status */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isLiveConnected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/80 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isLiveConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="font-semibold text-xs">
                {isLiveConnected
                  ? `Live Sync Active (${onlineUserCount} connected in room)`
                  : 'Sync Server Offline (Local Storage Mode)'}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-white/70 px-2 py-0.5 rounded border border-current/20">
              {roomId || 'None'}
            </span>
          </div>

          {/* Backend URL Configuration for Android / Remote Sync */}
          <form onSubmit={handleSaveServerUrl} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5 text-xs">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>Backend Server URL</span>
              </label>
              {serverSaved && <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
                placeholder="e.g. https://your-server.onrender.com"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition text-[11px]"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              On Android, configure this to your live server or Wi-Fi IP (e.g. <code>http://192.168.x.x:3001</code>).
            </p>
          </form>

          {/* Device Identity Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Who are you on this device / phone?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSetIdentity('user1')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                  myIdentity === 'user1'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{user1.avatar}</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{user1.name}</div>
                  <div className="text-[10px] text-slate-400">Primary user</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSetIdentity('user2')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                  myIdentity === 'user2'
                    ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{user2.avatar}</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{user2.name}</div>
                  <div className="text-[10px] text-slate-400">Friend user</div>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your friend can open this same link on their device and choose their profile.
            </p>
          </div>

          {/* Room ID and Join */}
          <form onSubmit={handleApplyRoom} className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Shared Room Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="e.g. DUO-7842"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition"
              >
                Join
              </button>
              <button
                type="button"
                onClick={handleGenerateNewRoom}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                title="Generate new random room code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Copy Link & Native Share Button */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Share Link with Friend</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl(inputRoomId || roomId)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs truncate font-mono select-all"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                  title="Native Share"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}
            </div>
          </div>

          {/* QR Code for Phone Scan */}
          {qrDataUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-2">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Scan with phone camera to open instantly:</span>
              </div>
              <img
                src={qrDataUrl}
                alt="Room QR Code"
                className="w-36 h-36 border border-slate-200 rounded-lg bg-white p-1 shadow-sm"
              />
              {networkInfo?.localIp && (
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Local Wi-Fi IP: <code>http://{networkInfo.localIp}:{networkInfo.port || 3001}</code>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
