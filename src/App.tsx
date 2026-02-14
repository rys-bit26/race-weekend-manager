import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from './store/appStore';
import { useFilterStore } from './store/filterStore';
import { useNotificationStore } from './store/notificationStore';
import { useActiveWeekend } from './hooks/useRaceWeekend';
import { useActivities, filterActivities } from './hooks/useActivities';
import { useMasterSchedule } from './hooks/useMasterSchedule';
import { usePeople } from './hooks/usePeople';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import { searchActivities } from './services/search/SearchService';
import { seedDatabase } from './db/seed';
import { DAYS } from './utils/constants';
import { DayTabBar } from './components/schedule/DayTabBar';
import { ExecutiveView } from './components/schedule/ExecutiveView';
import { AndrettiView } from './components/schedule/AndrettiView';
import { SequentialView } from './components/schedule/SequentialView';
import { ActivityModal } from './components/activity/ActivityModal';
import { ImportDialog } from './components/import/ImportDialog';
import { ExportDialog } from './components/export/ExportDialog';
import { FilterBar } from './components/filters/FilterBar';
import { EventSelector } from './components/header/EventSelector';
import { AddEventModal } from './components/header/AddEventModal';
import { NotificationBell } from './components/notifications/NotificationBell';
import { NotificationToast } from './components/notifications/NotificationToast';
import { PersonSelector } from './components/notifications/PersonSelector';
import { NotificationPreferencesModal } from './components/notifications/NotificationPreferencesModal';
import type { Activity } from './types/activity';
import {
  LayoutGrid,
  Users,
  List,
  Plus,
  FileUp,
  Download,
  Menu,
  X,
  Flag,
} from 'lucide-react';

function App() {
  const { activeView, setActiveView, activeDay, sidebarOpen, setSidebarOpen } =
    useAppStore();
  const filters = useFilterStore();
  const activePersonId = useNotificationStore((s) => s.activePersonId);

  const { activeWeekend, activeWeekendId, weekends, setActiveWeekendId } = useActiveWeekend();
  const { activities, addActivity, updateActivity, deleteActivity } = useActivities(activeWeekendId);
  const { events: masterEvents } = useMasterSchedule(activeWeekendId);
  const { people } = usePeople();

  // Start notification scheduler
  useNotificationScheduler(activeWeekendId);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [personSelectorOpen, setPersonSelectorOpen] = useState(false);

  // Seed database on first load
  useEffect(() => {
    seedDatabase();
  }, []);

  // Show person selector on first visit if no person selected
  useEffect(() => {
    if (!activePersonId && people.length > 0) {
      setPersonSelectorOpen(true);
    }
  }, [activePersonId, people.length]);

  // Apply filters and search
  const filteredActivities = useMemo(() => {
    let result = filterActivities(activities, {
      departments: filters.departments,
      personIds: filters.personIds,
      statuses: filters.statuses,
      location: filters.location,
    });

    if (filters.searchQuery) {
      result = searchActivities(result, people, filters.searchQuery);
    }

    return result;
  }, [activities, filters, people]);

  // Current day label for single-day views
  const dayLabel = useMemo(
    () => DAYS.find((d) => d.id === activeDay)?.label ?? activeDay,
    [activeDay]
  );

  // Day-filtered data for single-day views (Andretti Only, Sequential)
  const dayMasterEvents = useMemo(
    () =>
      masterEvents
        .filter((e) => e.day === activeDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [masterEvents, activeDay]
  );

  const dayActivities = useMemo(
    () =>
      filteredActivities
        .filter((a) => a.day === activeDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [filteredActivities, activeDay]
  );

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityModalOpen(true);
  };

  const handleNewActivity = () => {
    setEditingActivity(null);
    setActivityModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-slate-900 text-white flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1 hover:bg-slate-800 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <Flag size={20} className="text-indigo-400" />
              <EventSelector
                weekends={weekends}
                activeWeekend={activeWeekend}
                onSelect={setActiveWeekendId}
                onAddNew={() => setAddEventOpen(true)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setActiveView('executive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'executive'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
                Full Team Schedule
              </button>
              <button
                onClick={() => setActiveView('andretti')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'andretti'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                Andretti Only
              </button>
              <button
                onClick={() => setActiveView('sequential')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeView === 'sequential'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List size={14} />
                Sequential
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={() => setImportOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Import Schedule"
            >
              <FileUp size={18} />
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Export PDF"
            >
              <Download size={18} />
            </button>
            <NotificationBell
              weekendId={activeWeekendId}
              onOpenPreferences={() => setPrefsOpen(true)}
            />
            <button
              onClick={handleNewActivity}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Activity</span>
            </button>
          </div>
        </div>

        {/* Mobile view toggle */}
        <div className="sm:hidden flex items-center bg-slate-800 mx-4 mb-2 rounded-lg p-0.5">
          <button
            onClick={() => setActiveView('executive')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'executive'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <LayoutGrid size={14} />
            Full
          </button>
          <button
            onClick={() => setActiveView('andretti')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'andretti'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <Users size={14} />
            Andretti
          </button>
          <button
            onClick={() => setActiveView('sequential')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'sequential'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <List size={14} />
            Sequential
          </button>
        </div>
      </header>

      {/* Day tabs */}
      <DayTabBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:flex-shrink-0 overflow-y-auto pt-2 px-3`}
        >
          {/* Mobile close */}
          <div className="flex justify-end lg:hidden mb-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <FilterBar people={people} />
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Schedule content */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'executive' ? (
            <ExecutiveView
              activities={filteredActivities}
              masterEvents={masterEvents}
              people={people}
              onEditActivity={handleEditActivity}
            />
          ) : activeView === 'andretti' ? (
            <AndrettiView
              activities={dayActivities}
              people={people}
              onEditActivity={handleEditActivity}
              dayLabel={dayLabel}
            />
          ) : (
            <SequentialView
              activities={dayActivities}
              masterEvents={dayMasterEvents}
              people={people}
              onEditActivity={handleEditActivity}
              dayLabel={dayLabel}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddEventModal
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        onCreated={(id) => setActiveWeekendId(id)}
      />

      <PersonSelector
        open={personSelectorOpen}
        people={people}
        onClose={() => setPersonSelectorOpen(false)}
      />

      <NotificationPreferencesModal
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        weekendId={activeWeekendId}
        activities={activities}
        people={people}
      />

      {activeWeekendId && (
        <>
          <ActivityModal
            open={activityModalOpen}
            onClose={() => {
              setActivityModalOpen(false);
              setEditingActivity(null);
            }}
            onSave={async (data) => {
              if (editingActivity) {
                await updateActivity(editingActivity.id, data);
              } else {
                await addActivity(data);
              }
            }}
            onDelete={
              editingActivity
                ? () => {
                    deleteActivity(editingActivity.id);
                  }
                : undefined
            }
            activity={editingActivity}
            people={people}
            weekendId={activeWeekendId}
          />

          <ImportDialog
            open={importOpen}
            onClose={() => setImportOpen(false)}
            weekendId={activeWeekendId}
          />

          {activeWeekend && (
            <ExportDialog
              open={exportOpen}
              onClose={() => setExportOpen(false)}
              weekend={activeWeekend}
              masterEvents={masterEvents}
              activities={filteredActivities}
              people={people}
            />
          )}
        </>
      )}

      {/* Toast overlay */}
      <NotificationToast />
    </div>
  );
}

export default App;
