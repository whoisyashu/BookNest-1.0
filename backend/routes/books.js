const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Books = require('../models/Books');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyBPh16-5YuFhISK5HMlE8LXbwAj7RrHpq8';
const GEMINI_PROMPT = `You are a professional book quality inspector. Kindly review the attached image of a physical book and determine if it’s suitable for condition evaluation.

🕵️‍♂️ Step 1: Image Suitability Pre-Check
Please verify the following before scoring:

✅ Image Suitability Checklist (All must pass to proceed):

Book Visibility:
Ensure the entire book is clearly visible — including all corners, edges, and the spine.
There should be a little space around the book (not tightly cropped or cut off).

Clarity & Focus:
The image should be sharp and in focus — not blurry, overexposed (too white), or underexposed (too dark).

Lighting Quality:
Lighting must be balanced, with no harsh shadows, bright glares, or reflective areas hiding details.

❌ If any of these checks fail, please respond with:

"Image unsuitable for evaluation. Kindly retake the photo ensuring the entire book is fully visible with some surrounding space, proper lighting, and a clear, focused view."

✅ If the image passes all checks, proceed to Step 2:

📊 Step 2: Condition Evaluation
Please evaluate the physical condition of the book and return the following:

Score (0 to 100) — Higher indicates better condition.

Condition Tag based on the score:

Excellent (90–100)

Good (75–89)

Fair (50–74)

Poor (Below 50)

Short explanation (1–2 lines) justifying your score.

Criteria to consider:
Condition of cover (creases, tears, stains, fading)

Spine state (bent, cracked, misaligned)

Visible pages (yellowing, folds, marks)

Structural shape (warping, alignment)

Binding strength and print clarity
`;

const SOFT_PROMPT = `
You are a book quality inspector. Analyze the attached image of a physical book and estimate its condition.
If the image is unclear, do your best to estimate.
Return a score (0-100), a condition tag (Excellent, Good, Fair, Poor), and a short reason.
Output format:
Score: <number>
Quality: <tag>
Reason: <reason>
`;

// Public: Get all books
router.get('/', asyncHandler(async (req, res) => {
  const books = await Books.find({ isDeleted: false });
  res.json({ success: true, data: books });
}));

// Public: Get book by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Books.findById(req.params.id);
  if (!book || book.isDeleted) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, data: book });
}));

// Protected: Create book (Seller only)
router.post('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const book = await Books.create({ ...req.body, sellerId: req.user._id });
  res.status(201).json({ success: true, data: book });
}));

// Protected: Update book (Seller only, owner)
router.put('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const book = await Books.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, req.body, { new: true });
  if (!book) return res.status(404).json({ success: false, message: 'Book not found or not owned by you' });
  res.json({ success: true, data: book });
}));

// Protected: Delete book (Seller only, owner)
router.delete('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const book = await Books.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, { isDeleted: true }, { new: true });
  if (!book) return res.status(404).json({ success: false, message: 'Book not found or not owned by you' });
  res.json({ success: true, message: 'Book deleted' });
}));

router.post('/condition-score', upload.single('image'), async (req, res) => {
  try {
    console.debug('Received request to /condition-score');
    if (!req.file) {
      console.debug('No image uploaded');
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    console.debug('Image received:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
    const imageBase64 = req.file.buffer.toString('base64');
    const payload = {
      contents: [
        {
          parts: [
            { text: GEMINI_PROMPT },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: imageBase64
              }
            }
          ]
        }
      ]
    };
    console.debug('Sending image to Gemini REST API (2.0-flash) for evaluation...');
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );
    const parts = response.data.candidates?.[0]?.content?.parts;
    console.debug('All parts:', parts);
    const text = parts && parts.length ? parts.map(p => p.text).join('\n') : '';
    // Parse score, quality, reason with robust regex for markdown output
    const scoreMatch = text.match(/Score[:：]?\s*\**(\d+)/i);
    const qualityMatch = text.match(/Condition Tag[:：]?\s*\**([A-Za-z\-]+)/i);
    const reasonMatch = text.match(/Explanation[:：]?\s*\**([^\n]+)/i);
    let score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    let quality = qualityMatch ? qualityMatch[1] : '';
    let reason = reasonMatch ? reasonMatch[1].trim() : '';
    res.json({ success: true, score, quality, reason, geminiText: text, geminiParts: parts, geminiRaw: response.data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error evaluating image', error: err.message });
  }
});

module.exports = router;