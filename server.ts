import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { queryHotelIntelligence } from './server/ai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', property: 'The Meridian Kolkata' });
  });

  // 1. Property
  app.get('/api/property', (_req, res) => {
    res.json(db.getProperty());
  });

  // 2. KPIs
  app.get('/api/kpis', (_req, res) => {
    res.json(db.getKPIs());
  });

  // 3. Rooms
  app.get('/api/rooms', (req, res) => {
    const status = req.query.status as any;
    const floor = req.query.floor ? parseInt(req.query.floor as string, 10) : undefined;
    let rooms = db.getAllRooms();
    if (status) {
      rooms = rooms.filter((r) => r.status === status);
    }
    if (floor) {
      rooms = rooms.filter((r) => r.floor === floor);
    }
    res.json(rooms);
  });

  app.get('/api/rooms/:id', (req, res) => {
    const room = db.getRoomById(req.params.id);
    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }
    res.json(room);
  });

  app.post('/api/rooms/:id/mark-clean', (req, res) => {
    const performedBy = req.body.performedBy || 'Housekeeping Lead';
    const result = db.markRoomClean(req.params.id, performedBy);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post('/api/rooms/:id/maintenance', (req, res) => {
    const { status, reason, performedBy } = req.body;
    const result = db.setRoomMaintenance(req.params.id, status, reason, performedBy);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // 4. Guests
  app.get('/api/guests', (_req, res) => {
    res.json(db.getAllGuests());
  });

  app.get('/api/guests/:id', (req, res) => {
    const guest = db.getGuestById(req.params.id);
    if (!guest) {
      res.status(404).json({ error: 'Guest not found.' });
      return;
    }
    res.json(guest);
  });

  app.post('/api/guests', (req, res) => {
    const guest = db.createGuest(req.body);
    res.status(201).json(guest);
  });

  // 5. Reservations
  app.get('/api/reservations', (_req, res) => {
    res.json(db.getAllReservations());
  });

  app.get('/api/reservations/:id', (req, res) => {
    const reservation = db.getReservationById(req.params.id);
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }
    res.json(reservation);
  });

  app.post('/api/reservations', (req, res) => {
    const result = db.createReservation(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(result.reservation);
  });

  app.post('/api/reservations/:id/cancel', (req, res) => {
    const performedBy = req.body.performedBy || 'Front Desk';
    const result = db.cancelReservation(req.params.id, performedBy);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // 6. Check-in
  app.post('/api/check-in', (req, res) => {
    const result = db.performCheckIn(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // 7. Check-out
  app.post('/api/check-out', (req, res) => {
    const result = db.performCheckOut(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // 8. Operational Events
  app.get('/api/events', (_req, res) => {
    res.json(db.getAllEvents());
  });

  // 9. Search
  app.post('/api/search', (req, res) => {
    const query = req.body.query || '';
    res.json(db.search(query));
  });

  // 10. AI Operator Query
  app.post('/api/ai/query', async (req, res) => {
    try {
      const query = req.body.query || '';
      const answer = await queryHotelIntelligence(query);
      res.json(answer);
    } catch (err: any) {
      console.error('AI Operator error:', err);
      res.status(500).json({
        error: 'Failed to process AI query.',
        details: err?.message || String(err),
      });
    }
  });

  // 11. Reset Seed Data
  app.post('/api/reset-seed', (_req, res) => {
    db.reset();
    res.json({ message: 'Hotel database reset to initial seeded state.' });
  });

  // Vite middleware for dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INNtelligence server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
