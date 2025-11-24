import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { BookOpen, Target, TrendingUp, LayoutDashboard, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onLogSession?: () => void;
}

export function Navigation({ onLogSession }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/sessions", label: "Sessions", icon: BookOpen },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/insights", label: "Insights", icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Credenza</span>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="gap-2"
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onLogSession}
            className="gap-2"
            data-testid="button-log-session"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Log Session</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    ST
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-item-settings">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-item-logout">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
