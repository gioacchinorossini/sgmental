"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  ArrowLeft,
  Sparkles,
  QrCode as QrIcon,
} from "lucide-react";

export default function QrCodePage() {
  const targetUrl = "https://sgmental.netlify.app/";
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [qrColor, setQrColor] = useState<string>("#006847"); // Default emerald green matching the reference image
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate QR Code data URL whenever target URL or color changes
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: qrColor,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Generation Error:", err));
  }, [targetUrl, qrColor]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "csab-dare-to-be-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Bar Navigation */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-4 no-print">
        <Link
          href="/"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Evaluation Form</span>
        </Link>
        <Link
          href="/admin"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
        >
          Admin Portal
        </Link>
      </header>

      {/* Center QR Card (Matching reference design) */}
      <main className="max-w-md w-full mx-auto my-auto flex flex-col items-center">
        {/* Printable Card */}
        <div
          ref={cardRef}
          className="w-full max-w-[340px] bg-white rounded-[36px] p-7 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-neutral-200/90 flex flex-col items-center text-center transition-all duration-300"
        >
          {/* Circular CSAB Logo with Accent Border */}
          <div
            className="w-20 h-20 rounded-full border-[2.5px] p-1 flex items-center justify-center bg-white shadow-2xs mb-2 transition-colors duration-200"
            style={{ borderColor: qrColor }}
          >
            <img
              src="/logos/csab.png"
              alt="Colegio San Agustin - Bacolod"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Org Pill Badge */}
          <div className="mb-5">
            <span
              className="inline-block px-3.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide"
              style={{
                backgroundColor:
                  qrColor === "#006847"
                    ? "#E6F4EA"
                    : qrColor === "#800000"
                    ? "#FCE8E6"
                    : "#F1F3F4",
                color: qrColor,
              }}
            >
              CSAB
            </span>
          </div>

          {/* QR Code Container */}
          <div className="w-full aspect-square bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-center mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Evaluation QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <QrIcon className="w-16 h-16 animate-pulse" />
              </div>
            )}
          </div>

          {/* Target URL Caption */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 font-medium hover:underline break-all tracking-tight leading-relaxed block max-w-full"
          >
            {targetUrl}
          </a>
        </div>

        {/* Action Controls & Color Toggles */}
        <div className="w-full max-w-[340px] mt-6 space-y-3 no-print">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 active:scale-[0.98] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span>Print Poster</span>
            </button>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              <span>Open Form</span>
            </a>
          </div>

          {/* Color Presets */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-400">
              QR Theme:
            </span>
            <button
              type="button"
              onClick={() => setQrColor("#006847")}
              className={`w-6 h-6 rounded-full bg-[#006847] border-2 transition ${
                qrColor === "#006847"
                  ? "border-neutral-900 ring-2 ring-neutral-200 scale-110"
                  : "border-transparent"
              }`}
              title="Reference Green"
            />
            <button
              type="button"
              onClick={() => setQrColor("#800000")}
              className={`w-6 h-6 rounded-full bg-[#800000] border-2 transition ${
                qrColor === "#800000"
                  ? "border-neutral-900 ring-2 ring-neutral-200 scale-110"
                  : "border-transparent"
              }`}
              title="CSAB Maroon"
            />
            <button
              type="button"
              onClick={() => setQrColor("#000000")}
              className={`w-6 h-6 rounded-full bg-black border-2 transition ${
                qrColor === "#000000"
                  ? "border-neutral-900 ring-2 ring-neutral-200 scale-110"
                  : "border-transparent"
              }`}
              title="Classic Black"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center pt-6 no-print">
        <p className="text-[11px] text-neutral-400">
          Colegio San Agustin - Bacolod • &ldquo;Virtus et Scientia&rdquo;
        </p>
      </footer>

      {/* Print stylesheet to only print the QR card on a clean page */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
