import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPreferredTheme, applyTheme, saveTheme } from '../utils/theme';

const useAppStore = create(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            activePlant: 'Plant A',
            theme: getPreferredTheme(),
            
            shiftPref: 'A Shift',
            weeklyOff: 'Sunday',
            shiftAlerts: true,
            notifications: {
                production: true,
                inventory: false,
                machine: true,
                email: true,
            },
            sysPref: {
                dashboard: 'Main',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
            },
            dashboardFilter: 'today',

            activities: [
                {
                    id: 1,
                    title: 'System Initialized',
                    detail: 'Production Planner SPA loaded successfully.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'Ready',
                }
            ],

            setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
            setActivePlant: (activePlant) => set({ activePlant }),
            setTheme: (theme) => set((state) => {
                // persist and apply immediately
                try {
                    saveTheme(theme);
                    applyTheme(theme);
                } catch (e) {
                    // ignore in SSR or unexpected env
                }
                return { theme };
            }),
            
            setShiftPref: (shiftPref) => set({ shiftPref }),
            setWeeklyOff: (weeklyOff) => set({ weeklyOff }),
            setShiftAlerts: (shiftAlerts) => set({ shiftAlerts }),
            setNotifications: (notifications) => set({ notifications }),
            setSysPref: (sysPref) => set({ sysPref }),
            setDashboardFilter: (dashboardFilter) => set({ dashboardFilter }),
            
            logActivity: (activity) => set((state) => ({
                activities: [{
                    id: Date.now(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ...activity
                }, ...state.activities].slice(0, 50)
            })),
        }),
        {
            name: 'ppss-app-storage',
        }
    )
);

export default useAppStore;
