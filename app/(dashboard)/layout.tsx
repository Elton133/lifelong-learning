"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Target, ListMusic, Lightbulb, BarChart3, LogOut, Menu, X, Flame } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SWRProvider } from "@/lib/swr-provider"
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Skills", href: "/skills", icon: Target },
  { name: "Playlist", href: "/playlist", icon: ListMusic },
  { name: "Insights", href: "/insights", icon: Lightbulb },
  { name: "Progress", href: "/progress", icon: BarChart3 },
]
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <SWRProvider>
      {" "}
      <div className="min-h-screen bg-background">
        {" "}
        {/* Mobile sidebar backdrop */}{" "}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}{" "}
        {/* Sidebar */}{" "}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-950 border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {" "}
          {/* Redesigned sidebar header with gradient and improved branding */}{" "}
          <div className="p-6 border-b border-border">
            {" "}
            <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              {" "}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                {" "}
                <span className="text-white font-bold text-lg">SF</span>{" "}
              </div>{" "}
              <div className="flex flex-col">
                {" "}
                <span className="font-bold text-lg text-foreground">SkillFlow</span>{" "}
                <span className="text-xs text-muted-foreground">Master new skills</span>{" "}
              </div>{" "}
            </Link>{" "}
            <button
              className="absolute top-6 right-4 lg:hidden p-1 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              {" "}
              <X className="w-5 h-5" />{" "}
            </button>{" "}
          </div>{" "}
          {/* Added flex-1 to push user section to bottom, improved spacing */}{" "}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {" "}
            {/* Added category labels for better visual hierarchy */}{" "}
            <div className="px-2 py-2 mb-4">
              {" "}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>{" "}
            </div>{" "}
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {" "}
                  <item.icon className="w-5 h-5 flex-shrink-0" /> <span className="truncate">{item.name}</span>{" "}
                </Link>
              )
            })}{" "}
          </nav>{" "}
          {/* Enhanced user section with stats and better styling */}{" "}
          <div className="p-4 border-t border-border">
            {" "}
            {/* Stats display */}{" "}
            <div className="flex gap-2 mb-4 px-2">
              {" "}
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-2.5">
                {" "}
                <div className="flex items-center gap-1.5">
                  {" "}
                  <Flame className="w-4 h-4 text-orange-500" />{" "}
                  <span className="text-xs text-muted-foreground">Streak</span>{" "}
                </div>{" "}
                <p className="text-sm font-bold text-foreground mt-0.5">12 days</p>{" "}
              </div>{" "}
              <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2.5">
                {" "}
                <p className="text-xs text-muted-foreground">Level</p>{" "}
                <p className="text-sm font-bold text-foreground mt-0.5">12</p>{" "}
              </div>{" "}
            </div>{" "}
            {/* User profile */}{" "}
            <div className="flex items-center gap-3 px-3 py-3 bg-muted rounded-lg mb-3">
              {" "}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                {" "}
                <span className="text-white font-bold text-sm">AD</span>{" "}
              </div>{" "}
              <div className="flex-1 min-w-0">
                {" "}
                <p className="text-sm font-semibold truncate text-foreground">Alex Developer</p>{" "}
                <p className="text-xs text-muted-foreground truncate">Senior Engineer</p>{" "}
              </div>{" "}
            </div>{" "}
            {/* Sign out button */}{" "}
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200">
              {" "}
              <LogOut className="w-4 h-4" /> Sign out{" "}
            </button>{" "}
          </div>{" "}
        </aside>{" "}
        {/* Main content */}{" "}
        <div className="lg:pl-64">
          {" "}
          {/* Top bar */}{" "}
          <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-border">
            {" "}
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              {" "}
              <button
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                {" "}
                <Menu className="w-5 h-5" />{" "}
              </button>{" "}
              <div className="flex-1" />{" "}
              <div className="flex items-center gap-4">
                {" "}
                <div className="text-right">
                  {" "}
                  <p className="text-sm font-semibold text-foreground">2,450 XP</p>{" "}
                  <p className="text-xs text-muted-foreground">Level 12</p>{" "}
                </div>{" "}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  {" "}
                  <span className="text-white font-bold text-sm">AD</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </header>{" "}
          {/* Page content */} <main className="p-4 lg:p-6"> {children} </main>{" "}
        </div>{" "}
      </div>{" "}
    </SWRProvider>
  )
}

import type React from "react"
