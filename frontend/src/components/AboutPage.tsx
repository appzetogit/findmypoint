import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { loadAboutData, AboutData } from "../data/aboutData";

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData>(loadAboutData);

  const fetchAbout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/about`);
      const data = await res.json();
      if (data.success && data.about) {
        setAboutData(data.about);
      } else {
        setAboutData(loadAboutData());
      }
    } catch {
      setAboutData(loadAboutData());
    }
  };

  useEffect(() => {
    fetchAbout();

    const handleSync = () => fetchAbout();
    window.addEventListener("storage", handleSync);
    window.addEventListener("fmp_about_changed", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("fmp_about_changed", handleSync);
    };
  }, []);

  return (
    <div className="space-y-5 pb-10 text-left animate-in fade-in duration-300">
      <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
        {aboutData.title || "About FindmyPoint"}
      </h2>

      <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
        {aboutData.paragraph1 && (
          <p>
            {aboutData.paragraph1.includes("FindmyPoint")
              ? aboutData.paragraph1.split("FindmyPoint").map((chunk, i, arr) => (
                  <React.Fragment key={i}>
                    {chunk}
                    {i < arr.length - 1 && (
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        FindmyPoint
                      </span>
                    )}
                  </React.Fragment>
                ))
              : aboutData.paragraph1}
          </p>
        )}

        {aboutData.paragraph2 && <p>{aboutData.paragraph2}</p>}

        {aboutData.paragraph3 && <p>{aboutData.paragraph3}</p>}
      </div>
    </div>
  );
}
