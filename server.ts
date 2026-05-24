import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================================
// IN-MEMORY DATABASE WITH ROBUST SEED DATA
// ==========================================================

let business = {
  id: "b-101",
  name: "Apex Cardio Gym & Spa",
  type: "Gym",
  ownerName: "Alexandra Mercer",
  phoneNumber: "+1 (555) 302-8941",
  email: "contact@apexcardio.com",
  address: "742 Elite Boulevard, West Wing",
  city: "San Francisco",
  openingTime: "06:00",
  closingTime: "22:00",
  logoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop"
};

let offers = [
  {
    id: "o-201",
    title: "Full Body Detox & Hydro-Therapy Spa Massage",
    description: "Experience premium deep tissue therapy including thermal steam bath, facial reflexology and organic herbal tea. Perfect holiday relaxation session.",
    category: "Spa & Massage",
    originalPrice: 150,
    offerPrice: 59,
    discountPercentage: 61,
    startDate: "2026-05-20",
    endDate: "2026-05-30",
    startTime: "09:00",
    endTime: "21:00",
    totalCapacity: 50,
    maxBookingPerCustomer: 2,
    termsAndConditions: "Please arrive 10 minutes prior. Cancellations must be made 2 hours in advance. Valid id required.",
    status: "Active",
    couponCode: "DETOX5",
    couponDiscount: 5
  },
  {
    id: "o-202",
    title: "1-on-1 HIIT Fitness Coaching & Biometric Assessment",
    description: "Get individualized high-intensity interval training, body composition assessment and customized meal blueprint designed by championship coaches.",
    category: "Coaching",
    originalPrice: 120,
    offerPrice: 45,
    discountPercentage: 63,
    startDate: "2026-05-22",
    endDate: "2026-05-28",
    startTime: "06:00",
    endTime: "18:00",
    totalCapacity: 30,
    maxBookingPerCustomer: 1,
    termsAndConditions: "Clean indoor workout shoes mandatory. Towels provided on premise. Fasting 2 hours prior is advised.",
    status: "Active",
    couponCode: "FITSTART",
    couponDiscount: 10
  },
  {
    id: "o-203",
    title: "Private Football Turf Booking (Light Included)",
    description: "Premium FIFA-approved modular artificial turf. Ideal for 5v5 or 6v6 friendly matches. Includes bibs, premium balls and overhead floodlighting.",
    category: "Sports",
    originalPrice: 80,
    offerPrice: 39,
    discountPercentage: 51,
    startDate: "2026-05-24",
    endDate: "2026-06-05",
    startTime: "16:00",
    endTime: "22:00",
    totalCapacity: 40,
    maxBookingPerCustomer: 3,
    termsAndConditions: "Moulded studs or flat trainers only. Steel studs strictly forbidden. Soft drinks available at locker counters.",
    status: "Active"
  },
  {
    id: "o-204",
    title: "VIP Hair Stylist Transformation Package (Draft)",
    description: "Complete restyling consultation, premium wash, structural scalp therapy and Keratin finishing by Senior Director Stylists.",
    category: "Salon",
    originalPrice: 200,
    offerPrice: 99,
    discountPercentage: 50,
    startDate: "2026-05-28",
    endDate: "2026-06-10",
    startTime: "10:00",
    endTime: "20:00",
    totalCapacity: 20,
    maxBookingPerCustomer: 1,
    termsAndConditions: "Advanced confirmation via phone recommended. Surcharge applies for extra-long hair lengths.",
    status: "Draft"
  }
];

let slots = [
  // Slots for Spa (o-201)
  {
    id: "s-301",
    offerId: "o-201",
    slotDate: "2026-05-24",
    startTime: "09:00",
    endTime: "11:00",
    capacity: 10,
    bookedCount: 8,
    availableCount: 2,
    status: "Available"
  },
  {
    id: "s-302",
    offerId: "o-201",
    slotDate: "2026-05-24",
    startTime: "11:00",
    endTime: "13:00",
    capacity: 10,
    bookedCount: 10,
    availableCount: 0,
    status: "Full"
  },
  {
    id: "s-303",
    offerId: "o-201",
    slotDate: "2026-05-25",
    startTime: "14:00",
    endTime: "16:00",
    capacity: 15,
    bookedCount: 5,
    availableCount: 10,
    status: "Available"
  },
  {
    id: "s-304",
    offerId: "o-201",
    slotDate: "2026-05-25",
    startTime: "17:00",
    endTime: "19:00",
    capacity: 15,
    bookedCount: 2,
    availableCount: 13,
    status: "Available"
  },

  // Slots for HIIT Coaching (o-202)
  {
    id: "s-311",
    offerId: "o-202",
    slotDate: "2026-05-24",
    startTime: "06:30",
    endTime: "08:00",
    capacity: 5,
    bookedCount: 4,
    availableCount: 1,
    status: "Available"
  },
  {
    id: "s-312",
    offerId: "o-202",
    slotDate: "2026-05-24",
    startTime: "08:30",
    endTime: "10:00",
    capacity: 5,
    bookedCount: 5,
    availableCount: 0,
    status: "Full"
  },
  {
    id: "s-313",
    offerId: "o-202",
    slotDate: "2026-05-25",
    startTime: "16:30",
    endTime: "18:00",
    capacity: 10,
    bookedCount: 1,
    availableCount: 9,
    status: "Available"
  },

  // Slots for Football Turf (o-203)
  {
    id: "s-321",
    offerId: "o-203",
    slotDate: "2026-05-24",
    startTime: "16:00",
    endTime: "18:00",
    capacity: 8,
    bookedCount: 3,
    availableCount: 5,
    status: "Available"
  },
  {
    id: "s-322",
    offerId: "o-203",
    slotDate: "2026-05-25",
    startTime: "18:00",
    endTime: "20:00",
    capacity: 8,
    bookedCount: 7,
    availableCount: 1,
    status: "Available"
  },
  {
    id: "s-323",
    offerId: "o-203",
    slotDate: "2026-05-25",
    startTime: "20:00",
    endTime: "22:00",
    capacity: 8,
    bookedCount: 0,
    availableCount: 8,
    status: "Available"
  }
];

let bookings = [
  {
    id: "b-401",
    referenceNumber: "SO-192841",
    offerId: "o-201",
    slotId: "s-301",
    customerName: "David Sterling",
    phoneNumber: "+1 (555) 231-7788",
    email: "david.ster@gmail.com",
    numberOfPeople: 2,
    specialNote: "Anniversary surprise session for couple",
    status: "Confirmed",
    paymentStatus: "Paid",
    bookingDate: "2026-05-23T14:32:00Z",
    couponApplied: "DETOX5",
    totalPaid: 113, // (59 * 2) - 5
    offerTitle: "Full Body Detox & Hydro-Therapy Spa Massage",
    businessName: "Apex Cardio Gym & Spa",
    slotDate: "2026-05-24",
    slotTime: "09:00 - 11:00"
  },
  {
    id: "b-402",
    referenceNumber: "SO-923145",
    offerId: "o-201",
    slotId: "s-302",
    customerName: "Maria Gellar",
    phoneNumber: "+1 (555) 942-1200",
    email: "gellar_m@gmail.com",
    numberOfPeople: 1,
    status: "Completed",
    paymentStatus: "Paid",
    bookingDate: "2026-05-22T08:15:00Z",
    totalPaid: 59,
    offerTitle: "Full Body Detox & Hydro-Therapy Spa Massage",
    businessName: "Apex Cardio Gym & Spa",
    slotDate: "2026-05-24",
    slotTime: "11:00 - 13:00"
  },
  {
    id: "b-403",
    referenceNumber: "SO-742910",
    offerId: "o-202",
    slotId: "s-312",
    customerName: "Marcus Vance",
    phoneNumber: "+1 (555) 700-1122",
    email: "marcus.vance@yahoo.com",
    numberOfPeople: 1,
    specialNote: "Recovering from lower back strain, need light intensity adjustment.",
    status: "Confirmed",
    paymentStatus: "Paid",
    bookingDate: "2026-05-23T11:45:00Z",
    couponApplied: "FITSTART",
    totalPaid: 35, // 45 - 10
    offerTitle: "1-on-1 HIIT Fitness Coaching & Biometric Assessment",
    businessName: "Apex Cardio Gym & Spa",
    slotDate: "2026-05-24",
    slotTime: "08:30 - 10:00"
  },
  {
    id: "b-404",
    referenceNumber: "SO-238491",
    offerId: "o-203",
    slotId: "s-321",
    customerName: "Jeremy Stone",
    phoneNumber: "+1 (555) 438-9900",
    numberOfPeople: 5,
    status: "Pending",
    paymentStatus: "Unpaid",
    bookingDate: "2026-05-24T05:22:00Z",
    totalPaid: 195, // 39 * 5
    offerTitle: "Private Football Turf Booking (Light Included)",
    businessName: "Apex Cardio Gym & Spa",
    slotDate: "2026-05-24",
    slotTime: "16:00 - 18:00"
  },
  {
    id: "b-405",
    referenceNumber: "SO-112233",
    offerId: "o-201",
    slotId: "s-303",
    customerName: "Jessica Alba",
    phoneNumber: "+1 (555) 301-4433",
    numberOfPeople: 1,
    status: "Cancelled",
    paymentStatus: "Refunded",
    bookingDate: "2026-05-21T18:10:00Z",
    totalPaid: 59,
    offerTitle: "Full Body Detox & Hydro-Therapy Spa Massage",
    businessName: "Apex Cardio Gym & Spa",
    slotDate: "2026-05-25",
    slotTime: "14:00 - 16:00"
  }
];

let notifications = [
  {
    id: "n-1",
    timestamp: new Date().toISOString(),
    type: "booking_received",
    message: "New slot booking received from Jeremy Stone for Private Football Turf Booking.",
    referenceNumber: "SO-238491"
  },
  {
    id: "n-2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "booking_confirmed",
    message: "Booking confirmed: David Sterling successfully reserved 2 seats for Spa Massage.",
    referenceNumber: "SO-192841"
  },
  {
    id: "n-3",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "booking_cancelled",
    message: "User Jessica Alba cancelled reservation SO-112233.",
    referenceNumber: "SO-112233"
  }
];

// Helper to push a server notification log
function createNotification(type: string, message: string, referenceNumber?: string) {
  notifications.unshift({
    id: `n-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    referenceNumber
  });
  if (notifications.length > 50) notifications.pop();
}

// Generate unique reference
function generateReference(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `SO-${num}`;
}

// ==========================================================
// REST API ENDPOINTS
// ==========================================================

// 1. Auth Login API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Handle mock authentication (standard simulation)
  if (email.toLowerCase() === 'admin@apexcardio.com' && password === 'admin123') {
    return res.json({
      user: {
        id: "u-1",
        email: "admin@apexcardio.com",
        name: "Alexandra Mercer",
        role: "Admin"
      },
      token: "mock-jwt-token-ey-123456"
    });
  } else if (password === 'admin123' || password === 'password') {
    // Lax login for demo-ability
    return res.json({
      user: {
        id: "u-temp",
        email: email,
        name: email.split('@')[0].toUpperCase(),
        role: "Admin"
      },
      token: "mock-jwt-token-ey-" + Math.floor(Math.random() * 1000000)
    });
  }

  return res.status(401).json({ error: "Invalid credentials. Use admin@apexcardio.com and password admin123" });
});

// 2. Business APIs
app.get('/api/business', (req, res) => {
  res.json(business);
});

app.post('/api/business', (req, res) => {
  business = { ...business, ...req.body, id: `b-${Date.now()}` };
  createNotification("status_changed", "Business profile created successfully.");
  res.status(201).json(business);
});

app.put('/api/business/:id', (req, res) => {
  business = { ...business, ...req.body };
  createNotification("status_changed", "Business profile updated successfully.");
  res.json(business);
});

// 3. Offers APIs
app.get('/api/offers', (req, res) => {
  res.json(offers);
});

app.get('/api/offers/:id', (req, res) => {
  const offer = offers.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ error: "Offer not found" });
  res.json(offer);
});

app.post('/api/offers', (req, res) => {
  const { title, originalPrice, offerPrice } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Offer Title is required" });
  }
  if (Number(offerPrice) >= Number(originalPrice)) {
    return res.status(400).json({ error: "Offer price must be less than original price" });
  }

  const newOffer = {
    ...req.body,
    id: `o-${Date.now()}`,
    originalPrice: Number(originalPrice),
    offerPrice: Number(offerPrice),
    discountPercentage: Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
  };
  
  offers.push(newOffer);
  createNotification("status_changed", `New slot offer published: "${title}"`);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Offer not found" });

  const { originalPrice, offerPrice } = req.body;
  let discountPercentage = offers[index].discountPercentage;
  if (originalPrice !== undefined && offerPrice !== undefined) {
    if (Number(offerPrice) >= Number(originalPrice)) {
      return res.status(400).json({ error: "Offer price must be less than original price" });
    }
    discountPercentage = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  }

  offers[index] = {
    ...offers[index],
    ...req.body,
    originalPrice: originalPrice !== undefined ? Number(originalPrice) : offers[index].originalPrice,
    offerPrice: offerPrice !== undefined ? Number(offerPrice) : offers[index].offerPrice,
    discountPercentage
  };

  createNotification("status_changed", `Offer "${offers[index].title}" updated successfully.`);
  res.json(offers[index]);
});

app.delete('/api/offers/:id', (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Offer not found" });
  
  const title = offers[index].title;
  offers = offers.filter(o => o.id !== req.params.id);
  // Cascading deletion of slots and bookings for clean demo is premium, but we can keep slots or mark custom
  slots = slots.filter(s => s.offerId !== req.params.id);
  
  createNotification("status_changed", `Offer "${title}" deleted.`);
  res.json({ success: true, message: "Offer and its slots deleted successfully." });
});

// 4. Slots APIs
app.get('/api/slots', (req, res) => {
  res.json(slots);
});

app.get('/api/offers/:offerId/slots', (req, res) => {
  const offerSlots = slots.filter(s => s.offerId === req.params.offerId);
  res.json(offerSlots);
});

app.post('/api/slots', (req, res) => {
  const { offerId, slotDate, startTime, endTime, capacity } = req.body;
  if (!offerId || !slotDate || !startTime || !endTime || !capacity) {
    return res.status(400).json({ error: "Required fields: offerId, slotDate, startTime, endTime, capacity" });
  }

  const newSlot = {
    id: `s-${Date.now()}`,
    offerId,
    slotDate,
    startTime,
    endTime,
    capacity: Number(capacity),
    bookedCount: 0,
    availableCount: Number(capacity),
    status: 'Available' as const
  };

  slots.push(newSlot);
  createNotification("status_changed", "New appointment block created.");
  res.status(201).json(newSlot);
});

app.put('/api/slots/:id', (req, res) => {
  const index = slots.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Slot not found" });

  const currentSlot = slots[index];
  const updatedSlot = { ...currentSlot, ...req.body };
  
  if (updatedSlot.capacity !== undefined) {
    updatedSlot.capacity = Number(updatedSlot.capacity);
    updatedSlot.availableCount = updatedSlot.capacity - updatedSlot.bookedCount;
    if (updatedSlot.availableCount <= 0) {
      updatedSlot.status = "Full";
      updatedSlot.availableCount = 0;
    } else if (updatedSlot.status === 'Full') {
      updatedSlot.status = 'Available';
    }
  }

  slots[index] = updatedSlot;
  res.json(slots[index]);
});

app.delete('/api/slots/:id', (req, res) => {
  const index = slots.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Slot not found" });

  slots = slots.filter(s => s.id !== req.params.id);
  createNotification("status_changed", "Appointment slot deleted.");
  res.json({ success: true, message: "Slot deleted." });
});

// 5. Bookings APIs
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});

app.post('/api/bookings', (req, res) => {
  const { offerId, slotId, customerName, phoneNumber, email, numberOfPeople, specialNote, couponApplied } = req.body;
  
  if (!offerId || !slotId || !customerName || !phoneNumber || !numberOfPeople) {
    return res.status(400).json({ error: "Required parameters are missing" });
  }

  const offer = offers.find(o => o.id === offerId);
  const slot = slots.find(s => s.id === slotId);

  if (!offer) return res.status(404).json({ error: "Offer not found" });
  if (!slot) return res.status(404).json({ error: "Slot not found" });

  if (offer.status !== "Active") {
    return res.status(400).json({ error: "This offer is currently suspended or inactive." });
  }

  if (slot.status === "Full" || slot.availableCount <= 0) {
    return res.status(400).json({ error: "This booking slot is fully booked." });
  }

  const bookingGuests = Number(numberOfPeople);
  if (bookingGuests > slot.availableCount) {
    return res.status(400).json({ error: `Not enough slot spaces left. Available capacity: ${slot.availableCount} seats.` });
  }

  // Same phone number limits check
  const existingRecords = bookings.filter(b => b.phoneNumber === phoneNumber && b.offerId === offerId && b.status !== 'Cancelled');
  const totalVolumeByPhone = existingRecords.reduce((acc, curr) => acc + curr.numberOfPeople, 0);
  if (totalVolumeByPhone + bookingGuests > offer.maxBookingPerCustomer) {
    return res.status(400).json({ error: `Safety limit exceeded. You can book a maximum of ${offer.maxBookingPerCustomer} seats per customer for this offer. You've already booked ${totalVolumeByPhone} seats.` });
  }

  // Calculate pricing & validation
  let baseCost = offer.offerPrice * bookingGuests;
  let finalPaid = baseCost;
  let couponUsed: string | undefined = undefined;

  if (couponApplied && offer.couponCode && couponApplied.toUpperCase() === offer.couponCode.toUpperCase()) {
    couponUsed = offer.couponCode;
    const discount = offer.couponDiscount || 0;
    finalPaid = Math.max(0, baseCost - discount);
  }

  // Update Slot reservation
  slot.bookedCount += bookingGuests;
  slot.availableCount = slot.capacity - slot.bookedCount;
  if (slot.availableCount <= 0) {
    slot.status = "Full";
  }

  const ref = generateReference();
  const newBooking = {
    id: `b-${Date.now()}`,
    referenceNumber: ref,
    offerId,
    slotId,
    customerName,
    phoneNumber,
    email,
    numberOfPeople: bookingGuests,
    specialNote,
    status: "Confirmed" as const, // auto-confirmed logic for smooth demonstration flow
    paymentStatus: "Paid" as const, // auto-paid since it is an reservation coupon promo
    bookingDate: new Date().toISOString(),
    couponApplied: couponUsed,
    totalPaid: finalPaid,
    offerTitle: offer.title,
    businessName: business.name,
    slotDate: slot.slotDate,
    slotTime: `${slot.startTime} - ${slot.endTime}`
  };

  bookings.unshift(newBooking);
  createNotification("booking_received", `New reservation confirmed for ${customerName} (${bookingGuests} seat(s)). Reference: ${ref}`, ref);
  
  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { status, paymentStatus } = req.body;
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Booking not found" });

  const previousBooking = bookings[index];
  
  if (status && status !== previousBooking.status) {
    // If transitioning from cancellation to confirmed or vice-versa, handle counter adjustment
    if (status === 'Cancelled' && previousBooking.status !== 'Cancelled') {
      const slot = slots.find(s => s.id === previousBooking.slotId);
      if (slot) {
        slot.bookedCount = Math.max(0, slot.bookedCount - previousBooking.numberOfPeople);
        slot.availableCount = slot.capacity - slot.bookedCount;
        if (slot.availableCount > 0 && slot.status === 'Full') {
          slot.status = 'Available';
        }
      }
      createNotification("booking_cancelled", `Booking reference ${previousBooking.referenceNumber} has been CANCELLED. Seats freed.`, previousBooking.referenceNumber);
    } else if (status !== 'Cancelled' && previousBooking.status === 'Cancelled') {
      // Re-confirming back from cancelled
      const slot = slots.find(s => s.id === previousBooking.slotId);
      if (slot) {
        slot.bookedCount += previousBooking.numberOfPeople;
        slot.availableCount = slot.capacity - slot.bookedCount;
        if (slot.availableCount <= 0) slot.status = 'Full';
      }
      createNotification("booking_confirmed", `Booking reference ${previousBooking.referenceNumber} restored to CONFIRMED.`, previousBooking.referenceNumber);
    } else {
      createNotification("status_changed", `Booking status updated to "${status}" for ref: ${previousBooking.referenceNumber}`, previousBooking.referenceNumber);
    }
    
    previousBooking.status = status;
  }

  if (paymentStatus) {
    previousBooking.paymentStatus = paymentStatus;
  }

  res.json(previousBooking);
});

// 6. Dashboard Summary API
app.get('/api/dashboard/summary', (req, res) => {
  // Offers
  const totalOffersCount = offers.length;
  const activeOffersCount = offers.filter(o => o.status === "Active").length;

  // Bookings
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  const totalBookingsCount = bookings.length;
  
  const todayStr = "2026-05-24"; // Anchor date to match seeds and current simulation time
  const todaysBookingsCount = bookings.filter(b => b.bookingDate.startsWith(todayStr) || b.slotDate === todayStr).length;

  // Seats calculations
  let totalCapacitySeats = 0;
  let bookedSeatsCount = 0;

  slots.forEach(s => {
    totalCapacitySeats += s.capacity;
    bookedSeatsCount += s.bookedCount;
  });

  const availableSeatsCount = Math.max(0, totalCapacitySeats - bookedSeatsCount);

  // Conversion rate: (Booked count / Total slot capacity) * 100
  const rate = totalCapacitySeats > 0 ? Math.round((bookedSeatsCount / totalCapacitySeats) * 100) : 0;

  // Bookings Over Time (last 7 days simulation based on bookingDates)
  const bookingsMap: Record<string, { count: number, value: number }> = {};
  
  // Create last 5 days
  for(let i = 4; i >= 0; i--) {
    const d = new Date(new Date("2026-05-24").getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    bookingsMap[d] = { count: 0, value: 0 };
  }

  bookings.forEach(b => {
    const dStr = b.bookingDate.substring(0, 10);
    if (bookingsMap[dStr]) {
      bookingsMap[dStr].count += 1;
      bookingsMap[dStr].value += b.totalPaid || 0;
    } else {
      // Just map to date
      bookingsMap[dStr] = { count: 1, value: b.totalPaid || 0 };
    }
  });

  const bookingsOverTime = Object.keys(bookingsMap).sort().map(key => ({
    date: key,
    bookings: bookingsMap[key].count,
    revenue: bookingsMap[key].value
  }));

  // Industry Distribution (Using categories)
  const catDistribution: Record<string, number> = {};
  offers.forEach(o => {
    catDistribution[o.category] = (catDistribution[o.category] || 0) + 1;
  });

  const industryDistribution = Object.keys(catDistribution).map(key => ({
    name: key,
    value: catDistribution[key]
  }));

  res.json({
    totalOffers: totalOffersCount,
    activeOffers: activeOffersCount,
    totalBookings: totalBookingsCount,
    todaysBookings: todaysBookingsCount,
    totalCapacity: totalCapacitySeats,
    bookedSeats: bookedSeatsCount,
    availableSeats: availableSeatsCount,
    conversionRate: rate,
    bookingsOverTime,
    industryDistribution,
    recentBookings: bookings.slice(0, 8)
  });
});

// Notifications Endpoint
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// ==========================================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================================

async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite hmr integration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked successfully in development mode.");
  } else {
    // Production client serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static bundle from 'dist' in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Offer Slot Booking Server listing on: http://localhost:${PORT}`);
  });
}

initializeApp().catch((err) => {
  console.error("FATAL: Failed to initiate Vite Dev Server integration:", err);
});
