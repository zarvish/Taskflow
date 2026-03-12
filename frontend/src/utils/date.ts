import { format, formatDistanceToNow, isAfter, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Unknown date';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, 'MMM d, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'Unknown date';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'Unknown date';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

export const isOverdue = (dueDate: string | Date | null): boolean => {
  if (!dueDate) return false;
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isAfter(new Date(), dateObj);
};
