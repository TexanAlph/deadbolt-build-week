export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export type Invoice = {
  id: number;
  ownerId: string;
  number: string;
  client: string;
  clientEmail: string;
  clientInitials: string;
  amount: number;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  description: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
};

export const currentUser = {
  id: "user_maya_01",
  name: "Maya Chen",
  email: "maya@northstar.test",
  company: "Northstar Studio",
  initials: "MC",
};

export const invoices: Invoice[] = [
  {
    id: 1024,
    ownerId: "user_maya_01",
    number: "INV-1024",
    client: "Atlas Coffee Co.",
    clientEmail: "finance@atlas-coffee.test",
    clientInitials: "AC",
    amount: 4800,
    issuedAt: "Jul 08, 2026",
    dueAt: "Jul 22, 2026",
    status: "pending",
    description: "Q3 brand campaign",
    lineItems: [
      { description: "Campaign creative direction", quantity: 1, rate: 2800 },
      { description: "Production design system", quantity: 1, rate: 2000 },
    ],
  },
  {
    id: 1025,
    ownerId: "user_maya_01",
    number: "INV-1025",
    client: "Fieldwork Labs",
    clientEmail: "ops@fieldwork.test",
    clientInitials: "FL",
    amount: 3200,
    issuedAt: "Jul 11, 2026",
    dueAt: "Jul 25, 2026",
    status: "paid",
    description: "Product launch sprint",
    lineItems: [
      { description: "Launch narrative workshop", quantity: 1, rate: 1200 },
      { description: "Web launch assets", quantity: 1, rate: 2000 },
    ],
  },
  {
    id: 1026,
    ownerId: "user_maya_01",
    number: "INV-1026",
    client: "Common Ground",
    clientEmail: "hello@commonground.test",
    clientInitials: "CG",
    amount: 2650,
    issuedAt: "Jul 14, 2026",
    dueAt: "Jul 28, 2026",
    status: "draft",
    description: "Summer event identity",
    lineItems: [
      { description: "Event identity concepts", quantity: 1, rate: 1850 },
      { description: "Social toolkit", quantity: 1, rate: 800 },
    ],
  },
  {
    id: 2044,
    ownerId: "user_omar_02",
    number: "INV-2044",
    client: "Helio Health",
    clientEmail: "billing@helio-health.test",
    clientInitials: "HH",
    amount: 12800,
    issuedAt: "Jul 02, 2026",
    dueAt: "Jul 16, 2026",
    status: "overdue",
    description: "Patient portal redesign",
    lineItems: [
      { description: "Product design engagement", quantity: 1, rate: 9800 },
      { description: "Accessibility review", quantity: 1, rate: 3000 },
    ],
  },
  {
    id: 3091,
    ownerId: "user_ren_03",
    number: "INV-3091",
    client: "Meridian Capital",
    clientEmail: "ap@meridian-capital.test",
    clientInitials: "MC",
    amount: 24000,
    issuedAt: "Jun 28, 2026",
    dueAt: "Jul 12, 2026",
    status: "paid",
    description: "Investor platform",
    lineItems: [
      { description: "Research and product strategy", quantity: 1, rate: 9000 },
      { description: "Interface design", quantity: 1, rate: 15000 },
    ],
  },
  {
    id: 4117,
    ownerId: "user_sasha_04",
    number: "INV-4117",
    client: "Juniper Schools",
    clientEmail: "district@juniper-schools.test",
    clientInitials: "JS",
    amount: 8750,
    issuedAt: "Jul 09, 2026",
    dueAt: "Jul 23, 2026",
    status: "pending",
    description: "Enrollment experience",
    lineItems: [
      { description: "Service blueprint", quantity: 1, rate: 3750 },
      { description: "Enrollment prototype", quantity: 1, rate: 5000 },
    ],
  },
];

export function getInvoiceById(id: number) {
  return invoices.find((invoice) => invoice.id === id);
}

export function getCurrentUserInvoices() {
  return invoices.filter((invoice) => invoice.ownerId === currentUser.id);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
