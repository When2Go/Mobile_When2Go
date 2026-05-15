export interface RouteItem {
  id: number;
  name: string;
  from: string;
  to: string;
  frequency: string;
}

export type RouteFormData = Omit<RouteItem, 'id'>;
