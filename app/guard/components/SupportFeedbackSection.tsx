"use client";

import React, { useRef, useState } from "react";

function HeadsetIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#0026FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"
      />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 13v3m0 0v3m0-3h3m-3 0H9" />
    </svg>
  );
}

function StarIcon({ filled, large }: { filled: boolean; large?: boolean }) {
  return (
    <svg
      className={`${large ? "h-5 w-5" : "h-4 w-4"} ${filled ? "text-[#FBB03B]" : "text-slate-600"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

type RatingRowProps = {
  displayRating: number;
  onHover: (value: number) => void;
  onLeave: () => void;
  onSelect: (value: number) => void;
  large?: boolean;
};

function RatingRow({ displayRating, onHover, onLeave, onSelect, large = false }: RatingRowProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 text-sm text-white/90 transition hover:text-white"
      onMouseLeave={onLeave}
      aria-label="Rate SenseiFi"
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={starValue}
              role="button"
              tabIndex={0}
              onMouseEnter={() => onHover(starValue)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(starValue);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(starValue);
                }
              }}
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              <StarIcon filled={starValue <= displayRating} large={large} />
            </span>
          );
        })}
      </span>
      <span className={large ? "text-base" : ""}>Rate us</span>
    </button>
  );
}

function FeedbackInput({
  message,
  onMessageChange,
  onSend,
  isSending,
  fileInputRef,
  onAttachmentClick,
}: {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAttachmentClick: () => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 -bottom-1 top-1/2 rounded-md bg-[#0026FF]/40 blur-2xl"
      />
      <div className="relative flex w-full items-center gap-2 rounded-md bg-[#252736] py-1.5 pl-4 pr-1.5 shadow-[0_0_28px_rgba(0,38,255,0.28)]">
        <input
          type="text"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void onSend();
          }}
          placeholder="Share your feedback..."
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onAttachmentClick}
          className="shrink-0 rounded-md p-2 transition hover:bg-white/5"
          aria-label="Attach screenshot"
        >
          <AttachmentIcon />
        </button>
        <button
          type="button"
          onClick={() => void onSend()}
          disabled={isSending}
          className="shrink-0 rounded-md bg-[#0026FF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0020dd] disabled:cursor-not-allowed disabled:opacity-60 sm:px-8"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function SupportFeedbackSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  const handleSend = async () => {
    if (!message.trim()) {
      setFeedbackMessage("Please enter your feedback before sending.");
      return;
    }

    setIsSending(true);
    setFeedbackMessage(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      setMessage("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedbackMessage("Thanks for your feedback. Our team will review it shortly.");
    } catch {
      setFeedbackMessage("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAttachment(file);
  };

  const statusBlock = (
    <>
      {feedbackMessage ? (
        <p
          className={`text-sm text-center ${
            feedbackMessage.startsWith("Thanks") ? "text-green-300" : "text-red-300"
          }`}
        >
          {feedbackMessage}
        </p>
      ) : null}
      {attachment ? (
        <p className="truncate px-2 text-center text-xs text-slate-400">Attached: {attachment.name}</p>
      ) : null}
    </>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAttachmentChange}
      />

      {/* Mobile */}
      <div
        className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-1 flex-col lg:hidden"
        style={{ backgroundColor: "#0c1129" }}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <h3 className="text-[1.75rem] font-semibold leading-tight text-white">
            &ldquo;We&apos;d love your thoughts&rdquo;
          </h3>
          <p className="mt-4 max-w-sm text-sm italic leading-relaxed text-white/75">
            Your feedback helps us build better features and fix what&apos;s broken.
          </p>

          <div className="mt-8 w-full space-y-3">
            {statusBlock}
            <FeedbackInput
              message={message}
              onMessageChange={setMessage}
              onSend={handleSend}
              isSending={isSending}
              fileInputRef={fileInputRef}
              onAttachmentClick={() => fileInputRef.current?.click()}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-center pb-10 pt-4">
          <RatingRow
            displayRating={displayRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(0)}
            onSelect={setRating}
            large
          />
        </div>
      </div>

      {/* Desktop */}
      <div
        className="relative hidden h-full min-h-[520px] w-full flex-1 flex-col overflow-hidden rounded-2xl px-8 py-7 lg:flex lg:min-h-0"
        style={{ backgroundColor: "#181b2e" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <HeadsetIcon />
            <h2 className="truncate text-lg font-medium text-white">Support & Feedback</h2>
          </div>

          <RatingRow
            displayRating={displayRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(0)}
            onSelect={setRating}
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-2 py-14 text-center">
          <h3 className="text-3xl font-normal leading-tight text-white md:text-4xl">We&apos;d love your thoughts</h3>
          <p className="mt-4 max-w-xl text-base italic leading-relaxed text-slate-400/90">
            Your feedback helps us build better features and fix what&apos;s broken.
          </p>

          <div className="mt-8 w-full max-w-4xl space-y-3">
            {statusBlock}
            <FeedbackInput
              message={message}
              onMessageChange={setMessage}
              onSend={handleSend}
              isSending={isSending}
              fileInputRef={fileInputRef}
              onAttachmentClick={() => fileInputRef.current?.click()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
