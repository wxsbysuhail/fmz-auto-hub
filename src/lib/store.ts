import { useEffect, useState, useCallback } from "react";

export const STATUSES = [
  "Booking Confirmed",
  "Vehicle in Garage",
  "Diagnosing",
  "Waiting on Parts",
  "In Repair",
  "Ready for Pickup",
] as const;

export type Status = (typeof STATUSES)[number];

export type ServiceType = "Diagnostics" | "Routine Service" | "Mechanical Repair";

export interface Booking {
  id: string;
  clientName: string;
  phone?: string;
  make: string;
  model: string;
  plate: string;
  serviceType: ServiceType;
  issue: string;
  date: string; // ISO
  status: Status;
  createdAt: string;
}

const KEY = "fmz.bookings.v1";
const EVT = "fmz:bookings-updated";

const now = new Date();
const daysAgo = (d: number) => {
  const x = new Date(now);
  x.setDate(x.getDate() - d);
  return x.toISOString();
};
const today = () => {
  const x = new Date(now);
  x.setHours(10, 0, 0, 0);
  return x.toISOString();
};

const SEED: Booking[] = [
  { id: "FMZ-1042", clientName: "Amélie Laurent", phone: "+33 6 12 34 56 78", make: "Porsche", model: "911 Carrera", plate: "AZ-918-PR", serviceType: "Diagnostics", issue: "Intermittent check-engine light at highway speeds.", date: today(), status: "Diagnosing", createdAt: daysAgo(1) },
  { id: "FMZ-1043", clientName: "Marcus Chen", phone: "+1 415 555 0144", make: "Tesla", model: "Model 3", plate: "EV-3-SF", serviceType: "Routine Service", issue: "Tire rotation and cabin filter replacement.", date: today(), status: "Vehicle in Garage", createdAt: daysAgo(1) },
  { id: "FMZ-1044", clientName: "Sofia Romano", make: "BMW", model: "M340i", plate: "BM-340-IT", serviceType: "Mechanical Repair", issue: "Front brake pads and rotors squealing.", date: today(), status: "Waiting on Parts", createdAt: daysAgo(2) },
  { id: "FMZ-1045", clientName: "James Okafor", make: "Audi", model: "RS6 Avant", plate: "RS-6-AV", serviceType: "Mechanical Repair", issue: "Suspension knock on uneven roads.", date: today(), status: "Waiting on Parts", createdAt: daysAgo(3) },
  { id: "FMZ-1046", clientName: "Yuki Tanaka", make: "Mazda", model: "MX-5", plate: "MX-5-JP", serviceType: "Routine Service", issue: "30k mile service interval.", date: today(), status: "Waiting on Parts", createdAt: daysAgo(2) },
  { id: "FMZ-1047", clientName: "Elena Vasquez", make: "Mercedes", model: "C63 AMG", plate: "C-63-AMG", serviceType: "Mechanical Repair", issue: "Oil leak near valve cover.", date: today(), status: "In Repair", createdAt: daysAgo(2) },
  { id: "FMZ-1048", clientName: "David Müller", make: "Volkswagen", model: "Golf GTI", plate: "GT-I-DE", serviceType: "Mechanical Repair", issue: "DSG transmission jerking on shifts.", date: today(), status: "In Repair", createdAt: daysAgo(3) },
  { id: "FMZ-1049", clientName: "Priya Patel", make: "Honda", model: "Civic Type R", plate: "TYPE-R", serviceType: "Routine Service", issue: "Oil change & inspection.", date: today(), status: "Ready for Pickup", createdAt: daysAgo(4) },
  { id: "FMZ-1050", clientName: "Olivia Martin", make: "Range Rover", model: "Sport", plate: "RR-SPRT", serviceType: "Diagnostics", issue: "Air suspension warning.", date: today(), status: "Booking Confirmed", createdAt: daysAgo(0) },
  { id: "FMZ-1051", clientName: "Lucas Bernard", make: "Ford", model: "Mustang GT", plate: "MUST-GT", serviceType: "Routine Service", issue: "Annual inspection.", date: today(), status: "Booking Confirmed", createdAt: daysAgo(0) },
];

function load(): Booking[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch {
    return SEED;
  }
}

function save(b: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(b));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(SEED);

  useEffect(() => {
    setBookings(load());
    const handler = () => setBookings(load());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const addBooking = useCallback((b: Omit<Booking, "id" | "status" | "createdAt">) => {
    const current = load();
    const nb: Booking = {
      ...b,
      id: `FMZ-${1000 + current.length + 50}`,
      status: "Booking Confirmed",
      createdAt: new Date().toISOString(),
    };
    save([nb, ...current]);
    return nb;
  }, []);

  const updateStatus = useCallback((id: string, status: Status) => {
    const current = load();
    save(current.map((x) => (x.id === id ? { ...x, status } : x)));
  }, []);

  return { bookings, addBooking, updateStatus };
}

export function findByPlate(plate: string): Booking | undefined {
  if (typeof window === "undefined") return undefined;
  const list = load();
  const norm = plate.replace(/\s|-/g, "").toUpperCase();
  return list.find((b) => b.plate.replace(/\s|-/g, "").toUpperCase() === norm);
}

export function isClosedDay(d: Date) {
  const day = d.getDay(); // 0 Sun, 3 Wed
  return day === 0 || day === 3;
}
