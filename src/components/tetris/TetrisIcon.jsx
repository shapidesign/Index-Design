import React from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Star,
  Heart,
  Download,
  Link2,
  Menu,
  X,
  MapPin,
  Book,
  Users,
  Wrench,
  Building2,
  Phone,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

/**
 * TetrisIcon - עטיפת אייקון בסגנון טטריס
 * Wraps Lucide icons with tetris-style rendering
 * 
 * @param {Object} props
 * @param {string} props.icon - Icon name
 * @param {number} props.size - Size in pixels
 * @param {string} props.className - Additional classes
 */
const iconMap = {
  'search': Search,
  'external-link': ExternalLink,
  'bookmark': Bookmark,
  'bookmark-filled': BookmarkCheck,
  'star': Star,
  'heart': Heart,
  'download': Download,
  'link': Link2,
  'menu': Menu,
  'close': X,
  'map-pin': MapPin,
  'book': Book,
  'users': Users,
  'wrench': Wrench,
  'museum': Building2,
  'phone': Phone,
  'upvote': ChevronUp,
  'downvote': ChevronDown,
  'arrow-up-right': ArrowUpRight,
};

const TetrisIcon = ({ icon, size = 24, className, ...props }) => {
  const IconComponent = iconMap[icon];
  
  if (!IconComponent) {
    console.warn(`TetrisIcon: Unknown icon "${icon}"`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={cn('inline-block', className)}
      strokeWidth={2.5}
      {...props}
    />
  );
};

export default TetrisIcon;
