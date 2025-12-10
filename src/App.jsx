import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Trophy, Mail, User, Building, Phone, AlertTriangle } from 'lucide-react';

// ============================================
// CONFIGURATION - CHANGE THESE SETTINGS
// ============================================
const CONFIG = {
  // Quiz Start Time (24-hour format: HH:MM)
  QUIZ_START_TIME: '20:48', // Example: 2:00 PM
  QUIZ_START_DATE: '2025-12-10', // Format: YYYY-MM-DD

  // Quiz End Time - after this datetime site will stop accepting responses
  QUIZ_END_TIME: '13:00', // 24-hour format HH:MM
  QUIZ_END_DATE: '2025-12-11', // Format: YYYY-MM-DD
  
  // 1) Google Apps Script URL for SAVING RESULTS
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbzX6n4pnfJ9mZQ5w8gD7rSD2fHwTeKVU07teOuXL3hBEBLz25cmIoVBHI9-KZs35EjV/exec',

  // 2) Google Apps Script URL for VALIDATING PARTICIPANTS
  PARTICIPANT_VERIFY_URL: 'https://script.google.com/macros/s/AKfycbxYDyd3OnhejocsUMQUHrUuG2_Ps0OI2wuhiF-_ynKWiRwIrJQe0f358SkufdZcZe9zbA/exec',
  
  // Web3forms Integration (keep your access key)
  // WEB3FORMS_ACCESS_KEY: 'c3ccd999-fdc3-49b1-a3b9-87e95da597fa',
  
  // Quiz Settings
  TIME_PER_QUESTION: 15 // seconds
};

// Quiz Questions
const QUIZ_QUESTIONS = [
  { id: 1, question: "Which scenario BEST illustrates a structural digital civics failure involving generative AI?", type: "multiple", options: ["A student using AI to summarize a textbook", "A government deploying an AI system without public consultation", "A chatbot giving incorrect movie recommendations", "A user forgetting to log out of an account"], correct: 1 },
  { id: 2, question: "A major challenge with regulating large language models is that:", type: "multiple", options: ["They are too small to audit", "They can behave unpredictably due to emergent properties", "They do not require data to learn", "Their outputs are always deterministic"], correct: 1 },
  { id: 3, question: "Which of the following BEST reflects the \"black box\" problem in AI governance?", type: "multiple", options: ["Users can modify source code freely", "Model decisions are difficult to interpret or trace", "The model uses open-source training data", "The system publishes full transparency reports"], correct: 1 },
  { id: 4, question: "When an AI model amplifies toxic content because it optimizes engagement metrics, this represents a failure in:", type: "multiple", options: ["Hardware constraints", "Algorithmic alignment", "Data labeling", "Model compression"], correct: 1 },
  { id: 5, question: "A deepfake that influences public opinion ahead of an election primarily threatens which democratic pillar?", type: "multiple", options: ["Participatory budgeting", "Informed citizen decision-making", "Infrastructure resilience", "Judicial review"], correct: 1 },
  { id: 6, question: "Which of the following is a latent risk of generative AI in civic spaces?", type: "multiple", options: ["Increased productivity", "Formation of AI-generated echo chambers", "Faster writing", "Larger datasets"], correct: 1 },
  { id: 7, question: "What is the core difficulty of enforcing accountability in AI systems deployed across multiple jurisdictions?", type: "multiple", options: ["Shared computational resources", "Divergent legal frameworks and regulatory standards", "Lack of technical support", "Uniformity of global ethics"], correct: 1 },
  { id: 8, question: "A civic failure occurs when an AI-powered welfare system wrongfully denies benefits due to biased training data. This best demonstrates:", type: "multiple", options: ["Bias transfer from data to decision", "Hyperparameter tuning error", "Model recalibration", "Edge-case overfitting"], correct: 0 },
  { id: 9, question: "Which concept focuses on ensuring AI outputs respect human agency and autonomy?", type: "multiple", options: ["Synthetic data generation", "Algorithmic self-governance", "Human-centered design", "Model distillation"], correct: 2 },
  { id: 10, question: "When AI-generated misinformation spreads faster than civic institutions can respond, this results in:", type: "multiple", options: ["Information asymmetry", "Data equilibrium", "Semantic coherence", "Content sparsity"], correct: 0 },
  { id: 11, question: "What makes generative AI especially dangerous in political microtargeting?", type: "multiple", options: ["It can operate without electricity", "It personalizes persuasive content at scale", "It eliminates all user data", "It cannot analyze browsing patterns"], correct: 1 },
  { id: 12, question: "A model that unintentionally reveals training data during outputs violates which core principle?", type: "multiple", options: ["Data minimization", "Explainability", "Federated learning", "Multi-modal processing"], correct: 0 },
  { id: 13, question: "Value alignmentfailures occur when:", type: "multiple", options: ["AI produces outputs inconsistent with human ethical norms", "Model accuracy increases over time", "Data is properly anonymized", "The system includes diverse training sets"], correct: 0 },
  { id: 14, question: "Which mechanism MOST effectively reduces risk from AI-generated civic misinformation?", type: "multiple", options: ["Closed-source development", "Slow inference times", "Traceable provenance and watermarking", "Removing content moderation"], correct: 2 },
  { id: 15, question: "A government relying solely on proprietary AI tools for decision-making risks:", type: "multiple", options: ["Increased transparency", "Vendor lock-in and opaque governance", "Improved public trust", "Enhanced civic participation"], correct: 1 },
  { id: 16, question: "Election fraud control improves through:", type: "multiple", options: ["AI ballot-image verification", "Offline counting only", "SMS-voting without tracking", "No audit system"], correct: 0 },
  { id: 17, question: "Digital tender transparency increases when AI:", type: "multiple", options: ["Generates corruption-risk scorecards", "Marks tenders confidential", "Removes public dashboards", "Deletes logs"], correct: 0 },
  { id: 18, question: "Slow disaster response is government failure. AI solution?", type: "multiple", options: ["Real-time crisis modelling + predictive alerts", "Post-event paperwork", "Manual coordination", "Random announcements"], correct: 0 },
  { id: 19, question: "Public schemes fail due to poor data hygiene. AI fixes through:", type: "multiple", options: ["Automated dataset cleaning + structured DB generation", "Paper-only storage", "Verbal record keeping", "Zero tracking"], correct: 0 },
  { id: 20, question: "Policy feedback often ignored — civic failure. Gen-AI helps by:", type: "multiple", options: ["Feedback clustering & issue-priority mapping", "Deleting citizen feedback", "Manual SMS counting", "Random complaint selection"], correct: 0 },
  { id: 21, question: "Legal verdicts are inaccessible to common citizens. AI fixes by:", type: "multiple", options: ["One-page simplified verdict summaries", "Technical-only format", "Private access", "Locked archives"], correct: 0 },
  { id: 22, question: "Voting campaigns are manipulated digitally — civic failure. AI cure:", type: "multiple", options: ["Automated transparency reports on ad-spend", "Black-box influence engines", "Hidden campaign targeting", "Paid bias bots"], correct: 0 },
  { id: 23, question: "A core governance flaw is manual attendance faking. AI solution:", type: "multiple", options: ["AI biometric attendance & ghost-employee detection", "Manual signing sheets", "Verbal presence", "Proxy marking"], correct: 0 },
  { id: 24, question: "Judicial time waste reduces most through:", type: "multiple", options: ["AI summarization of case files + auto-drafting", "More handwritten files", "Closed digital access", "Verbal dictation"], correct: 0 },
  { id: 25, question: "Legislative opacity weakens democracy. AI fixes through:", type: "multiple", options: ["AI-generated public dashboards showing policy impact", "Hidden bills", "Closed-door drafting", "No documentation"], correct: 0 },
  { id: 26, question: "Major civic flaw in subsidy distribution is leakage. Gen-AI reduces by:", type: "multiple", options: ["Beneficiary verification + anomaly alerts", "Verbal approvals", "Manual ration slips", "Trust-based distribution"], correct: 0 },
  { id: 27, question: "A governance flaw is low citizen participation. Gen-AI solution?", type: "multiple", options: ["Interactive policy-simulation tools for public input", "Public polling ban", "Offline suggestion boxes", "No awareness drives"], correct: 0 },
  { id: 28, question: "When spending reports are hidden, corruption grows. AI fixes with:", type: "multiple", options: ["Auto-generated public audit dashboards", "Sealed ledgers", "Limited access", "No tracking reports"], correct: 0 },
  { id: 29, question: "Fraud in welfare schemes thrives due to identity loopholes. Gen-AI combats via:", type: "multiple", options: ["Real-time beneficiary identity validation", "Paper records", "Verbal checks", "One-ID fits all"], correct: 0 },
  { id: 30, question: "The most complete AI transformation for failed civics governance is:", type: "multiple", options: ["AI-based policy simulation + automated tax processing", "No digital systems", "Human-only decisions", "Untracked tenders"], correct: 0 }
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
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // loader for "Verifying participant..."
  const [isValidatingParticipant, setIsValidatingParticipant] = useState(false);
  
  const visibilityRef = useRef(true);
  const submissionLock = useRef(false);

  // Load completed emails from localStorage on mount
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('completedEmails');
      if (savedCompleted) {
        // we don't strictly need to store them into state now
        JSON.parse(savedCompleted).map(e => e.toLowerCase());
      }
    } catch (e) {
      console.warn('Failed to load completedEmails from localStorage', e);
    }
  }, []);

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

      const [sh, sm] = CONFIG.QUIZ_START_TIME.split(':');
      const quizStart = new Date(CONFIG.QUIZ_START_DATE);
      quizStart.setHours(parseInt(sh, 10), parseInt(sm, 10), 0, 0);

      const [eh, em] = CONFIG.QUIZ_END_TIME.split(':');
      const quizEnd = new Date(CONFIG.QUIZ_END_DATE);
      quizEnd.setHours(parseInt(eh, 10), parseInt(em, 10), 0, 0);

      if (now >= quizEnd) {
        setQuizEnded(true);
        setCanStartQuiz(false);
        setTimeUntilStart('Quiz ended');
        if (stage === 'quiz' && !quizTerminated) {
          setQuizTerminated(true);
          submitQuizResults(score, false);
          setStage('results');
        }
        return;
      }

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

  // Set quiz start time when entering quiz stage
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

  // Build shuffled questions *and* shuffled options for each participant
  const buildShuffledQuestions = () => {
    const shuffledQuestionOrder = shuffleArray(QUIZ_QUESTIONS);

    return shuffledQuestionOrder.map((q) => {
      if (q.type !== 'multiple' || !q.options) return q;

      const origOptions = q.options.slice();
      const shuffledOpts = shuffleArray(origOptions);

      let correctValue = null;
      if (typeof q.correct === 'number' && origOptions[q.correct] !== undefined) {
        correctValue = origOptions[q.correct];
      } else if (typeof q.correct === 'string') {
        correctValue = q.correct;
      } else if (typeof q.answer === 'string') {
        correctValue = q.answer;
      }

      if (correctValue == null) {
        correctValue = origOptions[0];
      }

      let newCorrectIndex = shuffledOpts.findIndex(o => o === correctValue);

      if (newCorrectIndex === -1 && typeof correctValue === 'string') {
        const trimmed = correctValue.trim();
        newCorrectIndex = shuffledOpts.findIndex(o => typeof o === 'string' && o.trim() === trimmed);
      }

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
    setQuizStartTime(null);
    setEmailSent(false);
  };

  // Auto-close (or fallback to welcome) after results are shown
  useEffect(() => {
    if (stage === 'results') {
      const t = setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // ignored
        }
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

  // Auto-close "Already Participated" screen after 7s
  useEffect(() => {
    if (alreadyCompleted) {
      const t = setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          // ignored
        }
        resetQuizState();
        setAlreadyCompleted(false);
        setParticipant({ name: '', college: '', email: '', phone: '' });
        setStage('welcome');
      }, 7000);
      return () => clearTimeout(t);
    }
  }, [alreadyCompleted]);

  // validate participant using PARTICIPANT_VERIFY_URL
  const validateParticipantOnSheet = async (participantData) => {
    try {
      setIsValidatingParticipant(true);

      const params = new URLSearchParams({
        action: 'verify',
        name: participantData.name.trim(),
        email: participantData.email.trim(),
        phone: participantData.phone.trim()
      });

      const response = await fetch(`${CONFIG.PARTICIPANT_VERIFY_URL}?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        console.error('Verification request failed with status', response.status);
        return {
          verified: false,
          message: 'Unable to verify registration. Please contact the organizers.'
        };
      }

      const data = await response.json().catch(() => null);

      if (!data || data.status !== 'success') {
        return {
          verified: false,
          message: data?.message || 'Verification failed. Please contact the organizers.'
        };
      }

      if (!data.verified) {
        return {
          verified: false,
          message: data.message || 'You are not a registered participant.'
        };
      }

      return {
        verified: true,
        participant: data.participant,
        message: data.message || 'Verified successfully'
      };
    } catch (error) {
      console.error('Error validating participant:', error);
      return {
        verified: false,
        message: 'Network error while verifying. Please try again or contact the organizers.'
      };
    } finally {
      setIsValidatingParticipant(false);
    }
  };

  // Registration handler
  const handleRegistration = async () => {
    if (!participant.name || !participant.college || !participant.email || !participant.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(participant.name.trim())) {
      alert('Name should contain only letters and spaces');
      return;
    }

    if (participant.college.trim().length < 2) {
      alert('Please enter a valid college name');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participant.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    if (!/^\d{10}$/.test(participant.phone.replace(/\D/g, ''))) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    if (quizEnded) {
      alert('The quiz has already ended and registration is closed.');
      return;
    }

    // validate against BrainBoltParticipants sheet
    const verification = await validateParticipantOnSheet(participant);
    if (!verification.verified) {
      alert(verification.message || 'You are not a registered participant of BrainBolt.');
      return;
    }

    const emailLower = participant.email.toLowerCase();

    // now ONLY block if quiz is already completed
    if (isEmailCompleted(emailLower)) {
      alert('This email has already completed the quiz. You cannot take it again.');
      setAlreadyCompleted(true);
      return;
    }

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
    if (submissionLock.current) {
      console.warn('Submission already in progress. Skipping duplicate submission.');
      return;
    }

    submissionLock.current = true;

    const totalQuestions = (shuffledQuestions || QUIZ_QUESTIONS).length;
    const percentage = ((finalScore / totalQuestions) * 100).toFixed(2);
    const quizEndTime = new Date();
    const endTimestamp = quizEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
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

    try {
      const payload = JSON.stringify({
        action: 'addResult',
        data: resultData
      });

      await fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });
      
      console.log('✅ Data sent to Google Sheets');

      try {
        const web3Payload = {
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: `Quiz submission — ${participant.name}`,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
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
          body: JSON.stringify(web3Payload)
        });

        const web3Json = await web3Resp.json();
        console.log('Web3Forms response:', web3Json);
      } catch (web3Err) {
        console.warn('Web3Forms error:', web3Err);
      }

      saveCompletedEmail(participant.email);
      setEmailSent(true);
    } catch (error) {
      console.error('❌ Google Sheets error:', error);
    } finally {
      submissionLock.current = false;
    }
  };

  // Shared header (normal, not fixed)
  const Header = () => (
    <header className="w-full bg-white flex justify-center shadow-md">
      <img
        src="/HEADER.png"
        alt="Brain Bolt Header"
        className="w-full max-h-40 md:max-h-45 object-contain"
      />
    </header>
  );

  // Already Completed Screen
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-8 md:pt-12 flex items-center justify-center p-4">
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
            <p className="text-sm text-gray-500">
              This screen will close automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-6 flex items-center justify-center p-4">
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
      </div>
    );
  }

  // Registration Screen
  if (stage === 'registration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-6 flex items-center justify-center p-4">
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
                disabled={isValidatingParticipant}
                className={`w-full font-bold py-3 rounded-lg transition transform hover:scale-105 ${
                  isValidatingParticipant
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isValidatingParticipant ? 'Verifying participant…' : 'Continue to Rules'}
              </button>

              {/* Back button to go to Welcome */}
              <button
                type="button"
                onClick={() => {
                  setParticipant({ name: '', college: '', email: '', phone: '' });
                  setStage('welcome');
                }}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
              >
                ⬅ Back to Welcome
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rules Screen with Timer
  if (stage === 'rules') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-6 flex items-center justify-center p-4">
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
              className={`w-full font-bold py-4 rounded-lg text-xl my-3 transition transform ${
                (canStartQuiz && !quizEnded)
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed '
              }`}
            >
              {quizEnded ? 'Quiz Ended' : (canStartQuiz ? 'I Understand - Start Quiz' : 'Waiting for Quiz Time...')}
            </button>
            {/* Back button to Registration */}
            <button
              type="button"
              onClick={() => setStage('registration')}
              className="w-full mb-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              ⬅ Back to Registration
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (stage === 'quiz') {
    if (quizTerminated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800">
          <Header />
          <div className="pt-6 flex items-center justify-center p-4">
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
        </div>
      );
    }

    const questions = shuffledQuestions || QUIZ_QUESTIONS;
    const question = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-6 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span />
                <span className="font-semibold text-red-500">⚠ Don't switch tabs!</span>
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
                          ? 'bg-violet-100 border-violet-500'
                          : 'bg-gray-50 border-gray-300'
                        : 'bg-white border-gray-300 hover:border-violet-400 hover:bg-violet-50'
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
                          ? 'bg-violet-100 border-violet-500'
                          : 'bg-gray-50 border-gray-300'
                        : 'bg-white border-gray-300 hover:border-violet-400 hover:bg-violet-50'
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
                          ? 'bg-violet-100 border-violet-500'
                          : 'bg-gray-50 border-gray-300'
                        : 'bg-white border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                    }`}
                  >
                    FALSE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen (No Score Shown)
  if (stage === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <Header />
        <div className="pt-32 flex items-center justify-center p-4">
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
          </div>
        </div>
      </div>
    );
  }

  return null;
}
