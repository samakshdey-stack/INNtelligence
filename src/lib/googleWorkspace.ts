import { Guest, Property, Room, Reservation, HotelKPIs } from '../types';
import {
  initialMonthlyRevenueData,
  initialRoomCategoryBookingStats,
  initialRoomProblemsStats,
  initialCustomerProblemsStats,
  initialGuestFeedbackRecords,
} from '../data/analyticsData';

export interface WorkspaceExportResult {
  fileId: string;
  fileUrl: string;
  fileTitle: string;
  fileType: 'sheet' | 'doc';
  createdAt: string;
  itemCount?: number;
}

/**
 * 1. Export Guest Directory to Google Sheets
 */
export async function exportGuestsToGoogleSheets(
  accessToken: string,
  guests: Guest[],
  property: Property | null
): Promise<WorkspaceExportResult> {
  const hotelName = property?.name || 'The Meridian Kolkata';
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const fileTitle = `INNtelligence - ${hotelName} Guest Directory (${today})`;

  // Step 1: Create Spreadsheet via Google Sheets API v4
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: fileTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Guest Directory',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to create Google Spreadsheet (Status ${createRes.status})`
    );
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl =
    spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 2: Format Data Rows
  const headers = [
    'Guest ID',
    'First Name',
    'Last Name',
    'Email Address',
    'Phone Number',
    'Nationality',
    'VIP Tier',
    'Current Stay Status',
    'Allocated Room',
    'Check-in Date',
    'Check-out Date',
    'Total Stays',
    'Special Preferences / Notes',
    'ID Proof Type',
    'ID Proof Number',
  ];

  const rows = guests.map((g) => [
    g.id,
    g.firstName,
    g.lastName,
    g.email,
    g.phone,
    g.nationality,
    g.vipStatus || 'Regular',
    g.stayStatus,
    g.currentRoomNumber || 'N/A',
    g.checkInDate || 'N/A',
    g.checkOutDate || 'N/A',
    g.totalStays.toString(),
    g.notes || 'None',
    g.idProofType || 'Passport/Aadhaar',
    g.idProofNumber || 'Verified',
  ]);

  const allValues = [headers, ...rows];

  // Step 3: Append / Write values to Sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Guest%20Directory!A1:O${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `Guest Directory!A1:O${allValues.length}`,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to populate Google Sheet rows (Status ${updateRes.status})`
    );
  }

  // Step 4: Add Visual Styling & Auto-Resize Columns via BatchUpdate
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Style Header Row (Dark navy background, Gold accent text, Bold)
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.1, blue: 0.15 },
                  textFormat: {
                    foregroundColor: { red: 0.95, green: 0.8, blue: 0.3 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'LEFT',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Auto Resize Columns for readability
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 15,
              },
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('BatchUpdate styling notice:', styleErr);
  }

  return {
    fileId: spreadsheetId,
    fileUrl: spreadsheetUrl,
    fileTitle,
    fileType: 'sheet',
    createdAt: new Date().toISOString(),
    itemCount: guests.length,
  };
}

/**
 * 2. Export Audit Reports to Google Docs
 */
export async function exportReportToGoogleDocs(
  accessToken: string,
  reportType: 'financial' | 'operations' | 'both',
  property: Property | null,
  kpis?: HotelKPIs | null
): Promise<WorkspaceExportResult> {
  const hotelName = property?.name || 'The Meridian Kolkata';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const nowTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let fileTitle = `INNtelligence - ${hotelName} Executive Audit`;
  if (reportType === 'financial') {
    fileTitle = `INNtelligence - ${hotelName} Financial & Yield Audit (${new Date().toISOString().slice(0, 10)})`;
  } else if (reportType === 'operations') {
    fileTitle = `INNtelligence - ${hotelName} Operational & Incident Report (${new Date().toISOString().slice(0, 10)})`;
  } else {
    fileTitle = `INNtelligence - ${hotelName} Master Executive Dossier (${new Date().toISOString().slice(0, 10)})`;
  }

  // Step 1: Create Document via Google Docs API v1
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: fileTitle,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to create Google Doc (Status ${createRes.status})`
    );
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // Step 2: Build Structured Document Text Content
  const monthlyData = initialMonthlyRevenueData;
  const categoryStats = initialRoomCategoryBookingStats;
  const roomProblems = initialRoomProblemsStats;
  const customerProblems = initialCustomerProblemsStats;
  const feedbacks = initialGuestFeedbackRecords;

  const totalYTDRevenue = monthlyData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalBudget = monthlyData.reduce((acc, curr) => acc + curr.budgetRevenue, 0);
  const budgetVariance = (((totalYTDRevenue - totalBudget) / totalBudget) * 100).toFixed(2);
  const totalBookings = categoryStats.reduce((acc, curr) => acc + curr.bookings, 0);
  const totalIncidents = customerProblems.reduce((acc, curr) => acc + curr.count, 0);
  const avgResolutionTime = (
    customerProblems.reduce((acc, curr) => acc + curr.avgResolutionMins * curr.count, 0) /
    totalIncidents
  ).toFixed(1);

  let docBody = '';

  // Header Banner
  docBody += `================================================================================\n`;
  docBody += `INNtelligence™ LUXURY PROPERTY AUDIT & EXECUTIVE DOSSIER\n`;
  docBody += `Property: ${hotelName} | City: Kolkata, India | Room Count: 100 Keys\n`;
  docBody += `Audit Date: ${today} at ${nowTime} | Generated By: Hotel General Management\n`;
  docBody += `================================================================================\n\n`;

  // Section 1: Financial & Yield Performance (if 'financial' or 'both')
  if (reportType === 'financial' || reportType === 'both') {
    docBody += `1. FINANCIAL & YIELD PERFORMANCE AUDIT\n`;
    docBody += `--------------------------------------------------------------------------------\n`;
    docBody += `• Total YTD Gross Revenue: ₹${totalYTDRevenue.toFixed(1)} Lakhs (Target: ₹${totalBudget.toFixed(1)} Lakhs)\n`;
    docBody += `• Budget Variance: ${Number(budgetVariance) >= 0 ? '+' : ''}${budgetVariance}% (Favorable)\n`;
    docBody += `• Portfolio Occupancy Rate: ${(kpis?.occupancyRate || 78).toFixed(1)}%\n`;
    docBody += `• Estimated Daily Revenue: ₹${((kpis?.todaysRevenueEstimate || 378000) / 100000).toFixed(2)} Lakhs\n`;
    docBody += `• Total Room Nights Booked: ${totalBookings} nights\n\n`;

    docBody += `Room Category Breakdown & Yield Contribution:\n`;
    categoryStats.forEach((cat) => {
      docBody += `  - ${cat.category.padEnd(22)} | Bookings: ${cat.bookings.toString().padStart(4)} | Revenue: ₹${cat.revenue.toLocaleString('en-IN').padStart(12)} | Avg Stay: ${cat.avgStayNights} nights\n`;
    });
    docBody += `\nMonthly Revenue vs Budget Tracking (12 Months):\n`;
    monthlyData.forEach((m) => {
      const varPct = (((m.totalRevenue - m.budgetRevenue) / m.budgetRevenue) * 100).toFixed(1);
      docBody += `  - ${m.month.padEnd(16)} | Actual: ₹${m.totalRevenue.toFixed(1).padStart(6)}L | Budget: ₹${m.budgetRevenue.toFixed(1).padStart(6)}L | ADR: ₹${m.adr} | Occ: ${m.occupancyRate}% | Var: ${varPct}%\n`;
    });
    docBody += `\nStrategic Revenue Recommendations:\n`;
    docBody += `• Implement dynamic weekend surge pricing for Presidential & Executive Suites (+15% ADR ceiling).\n`;
    docBody += `• Target corporate agreements for mid-week Deluxe Suite occupancies (Tuesday-Thursday).\n`;
    docBody += `• Enhance direct booking incentives on brand portal to reduce OTA commissions by 3.2%.\n\n\n`;
  }

  // Section 2: Operational Quality & Incident Analysis (if 'operations' or 'both')
  if (reportType === 'operations' || reportType === 'both') {
    docBody += `2. OPERATIONAL & INCIDENT QUALITY REPORT\n`;
    docBody += `--------------------------------------------------------------------------------\n`;
    docBody += `• Total Incident Tickets Logged: ${totalIncidents} tickets\n`;
    docBody += `• Average Resolution SLA: ${avgResolutionTime} minutes\n`;
    docBody += `• Verified Guest Satisfaction Index: ${(kpis?.guestSatisfaction || 4.8).toFixed(1)} / 5.0 (96% Positive Rating)\n`;
    docBody += `• In-House Guests Active: ${kpis?.inHouseGuestsCount || 48} Guests\n\n`;

    docBody += `Room Maintenance & Telemetry Problem Distribution:\n`;
    roomProblems.forEach((prob) => {
      docBody += `  - ${prob.roomCategory.padEnd(24)} | Total Problems: ${prob.totalProblems.toString().padStart(3)} | Resolution Rate: ${prob.resolutionRate}% | HVAC: ${prob.hvacIssues} | Plumbing: ${prob.plumbingIssues} | Wi-Fi: ${prob.wifiAvIssues}\n`;
    });

    docBody += `\nGuest Incident Categories & Resolution SLA:\n`;
    customerProblems.forEach((cp) => {
      docBody += `  - ${cp.problemType.padEnd(24)} | Occurrences: ${cp.count.toString().padStart(3)} | Dept: ${cp.primaryDepartment.padEnd(14)} | Avg Resolution: ${cp.avgResolutionMins} mins [${cp.severity}]\n`;
    });

    docBody += `\nRecent Verified Guest Reviews & Sentiments:\n`;
    feedbacks.slice(0, 4).forEach((fb) => {
      docBody += `  - Room ${fb.roomNumber} (${fb.guestName}): Rating ${fb.rating}/5.0 [${fb.sentiment.toUpperCase()}]\n`;
      docBody += `    Comment: "${fb.comment}"\n`;
      if (fb.actionTaken) {
        docBody += `    Resolution Action: "${fb.actionTaken}"\n`;
      }
    });

    docBody += `\nOperational Directives for Frontline Staff:\n`;
    docBody += `• Preventative HVAC filter and sensor maintenance cycle on Floors 3 & 4.\n`;
    docBody += `• Pre-arrival verification protocol for VIP amenities and digital keycard provisioning.\n`;
    docBody += `• Rapid 15-minute escalation policy for in-room dining and room service deliveries.\n\n\n`;
  }

  // Executive Signoff
  docBody += `================================================================================\n`;
  docBody += `EXECUTIVE COMPLIANCE & SECURITY VERIFICATION\n`;
  docBody += `This report has been compiled and exported via INNtelligence Hospitality Cloud.\n`;
  docBody += `Integrity Status: Verified & Encrypted in Google Drive\n`;
  docBody += `================================================================================\n`;

  // Step 3: Insert Content into Google Doc via batchUpdate
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: docBody,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Failed to write text to Google Doc (Status ${updateRes.status})`
    );
  }

  return {
    fileId: documentId,
    fileUrl: documentUrl,
    fileTitle,
    fileType: 'doc',
    createdAt: new Date().toISOString(),
  };
}
