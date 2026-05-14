export interface RouteItem {
  id: number;
  name: string;
  from: string;
  to: string;
  isFavorite: boolean;
  frequency: string;
}

export type RouteFormData = Omit<RouteItem, 'id'>;
