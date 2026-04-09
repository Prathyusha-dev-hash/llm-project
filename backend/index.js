const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Setup multer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage: storage });

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
const uri = "mongodb+srv://prathyushachintha54_db_user:jVIuOoxAZaxK7UK9@cluster0.z5rysnq.mongodb.net/";
const client = new MongoClient(uri);

let db, studentsCollection, mlDataCollection, resourcesCollection, assignmentReviewsCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('LLM_Project');
    studentsCollection = db.collection('Student_details');
    mlDataCollection = db.collection('ML_DATA');
    resourcesCollection = db.collection('Resources');
    assignmentReviewsCollection = db.collection('Assignment_reviews');
    console.log("✅ Connected to MongoDB 'LLM_Project'");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// ─── In-memory data (Fallback for courses & analytics) ────────────────────────
let courses = [
  { id: 1, code: 'ML101', name: 'Machine Learning 101', emoji: '🤖', level: 'Beginner', students: 312, completion: 68 },
  { id: 2, code: 'AI305', name: 'AI Systems Design', emoji: '🧠', level: 'Advanced', students: 198, completion: 45 },
  { id: 3, code: 'DS202', name: 'Data Science 202', emoji: '📊', level: 'Intermediate', students: 267, completion: 82 },
  { id: 4, code: 'NLP201', name: 'NLP Fundamentals', emoji: '💬', level: 'Intermediate', students: 273, completion: 58 },
];

const analytics = {
  activeStudents: 1284,
  activeStudentsDelta: '↑ 8.3% this week',
  avgMastery: 74.2,
  avgMasteryDelta: '↑ 2.1% vs last week',
  aiInteractions: 3891,
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weeklyEngagement: [72, 85, 91, 88, 96, 54, 43],
  gaps: [
    { topic: 'Backpropagation', mastery: 44 },
    { topic: 'Transformer Attention', mastery: 38 },
    { topic: 'Bayesian Networks', mastery: 31 },
    { topic: 'Regularization', mastery: 52 },
    { topic: 'RL Policies', mastery: 29 },
  ],
};

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function getStudentName(row) {
  return row?.name || row?.Student || null;
}

function getStudentId(row) {
  return row?.studentId || row?._id?.toString() || null;
}

function getStudentCourseId(row) {
  return row?.courseId || null;
}

function hashString(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAssignmentReviewStats(reviews, studentId, courseId) {
  const matchingReviews = reviews.filter(review => review.studentId === studentId && review.courseId === courseId);
  const assignmentReviewCount = matchingReviews.length;
  const assignmentReviewScore = assignmentReviewCount > 0
    ? Math.round(matchingReviews.reduce((sum, review) => sum + (review.predictedPercentage || 0), 0) / assignmentReviewCount)
    : 0;

  return {
    assignmentReviewCount,
    assignmentReviewScore
  };
}

const GAP_STOPWORDS = new Set([
  'about', 'against', 'aligned', 'alignment', 'answer', 'answers', 'assignment', 'because', 'better',
  'brief', 'clarity', 'clear', 'concept', 'concepts', 'content', 'course', 'detail', 'details',
  'example', 'examples', 'explain', 'explanation', 'feedback', 'general', 'improve', 'improvement',
  'include', 'lack', 'missing', 'more', 'needs', 'question', 'response', 'review', 'score',
  'should', 'shows', 'solution', 'student', 'submission', 'support', 'topic', 'topics', 'work'
]);

function toTitleCase(text = '') {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

function normalizeGapTopic(text = '') {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !GAP_STOPWORDS.has(token));

  if (cleaned.length === 0) return null;
  return toTitleCase(cleaned.slice(0, 3).join(' '));
}

function canonicalizeTopicLabel(text = '') {
  const normalized = normalizeGapTopic(text);
  return normalized || null;
}

function buildKnowledgeGapMap(studentCourses) {
  const metricBuckets = new Map();

  for (const course of studentCourses) {
    const metrics = [
      { key: `${course.course}-coursework`, topic: `${course.course} Coursework`, mastery: course.averageScore ?? 0 },
      { key: `${course.course}-assignments`, topic: `${course.course} Assignment Review`, mastery: course.assignmentReviewScore ?? 0 },
      { key: `${course.course}-coverage`, topic: `${course.course} Submission Coverage`, mastery: course.submissionCoverage ?? 0 }
    ];

    for (const metric of metrics) {
      const current = metricBuckets.get(metric.key) || { topic: metric.topic, total: 0, count: 0 };
      current.total += metric.mastery;
      current.count += 1;
      metricBuckets.set(metric.key, current);
    }
  }

  return [...metricBuckets.values()]
    .map(metric => ({
      topic: metric.topic,
      mastery: Math.round(metric.total / metric.count)
    }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6);
}

function buildReviewDrivenKnowledgeGapMap(reviews) {
  const topicBuckets = new Map();

  for (const review of reviews) {
    const severity = clamp(100 - (review.predictedPercentage || 0), 10, 100);
    const explicitTopics = (review.topicTags || []).map(topic => canonicalizeTopicLabel(topic)).filter(Boolean);
    const inferredTopics = [...(review.gaps || []), ...(review.improvements || [])]
      .map(text => normalizeGapTopic(text))
      .filter(Boolean);
    const candidateTopics = [...new Set([...explicitTopics, ...inferredTopics])];

    for (const topic of candidateTopics) {
      const current = topicBuckets.get(topic) || { topic, totalSeverity: 0, count: 0 };
      current.totalSeverity += severity;
      current.count += 1;
      topicBuckets.set(topic, current);
    }
  }

  return [...topicBuckets.values()]
    .map(bucket => ({
      topic: bucket.topic,
      mastery: clamp(100 - Math.round(bucket.totalSeverity / bucket.count), 15, 95)
    }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6);
}

function calculateProgressMetrics({ totalScore, moduleCount, averageScore, assignmentReviewScore, submissionCoverage }) {
  const resolvedAverageScore = typeof averageScore === 'number'
    ? averageScore
    : (moduleCount > 0 ? Math.round(totalScore / moduleCount) : 0);
  const progress = Math.round((resolvedAverageScore * 0.3) + (assignmentReviewScore * 0.4) + (submissionCoverage * 0.3));

  return {
    averageScore: resolvedAverageScore,
    assignmentReviewScore,
    submissionCoverage,
    progress
  };
}

function aggregateStudentCourses(dbStudents, reviews = []) {
  const map = {}; 
  dbStudents.forEach(row => {
    const key = `${row.studentId}-${row.courseId}`;
    if (!map[key]) {
      map[key] = { studentId: row.studentId, name: row.name, courseId: row.courseId, totalScore: 0, moduleCount: 0 };
    }
    map[key].totalScore += (row.score || 0);
    map[key].moduleCount += 1;
  });

  return Object.values(map).map(sc => {
    const { assignmentReviewScore, assignmentReviewCount } = getAssignmentReviewStats(reviews, sc.studentId, sc.courseId);
    let mastery = 'Low';
    const averageScore = sc.moduleCount > 0 ? Math.round(sc.totalScore / sc.moduleCount) : 0;
    if (averageScore >= 80) mastery = 'High';
    else if (averageScore >= 60) mastery = 'Medium';
    
    return {
      studentId: sc.studentId,
      name: sc.name,
      course: sc.courseId,
      averageScore,
      assignmentReviewScore,
      assignmentReviewCount,
      mastery: mastery,
      avgScore: averageScore
    };
  });
}

const colors = ['#2D5BE3', '#7C3AED', '#1A7A4A', '#92540A', '#B91C1C'];
function getColor(name) {
  return colors[hashString(name) % colors.length];
}

async function getAllCourseTextChunks() {
  const dbData = await mlDataCollection.find({}).toArray();
  const allTextChunks = [];

  for (const doc of dbData) {
    if (!doc.pages) continue;
    for (const page of doc.pages) {
      if (!page.content) continue;
      for (const item of page.content) {
        if (item.type === 'paragraph' && item.text) {
          allTextChunks.push(item.text);
        }
      }
    }
  }

  return allTextChunks;
}

function getRiskProfile(studentCourse) {
  const reasons = [];
  let riskScore = 0;

  if (studentCourse.progress < 60) {
    reasons.push('overall progress is below target');
    riskScore += 35;
  }
  if ((studentCourse.assignmentReviewCount || 0) === 0) {
    reasons.push('no assignment has been submitted for review yet');
    riskScore += 20;
  }
  if (studentCourse.averageScore < 65) {
    reasons.push('average score is under 65%');
    riskScore += 35;
  }

  const level = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
  return {
    level,
    score: clamp(riskScore, 0, 100),
    reasons
  };
}

async function enrichStudentCourses(studentCourses) {
  const assignmentResources = await resourcesCollection.find({ resourceType: 'assignment' }).toArray();
  const expectedAssignmentsByCourse = assignmentResources.reduce((acc, resource) => {
    const courseKey = resource.courseId || 'Global';
    acc[courseKey] = (acc[courseKey] || 0) + 1;
    return acc;
  }, {});

  return studentCourses.map(course => {
    const expectedAssignments = expectedAssignmentsByCourse[course.course] || 0;
    const submissionCoverage = expectedAssignments > 0
      ? clamp(Math.round((course.assignmentReviewCount / expectedAssignments) * 100), 0, 100)
      : 100;
    const { progress, averageScore, assignmentReviewScore } = calculateProgressMetrics({
      averageScore: course.averageScore,
      assignmentReviewScore: course.assignmentReviewScore,
      submissionCoverage
    });
    const risk = getRiskProfile(course);

    return {
      ...course,
      progress,
      averageScore,
      assignmentReviewScore,
      expectedAssignments,
      submissionCoverage,
      risk
    };
  });
}

async function getStoredAssignmentReviews(filter = {}) {
  if (!assignmentReviewsCollection) return [];
  return assignmentReviewsCollection.find(filter).sort({ createdAt: -1 }).toArray();
}

function getTopContextFromChunks(allTextChunks, sourceText, limit = 4) {
  const keywords = sourceText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const matchedChunks = [];

  for (const chunk of allTextChunks) {
    let score = 0;
    const chunkLower = chunk.toLowerCase();
    for (const kw of keywords) {
      if (chunkLower.includes(kw)) score++;
    }
    if (score > 0) matchedChunks.push({ text: chunk, score });
  }

  matchedChunks.sort((a, b) => b.score - a.score);
  return matchedChunks.slice(0, limit).map(c => c.text).join('\n\n');
}

function readUploadedAssignmentText(file) {
  if (!file) return '';

  const ext = path.extname(file.originalname || '').toLowerCase();
  const supportedExtensions = new Set([
    '.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.csv',
    '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.sql', '.html', '.css'
  ]);

  const isTextLikeMime = (file.mimetype || '').startsWith('text/')
    || ['application/json', 'application/javascript'].includes(file.mimetype);

  if (!supportedExtensions.has(ext) && !isTextLikeMime) {
    return '';
  }

  return fs.readFileSync(file.path, 'utf8');
}

async function generateGroqReply(prompt) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
  });

  return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
}

function extractJson(text = '') {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  return fencedMatch ? fencedMatch[1].trim() : text.trim();
}

function formatAssignmentReview(review) {
  const rubricLines = (review.rubric || [])
    .map(item => `- **${item.category}**: ${item.score}/${item.maxScore} — ${item.feedback}`)
    .join('\n');
  const toBullets = items => (items || []).map(item => `- ${item}`).join('\n');

  return `## Predictive Grade
**${review.predictedPercentage}% (${review.letterGrade})**

## Overall Judgment
${review.overallJudgment}

## Rubric Breakdown
${rubricLines}

## What Works Well
${toBullets(review.strengths)}

## Gaps Against Course Material
${toBullets(review.gaps)}

## Suggested Improvements
${toBullets(review.improvements)}

## Confidence
${review.confidence}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const ADMIN_ACCOUNTS = {
  admin: { courseId: null, name: 'Super Admin' },
  admin1: { courseId: 'ML101', name: 'ML Instructor' },
  admin2: { courseId: 'DSA202', name: 'DSA Instructor' }
};

app.post('/api/login', async (req, res) => {
  const { role, username, password } = req.body;
  if (role === 'admin') {
    if (username in ADMIN_ACCOUNTS && password === 'admin123') {
      return res.json({ success: true, role: 'admin', adminData: ADMIN_ACCOUNTS[username] });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  } else if (role === 'student') {
    if (!password) {
      return res.status(400).json({ error: 'Password is required for student login' });
    }
    const studentRows = await studentsCollection.find({ $or: [{ studentId: username }, { Student: username }] }).toArray();
    if (studentRows.length > 0) {
      const studentName = getStudentName(studentRows[0]);
      const studentId = getStudentId(studentRows[0]);
      const storedReviews = await getStoredAssignmentReviews({ studentId });
      const aggregated = await enrichStudentCourses(aggregateStudentCourses(studentRows, storedReviews));
      const coursesInfo = aggregated.map(c => ({
         courseId: c.course || getStudentCourseId(studentRows[0]),
         progress: c.progress ?? 0,
         mastery: c.mastery ?? null,
         averageScore: c.averageScore ?? 0,
         assignmentReviewScore: c.assignmentReviewScore ?? 0,
         assignmentReviewCount: c.assignmentReviewCount ?? 0,
         submissionCoverage: c.submissionCoverage ?? 0,
         expectedAssignments: c.expectedAssignments ?? 0,
         risk: c.risk || null
      })).filter(course => course.courseId);

      if (!studentName || !studentId) {
        return res.status(422).json({ error: 'Student record is missing required fields.' });
      }

      return res.json({
        success: true,
        role: 'student',
        studentData: {
          id: studentId,
          name: studentName,
          courses: coursesInfo
        }
      });
    }
    return res.status(404).json({ error: 'Student not found.' });
  }
  return res.status(400).json({ error: 'Invalid role' });
});

app.get('/api/resources', async (req, res) => {
  try {
    const courseIdParam = req.query.courseId;
    let filter = {};
    if (courseIdParam) {
      const coursesArr = courseIdParam.split(',');
      if (coursesArr.length > 1) {
        filter = { courseId: { $in: coursesArr } };
      } else {
        filter = { courseId: courseIdParam };
      }
    }
    const resources = await resourcesCollection.find(filter).sort({ uploadedAt: -1 }).toArray();
    res.json(resources);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

app.post('/api/resources', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const title = req.body.title || req.file.originalname;
  const courseId = req.body.courseId || 'Global';
  const resourceType = req.body.resourceType === 'assignment' ? 'assignment' : 'study-material';
  const newResource = {
    title,
    courseId,
    resourceType,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date()
  };
  try {
    const result = await resourcesCollection.insertOne(newResource);
    newResource._id = result.insertedId;
    res.status(201).json(newResource);
  } catch (err) {
    console.error("Error saving resource metadata:", err);
    res.status(500).json({ error: "Failed to save resource" });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await resourcesCollection.findOne({ _id: new ObjectId(resourceId) });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    
    // Delete physical file
    const filePath = path.join(__dirname, 'uploads', resource.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete DB record
    await resourcesCollection.deleteOne({ _id: new ObjectId(resourceId) });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});


app.get('/api/courses', async (req, res) => {
  try {
    const adminCourseId = req.query.adminCourseId;
    const dbStudents = await studentsCollection.find({}).toArray();
    const storedReviews = await getStoredAssignmentReviews();
    const aggregated = await enrichStudentCourses(aggregateStudentCourses(dbStudents, storedReviews));

    const courseStats = {};
    for (let s of aggregated) {
      const c = s.course;
      if (c) {
        if (!courseStats[c]) courseStats[c] = { count: 0, totalProgress: 0 };
        courseStats[c].count++;
        courseStats[c].totalProgress += (s.progress || 0);
      }
    }

    let updatedCourses = courses.map(course => {
      const stats = courseStats[course.code] || { count: 0, totalProgress: 0 };
      return {
        ...course,
        students: stats.count,
        completion: stats.count > 0 ? Math.round(stats.totalProgress / stats.count) : 0
      };
    });

    if (adminCourseId && adminCourseId !== 'null' && adminCourseId !== 'undefined') {
      updatedCourses = updatedCourses.filter(c => c.code === adminCourseId);
    }

    res.json(updatedCourses);
  } catch (err) {
    console.error("Error fetching courses stats:", err);
    res.json(courses); // fallback
  }
});

app.post('/api/courses', (req, res) => {
  const { code, name, level, description } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  const course = { id: Date.now(), code, name, emoji: '📘', level: level || 'Beginner', students: 0, completion: 0, description: description || '' };
  courses.push(course);
  res.status(201).json(course);
});

app.get('/api/students', async (req, res) => {
  try {
    const adminCourseId = req.query.adminCourseId;
    const dbStudents = await studentsCollection.find({}).toArray();
    const storedReviews = await getStoredAssignmentReviews();
    let aggregated = await enrichStudentCourses(aggregateStudentCourses(dbStudents, storedReviews));

    if (adminCourseId && adminCourseId !== 'null' && adminCourseId !== 'undefined') {
      aggregated = aggregated.filter(s => s.course === adminCourseId);
    }

    const mappedStudents = aggregated.map((s, index) => ({
      id: s.studentId || `${s.course || 'student'}-${index}`,
      name: s.name || null,
      initials: getInitials(s.name),
      color: getColor(s.name || ''),
      course: s.course || null,
      progress: s.progress ?? 0,
      averageScore: s.averageScore ?? 0,
      assignmentReviewScore: s.assignmentReviewScore ?? 0,
      assignmentReviewCount: s.assignmentReviewCount ?? 0,
      submissionCoverage: s.submissionCoverage ?? 0,
      expectedAssignments: s.expectedAssignments ?? 0,
      mastery: s.mastery ?? null,
      risk: s.risk || null,
      lastActive: null
    })).filter(student => student.name && student.course);
    res.json(mappedStudents);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const adminCourseId = req.query.adminCourseId;
    const dbStudents = await studentsCollection.find({}).toArray();
    const storedReviews = await getStoredAssignmentReviews();
    let aggregated = await enrichStudentCourses(aggregateStudentCourses(dbStudents, storedReviews));
    let relevantReviews = storedReviews;

    if (adminCourseId && adminCourseId !== 'null' && adminCourseId !== 'undefined') {
      aggregated = aggregated.filter(s => s.course === adminCourseId);
      relevantReviews = relevantReviews.filter(review => review.courseId === adminCourseId);
    }

    // Calculate average mastery based on the 'progress' field in aggregated data
    const totalProgress = aggregated.reduce((acc, s) => acc + (s.progress || 0), 0);
    const avgMastery = aggregated.length > 0 ? (totalProgress / aggregated.length).toFixed(1) : 0;

    // Use unique student IDs for active students count
    const activeStudents = new Set(aggregated.map(s => s.studentId)).size;
    const reviewDrivenGaps = buildReviewDrivenKnowledgeGapMap(relevantReviews);
    const gaps = reviewDrivenGaps.length > 0 ? reviewDrivenGaps : buildKnowledgeGapMap(aggregated);

    const atRiskStudents = aggregated
      .filter(student => student.risk?.level !== 'Low')
      .sort((a, b) => (b.risk?.score || 0) - (a.risk?.score || 0))
      .slice(0, 6)
      .map(student => ({
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        riskLevel: student.risk.level,
        riskScore: student.risk.score,
        reasons: student.risk.reasons,
        progress: student.progress,
        averageScore: student.averageScore
      }));

    const dynamicAnalytics = {
      activeStudents,
      activeStudentsDelta: '↑ 12% this week',
      avgMastery: parseFloat(avgMastery),
      avgMasteryDelta: '↑ 3.2% vs last week',
      aiInteractions: 3891,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weeklyEngagement: [72, 85, 91, 88, 96, 54, 43],
      gaps,
      atRiskStudents
    };

    res.json(dynamicAnalytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message, courseId } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const allTextChunks = await getAllCourseTextChunks();
    const topContext = getTopContextFromChunks(allTextChunks, message, 4);

    // Synthesize response with Groq LLM
    const prompt = `You are an AI Instructor Assistant for the trackED platform.
You help students understand concepts, provide feedback, and act as a teacher.
You have access to some retrieved course material context below. Use this context if it is relevant to the student's message.
If the context does not contain the answer, or if the student asks a general question, use your own broad knowledge to help them.
Always be encouraging, professional, and format the output with markdown.
The user selected course is: ${courseId || 'Unknown Course'}.

COURSE MATERIAL CONTEXT:
${topContext || "No relevant course material found."}

STUDENT MESSAGE:
${message}
`;

    const reply = await generateGroqReply(prompt);

    res.json({ reply, timestamp: new Date().toISOString() });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat service failed" });
  }
});

app.post('/api/chat/evaluate-assignment', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const { notes, courseId, studentId, studentName } = req.body;

  if (!uploadedFile) {
    return res.status(400).json({ error: 'Assignment file is required' });
  }

  try {
    const assignmentText = readUploadedAssignmentText(uploadedFile);
    if (!assignmentText.trim()) {
      return res.status(400).json({
        error: 'This version supports text-based files such as .txt, .md, .js, .py, .java, .json, and similar code/text formats.'
      });
    }

    const trimmedAssignment = assignmentText.slice(0, 12000);
    const retrievalQuery = `${courseId || ''} ${notes || ''} ${trimmedAssignment.slice(0, 2000)}`.trim();
    const allTextChunks = await getAllCourseTextChunks();
    const topContext = getTopContextFromChunks(allTextChunks, retrievalQuery, 6);

    const prompt = `You are an AI instructor grading assistant for the trackED platform.
Evaluate the student's uploaded assignment solution against the course material context.
Judge the work using this rubric:
- Concept Accuracy: 40 points
- Course Alignment: 25 points
- Clarity and Explanation: 20 points
- Completeness: 15 points

Selected course: ${courseId || 'Unknown Course'}
Student: ${studentName || 'Unknown Student'} (${studentId || 'No ID'})
Additional student notes: ${notes || 'None provided'}
Uploaded file name: ${uploadedFile.originalname}

COURSE MATERIAL CONTEXT:
${topContext || 'No directly relevant course material was found.'}

STUDENT ASSIGNMENT SOLUTION:
${trimmedAssignment}

Return valid JSON only with this exact shape:
{
  "predictedPercentage": 0,
  "letterGrade": "A",
  "overallJudgment": "string",
  "rubric": [
    { "category": "Concept Accuracy", "score": 0, "maxScore": 40, "feedback": "string" },
    { "category": "Course Alignment", "score": 0, "maxScore": 25, "feedback": "string" },
    { "category": "Clarity and Explanation", "score": 0, "maxScore": 20, "feedback": "string" },
    { "category": "Completeness", "score": 0, "maxScore": 15, "feedback": "string" }
  ],
  "strengths": ["string"],
  "gaps": ["string"],
  "improvements": ["string"],
  "topicTags": ["string"],
  "confidence": "High/Medium/Low with brief explanation"
}

Important constraints:
- Base the evaluation primarily on the provided course material context.
- If the assignment appears partially correct, say so clearly.
- Do not claim certainty about a final institutional grade.
- The predictive grade should reflect conceptual accuracy, coverage, clarity, and alignment with the course material.`;

    const rawEvaluation = await generateGroqReply(prompt);
    const parsedEvaluation = JSON.parse(extractJson(rawEvaluation));
    const review = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      studentId: studentId || null,
      studentName: studentName || null,
      courseId: courseId || null,
      fileName: uploadedFile.originalname,
      createdAt: new Date().toISOString(),
      predictedPercentage: parsedEvaluation.predictedPercentage,
      letterGrade: parsedEvaluation.letterGrade,
      overallJudgment: parsedEvaluation.overallJudgment,
      rubric: parsedEvaluation.rubric || [],
      strengths: parsedEvaluation.strengths || [],
      gaps: parsedEvaluation.gaps || [],
      improvements: parsedEvaluation.improvements || [],
      topicTags: [...new Set((parsedEvaluation.topicTags || []).map(tag => canonicalizeTopicLabel(tag)).filter(Boolean))],
      confidence: parsedEvaluation.confidence || 'Medium'
    };

    if (assignmentReviewsCollection) {
      await assignmentReviewsCollection.insertOne(review);
    }

    res.json({
      reply: formatAssignmentReview(review),
      review,
      fileName: uploadedFile.originalname,
      courseId: courseId || null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Assignment evaluation error:", err);
    res.status(500).json({ error: 'Assignment evaluation failed' });
  } finally {
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
  }
});

app.get('/api/assignments/history', async (req, res) => {
  const { studentId, courseId } = req.query;

  const filter = {};
  if (studentId) filter.studentId = studentId;
  if (courseId) filter.courseId = courseId;
  const history = await getStoredAssignmentReviews(filter);

  res.json(history);
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ trackED API → http://localhost:${PORT}`);
});
