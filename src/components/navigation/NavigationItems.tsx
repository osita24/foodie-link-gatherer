import { Home, BookmarkPlus, User } from "lucide-react";

export const navigationItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BookmarkPlus, label: 'Saved', path: '/saved', requiresAuth: true },
  { icon: User, label: 'Profile', path: '/profile', requiresAuth: true, isProfile: true },
];