import { google } from 'googleapis'

export interface SheetQuestion {
  question: string
  type: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: number | string
  correct_answer_text?: string
  explanation?: string
  points?: number | string
  difficulty?: string
  tags?: string
}

/**
 * Extract Sheet ID from various Google Sheets URL formats
 */
export function extractSheetId(url: string): string {
  // Handle different URL formats:
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit...
  // https://docs.google.com/spreadsheets/d/SHEET_ID
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match || !match[1]) {
    throw new Error('Invalid Google Sheets URL. Please provide a valid share link.')
  }
  return match[1]
}

/**
 * Create authenticated Google Sheets API client
 */
function createSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !key) {
    throw new Error(
      'Missing Google credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local'
    )
  }

  // Clean and format the private key properly
  let privateKey = key

  // If the key is base64 encoded, decode it
  if (!key.includes('BEGIN PRIVATE KEY')) {
    try {
      privateKey = Buffer.from(key, 'base64').toString('utf-8')
    } catch (e) {
      console.warn('[Sheets Fetcher] Key is not base64 encoded, using as-is')
    }
  }

  // Replace literal \n strings with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  // Ensure proper key format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      'Invalid private key format. Key should start with "-----BEGIN PRIVATE KEY-----"'
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  return google.sheets({ version: 'v4', auth })
}

/**
 * Fetch and parse Google Sheets data
 *
 * @param sheetUrl - Full Google Sheets URL
 * @param range - Optional range (default: auto-detect first sheet with "A2:L") - assumes header in row 1, data starts row 2
 * @returns Array of question objects
 */
export async function fetchGoogleSheet(
  sheetUrl: string,
  range?: string
): Promise<SheetQuestion[]> {
  try {
    // Extract sheet ID from URL
    const sheetId = extractSheetId(sheetUrl)

    // Create authenticated client
    const sheets = createSheetsClient()

    // If no range specified, get first sheet name and use that
    let finalRange = range
    if (!finalRange) {
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      const firstSheet = sheetInfo.data.sheets?.[0]
      const sheetName = firstSheet?.properties?.title || 'Sheet1'
      finalRange = `${sheetName}!A2:L`

      console.log(`[Sheets Fetcher] Auto-detected sheet name: "${sheetName}"`)
    }

    // Fetch data from sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: finalRange,
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet. Make sure your sheet has data starting from row 2.')
    }
    
    // Transform rows to question objects
    // Expected columns: A=question, B=type, C-F=options, G=correct_answer, 
    //                   H=correct_answer_text, I=explanation, J=points, K=difficulty, L=tags
    return rows.map((row, index) => {
      if (!row || row.length === 0) {
        throw new Error(`Row ${index + 2} is empty`)
      }
      
      return {
        question: row[0] || '',
        type: row[1] || 'multiple_choice',
        option_a: row[2] || undefined,
        option_b: row[3] || undefined,
        option_c: row[4] || undefined,
        option_d: row[5] || undefined,
        correct_answer: row[6] || undefined,
        correct_answer_text: row[7] || undefined,
        explanation: row[8] || undefined,
        points: row[9] || undefined,
        difficulty: row[10] || undefined,
        tags: row[11] || undefined,
      }
    })
  } catch (error: any) {
    // Log the full error for debugging
    console.error('[Sheets Fetcher] Full error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      statusCode: error.statusCode,
      errors: error.errors,
      response: error.response?.data
    })
    
    // Provide helpful error messages
    if (error.code === 403 || error.status === 403) {
      throw new Error(
        `Permission denied. Make sure you've shared the sheet with: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`
      )
    }
    
    if (error.code === 404 || error.status === 404) {
      throw new Error(
        'Sheet not found. Please check the URL and make sure the sheet exists.'
      )
    }
    
    // Re-throw with original message for other errors
    throw new Error(error.message || 'Failed to fetch Google Sheet')
  }
}

/**
 * Get sheet metadata (useful for debugging)
 */
export async function getSheetInfo(sheetUrl: string) {
  try {
    const sheetId = extractSheetId(sheetUrl)
    const sheets = createSheetsClient()
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    })
    
    return {
      title: response.data.properties?.title,
      sheets: response.data.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })),
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get sheet info')
  }
}
