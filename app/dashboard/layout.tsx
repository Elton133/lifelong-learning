"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Target, ListMusic, Lightbulb, BarChart3, LogOut, Menu, X, Flame, Sun, Moon, Settings, User } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SWRProvider } from "@/lib/swr-provider"
import { useUser, useDashboardStats } from "@/hooks/useUser"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/contexts/ThemeContext"
import type React from "react"

// Constants for the leveling system
const XP_PER_LEVEL = 200; // Amount of XP required to gain one level

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Skills", href: "/dashboard/skills", icon: Target },
  { name: "Playlist", href: "/dashboard/playlist", icon: ListMusic },
  { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
  { name: "Progress", href: "/dashboard/progress", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { profile } = useUser()
  const { stats } = useDashboardStats()
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  // Calculate level based on XP
  const level = Math.floor((stats?.total_xp || 0) / XP_PER_LEVEL) + 1
  
  // Get user initials
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-950 border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header with gradient and improved branding */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">LL</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">Lifelong Learning</span>
              <span className="text-xs text-muted-foreground">Grow every day</span>
            </div>
          </Link>
          <button
            className="absolute top-6 right-4 lg:hidden p-1 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-2 py-2 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
          </div>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover-lift",
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl -z-10"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
        
        {/* User section with stats */}
        <div className="p-4 border-t border-border">
          {/* Stats display */}
          <div className="flex gap-2 mb-4 px-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-sm font-bold text-foreground mt-0.5">{stats?.streak_count || 0} days</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-1 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-2.5"
            >
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{level}</p>
            </motion.div>
          </div>
          
          {/* User profile */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 px-3 py-3 bg-muted rounded-xl mb-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{getInitials(profile?.full_name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.role || 'Learner'}</p>
            </div>
          </motion.div>
          
          {/* Sign out button */}
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-foreground" />
                )}
              </motion.button>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{(stats?.total_xp || 0).toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">Level {level}</p>
              </div>
              
              {/* User Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="text-white font-bold text-sm">{getInitials(profile?.full_name)}</span>
                </motion.button>
                
                <AnimatePresence>
                  {userDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-border overflow-hidden z-20"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-border bg-muted/50">
                          <p className="font-semibold text-foreground truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile?.role || 'Learner'}
                          </p>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleSignOut();
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-red-600 dark:text-red-400"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SWRProvider>
  )
}
