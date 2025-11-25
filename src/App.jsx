import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Trophy, Mail, User, Building, Phone } from 'lucide-react';

// Sample questions - Replace with your actual questions
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
  },
  {
    id: 6,
    question: "You should use the same password for all your accounts.",
    type: "boolean",
    correct: false
  },
  {
    id: 7,
    question: "What is cyberbullying?",
    type: "multiple",
    options: ["Online gaming", "Harassment using digital technology", "Computer virus", "Internet shopping"],
    correct: 1
  },
  {
    id: 8,
    question: "It's safe to share your personal information on public Wi-Fi.",
    type: "boolean",
    correct: false
  },
  {
    id: 9,
    question: "What does VPN stand for?",
    type: "multiple",
    options: ["Very Private Network", "Virtual Private Network", "Visual Protection Network", "Verified Personal Network"],
    correct: 1
  },
  {
    id: 10,
    question: "Digital citizenship includes being respectful online.",
    type: "boolean",
    correct: true
  },
  {
    id: 11,
    question: "What is ransomware?",
    type: "multiple",
    options: ["Free software", "Software that locks files until payment", "Antivirus software", "Photo editing software"],
    correct: 1
  },
  {
    id: 12,
    question: "You can trust all websites that appear in search results.",
    type: "boolean",
    correct: false
  },
  {
    id: 13,
    question: "What is copyright?",
    type: "multiple",
    options: ["Right to copy anything", "Legal right protecting creative works", "Computer right", "Wrong answer"],
    correct: 1
  },
  {
    id: 14,
    question: "Posting someone's private photos without permission is acceptable.",
    type: "boolean",
    correct: false
  },
  {
    id: 15,
    question: "What does URL stand for?",
    type: "multiple",
    options: ["Universal Resource Locator", "Uniform Resource Locator", "United Resource Link", "Universal Read Location"],
    correct: 1
  },
  {
    id: 16,
    question: "Strong passwords should include numbers, letters, and symbols.",
    type: "boolean",
    correct: true
  },
  {
    id: 17,
    question: "What is identity theft?",
    type: "multiple",
    options: ["Stealing someone's identity online", "Losing your ID card", "Forgetting password", "Creating fake account"],
    correct: 0
  },
  {
    id: 18,
    question: "You should verify information before sharing it on social media.",
    type: "boolean",
    correct: true
  },
  {
    id: 19,
    question: "What is netiquette?",
    type: "multiple",
    options: ["Internet speed", "Etiquette for online communication", "Network equipment", "Website design"],
    correct: 1
  },
  {
    id: 20,
    question: "Downloading pirated software is illegal.",
    type: "boolean",
    correct: true
  },
  {
    id: 21,
    question: "What is spam?",
    type: "multiple",
    options: ["Important emails", "Unwanted bulk messages", "Email attachment", "Security feature"],
    correct: 1
  },
  {
    id: 22,
    question: "It's okay to use someone else's work without giving credit.",
    type: "boolean",
    correct: false
  },
  {
    id: 23,
    question: "What is a firewall?",
    type: "multiple",
    options: ["Physical wall", "Security system that monitors network traffic", "Burning computer", "Internet cable"],
    correct: 1
  },
  {
    id: 24,
    question: "Privacy settings on social media are important.",
    type: "boolean",
    correct: true
  },
  {
    id: 25,
    question: "What is clickbait?",
    type: "multiple",
    options: ["Computer mouse", "Misleading content to get clicks", "Fishing technique", "Game feature"],
    correct: 1
  },
  {
    id: 26,
    question: "You should regularly update your software and apps.",
    type: "boolean",
    correct: true
  },
  {
    id: 27,
    question: "What is digital literacy?",
    type: "multiple",
    options: ["Reading books online", "Ability to use digital technology effectively", "Computer speed", "Internet connection"],
    correct: 1
  },
  {
    id: 28,
    question: "Cookies in browsers are always harmful.",
    type: "boolean",
    correct: false
  },
  {
    id: 29,
    question: "What is doxxing?",
    type: "multiple",
    options: ["Computer repair", "Publishing private information online", "Email service", "Password manager"],
    correct: 1
  },
  {
    id: 30,
    question: "Being a responsible digital citizen means thinking before you post.",
    type: "boolean",
    correct: true
  }
];

const RULES = [
  "Each question has a 10-second timer",
  "Questions will automatically advance when time expires",
  "You cannot go back to previous questions",
  "Each correct answer earns 1 point",
  "No negative marking for wrong answers",
  "Total of 30 questions",
  "Keep your device stable throughout the quiz",
  "Do not refresh the page during the quiz"
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
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (stage === 'quiz' && timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && stage === 'quiz' && !showFeedback) {
      handleAnswer(null);
    }
  }, [timeLeft, stage, showFeedback]);

  const handleRegistration = () => {
    if (participant.name && participant.college && participant.email && participant.phone) {
      setStage('rules');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;

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
        setTimeLeft(10);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        sendResults(finalScore);
        setStage('results');
      }
    }, 1500);
  };

  const sendResults = async (finalScore) => {
    const percentage = ((finalScore / QUIZ_QUESTIONS.length) * 100).toFixed(2);
    
    const emailData = {
      to_email: 'Technoholic25@gmail.com',
      participant_name: participant.name,
      college: participant.college,
      email: participant.email,
      phone: participant.phone,
      score: finalScore,
      total: QUIZ_QUESTIONS.length,
      percentage: percentage
    };

    console.log('Quiz Results:', emailData);
    
    // Email sending simulation - Replace with actual email service
    try {
      const response = await fetch('https://formspree.io/f/xovzndal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Brain Bolt Quiz Results - ${participant.name}`,
          'Participant Name': participant.name,
          'College': participant.college,
          'Email': participant.email,
          'Phone': participant.phone,
          'Score': `${finalScore}/${QUIZ_QUESTIONS.length}`,
          'Percentage': `${percentage}%`
        })
      });
      
      if (response.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Email error:', error);
    }
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">KBP College, Thane presents</h1>
          <h2 className="text-5xl font-extrabold text-blue-600 mb-4">Technoholic 2025</h2>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl mb-6">
            <h3 className="text-3xl font-bold">"Brain Bolt" Quiz Competition</h3>
          </div>
          <p className="text-xl text-gray-600 mb-8">Digital Civics Challenge</p>
          <button
            onClick={() => setStage('registration')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105"
          >
            Start Registration
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'registration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Participant Registration</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-2">
                <User className="w-5 h-5 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) => setParticipant({...participant, name: e.target.value})}
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
                onChange={(e) => setParticipant({...participant, phone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="10-digit mobile number"
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

  if (stage === 'rules') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Quiz Rules</h2>
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
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-800 font-semibold">⚠️ Important: Do not close or refresh this page during the quiz!</p>
          </div>
          <button
            onClick={() => setStage('quiz')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-xl transition transform hover:scale-105"
          >
            I Understand - Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>Score: {score}</span>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{question.question}</h3>
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
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : index === question.correct
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{String.fromCharCode(65 + index)}. {option}</span>
                    {showFeedback && (
                      selectedAnswer === index ? (
                        index === question.correct ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )
                      ) : index === question.correct ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : null
                    )}
                  </div>
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
                        ? question.correct === true
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : question.correct === true
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    TRUE
                    {showFeedback && (
                      selectedAnswer === true ? (
                        question.correct === true ? (
                          <CheckCircle className="w-6 h-6 ml-2 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 ml-2 text-red-500" />
                        )
                      ) : question.correct === true ? (
                        <CheckCircle className="w-6 h-6 ml-2 text-green-500" />
                      ) : null
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={showFeedback}
                  className={`p-6 rounded-lg border-2 font-bold text-xl transition transform hover:scale-105 ${
                    showFeedback
                      ? selectedAnswer === false
                        ? question.correct === false
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : question.correct === false
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    FALSE
                    {showFeedback && (
                      selectedAnswer === false ? (
                        question.correct === false ? (
                          <CheckCircle className="w-6 h-6 ml-2 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 ml-2 text-red-500" />
                        )
                      ) : question.correct === false ? (
                        <CheckCircle className="w-6 h-6 ml-2 text-green-500" />
                      ) : null
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const percentage = ((score / QUIZ_QUESTIONS.length) * 100).toFixed(2);
    const passed = percentage >= 50;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            TECHNOHOLIC
          </div>

          <Trophy className={`w-24 h-24 mx-auto mb-4 ${passed ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-8 px-6 rounded-xl mb-6">
            <div className="text-6xl font-bold mb-2">{score}/{QUIZ_QUESTIONS.length}</div>
            <div className="text-2xl font-semibold">{percentage}%</div>
            <div className="text-lg mt-2">{passed ? '🎉 Congratulations!' : 'Keep Learning!'}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Participant Details:</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {participant.name}</p>
              <p><strong>College:</strong> {participant.college}</p>
              <p><strong>Email:</strong> {participant.email}</p>
              <p><strong>Phone:</strong> {participant.phone}</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-800">
              {emailSent 
                ? '✅ Your results have been sent to the organizers!' 
                : '📧 Results will be sent to: Technoholic25@gmail.com'}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }
}