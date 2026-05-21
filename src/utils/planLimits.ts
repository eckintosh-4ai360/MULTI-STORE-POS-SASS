export type Plan = "starter" | "pro" | "enterprise";

export const PLAN_LIMITS: Record<Plan, { stores: number; products: number; users: number }> = {
  starter:    { stores: 1,        products: 500,      users: 5  },
  pro:        { stores: 5,        products: Infinity, users: 25 },
  enterprise: { stores: Infinity, products: Infinity, users: Infinity },
};

export function getPlanLabel(plan: string): string {
  return { starter: "Starter", pro: "Pro", enterprise: "Enterprise" }[plan] ?? plan;
}

export function getPlanColor(plan: string): string {
  return { starter: "indigo", pro: "purple", enterprise: "amber" }[plan] ?? "indigo";
}
