import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, Trophy, Mail, User, Building, Phone, AlertTriangle } from 'lucide-react';

// ============================================
// CONFIGURATION - CHANGE THESE SETTINGS
// ============================================
const CONFIG = {
  // Quiz Start Time (24-hour format: HH:MM)
  QUIZ_START_TIME: '10:36', // Example: 2:00 PM
  QUIZ_START_DATE: '2025-11-29', // Format: YYYY-MM-DD
  // Quiz End Time - after this datetime site will stop accepting responses
  QUIZ_END_TIME: '11:40', // 24-hour format HH:MM
  QUIZ_END_DATE: '2025-11-30', // Format: YYYY-MM-DD
  
  // Google Sheets Integration (Google Apps Script URL)
  GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbzo8SaoibMbaDCHegA3YzN5qOPiJaPZJj7v5_GsZ6ueJMU_faENahRxBhe5q5976Ksu/exec',
  
  // Formspree Integration
  // Web3forms Integration (replace with your access key)
  WEB3FORMS_ACCESS_KEY: 'c3ccd999-fdc3-49b1-a3b9-87e95da597fa',
  FORMSPREE_ID: 'xovzndal', // (unused) previous Formspree ID
  
  // Quiz Settings
  TIME_PER_QUESTION: 15, // seconds
  PASSING_PERCENTAGE: 50
};

// Quiz Questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is a digital footprint?",
    type: "multiple",
    options: ["Physical footprint on device", "Trail of data left online", "Computer memory", "Internet speed"],
    correct: 1
  },
  {
    id: 2,
    question: "Phishing is a type of cyber attack that uses fake emails to steal information.",
    type: "boolean",
    correct: true
  },
  {
    id: 3,
    question: "What does HTTPS stand for?",
    type: "multiple",
    options: ["Hyper Text Transfer Protocol Secure", "High Tech Transfer Protection System", "Hyper Transfer Text Protocol Safe", "Home Text Transfer Protocol"],
    correct: 0
  },
  {
    id: 4,
    question: "Two-factor authentication makes your account less secure.",
    type: "boolean",
    correct: false
  },
  {
    id: 5,
    question: "What is malware?",
    type: "multiple",
    options: ["Good software", "Malicious software", "Mail software", "Main software"],
    correct: 1
  }
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
  
  const visibilityRef = useRef(true);

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
      if (document.hidden && stage === 'quiz') {
        setQuizTerminated(true);
        submitQuizResults(score, true);
      }
    };

    const handleBlur = () => {
      if (stage === 'quiz') {
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
  }, [stage, score]);

  // Timer logic
  useEffect(() => {
    if (stage === 'quiz' && timeLeft > 0 && !showFeedback && !quizTerminated) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && stage === 'quiz' && !showFeedback && !quizTerminated) {
      handleAnswer(null);
    }
  }, [timeLeft, stage, showFeedback, quizTerminated]);

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

    // Check if email is already registered
    if (registeredEmails.has(participant.email.toLowerCase())) {
      alert('This email has already been registered. You cannot register twice.');
      return;
    }

    // Mark this email as registered and proceed
    setRegisteredEmails(prev => new Set(prev).add(participant.email.toLowerCase()));
    setStage('rules');
  };

  const handleAnswer = (answer) => {
    if (showFeedback || quizTerminated || quizEnded) return;

    const question = QUIZ_QUESTIONS[currentQuestion];
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
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
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
    const percentage = ((finalScore / QUIZ_QUESTIONS.length) * 100).toFixed(2);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    const resultData = {
      name: participant.name,
      college: participant.college,
      email: participant.email,
      phone: participant.phone,
      score: finalScore,
      total: QUIZ_QUESTIONS.length,
      percentage: percentage,
      status: terminated ? 'TERMINATED' : 'COMPLETED',
      timestamp: timestamp
    };

    console.log('Submitting results:', resultData);

    // Send to Google Sheets
    try {
      const response = await fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'addResult',
          data: {
            name: participant.name,
            college: participant.college,
            email: participant.email,
            phone: participant.phone,
            score: finalScore,
            total: QUIZ_QUESTIONS.length,
            percentage: percentage,
            status: terminated ? 'TERMINATED' : 'COMPLETED',
            timestamp: timestamp
          }
        })
      });
      
      console.log('✅ Data sent to Google Sheets');
    } catch (error) {
      console.error('❌ Google Sheets error:', error);
    }

    // Send Email via Web3forms (replacing Formspree)
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: `Brain Bolt Quiz Results - ${participant.name}`,
          from_name: 'Technoholic 2025',
          name: participant.name,
          email: participant.email,
          message: `\nQuiz Results:\n--------------\nParticipant Name: ${participant.name}\nCollege: ${participant.college}\nEmail: ${participant.email}\nPhone: ${participant.phone}\nScore: ${finalScore}/${QUIZ_QUESTIONS.length}\nPercentage: ${percentage}%\nStatus: ${terminated ? 'TERMINATED' : 'COMPLETED'}\nSubmitted At: ${timestamp}\n`,
        })
      });

      if (response.ok) {
        setEmailSent(true);
        console.log('Email sent successfully via Web3forms');
      } else {
        // Try to read response body for debugging (may be JSON or text)
        let details = '';
        try {
          details = await response.text();
          console.warn('Web3forms response status:', response.status, 'body:', details);
        } catch (e) {
          console.warn('Web3forms response status:', response.status, 'and could not read body');
        }
        // Inform the user in UI (brief)
        alert(`Failed to send confirmation email (status ${response.status}). Check console for details.`);
      }
    } catch (error) {
      console.error('Web3forms email error:', error);
      alert('Failed to send confirmation email. Check console for details.');
    }
  };

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
            onClick={() => (canStartQuiz && !quizEnded) && setStage('quiz')}
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

    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="font-semibold">⚠ Don't switch tabs!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%`}}
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
            <h3 className="text-2xl font-bold text-gray-800">{question.question}</h3>
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
          
          {emailSent && (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mt-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 font-semibold">Confirmation email sent to the host!</p>
            </div>
          )}
        </div>
      </div>
);
}
}
