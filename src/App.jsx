import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import UserSwitcher from './components/UserSwitcher';
import HabitTable from './components/HabitTable';
import HabitChart from './components/HabitChart';
import ComparisonView from './components/ComparisonView';
import ShareModal from './components/ShareModal';
import HabitModal from './components/HabitModal';
import ProfileModal from './components/ProfileModal';

import { getMonthDays, groupDaysByWeeks } from './utils/dateUtils';
import {
  loadLocalState,
  saveLocalState,
  getSavedIdentity,
  setSavedIdentity,
  getSavedRoomId,
  setSavedRoomId,
  getDefaultAppData,
} from './utils/storage';
import { connectSocket, broadcastState, disconnectSocket } from './utils/socket';

export default function App() {
  // Load initial app data
  const [appData, setAppData] = useState(() => loadLocalState());

  // URL Query inspection (?room=XYZ, ?as=user2)
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialRoomId = queryParams.get('room') || getSavedRoomId() || 'DUO-HABIT-1';
  const initialIdentity = queryParams.get('as') || getSavedIdentity() || 'user1';

  const [roomId, setRoomId] = useState(initialRoomId);
  const [myIdentity, setMyIdentity] = useState(initialIdentity);

  // Active view: user1, user2, or compare
  const [activeUserId, setActiveUserId] = useState(initialIdentity);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Real-time Socket state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [onlineUserCount, setOnlineUserCount] = useState(1);

  // Current calendar month & year
  const currentYear = appData.currentYear || new Date().getFullYear();
  const currentMonth = appData.currentMonth !== undefined ? appData.currentMonth : new Date().getMonth();

  // Save to localStorage whenever appData updates
  useEffect(() => {
    saveLocalState(appData);
  }, [appData]);

  // Connect socket and handle room synchronization
  useEffect(() => {
    setSavedRoomId(roomId);

    const userName = appData.users[myIdentity]?.name || 'User';

    const socket = connectSocket(roomId, userName, {
      onStateSync: (incoming) => {
        if (incoming && incoming.users) {
          setAppData(incoming);
        }
      },
      onPresence: (count) => {
        setOnlineUserCount(count || 1);
      },
      onConnectStatus: (connected) => {
        setIsLiveConnected(connected);
      },
    });

    return () => {
      disconnectSocket();
    };
  }, [roomId, myIdentity]);

  // Calculate calendar days & weeks for the selected month
  const days = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const weeks = useMemo(() => {
    return groupDaysByWeeks(days);
  }, [days]);

  // Helper: compute stats for a user
  const calculateStats = useCallback(
    (userData) => {
      if (!userData) return { totalHabits: 0, totalCompletedHabits: 0, progressPct: 0 };
      const habits = userData.habits || [];
      const completions = userData.completions || {};
      const totalHabits = habits.length;

      let totalCompleted = 0;
      days.forEach((day) => {
        const dayComps = completions[day.dateKey] || {};
        habits.forEach((h) => {
          if (dayComps[h.id]) totalCompleted++;
        });
      });

      const totalPossible = totalHabits * days.length;
      const progressPct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      return {
        totalHabits,
        totalCompletedHabits: totalCompleted,
        progressPct,
      };
    },
    [days]
  );

  const user1 = appData.users.user1;
  const user2 = appData.users.user2;

  const user1Stats = useMemo(() => calculateStats(user1), [user1, calculateStats]);
  const user2Stats = useMemo(() => calculateStats(user2), [user2, calculateStats]);

  const activeUserData = activeUserId === 'user1' ? user1 : user2;
  const activeUserStats = activeUserId === 'user1' ? user1Stats : user2Stats;
  const otherUserData = activeUserId === 'user1' ? user2 : user1;

  // Broadcast any state change helper
  const updateAndBroadcast = (updater) => {
    setAppData((prev) => {
      const next = updater(prev);
      broadcastState(next);
      return next;
    });
  };

  // Habit checkbox toggle
  const handleToggleHabit = (habitId, dateKey) => {
    updateAndBroadcast((prev) => {
      const targetUser = prev.users[activeUserId];
      const prevCompletions = targetUser.completions || {};
      const dayCompletions = { ...(prevCompletions[dateKey] || {}) };

      if (dayCompletions[habitId]) {
        delete dayCompletions[habitId];
      } else {
        dayCompletions[habitId] = true;
      }

      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...targetUser,
            completions: {
              ...prevCompletions,
              [dateKey]: dayCompletions,
            },
          },
        },
      };
    });
  };

  // Add or Edit Habit
  const handleSaveHabit = ({ id, title, emoji, category, copyToOtherUser }) => {
    updateAndBroadcast((prev) => {
      const targetUser = prev.users[activeUserId];
      const otherUserKey = activeUserId === 'user1' ? 'user2' : 'user1';
      const otherUser = prev.users[otherUserKey];

      let updatedHabits = [...targetUser.habits];

      if (id) {
        // Edit existing
        updatedHabits = updatedHabits.map((h) =>
          h.id === id ? { ...h, title, emoji, category } : h
        );
      } else {
        // Create new
        const newHabit = {
          id: 'h_' + Date.now(),
          title,
          emoji,
          category,
        };
        updatedHabits.push(newHabit);
      }

      let updatedOtherHabits = otherUser.habits;
      if (copyToOtherUser && !id) {
        const sharedCopy = {
          id: 'h_shared_' + Date.now(),
          title,
          emoji,
          category,
        };
        updatedOtherHabits = [...updatedOtherHabits, sharedCopy];
      }

      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...targetUser,
            habits: updatedHabits,
          },
          [otherUserKey]: {
            ...otherUser,
            habits: updatedOtherHabits,
          },
        },
      };
    });
  };

  // Delete Habit
  const handleDeleteHabit = (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    updateAndBroadcast((prev) => {
      const targetUser = prev.users[activeUserId];
      const updatedHabits = targetUser.habits.filter((h) => h.id !== habitId);

      // Clean up completion references
      const cleanedComps = {};
      Object.entries(targetUser.completions || {}).forEach(([dKey, hMap]) => {
        const newMap = { ...hMap };
        delete newMap[habitId];
        cleanedComps[dKey] = newMap;
      });

      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...targetUser,
            habits: updatedHabits,
            completions: cleanedComps,
          },
        },
      };
    });
  };

  // Copy single habit to other user's list
  const handleCopyHabitToOtherUser = (habit) => {
    const otherUserKey = activeUserId === 'user1' ? 'user2' : 'user1';
    const otherName = appData.users[otherUserKey].name;

    if (window.confirm(`Copy "${habit.title}" to ${otherName}'s tracker as a shared challenge?`)) {
      updateAndBroadcast((prev) => {
        const targetOther = prev.users[otherUserKey];
        const newHabit = {
          ...habit,
          id: 'h_copy_' + Date.now(),
        };
        return {
          ...prev,
          users: {
            ...prev.users,
            [otherUserKey]: {
              ...targetOther,
              habits: [...targetOther.habits, newHabit],
            },
          },
        };
      });
    }
  };

  // Save Profiles
  const handleSaveProfiles = ({ user1: newU1, user2: newU2 }) => {
    updateAndBroadcast((prev) => ({
      ...prev,
      users: {
        user1: newU1,
        user2: newU2,
      },
    }));
  };

  // Month navigation
  const handlePrevMonth = () => {
    setAppData((prev) => {
      let m = prev.currentMonth - 1;
      let y = prev.currentYear;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
      const next = { ...prev, currentMonth: m, currentYear: y };
      broadcastState(next);
      return next;
    });
  };

  const handleNextMonth = () => {
    setAppData((prev) => {
      let m = prev.currentMonth + 1;
      let y = prev.currentYear;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      const next = { ...prev, currentMonth: m, currentYear: y };
      broadcastState(next);
      return next;
    });
  };

  const handleJumpToday = () => {
    const now = new Date();
    setAppData((prev) => {
      const next = { ...prev, currentMonth: now.getMonth(), currentYear: now.getFullYear() };
      broadcastState(next);
      return next;
    });
  };

  // Export / Backup data as JSON file
  const handleExportData = () => {
    const jsonStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Habit-Tracker-Backup-${currentYear}-${currentMonth + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Today key
  const todayDateKey = useMemo(() => {
    const now = new Date();
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const dStr = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mStr}-${dStr}`;
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-3 sm:p-6 lg:p-8 max-w-[1400px] mx-auto transition-all">
      {/* Header with Month, Navigation, and KPI cards */}
      <Header
        year={currentYear}
        monthIndex={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToday={handleJumpToday}
        activeUserStats={activeUserStats}
        activeUserData={activeUserData}
        isLiveConnected={isLiveConnected}
        onlineUserCount={onlineUserCount}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onAddHabitClick={() => {
          setHabitToEdit(null);
          setIsHabitModalOpen(true);
        }}
        onExportData={handleExportData}
      />

      {/* User Switcher Tabs (Me vs Friend vs Compare Both) */}
      <UserSwitcher
        user1={user1}
        user2={user2}
        activeUserId={activeUserId}
        onSelectUser={(uId) => {
          setActiveUserId(uId);
          setIsCompareMode(false);
        }}
        isCompareMode={isCompareMode}
        onToggleCompareMode={(val) => setIsCompareMode(val)}
        myIdentity={myIdentity}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        user1Stats={user1Stats}
        user2Stats={user2Stats}
      />

      {/* Main Content Area */}
      {isCompareMode ? (
        <ComparisonView
          days={days}
          weeks={weeks}
          user1={user1}
          user2={user2}
          user1Stats={user1Stats}
          user2Stats={user2Stats}
          todayDateKey={todayDateKey}
          onSelectUser={(uId) => {
            setActiveUserId(uId);
            setIsCompareMode(false);
          }}
        />
      ) : (
        <main className="space-y-4">
          {/* Main Habit Spreadsheet Grid matching Image 2 */}
          <HabitTable
            days={days}
            weeks={weeks}
            userData={activeUserData}
            onToggleHabit={handleToggleHabit}
            onAddHabitClick={() => {
              setHabitToEdit(null);
              setIsHabitModalOpen(true);
            }}
            onEditHabitClick={(habit) => {
              setHabitToEdit(habit);
              setIsHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onCopyHabitToOtherUser={handleCopyHabitToOtherUser}
            otherUserName={otherUserData.name}
            activeUserId={activeUserId}
            currentViewerIdentity={myIdentity}
          />

          {/* Monthly Consistency Curve Chart matching Image 2 */}
          <HabitChart
            days={days}
            user1Data={user1}
            user2Data={user2}
            activeUserId={activeUserId}
            isCompareMode={false}
          />
        </main>
      )}

      {/* Share / Live Sync Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId}
        onJoinRoom={(newRoom) => setRoomId(newRoom)}
        isLiveConnected={isLiveConnected}
        onlineUserCount={onlineUserCount}
        myIdentity={myIdentity}
        onSetIdentity={(id) => {
          setMyIdentity(id);
          setSavedIdentity(id);
          setActiveUserId(id);
        }}
        user1={user1}
        user2={user2}
      />

      {/* Add / Edit Habit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        onSaveHabit={handleSaveHabit}
        habitToEdit={habitToEdit}
        otherUserName={otherUserData.name}
      />

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user1={user1}
        user2={user2}
        onSaveProfiles={handleSaveProfiles}
      />
    </div>
  );
}
