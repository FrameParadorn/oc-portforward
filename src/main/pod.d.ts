import { Service } from './service.d';

export interface ProcessItem {
  status: string;
  service: Service;
  log: string[];
  onClose: () => void;
}

export interface ProcessState {
  [name: string]: ProcessItem;
}
