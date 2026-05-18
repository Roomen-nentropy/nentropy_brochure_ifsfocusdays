import type { Session } from 'better-auth/types';

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  trialEndsAt?: Date | string | null;
}

export interface ExtendedSessionData {
  user: ExtendedUser;
  session: Session;
}

export interface SubscriptionData {
  id: string;
  plan: string;
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete_expired'
    | 'incomplete'
    | 'paused';
  periodEnd?: string | Date;
  cancelAtPeriodEnd?: boolean;
}
