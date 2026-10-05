/* =========================================================
   FRIDAY AI - ONBOARDING CONFIG
   Everything the Industry and Plan pages show comes from here.

   PLACEHOLDERS: plan names, taglines, feature-to-plan mapping and
   prices are starting points for you to edit. Set `price` to a number
   (per period) when you are ready; `null` shows "Contact us for pricing".
   ========================================================= */

/* ---------- Feature labels ---------- */

export const SHARED_FEATURES = {
  contacts:   "Contacts and lead management",
  reports:    "Dashboard and reports",
  calling:    "Cloud calling",
  messaging:  "SMS and messaging",
  automation: "Workflow automation",
  team:       "Team members and roles",
};

export const HOTEL_FEATURES = {
  reservations: "Reservations and calendar",
  rooms:        "Rooms and availability",
  guests:       "Guest profiles and stay history",
  frontdesk:    "Front desk check-in and check-out",
  requests:     "Housekeeping and service requests",
};

export const FITNESS_FEATURES = {
  members:     "Member profiles",
  memberships: "Memberships and renewals",
  attendance:  "Attendance and check-ins",
  classes:     "Classes and scheduling",
  trainers:    "Trainers and assignments",
  dues:        "Payments and dues tracking",
};

/* ---------- Industries ---------- */

export const INDUSTRIES = [
  {
    id: "hotel",
    title: "Hotels and homestays",
    description: "Manage guests, rooms and reservations from one place.",
    icon: "bed",
    highlights: [
      "Reservations and room availability",
      "Guest profiles and stay history",
      "Front desk and service requests",
      "Calls and messages with guests",
    ],
    features: { ...HOTEL_FEATURES, ...SHARED_FEATURES },
  },
  {
    id: "fitness",
    title: "Fitness and gyms",
    description: "Keep members, memberships and attendance organised.",
    icon: "dumbbell",
    highlights: [
      "Member profiles and renewals",
      "Attendance and check-ins",
      "Classes, trainers and schedules",
      "Payments and dues tracking",
    ],
    features: { ...FITNESS_FEATURES, ...SHARED_FEATURES },
  },
];

/* ---------- Plans (per industry) ---------- */

const plan = (id, name, tagline, features, extra = {}) => ({
  id, name, tagline, features,
  price: null,          // e.g. 1999
  currency: "INR",
  period: "month",
  recommended: false,   // true shows a "Recommended" badge
  ...extra,
});

const HOTEL_STARTER = ["reservations", "rooms", "guests", "contacts", "reports"];
const HOTEL_GROWTH  = [...HOTEL_STARTER, "frontdesk", "requests", "calling", "messaging"];
const HOTEL_SCALE   = [...HOTEL_GROWTH, "automation", "team"];

const FITNESS_STARTER = ["members", "memberships", "attendance", "contacts", "reports"];
const FITNESS_GROWTH  = [...FITNESS_STARTER, "classes", "trainers", "dues", "calling", "messaging"];
const FITNESS_SCALE   = [...FITNESS_GROWTH, "automation", "team"];

export const PLANS = {
  hotel: [
    plan("starter", "Starter", "The basics to run day-to-day bookings.", HOTEL_STARTER),
    plan("growth",  "Growth",  "Front desk, guest communication and calling.", HOTEL_GROWTH),
    plan("scale",   "Scale",   "Automation and team controls for larger properties.", HOTEL_SCALE),
  ],
  fitness: [
    plan("starter", "Starter", "The basics to manage members and renewals.", FITNESS_STARTER),
    plan("growth",  "Growth",  "Classes, trainers, dues and member communication.", FITNESS_GROWTH),
    plan("scale",   "Scale",   "Automation and team controls for multi-staff gyms.", FITNESS_SCALE),
  ],
};

/* ---------- Helpers (use these to build the CRM sidebar / guards) ---------- */

export const getIndustry = (id) => INDUSTRIES.find((i) => i.id === id) || null;

export const getPlan = (industryId, planId) =>
  (PLANS[industryId] || []).find((p) => p.id === planId) || null;

/** Feature ids a customer may use: their industry + their purchased plan. */
export const getEnabledFeatures = (industryId, planId) =>
  getPlan(industryId, planId)?.features ?? [];

export const hasFeature = (industryId, planId, featureId) =>
  getEnabledFeatures(industryId, planId).includes(featureId);

/** Human label for a feature id within an industry. */
export const featureLabel = (industryId, featureId) =>
  getIndustry(industryId)?.features?.[featureId] ?? featureId;
