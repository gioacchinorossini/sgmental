"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  User,
  LogOut,
  RefreshCw,
  Download,
  Search,
  Star,
  Users,
  Award,
  Calendar,
  Building,
  CheckCircle,
  FileSpreadsheet,
  ArrowLeft,
  ChevronDown,
  Filter,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

interface EvaluationRecord {
  id: string;
  created_at: string;
  attendee_name?: string | null;
  affiliated_school?: string | null;
  school?: string | null;
  success_rating?: number | null;
  success_feedback?: string | null;
  organized_rating?: number | null;
  organized_feedback?: string | null;
  venue_rating?: number | null;
  venue_feedback?: string | null;
  goal_rating?: number | null;
  goal_feedback?: string | null;
  punctuality_rating?: number | null;
  punctuality_feedback?: string | null;
  average_score?: number | null;
  general_comment?: string | null;
  metadata?: {
    attendee_name?: string;
    affiliated_school?: string;
  };
}

const QUESTIONS = [
  { key: "success_rating", label: "Rate the success of the event", short: "Event Success" },
  { key: "organized_rating", label: "Is the event well organized?", short: "Organization" },
  { key: "venue_rating", label: "Is the venue and facility satisfactory?", short: "Venue & Facilities" },
  { key: "goal_rating", label: "Is the goal of the event achieved?", short: "Goal Achievement" },
  { key: "punctuality_rating", label: "Did the event start on time?", short: "Punctuality" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem("csab_admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
      fetchRecords();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Required hardcoded credentials: user "admin", pass "jancypacete4321" (unhashed)
    if (username.trim() === "admin" && password === "jancypacete4321") {
      setIsAuthenticated(true);
      sessionStorage.setItem("csab_admin_session", "true");
      fetchRecords();
    } else {
      setLoginError("Invalid username or password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("csab_admin_session");
    setUsername("");
    setPassword("");
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluations");
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Failed to fetch evaluation records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setNoticeMessage(null);
    try {
      const res = await fetch(`/api/evaluations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirmId(null);
        setNoticeMessage({ text: "Evaluation deleted successfully.", type: "success" });
        setTimeout(() => setNoticeMessage(null), 3500);
      } else {
        setNoticeMessage({ text: data.error || data.message || "Failed to delete submission.", type: "error" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setNoticeMessage({ text: "An error occurred while deleting.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    setNoticeMessage(null);
    try {
      const res = await fetch("/api/evaluations?all=true", {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecords([]);
        setShowClearModal(false);
        setNoticeMessage({ text: "All evaluations cleared successfully.", type: "success" });
        setTimeout(() => setNoticeMessage(null), 3500);
      } else {
        setNoticeMessage({ text: data.error || data.message || "Failed to clear evaluations.", type: "error" });
      }
    } catch (err) {
      console.error("Clear all error:", err);
      setNoticeMessage({ text: "An error occurred while clearing evaluations.", type: "error" });
    } finally {
      setIsClearingAll(false);
    }
  };

  // Helper to extract attendee name cleanly
  const getName = (r: EvaluationRecord) => {
    return r.attendee_name || r.metadata?.attendee_name || "Anonymous";
  };

  // Helper to extract school cleanly
  const getSchool = (r: EvaluationRecord) => {
    return r.affiliated_school || r.metadata?.affiliated_school || r.school || "Colegio San Agustin - Bacolod";
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const nameMatch = getName(r).toLowerCase().includes(searchQuery.toLowerCase());
      const schoolMatch = selectedSchool === "All" || getSchool(r) === selectedSchool;
      return nameMatch && schoolMatch;
    });
  }, [records, searchQuery, selectedSchool]);

  // Calculations
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        total: 0,
        overallAvg: "0.0",
        questionAverages: [0, 0, 0, 0, 0],
        schoolBreakdown: {},
      };
    }

    const questionSums = [0, 0, 0, 0, 0];
    const questionCounts = [0, 0, 0, 0, 0];
    let totalScoreSum = 0;
    const schools: Record<string, { count: number; scoreSum: number }> = {};

    records.forEach((r) => {
      const qScores = [
        r.success_rating,
        r.organized_rating,
        r.venue_rating,
        r.goal_rating,
        r.punctuality_rating,
      ];

      qScores.forEach((score, i) => {
        if (score && score > 0) {
          questionSums[i] += score;
          questionCounts[i] += 1;
        }
      });

      const avg = Number(r.average_score) || (qScores.filter(Boolean).reduce((a, b) => a! + b!, 0) || 0) / 5;
      totalScoreSum += avg;

      const sc = getSchool(r);
      if (!schools[sc]) {
        schools[sc] = { count: 0, scoreSum: 0 };
      }
      schools[sc].count += 1;
      schools[sc].scoreSum += avg;
    });

    const questionAverages = questionSums.map((sum, i) =>
      questionCounts[i] ? (sum / questionCounts[i]).toFixed(1) : "0.0"
    );

    const overallAvg = (totalScoreSum / total).toFixed(1);

    return {
      total,
      overallAvg,
      questionAverages,
      schoolBreakdown: schools,
    };
  }, [records]);

  // Export CSV
  const handleExportCSV = () => {
    if (!records.length) return;

    const headers = [
      "ID",
      "Date",
      "Name",
      "Affiliated School",
      "Event Success (1-5)",
      "Success Comment",
      "Organized (1-5)",
      "Organized Comment",
      "Venue (1-5)",
      "Venue Comment",
      "Goal (1-5)",
      "Goal Comment",
      "Punctuality (1-5)",
      "Punctuality Comment",
      "Average Rating",
      "General Comments",
    ];

    const rows = records.map((r) => [
      r.id,
      new Date(r.created_at).toLocaleString(),
      `"${getName(r).replace(/"/g, '""')}"`,
      `"${getSchool(r).replace(/"/g, '""')}"`,
      r.success_rating ?? "",
      `"${(r.success_feedback || "").replace(/"/g, '""')}"`,
      r.organized_rating ?? "",
      `"${(r.organized_feedback || "").replace(/"/g, '""')}"`,
      r.venue_rating ?? "",
      `"${(r.venue_feedback || "").replace(/"/g, '""')}"`,
      r.goal_rating ?? "",
      `"${(r.goal_feedback || "").replace(/"/g, '""')}"`,
      r.punctuality_rating ?? "",
      `"${(r.punctuality_feedback || "").replace(/"/g, '""')}"`,
      r.average_score ?? "",
      `"${(r.general_comment || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dare_to_be_evaluations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Grouped Logos */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <img
              src="/logos/dept-emblem.png"
              alt="Department Emblem"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-xs"
            />
            <img
              src="/logos/csab.png"
              alt="Colegio San Agustin - Bacolod Seal"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs"
            />
            <img
              src="/logos/event-heart.jpg"
              alt="Dare to be Heart"
              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-2xl shadow-xs border border-rose-200/90 ring-1 ring-black/5"
            />
          </div>

          <div className="text-center mb-6">
            <p className="text-[10px] sm:text-xs font-extrabold tracking-widest text-[#800000] uppercase">
              Colegio San Agustin - Bacolod
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
              Admin Portal
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              &ldquo;Dare to be&rdquo; Evaluation Reports &amp; Analytics
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-700">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-neutral-900 text-center mb-1">
              Administrator Login
            </h2>
            <p className="text-xs text-neutral-500 text-center mb-5">
              Enter your credentials to access evaluation reports.
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-black text-white hover:bg-neutral-800 active:scale-[0.98] text-sm font-semibold shadow-sm transition"
              >
                Sign In to Reports
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Public Evaluation Form
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center text-[11px] text-neutral-400">
          Colegio San Agustin - Bacolod • &ldquo;Virtus et Scientia&rdquo;
        </footer>
      </div>
    );
  }

  // 2. REPORTS DASHBOARD
  return (
    <div className="min-h-screen bg-white text-neutral-900 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3.5">
            {/* Grouped Logos with CSAB at the Center */}
            <div className="flex items-center gap-2">
              <img
                src="/logos/dept-emblem.png"
                alt="Emblem"
                className="w-9 h-9 object-contain"
              />
              <img
                src="/logos/csab.png"
                alt="CSAB Seal"
                className="w-12 h-12 object-contain"
              />
              <img
                src="/logos/event-heart.jpg"
                alt="Event Logo"
                className="w-9 h-9 object-cover rounded-xl border border-rose-200/80"
              />
            </div>

            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-[#800000] uppercase">
                Colegio San Agustin - Bacolod
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
                &ldquo;Dare to be&rdquo; Evaluation Reports
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="text-xs font-semibold px-3 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-1.5 transition text-neutral-700"
              title="Refresh evaluations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!records.length}
              className="text-xs font-semibold px-3.5 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="text-xs font-semibold px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5 transition"
                title="Delete all evaluations"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-2 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 flex items-center gap-1.5 transition"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Global Notice Alert if present */}
        {noticeMessage && (
          <div
            className={`p-3 rounded-2xl flex items-center justify-between text-xs font-medium border ${
              noticeMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {noticeMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{noticeMessage.text}</span>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="p-1 hover:opacity-75 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Responses</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">
              {stats.total}
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Total attendees evaluated</span>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Average Rating</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-baseline gap-1">
              {stats.overallAvg} <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Overall performance</span>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Top Aspect</span>
              <Award className="w-4 h-4 text-[#800000]" />
            </div>
            <p className="text-sm sm:text-base font-extrabold text-neutral-900 truncate mt-1">
              {QUESTIONS[
                stats.questionAverages.indexOf(
                  Math.max(...stats.questionAverages.map(Number)).toFixed(1)
                )
              ]?.short || "Event Success"}
            </p>
            <span className="text-[11px] text-neutral-500 block">
              ⭐ {Math.max(...stats.questionAverages.map(Number)).toFixed(1)} / 5.0
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-neutral-200/70">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Schools</span>
              <Building className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900">
              {Object.keys(stats.schoolBreakdown).length}
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Participating institutions</span>
          </div>
        </div>

        {/* Question-by-Question Breakdown Card */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>5 Evaluation Criteria Breakdown</span>
          </h2>

          <div className="space-y-3.5">
            {QUESTIONS.map((q, idx) => {
              const avg = stats.questionAverages[idx] || "0.0";
              const percentage = (Number(avg) / 5) * 100;

              return (
                <div key={q.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-neutral-800">
                      {idx + 1}. {q.label}
                    </span>
                    <span className="font-bold text-neutral-900 shrink-0 ml-2">
                      ⭐ {avg} <span className="text-neutral-400 font-normal">/ 5.0</span>
                    </span>
                  </div>

                  {/* Rating Progress Bar */}
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FBC02D] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Affiliated Schools Table Card */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Responses by Affiliated School
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5">School / Organization</th>
                  <th className="pb-2.5 text-center">Submissions</th>
                  <th className="pb-2.5 text-right">Avg. Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {Object.entries(stats.schoolBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-neutral-400 text-xs">
                      No submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  Object.entries(stats.schoolBreakdown).map(([schoolName, sc]) => (
                    <tr key={schoolName} className="hover:bg-neutral-50/50 transition">
                      <td className="py-2.5 font-medium text-neutral-800">
                        {schoolName}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-bold text-xs">
                          {sc.count}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-neutral-900">
                        ⭐ {(sc.scoreSum / sc.count).toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual Submissions Feed with Search & Filter */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Recent Submissions ({filteredRecords.length})
              </h2>
              <p className="text-xs text-neutral-500">
                All attendee responses with feedback comments
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="text-xs px-3 py-1.5 pl-8 rounded-full border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No evaluations match your search.
              </div>
            ) : (
              filteredRecords.map((r) => {
                const name = getName(r);
                const school = getSchool(r);
                const date = new Date(r.created_at).toLocaleString();

                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 text-sm">
                          {name}
                        </span>
                        <span className="text-neutral-400 mx-1.5">•</span>
                        <span className="text-neutral-600 font-medium">
                          {school}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">
                          {date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                          ⭐ {Number(r.average_score || 0).toFixed(1)}
                        </span>

                        {deleteConfirmId === r.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <span className="text-[10px] font-bold text-red-700">Delete?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold transition disabled:opacity-50"
                            >
                              {deletingId === r.id ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-bold transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete this evaluation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Criteria Ratings Quick Row */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1 text-center">
                      <div className="p-1.5 rounded-xl bg-white border border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400 block truncate">Success</span>
                        <strong className="text-xs font-bold text-neutral-800">{r.success_rating ?? "-"}★</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white border border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400 block truncate">Organized</span>
                        <strong className="text-xs font-bold text-neutral-800">{r.organized_rating ?? "-"}★</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white border border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400 block truncate">Venue</span>
                        <strong className="text-xs font-bold text-neutral-800">{r.venue_rating ?? "-"}★</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white border border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400 block truncate">Goal</span>
                        <strong className="text-xs font-bold text-neutral-800">{r.goal_rating ?? "-"}★</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white border border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400 block truncate">Timing</span>
                        <strong className="text-xs font-bold text-neutral-800">{r.punctuality_rating ?? "-"}★</strong>
                      </div>
                    </div>

                    {/* Feedback Comments if present */}
                    {(r.success_feedback ||
                      r.organized_feedback ||
                      r.venue_feedback ||
                      r.goal_feedback ||
                      r.punctuality_feedback ||
                      r.general_comment) && (
                      <div className="pt-1.5 space-y-1 text-xs text-neutral-600 border-t border-neutral-200/50">
                        {r.success_feedback && (
                          <p><strong className="text-neutral-700">Success Feedback:</strong> {r.success_feedback}</p>
                        )}
                        {r.organized_feedback && (
                          <p><strong className="text-neutral-700">Organization Feedback:</strong> {r.organized_feedback}</p>
                        )}
                        {r.venue_feedback && (
                          <p><strong className="text-neutral-700">Venue Feedback:</strong> {r.venue_feedback}</p>
                        )}
                        {r.goal_feedback && (
                          <p><strong className="text-neutral-700">Goal Feedback:</strong> {r.goal_feedback}</p>
                        )}
                        {r.punctuality_feedback && (
                          <p><strong className="text-neutral-700">Timing Feedback:</strong> {r.punctuality_feedback}</p>
                        )}
                        {r.general_comment && (
                          <p><strong className="text-neutral-700">General Comment:</strong> {r.general_comment}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 pb-6">
          <Link
            href="/"
            className="hover:text-neutral-900 inline-flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Public Evaluation Form</span>
          </Link>

          <span>Colegio San Agustin - Bacolod • &ldquo;Virtus et Scientia&rdquo;</span>
        </div>
      </div>

      {/* Clear All Modal Confirmation */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-neutral-900">
                Delete All Evaluations?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This will permanently delete all {records.length} evaluation records from the database. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearingAll}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isClearingAll ? "Deleting..." : "Yes, Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

