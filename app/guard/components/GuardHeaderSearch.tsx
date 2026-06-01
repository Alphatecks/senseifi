"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { filterGuardSearchDestinations, useGuardSearch } from "@/context/GuardSearchContext";

export default function GuardHeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useGuardSearch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => filterGuardSearchDestinations(query), [query]);
  const showDropdown = open && query.trim().length > 0;

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const navigateTo = (href: string) => {
    setOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (results.length > 0) {
      navigateTo(results[0].href);
      return;
    }

    setOpen(false);
  };

  const currentPageMatch = results.find((item) => item.href === pathname);
  const otherResults = results.filter((item) => item.href !== pathname);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="emboss-inset-3d-input w-full flex items-center rounded-lg bg-[#1a1d24] overflow-hidden min-w-0 border border-slate-800/50">
        <input
          type="search"
          placeholder="Search pages and content"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 min-w-0 w-0 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none border-none"
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-controls="guard-header-search-results"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="flex items-center justify-center w-9 h-12 text-slate-500 hover:text-white transition shrink-0"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
        <button
          type="submit"
          className="emboss-raised flex items-center justify-center w-11 h-12 rounded-r-lg bg-[#23262e] text-slate-400 hover:text-white transition shrink-0"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {showDropdown ? (
        <div
          id="guard-header-search-results"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-700/60 bg-[#1a1d24] shadow-xl overflow-hidden"
          role="listbox"
        >
          {results.length > 0 ? (
            <ul className="py-1 max-h-64 overflow-y-auto">
              {currentPageMatch ? (
                <li key={`${currentPageMatch.href}-current`}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm transition hover:bg-slate-800/60 text-[#4066FF] bg-[#4066FF]/10"
                  >
                    <span className="font-medium">{currentPageMatch.label}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">Filtering content on this page</span>
                  </button>
                </li>
              ) : null}
              {otherResults.map((item) => (
                <li key={item.href}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => navigateTo(item.href)}
                    className="w-full text-left px-4 py-3 text-sm transition hover:bg-slate-800/60 text-white"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">Open page and filter content</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-slate-400">
              No pages matched. Filtering content on the current page.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
