import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { AIQueryResponse } from '../src/types';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Deterministic rule-based query resolver for instant, zero-latency, 100% grounded answers
// acts as a ground-truth baseline and fallback
export function resolveFactualQueryLocal(query: string): AIQueryResponse | null {
  const q = query.toLowerCase().trim();
  const kpis = db.getKPIs();
  const rooms = db.getAllRooms();
  const guests = db.getAllGuests();
  const reservations = db.getAllReservations();
  const events = db.getAllEvents();

  const isHindi = /[\u0900-\u097F]/.test(query);
  const isHinglish =
    /\b(kitne|kamre|khali|hai|hain|kaun|rukha|staying|aaj|kal|chal|raha)\b/i.test(query) && !isHindi;
  const lang = isHindi ? 'Hindi' : isHinglish ? 'Hinglish' : 'English';

  // 1. Vacant / Available rooms
  if (
    q.includes('vacant') ||
    q.includes('available') ||
    q.includes('खाली') ||
    q.includes('khali') ||
    q.includes('kitne rooms vacant')
  ) {
    const availableCount = kpis.availableRooms;
    const cleaningCount = kpis.cleaningRooms;
    let answer = '';

    if (isHindi) {
      answer = `द मेरिडियन कोलकाता में वर्तमान में ${availableCount} कमरे पूरी तरह से खाली (Available) और चेक-इन के लिए तैयार हैं। इसके अलावा ${cleaningCount} कमरे हाउसकीपिंग (Cleaning) में हैं।`;
    } else if (isHinglish) {
      answer = `The Meridian Kolkata me abhi ${availableCount} rooms vacant (Available) hain aur check-in ke liye ready hain. Iske alawa ${cleaningCount} rooms housekeeping (Cleaning) me hain.`;
    } else {
      answer = `Currently, there are ${availableCount} rooms available and ready for immediate guest check-in at The Meridian Kolkata. An additional ${cleaningCount} rooms are currently being serviced by housekeeping.`;
    }

    const availableRoomNumbers = rooms
      .filter((r) => r.status === 'Available')
      .slice(0, 8)
      .map((r) => r.roomNumber);

    return {
      query,
      answer,
      languageDetected: lang,
      confidence: 0.99,
      relatedEntities: { rooms: availableRoomNumbers },
      suggestedFollowUps: ['Who is checking in today?', 'Show me room 204 status', 'Which rooms are in cleaning?'],
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Who is staying in Room XXX? (e.g. 204)
  const roomMatch = q.match(/\b(room\s*|कमरा\s*|kamra\s*)?([1-5]\d{2})\b/i);
  if (
    (q.includes('staying in') ||
      q.includes('who is in') ||
      q.includes('occupied by') ||
      q.includes('kaun') ||
      q.includes('status of room') ||
      q.includes('who is staying') ||
      q.includes('details of room')) &&
    roomMatch
  ) {
    const roomNum = roomMatch[2];
    const room = db.getRoomById(roomNum);
    if (!room) {
      return {
        query,
        answer: isHindi
          ? `कमरा नंबर ${roomNum} होटल के रिकॉर्ड में मौजूद नहीं है।`
          : `Room ${roomNum} was not found in the property inventory.`,
        languageDetected: lang,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
    }

    let answer = '';
    if (room.status === 'Occupied' && room.currentGuestName) {
      const guest = guests.find((g) => g.id === room.currentGuestId);
      const res = reservations.find((r) => r.id === room.currentReservationId);
      if (isHindi) {
        answer = `कमरा ${roomNum} वर्तमान में ${room.currentGuestName} के नाम पर आरक्षित और ऑक्यूपाइड है (रिजर्वेशन: ${res?.id || 'N/A'}, चेक-आउट: ${res?.checkOutDate || 'N/A'}, दर: ₹${room.rate.toLocaleString('en-IN')}/रात)।`;
      } else if (isHinglish) {
        answer = `Room ${roomNum} abhi ${room.currentGuestName} ke pass hai aur Occupied hai (Reservation: ${res?.id || 'N/A'}, Check-out: ${res?.checkOutDate || 'N/A'}, Rate: ₹${room.rate.toLocaleString('en-IN')}/night).`;
      } else {
        answer = `Room ${roomNum} is currently occupied by ${room.currentGuestName} under reservation ${res?.id || 'N/A'}. Check-out is scheduled for ${res?.checkOutDate || 'N/A'} (Room type: ${room.roomType}, Rate: ₹${room.rate.toLocaleString('en-IN')}/night).`;
      }
      return {
        query,
        answer,
        languageDetected: lang,
        confidence: 0.99,
        relatedEntities: {
          rooms: [room.roomNumber],
          guests: guest ? [guest.id] : [],
          reservations: res ? [res.id] : [],
        },
        suggestedFollowUps: [`Check out Room ${roomNum}`, `View guest ${room.currentGuestName}`, 'How many rooms are vacant?'],
        timestamp: new Date().toISOString(),
      };
    } else {
      if (isHindi) {
        answer = `कमरा ${roomNum} वर्तमान में खाली नहीं है बल्कि इसकी स्थिति '${room.status}' है। कोई मेहमान इसमें नहीं रुका है।`;
      } else if (isHinglish) {
        answer = `Room ${roomNum} abhi Occupied nahi hai; iska current status '${room.status}' hai.`;
      } else {
        answer = `Room ${roomNum} is currently ${room.status} (${room.roomType}, ₹${room.rate.toLocaleString('en-IN')}/night). There is no active guest registered in this room right now.`;
      }
      return {
        query,
        answer,
        languageDetected: lang,
        confidence: 0.99,
        relatedEntities: { rooms: [room.roomNumber] },
        suggestedFollowUps: ['Show available rooms', 'Who is checking in today?'],
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 3. Maintenance / Out of service rooms
  if (q.includes('maintenance') || q.includes('मरम्मत') || q.includes('out of service') || q.includes('repair')) {
    const maintRooms = rooms.filter((r) => r.status === 'Maintenance' || r.status === 'Out of Service');
    let answer = '';
    if (maintRooms.length === 0) {
      answer = 'There are no rooms currently under maintenance or out of service.';
    } else {
      const details = maintRooms
        .map((r) => `Room ${r.roomNumber} (${r.status}${r.maintenanceReason ? ': ' + r.maintenanceReason : ''})`)
        .join(', ');
      if (isHindi) {
        answer = `वर्तमान में ${maintRooms.length} कमरे मेंटेनेंस या आउट ऑफ सर्विस हैं: ${details}।`;
      } else if (isHinglish) {
        answer = `Abhi total ${maintRooms.length} rooms maintenance / out of service me hain: ${details}.`;
      } else {
        answer = `There are currently ${maintRooms.length} rooms under maintenance or out of service: ${details}.`;
      }
    }
    return {
      query,
      answer,
      languageDetected: lang,
      confidence: 0.99,
      relatedEntities: { rooms: maintRooms.map((r) => r.roomNumber) },
      suggestedFollowUps: ['How many rooms are vacant?', "Show today's arrivals"],
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Today's Arrivals / Check-ins
  if (
    q.includes('arrivals') ||
    q.includes('checking in today') ||
    q.includes('checked in today') ||
    q.includes('aaj kaun') ||
    q.includes('आज कौन') ||
    q.includes('arrival')
  ) {
    const todayArrivals = reservations.filter((r) => r.checkInDate === '2026-08-22');
    const guestNames = todayArrivals.map((r) => `${r.guestName} (${r.roomType}, ${r.status})`).join(', ');
    let answer = '';
    if (isHindi) {
      answer = `आज 22 अगस्त 2026 को कुल ${todayArrivals.length} अराइवल्स निर्धारित हैं: ${guestNames || 'कोई अराइवल नहीं'}।`;
    } else if (isHinglish) {
      answer = `Aaj 22 August 2026 ko total ${todayArrivals.length} arrivals hain: ${guestNames || 'Koi arrival nahi'}.`;
    } else {
      answer = `Today (August 22, 2026), there are ${todayArrivals.length} scheduled arrivals: ${guestNames || 'No scheduled arrivals'}.`;
    }
    return {
      query,
      answer,
      languageDetected: lang,
      confidence: 0.99,
      relatedEntities: {
        reservations: todayArrivals.map((r) => r.id),
        guests: todayArrivals.map((r) => r.guestId),
      },
      suggestedFollowUps: ['How many rooms are vacant?', 'Who is checking out today?'],
      timestamp: new Date().toISOString(),
    };
  }

  // 5. Today's Departures / Check-outs
  if (
    q.includes('departure') ||
    q.includes('departures') ||
    q.includes('checking out today') ||
    q.includes('checked out today')
  ) {
    const todayDeps = reservations.filter((r) => r.checkOutDate === '2026-08-22');
    const guestNames = todayDeps.map((r) => `${r.guestName} (Room ${r.roomNumber || 'N/A'}, ${r.status})`).join(', ');
    let answer = '';
    if (isHindi) {
      answer = `आज 22 अगस्त 2026 को कुल ${todayDeps.length} डिपार्चर निर्धारित हैं: ${guestNames}।`;
    } else if (isHinglish) {
      answer = `Aaj 22 August 2026 ko total ${todayDeps.length} departures hain: ${guestNames}.`;
    } else {
      answer = `Today (August 22, 2026), there are ${todayDeps.length} scheduled departures: ${guestNames}.`;
    }
    return {
      query,
      answer,
      languageDetected: lang,
      confidence: 0.99,
      relatedEntities: {
        reservations: todayDeps.map((r) => r.id),
      },
      suggestedFollowUps: ['How many rooms are vacant?', "Show today's arrivals"],
      timestamp: new Date().toISOString(),
    };
  }

  // 6. Recent Activity / Events
  if (q.includes('activity') || q.includes('event') || q.includes('history') || q.includes('happening')) {
    const recent = events.slice(0, 4);
    const summary = recent.map((e) => `[${e.timeFormatted}] ${e.title}: ${e.description}`).join(' | ');
    return {
      query,
      answer: `Recent hotel operational activity: ${summary}`,
      languageDetected: lang,
      confidence: 0.98,
      suggestedFollowUps: ['How many rooms are vacant?', 'Who is checking in today?'],
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

// Primary AI Query Handler powered by Gemini 3.7 Flash with Live Database Grounding
export async function queryHotelIntelligence(userQuery: string): Promise<AIQueryResponse> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return {
      query: userQuery,
      answer: "Please provide a question about The Meridian Kolkata's operations, rooms, guests, or reservations.",
      languageDetected: 'English',
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    };
  }

  // Check deterministic resolver first for instant response
  const fastResult = resolveFactualQueryLocal(trimmed);
  if (fastResult) {
    return fastResult;
  }

  const ai = getAiClient();
  if (!ai) {
    // If no GEMINI_API_KEY, provide a strictly grounded factual summary
    const kpis = db.getKPIs();
    return {
      query: userQuery,
      answer: `The Meridian Kolkata Operational State: ${kpis.occupancyRate}% occupancy (${kpis.occupiedRooms}/${kpis.totalRooms} rooms occupied), ${kpis.availableRooms} available rooms, ${kpis.cleaningRooms} in housekeeping cleaning, ${kpis.todaysArrivals} arrivals today, and ${kpis.todaysDepartures} departures today.`,
      languageDetected: 'English',
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }

  // Build live operational snapshot for Gemini
  const property = db.getProperty();
  const kpis = db.getKPIs();
  const rooms = db.getAllRooms();
  const guests = db.getAllGuests();
  const reservations = db.getAllReservations();
  const events = db.getAllEvents().slice(0, 10);

  const contextSnapshot = {
    property,
    kpis,
    occupiedRoomsSummary: rooms
      .filter((r) => r.status === 'Occupied')
      .map((r) => ({ room: r.roomNumber, type: r.roomType, guest: r.currentGuestName, rate: r.rate })),
    availableRoomsSummary: rooms
      .filter((r) => r.status === 'Available')
      .map((r) => ({ room: r.roomNumber, type: r.roomType, rate: r.rate })),
    cleaningRooms: rooms.filter((r) => r.status === 'Cleaning').map((r) => r.roomNumber),
    maintenanceRooms: rooms
      .filter((r) => r.status === 'Maintenance' || r.status === 'Out of Service')
      .map((r) => ({ room: r.roomNumber, status: r.status, reason: r.maintenanceReason })),
    guestsSummary: guests.map((g) => ({
      id: g.id,
      name: `${g.firstName} ${g.lastName}`,
      room: g.currentRoomNumber,
      status: g.stayStatus,
      vip: g.vipStatus,
      phone: g.phone,
    })),
    reservationsSummary: reservations.map((r) => ({
      id: r.id,
      guest: r.guestName,
      room: r.roomNumber,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      status: r.status,
      channel: r.bookingChannel,
      rate: r.rate,
    })),
    recentEvents: events.map((e) => ({ time: e.timeFormatted, title: e.title, desc: e.description })),
  };

  const systemInstruction = `You are the AI Operator for INNtelligence at The Meridian Kolkata (Kolkata, India).
CRITICAL RULES:
1. Ground every answer STRICTLY in the provided operational database snapshot.
2. NEVER guess, speculate, or hallucinate. If data is not present in the snapshot, state clearly: "I don't have enough data to answer that yet."
3. Multilingual Support: Understand and respond naturally in the user's language (English, Hindi, or Hinglish).
   - If queried in Hindi (e.g. आज कितने कमरे खाली हैं?), answer politely and accurately in Hindi.
   - If queried in Hinglish (e.g. Aaj kitne rooms vacant hain?), answer in clear Hinglish.
   - If queried in English, answer in polished, professional English.
4. Keep answers concise, factual, and direct without generic marketing buzzwords.
5. Provide relevant room numbers, guest names, and reservation IDs when answering.`;

  try {
    const prompt = `Current Operational Database Snapshot:
${JSON.stringify(contextSnapshot, null, 2)}

User Question: "${trimmed}"

Please answer the user question accurately based solely on the database snapshot above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high factual accuracy
      },
    });

    const text = response.text || "I don't have enough data to answer that yet.";

    const isHindi = /[\u0900-\u097F]/.test(trimmed);
    const isHinglish = /\b(kitne|kamre|khali|hai|hain|kaun|rukha|aaj)\b/i.test(trimmed) && !isHindi;

    return {
      query: userQuery,
      answer: text.trim(),
      languageDetected: isHindi ? 'Hindi' : isHinglish ? 'Hinglish' : 'English',
      confidence: 0.98,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    // Fallback to local resolver
    const fallback = resolveFactualQueryLocal(trimmed);
    if (fallback) return fallback;

    return {
      query: userQuery,
      answer: `Live Hotel State: ${kpis.availableRooms} rooms available, ${kpis.occupiedRooms} occupied (${kpis.occupancyRate}% occupancy), ${kpis.todaysArrivals} arrivals today.`,
      languageDetected: 'English',
      confidence: 0.9,
      timestamp: new Date().toISOString(),
    };
  }
}
