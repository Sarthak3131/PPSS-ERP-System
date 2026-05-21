import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, Bars3Icon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import useAuth from '../hooks/useAuth';
import * as notificationService from '../services/notificationService';
import { useToast } from '../components/ui/ToastProvider';

const Navbar = React.memo(function Navbar({ openSidebar }) {
    const { logout, isAuthenticated, sessionChecked } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);
    const { push: pushToast } = useToast();

    const fetchNotifications = async () => {
        try {
            setIsLoadingNotifs(true);
            const res = await notificationService.getAll();
            setNotifications(res.data);
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to load notifications', tone: 'error' });
        } finally {
            setIsLoadingNotifs(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !sessionChecked) {
            setIsLoadingNotifs(false);
            setNotifications([]);
            return;
        }

        fetchNotifications();
    }, [isAuthenticated, sessionChecked]);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markRead(id);
            fetchNotifications();
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to mark notification as read', tone: 'error' });
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            fetchNotifications();
            pushToast({ title: 'Success', message: 'All notifications marked as read', tone: 'success' });
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to mark all as read', tone: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.remove(id);
            fetchNotifications();
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to delete notification', tone: 'error' });
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b border-(--erp-border) bg-(--erp-surface-muted)/95 px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors sm:px-5 lg:px-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openSidebar}
                        className="rounded-lg border border-(--erp-border) bg-(--erp-surface) p-1.5 text-(--erp-muted) shadow-sm transition hover:border-(--erp-primary) hover:text-(--erp-ink) lg:hidden"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>

                    <div className="hidden items-center gap-2 rounded-lg border border-(--erp-border) bg-(--erp-surface) px-3 py-1.5 text-sm text-(--erp-muted) shadow-sm sm:flex">
                        <MagnifyingGlassIcon className="h-4 w-4" />
                        <span>Search orders, machines, SKUs...</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                            className="relative rounded-lg border border-(--erp-border) bg-(--erp-surface) p-1.5 text-(--erp-muted) shadow-sm transition hover:border-(--erp-primary) hover:text-(--erp-ink)"
                        >
                            <BellIcon className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--erp-danger) text-[9px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div 
                            className={`absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-(--erp-border) bg-(--erp-surface) p-2 shadow-lg focus:outline-none z-50 transition-all duration-200 ease-out ${notificationsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                        >
                            <div className="flex items-center justify-between px-2 pb-2 border-b border-(--erp-border) mb-2">
                                <span className="text-sm font-semibold text-(--erp-ink)">Notifications</span>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-(--erp-primary) hover:underline">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                                {isLoadingNotifs ? (
                                    <div className="p-4 text-center text-xs text-(--erp-muted)">Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-(--erp-muted)">No notifications available.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`group relative rounded-lg p-2 transition hover:bg-(--erp-surface-muted) ${!n.read_at ? 'bg-(--erp-primary)/5' : ''}`}>
                                            <div className="pr-6 cursor-pointer" onClick={() => !n.read_at && handleMarkRead(n.id)}>
                                                <p className={`text-xs ${!n.read_at ? 'font-semibold text-(--erp-ink)' : 'text-(--erp-muted)'}`}>{n.message || 'System Alert'}</p>
                                                <p className="mt-0.5 text-[10px] text-(--erp-muted)">{new Date(n.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                                                className="absolute right-2 top-2 hidden text-(--erp-muted) hover:text-(--erp-danger) group-hover:block"
                                                title="Delete"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <ThemeToggle />

                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                            className="flex items-center gap-3 rounded-full border border-(--erp-border) bg-(--erp-surface) py-1 pl-1 pr-3 text-left shadow-sm transition hover:border-(--erp-primary) hover:ring-1 hover:ring-(--erp-primary)/20"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--erp-primary)/10 text-sm font-bold text-(--erp-primary)">
                                SS
                            </div>
                            <div className="hidden flex-col sm:flex">
                                <span className="text-sm font-semibold text-(--erp-ink)">Sarthak Srivastava</span>
                                <span className="text-[11px] text-(--erp-muted)">Production Planner &bull; Plant A</span>
                            </div>
                            <ChevronDownIcon className={`h-4 w-4 text-(--erp-muted) transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <div 
                            className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-(--erp-border) bg-(--erp-surface) p-1 shadow-lg focus:outline-none z-50 transition-all duration-200 ease-out ${profileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                        >
                            <Link to="/settings#profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-4 py-2 text-sm font-medium text-(--erp-ink) transition hover:bg-(--erp-surface-muted)">My Profile</Link>
                            <Link to="/settings#shift" onClick={() => setProfileOpen(false)} className="block rounded-lg px-4 py-2 text-sm font-medium text-(--erp-ink) transition hover:bg-(--erp-surface-muted)">Shift Preferences</Link>
                            <Link to="/settings#notifications" onClick={() => setProfileOpen(false)} className="block rounded-lg px-4 py-2 text-sm font-medium text-(--erp-ink) transition hover:bg-(--erp-surface-muted)">Notification Settings</Link>
                            <div className="my-1 border-t border-(--erp-border)"></div>
                            <button onClick={() => { setProfileOpen(false); logout(); }} className="block w-full text-left rounded-lg px-4 py-2 text-sm font-medium text-(--erp-danger) transition hover:bg-(--erp-danger)/10">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});

export default Navbar;
