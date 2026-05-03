const PDFDocument = require('pdfkit')
const https = require('https')
const http = require('http')

const LOGO_URL = 'https://res.cloudinary.com/deci4v6zv/image/upload/v1762617272/the-serenity-place-logo-2026-removebg_ze7l7v.png'

// Fetch remote image as buffer
const fetchImageBuffer = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? https : http
  client.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return fetchImageBuffer(res.headers.location)
        .then(resolve).catch(reject)
    }
    const chunks = []
    res.on('data', c => chunks.push(c))
    res.on('end', () => resolve(Buffer.concat(chunks)))
    res.on('error', reject)
  }).on('error', reject)
})

const formatKES = (amount) => {
  const num = Number(amount)
  if (isNaN(num)) return 'Ksh 0'
  return `Ksh ${num.toLocaleString('en-KE')}`
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const formatKeTime = () => {
  return new Date().toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const typeLabel = (type) => ({
  monthly_fee:   'Monthly Care Fee',
  medical_fee:   'Medical / Therapy Fee',
  deposit:       'Admission Deposit',
  daily_charge:  'Daily Charge',
  credit_adjustment: 'Balance Adjustment',
  other:         'Other Payment'
}[type] ?? type ?? 'Payment')

const generateReceipt = async (payment, client, sponsor) => {
  return new Promise(async (resolve, reject) => {
    try {
      // ── DOCUMENT SETUP ────────────────────────────────
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 0,
        info: { Title: 'Payment Receipt — The Serenity Place' }
      })
      const chunks = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // ── CONSTANTS ─────────────────────────────────────
      const PW    = 595.28   // A4 width in points
      const PH    = 841.89   // A4 height in points
      const ML    = 40       // margin left
      const MR    = 40       // margin right
      const CW    = PW - ML - MR  // content width = 515.28pt

      const NAVY  = '#070D19'
      const CYAN  = '#06B6D4'
      const WHITE = '#FFFFFF'
      const SLATE = '#475569'
      const SLATE_LIGHT = '#64748B'
      const OFFWHITE = '#F8FAFC'
      const BORDER = '#E2E8F0'
      const RED   = '#EF4444'

      // ── SECTION 1: HEADER ────────────────────────────
      let curY = 30

      // Fetch and draw logo
      try {
        const logoBuffer = await fetchImageBuffer(LOGO_URL)
        doc.image(logoBuffer, ML, curY, { 
          fit: [120, 60], 
          align: 'left', 
          valign: 'center' 
        })
      } catch (e) {
        // Fallback: gradient "S" mark
        doc.roundedRect(ML, curY, 50, 50, 8).fill(CYAN)
        doc.fontSize(28).fillColor(WHITE).font('Helvetica-Bold')
           .text('S', ML, curY + 10, { width: 50, align: 'center' })
      }

      // "PAYMENT RECEIPT" — right side
      doc.fontSize(20)
         .fillColor(NAVY)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', 0, curY + 18, {
           width: PW - MR,
           align: 'right'
         })

      curY += 75

      // Cyan accent bar
      doc.rect(ML, curY, CW, 2).fill(CYAN)
      curY += 15

      // ── SECTION 2: INFO ROW ──────────────────────────
      const receiptNo = `${new Date().getFullYear()}-${String(payment._id).slice(-6).toUpperCase()}`
      const dateIssued = formatDate(payment.paymentDate ?? payment.createdAt)

      // Left column — receipt meta
      doc.fontSize(10).font('Helvetica-Bold').fillColor(NAVY)
         .text('Receipt No:', ML, curY)
      doc.fontSize(10).font('Helvetica').fillColor(SLATE)
         .text(receiptNo, ML + 70, curY)

      doc.fontSize(10).font('Helvetica-Bold').fillColor(NAVY)
         .text('Date Issued:', ML, curY + 18)
      doc.fontSize(10).font('Helvetica').fillColor(SLATE)
         .text(dateIssued, ML + 75, curY + 18)

      // Right column — facility contact
      doc.fontSize(12).font('Helvetica-Bold').fillColor(NAVY)
         .text('The Serenity Place', 0, curY, {
           width: PW - MR,
           align: 'right'
         })
      doc.fontSize(10).font('Helvetica').fillColor(SLATE)
         .text('Kahawa Sukari, Off Thika Super Highway', 0, curY + 16, {
           width: PW - MR, align: 'right'
         })
         .text('accounts@serenityplace.org', 0, curY + 30, {
           width: PW - MR, align: 'right'
         })

      curY += 65

      // ── SECTION 3: RECEIVED FROM ─────────────────────
      // Light card background
      const cardH = 70
      doc.roundedRect(ML, curY, CW, cardH, 6)
         .fill(OFFWHITE)

      // Thin left cyan accent
      doc.roundedRect(ML, curY, 3, cardH, 3).fill(CYAN)

      const cardPad = 15
      const colW = CW / 2

      // Left inner column
      doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_LIGHT)
         .text('CLIENT NAME', ML + cardPad, curY + cardPad)
      doc.fontSize(11).font('Helvetica').fillColor(NAVY)
         .text(client?.name ?? 'N/A', ML + cardPad, curY + cardPad + 14)

      doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_LIGHT)
         .text('SPONSOR', ML + cardPad, curY + cardPad + 34)
      doc.fontSize(10).font('Helvetica').fillColor(NAVY)
         .text(sponsor?.name ?? 'Self-Sponsored', ML + cardPad, curY + cardPad + 47)

      // Right inner column
      const rightX = ML + colW + cardPad

      doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_LIGHT)
         .text('ADMISSION DATE', rightX, curY + cardPad)
      doc.fontSize(11).font('Helvetica').fillColor(NAVY)
         .text(formatDate(client?.dateOfAdmission), rightX, curY + cardPad + 14)

      // Room/ID — use whatever field exists, fallback gracefully
      const roomId = client?.roomNumber ?? client?.room ?? client?.bedNumber ?? null
      if (roomId) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_LIGHT)
           .text('ROOM / ID', rightX, curY + cardPad + 34)
        doc.fontSize(10).font('Helvetica').fillColor(NAVY)
           .text(String(roomId), rightX, curY + cardPad + 47)
      }

      curY += cardH + 25

      // ── SECTION 4: PAYMENT TABLE ─────────────────────
      // Column widths (% of CW)
      const COL = {
        desc:   CW * 0.40,
        period: CW * 0.20,
        method: CW * 0.20,
        amount: CW * 0.20,
      }
      const COL_X = {
        desc:   ML,
        period: ML + COL.desc,
        method: ML + COL.desc + COL.period,
        amount: ML + COL.desc + COL.period + COL.method,
      }

      // Table header — navy bar
      const thH = 30
      doc.rect(ML, curY, CW, thH).fill(NAVY)

      const thTextY = curY + 10
      doc.fontSize(10).font('Helvetica-Bold').fillColor(WHITE)
         .text('DESCRIPTION', COL_X.desc + 10, thTextY)
         .text('PERIOD',      COL_X.period + 6, thTextY)
         .text('METHOD',      COL_X.method + 6, thTextY)
         .text('AMOUNT',      COL_X.amount, thTextY, {
           width: COL.amount - 10, align: 'right'
         })

      curY += thH

      // Table row (single payment — can extend to array if needed)
      const rowH = 28
      const isOdd = true  // first row
      doc.rect(ML, curY, CW, rowH)
         .fill(isOdd ? OFFWHITE : WHITE)

      // Subtle row bottom border
      doc.rect(ML, curY + rowH - 1, CW, 1).fill(BORDER)

      const rowTextY = curY + 9
      const period = payment.billingPeriodLabel ??
        (payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString('en-KE', {
              month: 'short', year: 'numeric'
            })
          : 'N/A')

      doc.fontSize(10).font('Helvetica-Bold').fillColor(NAVY)
         .text(typeLabel(payment.paymentType), COL_X.desc + 10, rowTextY,
           { width: COL.desc - 15 })

      doc.fontSize(10).font('Helvetica').fillColor(NAVY)
         .text(period, COL_X.period + 6, rowTextY, { width: COL.period - 6 })
         .text(payment.paymentMethod ?? 'N/A', COL_X.method + 6, rowTextY,
           { width: COL.method - 6 })

      doc.fontSize(11).font('Helvetica-Bold').fillColor(NAVY)
         .text(formatKES(payment.amount), COL_X.amount, rowTextY, {
           width: COL.amount - 10, align: 'right'
         })

      curY += rowH + 15

      // ── SECTION 5: TOTALS ────────────────────────────
      // Right-aligned, 200pt wide
      const totalW = 220
      const totalX = PW - MR - totalW

      // Cyan total strip
      const totalH = 40
      doc.rect(totalX, curY, totalW, totalH).fill(CYAN)

      doc.fontSize(12).font('Helvetica-Bold').fillColor(WHITE)
         .text('TOTAL PAID', totalX + 12, curY + 12)
      doc.fontSize(14).font('Helvetica-Bold').fillColor(WHITE)
         .text(formatKES(payment.amount), totalX, curY + 11, {
           width: totalW - 10, align: 'right'
         })

      curY += totalH + 10

      // Outstanding balance
      const balance = client?.balance ?? client?.outstandingBalance ?? null
      if (balance !== null && balance !== undefined) {
        doc.rect(totalX, curY, totalW, 32).fill('#FFF1F2')
        doc.fontSize(10).font('Helvetica').fillColor(RED)
           .text('Outstanding Balance', totalX + 12, curY + 10)
        doc.fontSize(11).font('Helvetica-Bold').fillColor(RED)
           .text(formatKES(balance), totalX, curY + 10, {
             width: totalW - 10, align: 'right'
           })
        curY += 42
      }

      // ── SECTION 6: FOOTER ────────────────────────────
      const footerY = PH - 60

      // Cyan separator line
      doc.rect(ML, footerY, CW, 1).fill(CYAN)

      // Footer text
      doc.fontSize(8).font('Helvetica').fillColor(SLATE_LIGHT)
         .text(
           `Generated automatically via Serenity Place Web App  |  Kenya Time: ${formatKeTime()}  |  accounts@serenityplace.org`,
           ML, footerY + 8,
           { width: CW, align: 'center' }
         )

      doc.fontSize(8).font('Helvetica-Oblique').fillColor(SLATE)
         .text(
           'www.theserenityplace.org  |  Kahawa Sukari, Off Thika Super Highway, Nairobi',
           ML, footerY + 22,
           { width: CW, align: 'center' }
         )

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { generateReceipt }
