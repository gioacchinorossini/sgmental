"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Share2,
  Layers,
  Award,
  ListFilter,
  Check,
  Loader2,
  School,
  User,
  ArrowRight
} from "lucide-react";

interface Question {
  id: number;
  key: string;
  question: string;
  category: string;
  subtext: string;
  commentPrompt: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    key: "success",
    question: "Rate the success of the event",
    category: "Overall Impact",
    subtext: "How successful was the 'Dare to be' event overall?",
    commentPrompt: "How can we improve or what made it great?",
  },
  {
    id: 2,
    key: "organized",
    question: "Is the event well organized?",
    category: "Coordination",
    subtext: "Was the flow, coordination, and handling orderly?",
    commentPrompt: "Any suggestions regarding event coordination?",
  },
  {
    id: 3,
    key: "venue",
    question: "Is the venue and facility satisfactory?",
    category: "Venue & Facilities",
    subtext: "Comfort, acoustics, ventilation, and seating accommodation.",
    commentPrompt: "How can we improve the venue and facility?",
  },
  {
    id: 4,
    key: "goal",
    question: "Is the goal of the event achieved?",
    category: "Core Objective",
    subtext: "Did 'Dare to be' accomplish its mission and inspiring purpose?",
    commentPrompt: "In what way did the event achieve or miss its goal?",
  },
  {
    id: 5,
    key: "punctuality",
    question: "Did the event start on time?",
    category: "Time Management",
    subtext: "Punctuality and adherence to the announced program schedule.",
    commentPrompt: "Any thoughts on the timing and pacing?",
  },
];

const RATING_SCALES = [
  {
    score: 1,
    title: "Poor",
    description: "Does not meet expectations.",
  },
  {
    score: 2,
    title: "Fair",
    description: "Needs improvement.",
  },
  {
    score: 3,
    title: "Good",
    description: "Meets expectations.",
  },
  {
    score: 4,
    title: "Very Good",
    description: "Meets expectations very well.",
  },
  {
    score: 5,
    title: "Excellent",
    description: "Exceeds expectations.",
  },
];

const AFFILIATED_SCHOOLS = [
  "Colegio San Agustin - Bacolod",
  "USLS - Executive Branch and College of Arts and Sciences Council",
  "National University Bacolod - University Student Government",
  "UNO-R Supreme Student Government",
  "UNO-R Psychology Society",
  "RCI - College of Nursing",
  "NU - College of Nursing",
  "SUNN - College of Nursing",
  "UNOR - College of Nursing",
];

export default function EventFeedbackPage() {
  // Step 0: Welcome & Affiliated School Info
  // Steps 1 to 5: Questions 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [attendeeName, setAttendeeName] = useState<string>("");
  const [affiliatedSchool, setAffiliatedSchool] = useState<string>("Colegio San Agustin - Bacolod");
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [generalComment, setGeneralComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"card" | "all">("card");

  const totalQuestions = QUESTIONS.length;
  // currentStep 1 maps to question 0
  const activeQuestionIndex = currentStep > 0 ? currentStep - 1 : 0;
  const currentQ = QUESTIONS[activeQuestionIndex];
  const answeredCount = Object.keys(ratings).length;
  const isAllAnswered = totalQuestions === answeredCount;

  // Keyboard navigation (1-5 to rate when on question steps)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isSubmitting || viewMode !== "card" || currentStep === 0) return;
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const score = parseInt(e.key, 10);
        handleSelectRating(activeQuestionIndex, score);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, activeQuestionIndex, isSubmitted, isSubmitting, viewMode]);

  const handleSelectRating = (qIndex: number, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [qIndex]: score,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const calculateAverage = () => {
    const scores = Object.values(ratings);
    if (!scores.length) return "0.0";
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / scores.length).toFixed(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const avg = parseFloat(calculateAverage());

    try {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratings,
          comments,
          attendeeName: attendeeName.trim(),
          affiliatedSchool,
          generalComment,
          averageScore: avg,
        }),
      });

      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#D97706", "#991B1B", "#F59E0B", "#18181B"],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRatings({});
    setComments({});
    setAttendeeName("");
    setAffiliatedSchool("Colegio San Agustin - Bacolod");
    setGeneralComment("");
    setCurrentStep(0);
    setIsSubmitted(false);
  };

  const getScoreMeta = (score?: number) => {
    if (!score) return null;
    return RATING_SCALES.find((s) => s.score === score);
  };

  const handleShareSummary = () => {
    const summaryText =
      `Dare To Be Evaluation Form\n` +
      `Colegio San Agustin - Bacolod\n` +
      (attendeeName.trim() ? `Name: ${attendeeName.trim()}\n` : "") +
      `Affiliated School: ${affiliatedSchool}\n` +
      `Overall Rating: ${calculateAverage()} / 5.0\n` +
      QUESTIONS.map(
        (q, idx) => `${idx + 1}. ${q.question}: ${ratings[idx] ?? "N/A"}/5`
      ).join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Unified Institutional & Event Header */}
      <header className="max-w-md sm:max-w-lg md:max-w-xl w-full mx-auto mb-3 text-center">
        {/* All 5 Logos Grouped with CSAB at the Center */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2.5 flex-wrap">
          <div className="relative" title="Eagle Emblem">
            <img
              src="/logos/eagle.png"
              alt="Eagle Emblem"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-xs"
            />
          </div>
          <div className="relative" title="Academic / Department Emblem">
            <img
              src="/logos/dept-emblem.png"
              alt="Department Emblem"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-xs"
            />
          </div>
          <div className="relative" title="Colegio San Agustin - Bacolod">
            <img
              src="/logos/csab.png"
              alt="Colegio San Agustin - Bacolod Seal"
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-xs"
            />
          </div>
          <div className="relative" title="Dare to be Event">
            <img
              src="/logos/event-heart.png"
              alt="Dare to be Heart"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-xs"
            />
          </div>
          <div className="relative" title="College of Liberal Arts Sciences and Education">
            <img
              src="/logos/usa-clase.png"
              alt="CLASE Seal"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Title Placement */}
        <div className="space-y-0.5 mb-3">
          <p className="text-[10px] sm:text-xs font-extrabold tracking-widest text-[#800000] uppercase">
            Colegio San Agustin - Bacolod
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900 leading-tight">
            &ldquo;Dare to be&rdquo;
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Evaluation Form
          </p>
        </div>

        {/* View Switcher */}
        {!isSubmitted && (
          <div className="flex justify-end px-1">
            <button
              onClick={() => setViewMode(viewMode === "card" ? "all" : "card")}
              className="text-[11px] sm:text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-full px-3 py-1 shadow-2xs transition flex items-center gap-1.5"
              title="Toggle between single card step mode and full view"
            >
              <ListFilter className="w-3.5 h-3.5 text-neutral-500" />
              {viewMode === "card" ? "Show All" : "Step Mode"}
            </button>
          </div>
        )}
      </header>

      {/* Main Form Content */}
      <main className="max-w-md sm:max-w-lg md:max-w-xl w-full mx-auto flex-1 flex flex-col justify-center my-auto">
        {/* SUCCESS SUBMITTED SCREEN */}
        {isSubmitted ? (
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 text-center animate-scale-in">
            {/* Logos grouped together on success screen */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
              <img
                src="/logos/eagle.png"
                alt="Eagle Emblem"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-2xs"
              />
              <img
                src="/logos/dept-emblem.png"
                alt="Department Emblem"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-2xs"
              />
              <img
                src="/logos/csab.png"
                alt="CSAB Seal"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-2xs"
              />
              <img
                src="/logos/event-heart.png"
                alt="Event Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-2xs"
              />
              <img
                src="/logos/usa-clase.png"
                alt="CLASE Seal"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-2xs"
              />
            </div>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Maraming Salamat, Agustino!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-4">
              Your evaluation for <strong className="text-neutral-800">&ldquo;Dare to be&rdquo;</strong> has been successfully submitted.
            </p>

            {/* Respondent affiliation chip */}
            <div className="mb-5 inline-block bg-neutral-50 border border-neutral-200/70 rounded-xl px-3.5 py-1.5 text-xs text-neutral-600">
              <span>School: <strong className="text-neutral-900">{affiliatedSchool}</strong></span>
              {attendeeName.trim() && (
                <span className="block text-[11px] text-neutral-500 mt-0.5">Attendee: {attendeeName.trim()}</span>
              )}
            </div>

            {/* Score Summary Box */}
            <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-neutral-200/70 mb-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-3">
                <span className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                  Overall Rating
                </span>
                <span className="text-lg sm:text-xl font-black text-neutral-900 flex items-center gap-1">
                  ⭐ {calculateAverage()} <span className="text-xs sm:text-sm font-normal text-neutral-400">/ 5.0</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {QUESTIONS.map((q, idx) => {
                  const score = ratings[idx];
                  const meta = getScoreMeta(score);
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between text-xs sm:text-sm gap-2"
                    >
                      <span className="text-neutral-600 truncate flex-1">
                        {idx + 1}. {q.question}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px] sm:text-xs">
                          {score ?? "-"}
                        </span>
                        <span className="text-[11px] sm:text-xs font-medium text-neutral-500">
                          {meta?.title ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleShareSummary}
                className="flex-1 py-3 px-4 rounded-full bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Share Summary"}
              </button>

              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-full bg-neutral-100 text-neutral-700 font-medium text-sm hover:bg-neutral-200 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Submit Another
              </button>
            </div>
          </div>
        ) : viewMode === "card" ? (
          /* STEP-BY-STEP CARD VIEW */
          currentStep === 0 ? (
            /* STEP 0: WELCOME & ATTENDEE DETAILS CARD */
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 relative animate-fade-in space-y-5">
              {/* Segmented Progress Bar (Step 0 active) */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      if (s === 0 || ratings[s - 1] !== undefined || s <= currentStep) {
                        setCurrentStep(s);
                      }
                    }}
                    className={`h-1.5 sm:h-2 flex-1 rounded-full cursor-pointer transition-all duration-300 ${s === currentStep
                      ? "bg-black"
                      : s === 0 || ratings[s - 1] !== undefined
                        ? "bg-neutral-400"
                        : "bg-neutral-200"
                      }`}
                    title={s === 0 ? "Details" : `Question ${s}`}
                  />
                ))}
              </div>

              {/* Title & St. Augustine Greeting */}
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#800000] block mb-1">
                  Seminar Evaluation
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  Dare To Be Evaluation Form
                </h2>
                <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-neutral-700 text-xs sm:text-sm leading-relaxed">
                  <p className="font-normal text-neutral-700">
                    Greetings in St. Augustine! The Student Government values your feedback and would appreciate it if you could take a few minutes to evaluate the seminar. Your responses will help us improve future events and provide better learning experiences. Thank you for your time and participation!
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4 pt-1">
                {/* Name */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-neutral-800 block mb-1.5">
                    Name<span className="text-[#800000] font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition"
                  />
                </div>

                {/* Affiliated School* */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-neutral-800 block mb-1.5">
                    Affiliated School<span className="text-[#800000] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={affiliatedSchool}
                      onChange={(e) => setAffiliatedSchool(e.target.value)}
                      required
                      className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition appearance-none cursor-pointer pr-10"
                    >
                      {AFFILIATED_SCHOOLS.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">
                  Step 1 of 6
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (attendeeName.trim()) {
                      setCurrentStep(1);
                    }
                  }}
                  disabled={!attendeeName.trim()}
                  className={`rounded-full px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm transition flex items-center gap-1.5 ${attendeeName.trim()
                    ? "bg-black text-white hover:bg-neutral-800 active:scale-95"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                >
                  <span>Proceed to Rate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEPS 1 TO 5: THE 5 QUESTIONS CARD (MATCHES USER SCREENSHOT EXACTLY) */
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 relative transition-all duration-300">
              {/* Top Segmented Progress Bar */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      if (s === 0 || ratings[s - 1] !== undefined || s <= currentStep) {
                        setCurrentStep(s);
                      }
                    }}
                    className={`h-1.5 sm:h-2 flex-1 rounded-full cursor-pointer transition-all duration-300 ${s === currentStep
                      ? "bg-black"
                      : s === 0 || ratings[s - 1] !== undefined
                        ? "bg-neutral-400"
                        : "bg-neutral-200"
                      }`}
                    title={s === 0 ? "Details" : `Question ${s}`}
                  />
                ))}
              </div>

              {/* Question Title */}
              <div className="mb-6">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Question {activeQuestionIndex + 1} of {totalQuestions}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-neutral-900 tracking-tight leading-snug">
                  {currentQ.question}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  {currentQ.subtext}
                </p>
              </div>

              {/* Number Circles UI (Replacing faces with numbers 1 to 5) */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 py-1">
                  {RATING_SCALES.map((item) => {
                    const isSelected = ratings[activeQuestionIndex] === item.score;
                    const isAnySelected = ratings[activeQuestionIndex] !== undefined;

                    return (
                      <button
                        key={item.score}
                        type="button"
                        onClick={() => handleSelectRating(activeQuestionIndex, item.score)}
                        className={`relative flex-1 aspect-square max-w-[64px] sm:max-w-[76px] md:max-w-[84px] rounded-full flex flex-col items-center justify-center transition-all duration-200 select-none group focus:outline-none active:scale-95 ${isSelected
                          ? "bg-[#FBC02D] text-neutral-900 shadow-md shadow-amber-500/20 scale-105 ring-2 ring-[#F59E0B]/50"
                          : isAnySelected
                            ? "bg-neutral-100 text-neutral-400 hover:bg-neutral-200/80 hover:text-neutral-600"
                            : "bg-[#FEEFC3] text-neutral-800 hover:bg-[#FDD835] hover:scale-105"
                          }`}
                        aria-label={`Rate ${item.score} out of 5: ${item.title}`}
                      >
                        <span className="text-lg sm:text-2xl font-bold tracking-tight">
                          {item.score}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Scale Labels Underneath */}
                <div className="flex justify-between text-[10px] sm:text-xs text-neutral-400 px-1 mt-2 font-medium">
                  <span>1 – Poor</span>
                  <span>3 – Good</span>
                  <span>5 – Excellent</span>
                </div>

                {/* Dynamic Description for Selected Rating */}
                {ratings[activeQuestionIndex] !== undefined && (
                  <div className="mt-4 p-3 rounded-xl sm:rounded-2xl bg-amber-50/80 border border-amber-200/60 animate-fade-in flex items-center justify-between">
                    <div className="text-xs sm:text-sm text-neutral-800">
                      <strong className="text-amber-900 font-bold">
                        {ratings[activeQuestionIndex]} – {getScoreMeta(ratings[activeQuestionIndex])?.title}:
                      </strong>{" "}
                      <span className="text-neutral-600">
                        {getScoreMeta(ratings[activeQuestionIndex])?.description}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* "How can we improve?" Feedback Input */}
              {ratings[activeQuestionIndex] !== undefined && (
                <div className="space-y-2 mb-6 animate-fade-in">
                  <label className="text-xs sm:text-sm font-semibold text-neutral-800 block">
                    {currentQ.commentPrompt}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={comments[activeQuestionIndex] || ""}
                      onChange={(e) =>
                        setComments({
                          ...comments,
                          [activeQuestionIndex]: e.target.value,
                        })
                      }
                      placeholder="Write your feedback"
                      className="w-full text-sm sm:text-base px-4 py-3 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-neutral-700 transition px-2 py-1.5 focus:outline-none"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={ratings[activeQuestionIndex] === undefined || isSubmitting}
                  className={`rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none flex items-center gap-2 ${ratings[activeQuestionIndex] !== undefined && !isSubmitting
                    ? "bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-sm"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : activeQuestionIndex === totalQuestions - 1 ? (
                    "Submit"
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )
        ) : (
          /* ALL-IN-ONE VIEW (FOR EASY COMPLETE REVIEW) */
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Dare To Be Evaluation Form
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Please complete the details and rate all 5 criteria
                </p>
              </div>
            </div>

            {/* St. Augustine Greeting Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-neutral-700 text-xs sm:text-sm leading-relaxed">
              <p className="font-normal text-neutral-700">
                Greetings in St. Augustine! The Student Government values your feedback and would appreciate it if you could take a few minutes to evaluate the seminar. Your responses will help us improve future events and provide better learning experiences. Thank you for your time and participation!
              </p>
            </div>

            {/* Attendee Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/60">
              <div>
                <label className="text-xs sm:text-sm font-bold text-neutral-800 block mb-1.5">
                  Name<span className="text-[#800000] font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-neutral-800 block mb-1.5">
                  Affiliated School<span className="text-[#800000] font-bold">*</span>
                </label>
                <select
                  value={affiliatedSchool}
                  onChange={(e) => setAffiliatedSchool(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  {AFFILIATED_SCHOOLS.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    {idx + 1}. {q.question}
                  </h3>
                  {ratings[idx] && (
                    <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 shrink-0">
                      ★ {ratings[idx]} / 5
                    </span>
                  )}
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {RATING_SCALES.map((item) => {
                    const isSelected = ratings[idx] === item.score;
                    const isAnySelected = ratings[idx] !== undefined;

                    return (
                      <button
                        key={item.score}
                        type="button"
                        onClick={() => handleSelectRating(idx, item.score)}
                        className={`flex-1 aspect-square max-w-[54px] sm:max-w-[64px] rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all ${isSelected
                          ? "bg-[#FBC02D] text-neutral-900 shadow-sm ring-2 ring-[#F59E0B]/50 scale-105"
                          : isAnySelected
                            ? "bg-neutral-200/80 text-neutral-400 hover:bg-neutral-300"
                            : "bg-[#FEEFC3] text-neutral-800 hover:bg-[#FDD835]"
                          }`}
                      >
                        {item.score}
                      </button>
                    );
                  })}
                </div>

                {/* Optional comment */}
                <input
                  type="text"
                  value={comments[idx] || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [idx]: e.target.value,
                    })
                  }
                  placeholder="Optional comments for this item..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400"
                />
              </div>
            ))}

            {/* General feedback */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-neutral-800">
                Additional Comments / Commendations
              </label>
              <textarea
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                placeholder="Share your memorable moments or recommendations for the organizers..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting || !attendeeName.trim()}
              className={`w-full py-3.5 rounded-full text-sm sm:text-base font-semibold transition flex items-center justify-center gap-2 ${isAllAnswered && !isSubmitting && attendeeName.trim()
                ? "bg-black text-white hover:bg-neutral-800 shadow-md active:scale-[0.98]"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : !attendeeName.trim() ? (
                "Please enter your Name"
              ) : isAllAnswered ? (
                "Submit Complete Evaluation"
              ) : (
                `Please rate all questions (${answeredCount}/5 answered)`
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-md sm:max-w-lg md:max-w-xl w-full mx-auto mt-6 text-center">
        <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
          Colegio San Agustin - Bacolod
        </p>
        <p className="text-[10px] sm:text-[11px] text-neutral-400/80 mt-0.5">
          &ldquo;Virtus et Scientia&rdquo;
        </p>
      </footer>
    </div>
  );
}
