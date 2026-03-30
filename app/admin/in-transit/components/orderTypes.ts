export type Order = {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  weight: string;
  smsSent: boolean;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

