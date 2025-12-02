import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Trophy, Mail, User, Building, Phone, AlertTriangle } from 'lucide-react';

// ============================================
// CONFIGURATION - CHANGE THESE SETTINGS
// ============================================
const CONFIG = {
  // Quiz Start Time (24-hour format: HH:MM)
  QUIZ_START_TIME: '10:36', // Example: 2:00 PM
  QUIZ_START_DATE: '2025-11-29', // Format: YYYY-MM-DD
  // Quiz End Time - after this datetime site will stop accepting responses
  QUIZ_END_TIME: '11:40', // 24-hour format HH:MM
  QUIZ_END_DATE: '2025-12-09', // Format: YYYY-MM-DD
  
  // Google Sheets Integration (Google Apps Script URL)
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbzX6n4pnfJ9mZQ5w8gD7rSD2fHwTeKVU07teOuXL3hBEBLz25cmIoVBHI9-KZs35EjV/exec',
  
  // Web3forms Integration (keep your access key)
 // WEB3FORMS_ACCESS_KEY: 'c3ccd999-fdc3-49b1-a3b9-87e95da597fa',
  
  // Quiz Settings
  TIME_PER_QUESTION: 15 // seconds
};

// Quiz Questions
const QUIZ_QUESTIONS = [
  { id: 1, question: "Fake news damages democracy. What Gen-AI solution fits best?", type: "multiple", options: ["Real-time misinformation detection model", "Meme generators", "Offline rumor chain", "SMS propaganda"], correct: 0 },
  { id: 2, question: "Corruption in municipal approvals reduces when:", type: "multiple", options: ["AI evaluates files with digital tracking trails", "Offices stay closed", "All approvals verbal", "No application required"], correct: 0 },
  { id: 3, question: "Civics fails when court judgments are too complex. Gen-AI helps by:", type: "multiple", options: ["Auto-creating readable summaries for citizens", "Banning public access", "Encrypting legal files", "Hiding case history"], correct: 0 },
  { id: 4, question: "Duplicate voter identity is a major civic flaw. Gen-AI helps by:", type: "multiple", options: ["Automated document verification", "Increasing voting age", "Removing ID cards", "Offline booth lists"], correct: 0 },
  { id: 5, question: "Bribery in tender selection is a chronic governance failure. AI fixes by:", type: "multiple", options: ["Scored, automated tender evaluation", "Handwritten bidding", "Verbal assessments only", "Removing digital records"], correct: 0 },
  { id: 6, question: "When RTI requests pile up, the civic system fails. Best AI fix:", type: "multiple", options: ["Auto-sorting + auto-summary of RTI queries", "Eliminate RTI", "File locking", "Delay replies"], correct: 0 },
  // { id: 7, question: "Judicial overload slows justice. Gen-AI reduces delay by:", type: "multiple", options: ["Case-priority recommendation engines", "Closing courts early", "Deleting old files", "Random scheduling"], correct: 0 },
  // { id: 8, question: "Lack of public awareness about laws is civic failure. AI solves via:", type: "multiple", options: ["Multi-language policy explanation generation", "English-only publishing", "Sealed bills", "Legal secrecy"], correct: 0 },
  // { id: 9, question: "Gen-AI can prevent subsidy fraud by:", type: "multiple", options: ["Biometric identity matching + anomaly detection", "Verbal approval only", "Paper-based tracking", "Manual signature matching"], correct: 0 },
  // { id: 10, question: "Corruption grows when govt data is unstructured. Gen-AI solves by:", type: "multiple", options: ["Converting raw data to readable structured insights", "Deleting datasets", "Offline filing", "Password-locked PDFs only"], correct: 0 },
  // { id: 11, question: "Poor grievance response is governance failure. AI improves by:", type: "multiple", options: ["Citizen-assist chatbots + query tracking", "Closing helplines", "Delayed email replies", "Manual tokens"], correct: 0 },
  // { id: 12, question: "Transparent public spending improves when AI:", type: "multiple", options: ["Generates anomaly-flagged financial reports", "Hides transaction logs", "Removes audit trails", "Allows no digital trace"], correct: 0 },
  // { id: 13, question: "Election misinformation is civic breakdown. The Gen-AI counter-tools?", type: "multiple", options: ["AI fact-checking + deepfake detection", "Baseless viral ads", "Anonymous influence chains", "One-sided propaganda"], correct: 0 },
  // { id: 14, question: "Failure in policy understanding can be fixed using AI-based:", type: "multiple", options: ["Simplified bill explanation models", "Technical documents only", "Handwritten notes", "No publication"], correct: 0 },
  // { id: 15, question: "Poor police case processing is civic inefficiency. AI reduces it by:", type: "multiple", options: ["FIR auto-drafting + crime-pattern prediction", "Verbal reporting only", "Manual notebooks", "No digital log"], correct: 0 },
  // { id: 16, question: "Election fraud control improves through:", type: "multiple", options: ["AI ballot-image verification", "Offline counting only", "SMS-voting without tracking", "No audit system"], correct: 0 },
  // { id: 17, question: "Digital tender transparency increases when AI:", type: "multiple", options: ["Generates corruption-risk scorecards", "Marks tenders confidential", "Removes public dashboards", "Deletes logs"], correct: 0 },
  // { id: 18, question: "Slow disaster response is government failure. AI solution?", type: "multiple", options: ["Real-time crisis modelling + predictive alerts", "Post-event paperwork", "Manual coordination", "Random announcements"], correct: 0 },
  // { id: 19, question: "Public schemes fail due to poor data hygiene. AI fixes through:", type: "multiple", options: ["Automated dataset cleaning + structured DB generation", "Paper-only storage", "Verbal record keeping", "Zero tracking"], correct: 0 },
  // { id: 20, question: "Policy feedback often ignored — civic failure. Gen-AI helps by:", type: "multiple", options: ["Feedback clustering & issue-priority mapping", "Deleting citizen feedback", "Manual SMS counting", "Random complaint selection"], correct: 0 },
  // { id: 21, question: "Legal verdicts are inaccessible to common citizens. AI fixes by:", type: "multiple", options: ["One-page simplified verdict summaries", "Technical-only format", "Private access", "Locked archives"], correct: 0 },
  // { id: 22, question: "Voting campaigns are manipulated digitally — civic failure. AI cure:", type: "multiple", options: ["Automated transparency reports on ad-spend", "Black-box influence engines", "Hidden campaign targeting", "Paid bias bots"], correct: 0 },
  // { id: 23, question: "A core governance flaw is manual attendance faking. AI solution:", type: "multiple", options: ["AI biometric attendance & ghost-employee detection", "Manual signing sheets", "Verbal presence", "Proxy marking"], correct: 0 },
  // { id: 24, question: "Judicial time waste reduces most through:", type: "multiple", options: ["AI summarization of case files + auto-drafting", "More handwritten files", "Closed digital access", "Verbal dictation"], correct: 0 },
  // { id: 25, question: "Legislative opacity weakens democracy. AI fixes through:", type: "multiple", options: ["AI-generated public dashboards showing policy impact", "Hidden bills", "Closed-door drafting", "No documentation"], correct: 0 },
  // { id: 26, question: "Major civic flaw in subsidy distribution is leakage. Gen-AI reduces by:", type: "multiple", options: ["Beneficiary verification + anomaly alerts", "Verbal approvals", "Manual ration slips", "Trust-based distribution"], correct: 0 },
  // { id: 27, question: "A governance flaw is low citizen participation. Gen-AI solution?", type: "multiple", options: ["Interactive policy-simulation tools for public input", "Public polling ban", "Offline suggestion boxes", "No awareness drives"], correct: 0 },
  // { id: 28, question: "When spending reports are hidden, corruption grows. AI fixes with:", type: "multiple", options: ["Auto-generated public audit dashboards", "Sealed ledgers", "Limited access", "No tracking reports"], correct: 0 },
  // { id: 29, question: "Fraud in welfare schemes thrives due to identity loopholes. Gen-AI combats via:", type: "multiple", options: ["Real-time beneficiary identity validation", "Paper records", "Verbal checks", "One-ID fits all"], correct: 0 },
  // { id: 30, question: "The most complete AI transformation for failed civics governance is:", type: "multiple", options: ["AI-based policy simulation + automated tax processing", "No digital systems", "Human-only decisions", "Untracked tenders"], correct: 0 }
];

const RULES = [
  "Quiz will start automatically at the scheduled time",
  "Each question has a 15-second timer",
  "Questions will automatically advance when time expires",
  "You cannot go back to previous questions",
  "Each correct answer earns 1 point",
  "Total of 30 questions",
  "⚠ DO NOT switch tabs or minimize window - Quiz will be terminated",
  "Do not refresh the page during the quiz",
  "Results will be announced later"
];

export default function BrainBoltQuiz() {
  const [stage, setStage] = useState('welcome');
  const [participant, setParticipant] = useState({
    name: '',
    college: '',
    email: '',
    phone: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(CONFIG.TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [quizTerminated, setQuizTerminated] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [canStartQuiz, setCanStartQuiz] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [registeredEmails, setRegisteredEmails] = useState(new Set());
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(null);
  
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  const visibilityRef = useRef(true);
  const submissionLock = useRef(false);

  // Load registered and completed emails from localStorage on mount
  useEffect(() => {
    try {
      const savedRegistered = localStorage.getItem('registeredEmails');
      if (savedRegistered) {
        const arr = JSON.parse(savedRegistered);
        setRegisteredEmails(new Set(arr.map(e => e.toLowerCase())));
      }

      const savedCompleted = localStorage.getItem('completedEmails');
      if (savedCompleted) {
        const arr = JSON.parse(savedCompleted);
        // If current email is in completed list, show already completed message
        const emails = arr.map(e => e.toLowerCase());
      }
    } catch (e) {
      console.warn('Failed to load emails from localStorage', e);
    }
  }, []);

  // Save registered email
  const saveRegisteredEmail = (email) => {
    if (!email) return;
    try {
      const emailLower = email.toLowerCase();
      const current = JSON.parse(localStorage.getItem('registeredEmails') || '[]');
      if (!current.includes(emailLower)) {
        current.push(emailLower);
        localStorage.setItem('registeredEmails', JSON.stringify(current));
      }
      setRegisteredEmails(prev => new Set(prev).add(emailLower));
    } catch (e) {
      console.warn('Could not save registeredEmails to localStorage', e);
    }
  };

  // Save completed email (after successful submission)
  const saveCompletedEmail = (email) => {
    if (!email) return;
    try {
      const emailLower = email.toLowerCase();
      const current = JSON.parse(localStorage.getItem('completedEmails') || '[]');
      if (!current.includes(emailLower)) {
        current.push(emailLower);
        localStorage.setItem('completedEmails', JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Could not save completedEmails to localStorage', e);
    }
  };

  // Check if email already completed quiz
  const isEmailCompleted = (email) => {
    if (!email) return false;
    try {
      const completed = JSON.parse(localStorage.getItem('completedEmails') || '[]');
      return completed.map(e => e.toLowerCase()).includes(email.toLowerCase());
    } catch (e) {
      return false;
    }
  };

  // Check start and end times for the quiz
  useEffect(() => {
    const checkQuizTimes = () => {
      const now = new Date();

      // build start datetime
      const [sh, sm] = CONFIG.QUIZ_START_TIME.split(':');
      const quizStart = new Date(CONFIG.QUIZ_START_DATE);
      quizStart.setHours(parseInt(sh, 10), parseInt(sm, 10), 0, 0);

      // build end datetime
      const [eh, em] = CONFIG.QUIZ_END_TIME.split(':');
      const quizEnd = new Date(CONFIG.QUIZ_END_DATE);
      quizEnd.setHours(parseInt(eh, 10), parseInt(em, 10), 0, 0);

      if (now >= quizEnd) {
        // Quiz period is over
        setQuizEnded(true);
        setCanStartQuiz(false);
        setTimeUntilStart('Quiz ended');
        // If someone is mid-quiz, auto-submit and move to results
        if (stage === 'quiz' && !quizTerminated) {
          setQuizTerminated(true);
          submitQuizResults(score, false);
          setStage('results');
        }
        return;
      }

      // Not yet ended
      setQuizEnded(false);

      if (now >= quizStart) {
        setCanStartQuiz(true);
        setTimeUntilStart('');
      } else {
        setCanStartQuiz(false);
        const diff = quizStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        timeString += `${hrs}h ${mins}m ${secs}s`;
        setTimeUntilStart(timeString);
      }
    };

    checkQuizTimes();
    const interval = setInterval(checkQuizTimes, 1000);
    return () => clearInterval(interval);
  }, [stage, score, quizTerminated]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stage === 'quiz' && !quizTerminated) {
        setQuizTerminated(true);
        submitQuizResults(score, true);
      }
    };

    const handleBlur = () => {
      if (stage === 'quiz' && !quizTerminated) {
        visibilityRef.current = false;
        setTimeout(() => {
          if (!visibilityRef.current) {
            setQuizTerminated(true);
            submitQuizResults(score, true);
          }
        }, 100);
      }
    };

    const handleFocus = () => {
      visibilityRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [stage, score, quizTerminated]);

  // Timer logic
  useEffect(() => {
    if (stage === 'quiz' && timeLeft > 0 && !showFeedback && !quizTerminated) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && stage === 'quiz' && !showFeedback && !quizTerminated) {
      handleAnswer(null);
    }
  }, [timeLeft, stage, showFeedback, quizTerminated]);

  // Set quiz start time when entering quiz stage (MOVED HERE)
  useEffect(() => {
    if (stage === 'quiz' && !quizStartTime) {
      setQuizStartTime(new Date());
      console.log('Quiz started at:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }
  }, [stage, quizStartTime]);

  // Helper: shuffle an array (Fisher-Yates)
  const shuffleArray = (array) => {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const buildShuffledQuestions = () => {
    return QUIZ_QUESTIONS.map((q) => {
      if (q.type !== 'multiple' || !q.options) return q;
      const origOptions = q.options.slice();
      const shuffledOpts = shuffleArray(origOptions);

      // Determine the correct option value robustly.
      let correctValue = null;
      if (typeof q.correct === 'number' && origOptions[q.correct] !== undefined) {
        correctValue = origOptions[q.correct];
      } else if (typeof q.correct === 'string') {
        correctValue = q.correct;
      } else if (typeof q.answer === 'string') {
        correctValue = q.answer;
      }

      // Fallback: if we couldn't determine a correctValue, try to look for any option marked
      // with special markers (not common) or default to the original first option.
      if (correctValue == null) {
        correctValue = origOptions[0];
      }

      // Find the new index of the correct option in the shuffled array.
      let newCorrectIndex = shuffledOpts.findIndex(o => o === correctValue);

      // Try a trimmed-string match as a robust fallback.
      if (newCorrectIndex === -1 && typeof correctValue === 'string') {
        const trimmed = correctValue.trim();
        newCorrectIndex = shuffledOpts.findIndex(o => typeof o === 'string' && o.trim() === trimmed);
      }

      // Final fallback: if still not found, set to 0 so there's always a valid index.
      if (newCorrectIndex === -1) newCorrectIndex = 0;

      return { ...q, options: shuffledOpts, correct: newCorrectIndex };
    });
  };

  // Reset quiz UI/state so the app can return to welcome screen
  const resetQuizState = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(CONFIG.TIME_PER_QUESTION);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShuffledQuestions(null);
    setQuizTerminated(false);
    // do not clear registered/completed lists
    setQuizStartTime(null);
    setEmailSent(false);
  };

  // Auto-close (or fallback to welcome) 15s after results are shown
  useEffect(() => {
    if (stage === 'results') {
      const t = setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // ignored
        }
        // Fallback: reset UI and return to welcome screen
        resetQuizState();
        setStage('welcome');
      }, 7000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Auto-close terminated quiz screen after 7s (attempt close, fallback to welcome)
  useEffect(() => {
    if (quizTerminated && stage === 'quiz') {
      const t2 = setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // ignored
        }
        resetQuizState();
        setStage('welcome');
      }, 7000);
      return () => clearTimeout(t2);
    }
  }, [quizTerminated, stage]);

  const handleRegistration = () => {
    // Validate all fields are filled
    if (!participant.name || !participant.college || !participant.email || !participant.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate name (not empty and contains only letters and spaces)
    if (!/^[a-zA-Z\s]+$/.test(participant.name.trim())) {
      alert('Name should contain only letters and spaces');
      return;
    }

    // Validate college name (not empty)
    if (participant.college.trim().length < 2) {
      alert('Please enter a valid college name');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participant.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone number (only digits, 10 digits)
    if (!/^\d{10}$/.test(participant.phone.replace(/\D/g, ''))) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    if (quizEnded) {
      alert('The quiz has already ended and registration is closed.');
      return;
    }

    const emailLower = participant.email.toLowerCase();

    // Check if email already completed the quiz
    if (isEmailCompleted(emailLower)) {
      alert('This email has already completed the quiz. You cannot take it again.');
      setAlreadyCompleted(true);
      return;
    }

    // Check if email is already registered
    if (registeredEmails.has(emailLower)) {
      alert('This email has already been registered. You cannot register twice.');
      return;
    }

    // Mark this email as registered and proceed
    saveRegisteredEmail(emailLower);
    setStage('rules');
  };

  const handleAnswer = (answer) => {
    if (showFeedback || quizTerminated || quizEnded) return;

    const questions = shuffledQuestions || QUIZ_QUESTIONS;
    const question = questions[currentQuestion];
    const isCorrect = question.type === 'boolean'
      ? answer === question.correct
      : answer === question.correct;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers({
      ...answers,
      [currentQuestion]: { answer, correct: isCorrect }
    });

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(CONFIG.TIME_PER_QUESTION);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        submitQuizResults(finalScore, false);
        setStage('results');
      }
    }, 1500);
  };

  const submitQuizResults = async (finalScore, terminated = false) => {
    // Prevent duplicate submissions
    if (submissionLock.current) {
      console.warn('Submission already in progress. Skipping duplicate submission.');
      return;
    }

    submissionLock.current = true;

    const totalQuestions = (shuffledQuestions || QUIZ_QUESTIONS).length;
    const percentage = ((finalScore / totalQuestions) * 100).toFixed(2);
    const quizEndTime = new Date();
    const endTimestamp = quizEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    // Calculate duration in seconds
    let durationSeconds = 0;
    let startTimestamp = 'N/A';

    if (quizStartTime) {
      durationSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
      startTimestamp = quizStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
    
    const resultData = {
      name: participant.name,
      college: participant.college,
      email: participant.email,
      phone: participant.phone,
      score: finalScore,
      total: totalQuestions,
      percentage: percentage,
      status: terminated ? 'TERMINATED' : 'COMPLETED',
      startTime: startTimestamp,
      endTime: endTimestamp,
      durationSeconds: durationSeconds
    };

    console.log('Submitting results:', resultData);

    // Send to Google Sheets
    try {
      const payload = JSON.stringify({
        action: 'addResult',
        data: resultData
      });

      console.log('Payload being sent to Google Sheets:', payload);

      // keep this if your Apps Script requires no-cors (it will be opaque)
      await fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });
      
      console.log('✅ Data sent to Google Sheets');

      // --- NEW: Send email via Web3Forms ---
      // Web3Forms requires a POST to https://api.web3forms.com/submit with access_key
      try {
        const web3Payload = {
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: `Quiz submission — ${participant.name}`,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          // Put useful details in the message
          message: `Name: ${participant.name}
College: ${participant.college}
Email: ${participant.email}
Phone: ${participant.phone}
Score: ${finalScore}/${totalQuestions}
Percentage: ${percentage}%
Status: ${resultData.status}
Start: ${resultData.startTime}
End: ${resultData.endTime}
Duration (s): ${resultData.durationSeconds}`
        };

        const web3Resp = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // IMPORTANT: do NOT use mode: 'no-cors' here — you want real response/errors
          body: JSON.stringify(web3Payload)
        });

        const web3Json = await web3Resp.json();
        console.log('Web3Forms response:', web3Json);
      } catch (web3Err) {
        console.warn('Web3Forms error:', web3Err);
      }

      // Mark email as completed only after attempts complete
      saveCompletedEmail(participant.email);
      setEmailSent(true);
    } catch (error) {
      console.error('❌ Google Sheets error:', error);
    } finally {
      submissionLock.current = false;
    }
  };

  // Already Completed Screen
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-yellow-600 mb-4">Already Participated!</h2>
          <p className="text-xl text-gray-700 mb-6">
            This email address has already completed the quiz.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
            <p className="text-lg text-yellow-800 font-semibold">
              You can only participate once in this quiz.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              If you believe this is an error, please contact the organizers.
            </p>
          </div>
          
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">KBP College, Thane presents</h1>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-blue-600 mb-4">Technoholic 2025</h2>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl mb-6">
            <h3 className="text-xl sm:text-3xl font-bold">"Brain Bolt" Quiz Competition</h3>
          </div>
          <p className="text-xl text-gray-600 mb-8">Digital Civics Challenge</p>
          
          {!canStartQuiz && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-yellow-800 mb-2">Quiz starts in:</p>
              <p className="text-3xl font-bold text-yellow-900">{timeUntilStart}</p>
              <p className="text-sm text-yellow-700 mt-2">Scheduled: {CONFIG.QUIZ_START_DATE} at {CONFIG.QUIZ_START_TIME}</p>
              <p className="text-sm text-yellow-700 mt-1">Ends: {CONFIG.QUIZ_END_DATE} at {CONFIG.QUIZ_END_TIME}</p>
            </div>
          )}
          
          <button
            onClick={() => { if (!quizEnded) setStage('registration'); }}
            disabled={quizEnded}
            className={`${quizEnded ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105`}
          >
            {quizEnded ? 'Quiz Ended' : (canStartQuiz ? 'Start Registration' : 'Register Now (Quiz starts later)')}
          </button>
        </div>
      </div>
    );
  }

  // Registration Screen
  if (stage === 'registration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Participant Registration</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-2">
                <User className="w-5 h-5 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setParticipant({...participant, name: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-2">
                <Building className="w-5 h-5 mr-2" />
                College Name *
              </label>
              <input
                type="text"
                value={participant.college}
                onChange={(e) => setParticipant({...participant, college: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your college name"
              />
            </div>
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-2">
                <Mail className="w-5 h-5 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={participant.email}
                onChange={(e) => setParticipant({...participant, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-2">
                <Phone className="w-5 h-5 mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={participant.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setParticipant({...participant, phone: value});
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>
            <button
              onClick={handleRegistration}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
            >
              Continue to Rules
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rules Screen with Timer
  if (stage === 'rules') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Quiz Rules</h2>
          
          {!canStartQuiz && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
              <Clock className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-yellow-800">Quiz will start automatically in:</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">{timeUntilStart}</p>
              <p className="text-sm text-yellow-700 mt-2">Scheduled: {CONFIG.QUIZ_START_DATE} at {CONFIG.QUIZ_START_TIME}</p>
              <p className="text-sm text-yellow-700 mt-1">Ends: {CONFIG.QUIZ_END_DATE} at {CONFIG.QUIZ_END_TIME}</p>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <ul className="space-y-3">
              {RULES.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠ WARNING: Switching tabs will automatically terminate your quiz!</p>
          </div>
          
          <button
            onClick={() => {
              if (canStartQuiz && !quizEnded) {
                setShuffledQuestions(buildShuffledQuestions());
                setStage('quiz');
              }
            }}
            disabled={!canStartQuiz || quizEnded}
            className={`w-full font-bold py-4 rounded-lg text-xl transition transform ${
              (canStartQuiz && !quizEnded)
                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {quizEnded ? 'Quiz Ended' : (canStartQuiz ? 'I Understand - Start Quiz' : 'Waiting for Quiz Time...')}
          </button>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (stage === 'quiz') {
    if (quizTerminated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
            <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-red-600 mb-4">Quiz Terminated!</h2>
            <p className="text-xl text-gray-700 mb-6">
              You switched tabs or minimized the window. Your quiz has been automatically submitted.
            </p>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <p className="text-lg text-red-800 font-semibold">
                Your progress has been recorded and submitted to the organizers.
              </p>
              <p className="text-sm text-red-600 mt-2">
                Results will be announced later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const questions = shuffledQuestions || QUIZ_QUESTIONS;
    const question = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span className="font-semibold">⚠ Don't switch tabs!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}
              />
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <Clock className={`w-8 h-8 mr-2 ${timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'}`} />
            <span className={`text-4xl font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-gray-800'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              <span className="inline-block mr-3 text-2xl font-extrabold">{currentQuestion + 1}.</span>
              {question.question}
            </h3>
          </div>

          <div className="space-y-3">
            {question.type === 'multiple' ? (
              question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition transform hover:scale-102 ${
                    showFeedback
                      ? selectedAnswer === index
                        ? index === question.correct
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-100 border-gray-400'
                        : 'bg-gray-50 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + index)}. {option}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={showFeedback}
                  className={`p-6 rounded-lg border-2 font-bold text-xl transition transform hover:scale-105 ${
                    showFeedback
                      ? selectedAnswer === true
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  TRUE
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={showFeedback}
                  className={`p-6 rounded-lg border-2 font-bold text-xl transition transform hover:scale-105 ${
                    showFeedback
                      ? selectedAnswer === false
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  FALSE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results Screen (No Score Shown)
  if (stage === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            TECHNOHOLIC
          </div>

          <Trophy className="w-24 h-24 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Response Submitted!</h2>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-8 px-6 rounded-xl mb-6">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-semibold">Thank you for participating!</p>
            <p className="text-sm mt-4">Your responses have been submitted successfully.</p>
            <p className="text-sm">Results will be announced shortly on the official platform.</p>
          </div>
          
          {/* Email confirmation message removed per request */}
        </div>
      </div>
);
}
}