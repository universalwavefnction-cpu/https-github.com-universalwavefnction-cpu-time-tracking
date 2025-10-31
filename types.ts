
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Activity {
  id: string;
  date: string; // Format: 'YYYY-MM-DD'
  startTime: string; // Format: 'HH:mm'
  endTime: string; // Format: 'HH:mm'
  description: string;
  categoryId: string;
}
