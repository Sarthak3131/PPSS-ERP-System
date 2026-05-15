import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import Select from '../components/ui/Select';
import useAppStore from '../store/appStore';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/ui/ToastProvider';
import * as userService from '../services/userService';
import { getApiErrorMessage } from '../utils/apiEnvelope';

export default function Settings() {
    const { hash } = useLocation();
    const { logout, user } = useAuth();
    const { push: pushToast } = useToast();
    
    const [profile, setProfile] = React.useState({ name: '', email: '', department: '', plantLocation: '' });
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [profileError, setProfileError] = React.useState(null);
    
    const activePlant = useAppStore((s) => s.activePlant);
    const setActivePlant = useAppStore((s) => s.setActivePlant);
    const shiftPref = useAppStore((s) => s.shiftPref);
    const setShiftPref = useAppStore((s) => s.setShiftPref);
    const weeklyOff = useAppStore((s) => s.weeklyOff);
    const setWeeklyOff = useAppStore((s) => s.setWeeklyOff);
    const shiftAlerts = useAppStore((s) => s.shiftAlerts);
    const setShiftAlerts = useAppStore((s) => s.setShiftAlerts);
    const notifications = useAppStore((s) => s.notifications);
    const setNotifications = useAppStore((s) => s.setNotifications);
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);
    const sysPref = useAppStore((s) => s.sysPref);
    const setSysPref = useAppStore((s) => s.setSysPref);

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                plantLocation: user.plant || activePlant,
            });
        }
    }, [user, activePlant]);

    const saveSetting = (setter, value, successMsg) => {
        try {
            setter(value);
            pushToast({ title: 'Saved', message: successMsg, tone: 'success' });
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to save settings.', tone: 'error' });
        }
    };

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [hash]);

    const handleNotificationToggle = (key) => {
        saveSetting(setNotifications, { ...notifications, [key]: !notifications[key] }, 'Notification preferences updated.');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileError(null);
        setIsSavingProfile(true);

        try {
            if (!profile.name || !profile.email) {
                setProfileError('Name and email are required.');
                setIsSavingProfile(false);
                return;
            }

            await userService.updateProfile({
                name: profile.name,
                email: profile.email,
                department: profile.department,
                plant: profile.plantLocation,
            });

            pushToast({ title: 'Success', message: 'Profile updated successfully.', tone: 'success' });
            setActivePlant(profile.plantLocation);
        } catch (error) {
            const message = getApiErrorMessage(error) || 'Failed to update profile.';
            setProfileError(message);
            pushToast({ title: 'Error', message, tone: 'error' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <section className="space-y-6 pb-20">
            <PageHeader title="System Settings" subtitle="Manage your personal preferences, notifications, and global system configuration." />
            <div className="mx-auto max-w-4xl space-y-8">
                <section id="profile" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">Profile Settings</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Update your personal information and department details.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput id="profile-name" label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={isSavingProfile} />
                        <FormInput id="profile-email" type="email" label="Email Address" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled={isSavingProfile} />
                        <FormInput id="profile-dept" label="Department" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} disabled={isSavingProfile} />
                        <Select id="profile-plant" label="Plant Location" value={profile.plantLocation} onChange={(e) => { setProfile({ ...profile, plantLocation: e.target.value }); }} disabled={isSavingProfile}>
                            <option value="Plant A">Plant A</option>
                            <option value="Plant B">Plant B</option>
                            <option value="Plant C">Plant C</option>
                        </Select>
                    </div>
                    {profileError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>}
                    <div className="mt-6 flex justify-end">
                        <Button variant="primary" onClick={handleSaveProfile} loading={isSavingProfile} disabled={isSavingProfile}>Save Profile</Button>
                    </div>
                </section>
                <section id="shift" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">Shift Preferences</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Configure your working hours and availability.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select id="shift-pref" label="Preferred Shift" value={shiftPref} onChange={(e) => saveSetting(setShiftPref, e.target.value, 'Shift preference updated.')}>
                            <option value="A Shift">A Shift (06:00 - 14:00)</option>
                            <option value="B Shift">B Shift (14:00 - 22:00)</option>
                            <option value="C Shift">C Shift (22:00 - 06:00)</option>
                            <option value="General">General (09:00 - 17:00)</option>
                        </Select>
                        <Select id="shift-off" label="Weekly Off" value={weeklyOff} onChange={(e) => saveSetting(setWeeklyOff, e.target.value, 'Weekly off updated.')}>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                            <option value="Rotating">Rotating</option>
                        </Select>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <div><p className="font-semibold text-[var(--erp-ink)] text-sm">Shift Alerts</p><p className="text-xs text-[var(--erp-muted)]">Receive notifications for shift changes or overtime requests.</p></div>
                        <input type="checkbox" checked={shiftAlerts} onChange={(e) => saveSetting(setShiftAlerts, e.target.checked, 'Shift alerts updated.')} className="h-5 w-10 appearance-none rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] transition-all checked:border-[var(--erp-primary)] checked:bg-[var(--erp-primary)] focus:ring-2 focus:ring-[var(--erp-primary)]/50" />
                    </div>
                </section>
                <section id="notifications" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">Notification Settings</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Manage what events trigger alerts across the system.</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { key: 'production', label: 'Production Alerts', desc: 'Updates on order completion and delays.' },
                            { key: 'inventory', label: 'Inventory Alerts', desc: 'Low stock and reorder point warnings.' },
                            { key: 'machine', label: 'Machine Alerts', desc: 'Breakdowns, maintenance schedules, and capacity overloads.' },
                            { key: 'email', label: 'Email Notifications', desc: 'Receive a daily digest of all alerts via email.' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between erp-subpanel">
                                <div><p className="font-semibold text-[var(--erp-ink)] text-sm">{item.label}</p><p className="text-xs text-[var(--erp-muted)]">{item.desc}</p></div>
                                <input type="checkbox" checked={notifications[item.key]} onChange={() => handleNotificationToggle(item.key)} className="h-5 w-10 appearance-none rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] transition-all checked:border-[var(--erp-primary)] checked:bg-[var(--erp-primary)] focus:ring-2 focus:ring-[var(--erp-primary)]/50" />
                            </div>
                        ))}
                    </div>
                </section>
                <section id="theme" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">Theme Settings</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Customize the visual appearance of the application.</p>
                    </div>
                    <div className="flex gap-4">
                        {["light", "dark", "system"].map((t) => (
                            <button key={t} onClick={() => saveSetting(setTheme, t, `Theme set to ${t}.`)} className={`flex-1 rounded-xl border p-4 text-center transition-all ${theme === t ? "border-[var(--erp-primary)] bg-[var(--erp-primary)]/5 text-[var(--erp-primary)] ring-1 ring-[var(--erp-primary)]" : "border-[var(--erp-border)] bg-[var(--erp-surface)] text-[var(--erp-muted)] hover:border-[var(--erp-muted)]"}`}>
                                <span className="block text-sm font-semibold capitalize">{t}</span>
                            </button>
                        ))}
                    </div>
                </section>
                <section id="security" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">Security Settings</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Manage your password and active sessions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormInput id="sec-curr" type="password" label="Current Password" placeholder="••••••••" />
                        <FormInput id="sec-new" type="password" label="New Password" placeholder="••••••••" />
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--erp-border)] pt-6">
                        <div><p className="font-semibold text-[var(--erp-ink)] text-sm">Active Sessions</p><p className="text-xs text-[var(--erp-muted)]">Sign out from all other devices.</p></div>
                        <Button variant="danger" onClick={logout}>Logout All Devices</Button>
                    </div>
                </section>
                <section id="system" className="erp-panel scroll-mt-24">
                    <div className="border-b border-[var(--erp-border)] pb-4 mb-6">
                        <h3 className="text-xl font-bold text-[var(--erp-ink)]">System Preferences</h3>
                        <p className="mt-1 text-sm text-[var(--erp-muted)]">Global formatting and default views.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Select id="sys-dash" label="Default Dashboard" value={sysPref.dashboard} onChange={(e) => saveSetting(setSysPref, { ...sysPref, dashboard: e.target.value }, 'Dashboard preference saved.')}>
                            <option value="Main">Main Dashboard</option>
                            <option value="Scheduling">Scheduling Board</option>
                            <option value="Machines">Machine Planning</option>
                        </Select>
                        <Select id="sys-date" label="Date Format" value={sysPref.dateFormat} onChange={(e) => saveSetting(setSysPref, { ...sysPref, dateFormat: e.target.value }, 'Date format saved.')}>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </Select>
                        <Select id="sys-time" label="Time Format" value={sysPref.timeFormat} onChange={(e) => saveSetting(setSysPref, { ...sysPref, timeFormat: e.target.value }, 'Time format saved.')}>
                            <option value="24h">24-hour</option>
                            <option value="12h">12-hour (AM/PM)</option>
                        </Select>
                    </div>
                </section>
            </div>
        </section>
    );
}
