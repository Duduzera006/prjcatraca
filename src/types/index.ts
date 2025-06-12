export interface Student {
  uid: string;
  nome: string;
  ra: string;
  autorizado: boolean;
}

export interface AccessLog {
  timestamp: string;
  uid: string;
  nome: string;
  status: string;
  ra: string;
}
