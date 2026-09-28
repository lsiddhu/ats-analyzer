import { useState } from "react";

function Dashboard() {
  const [resume, setResume] = useState(null);
  const [resumeId, setResumeId] = useState(
    localStorage.getItem("resumeId") || ""
  );

  const [jobDescription, setJobDescription] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [analyzeMessage, setAnalyzeMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadMessage("Please select a PDF file.");
      setResume(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("PDF size must be less than 5 MB.");
      setResume(null);
      return;
    }

    setResume(file);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!resume) {
      setUploadMessage("Please select a PDF resume first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setUploadMessage("Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    setUploadLoading(true);
    setUploadMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/resume/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUploadMessage(data.message || "Upload failed.");
        return;
      }

      const uploadedResumeId = data.resume?.id;

      if (!uploadedResumeId) {
        console.error("Resume ID missing from response:", data);
        setUploadMessage(
          "Resume uploaded, but resume ID was not received."
        );
        return;
      }

      setResumeId(uploadedResumeId);

      localStorage.setItem("resumeId", uploadedResumeId);
      localStorage.setItem(
        "resumeFileName",
        data.fileName || resume.name
      );

      setUploadMessage("Resume uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Unable to connect to server.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalyze = async () => {
    const storedResumeId = localStorage.getItem("resumeId");

    const currentResumeId = resumeId || storedResumeId;

    if (!currentResumeId) {
      setAnalyzeMessage("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setAnalyzeMessage("Please enter the job description.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setAnalyzeMessage("Please login again.");
      return;
    }

    setAnalyzeLoading(true);
    setAnalyzeMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/resume/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resumeId: currentResumeId,
            jobDescription: jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAnalyzeMessage(data.message || "Analysis failed.");
        setAnalysisResult(null);
        return;
      }

      setAnalysisResult(data.result);
      setAnalyzeMessage("Resume analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzeMessage("Unable to connect to server.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("resumeId");
    localStorage.removeItem("resumeFileName");

    window.location.href = "/login";
  };

  const score = analysisResult?.atsScore || 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              Resume ATS Analyzer
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Analyze your resume against a job description
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">

            <span className="text-sm text-slate-600 sm:block">
              <span className="hidden sm:inline">Hello, </span>

              <span className="font-semibold text-slate-900">
                {user?.name || "User"}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* Upload + Job Description */}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">

          {/* Upload Resume */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-5 sm:mb-6">
              <span className="text-sm font-semibold text-blue-600">
                STEP 01
              </span>

              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                Upload Your Resume
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload your resume in PDF format.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-blue-400 sm:p-6">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                📄
              </div>

              <label className="inline-block w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto">
                Choose PDF

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-xs text-slate-500">
                PDF only · Maximum 5 MB
              </p>

              {resume && (
                <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Selected Resume
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {resume.name}
                  </p>

                </div>
              )}

              {localStorage.getItem("resumeFileName") && !resume && (
                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                    Uploaded Resume
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {localStorage.getItem("resumeFileName")}
                  </p>

                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploadLoading}
                className="mt-5 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadLoading ? "Uploading..." : "Upload Resume"}
              </button>

              {uploadMessage && (
                <p className="mt-4 text-sm font-medium text-slate-600">
                  {uploadMessage}
                </p>
              )}

            </div>
          </section>

          {/* Job Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-5 sm:mb-6">
              <span className="text-sm font-semibold text-blue-600">
                STEP 02
              </span>

              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                Job Description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Paste the job description you want to compare your resume
                against.
              </p>
            </div>

            <textarea
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="h-52 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-64 sm:p-4"
            />

            <button
              onClick={handleAnalyze}
              disabled={analyzeLoading}
              className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzeLoading
                ? "Analyzing Resume..."
                : "Analyze Resume"}
            </button>

            {analyzeMessage && (
              <p className="mt-4 text-center text-sm font-medium text-slate-600">
                {analyzeMessage}
              </p>
            )}

          </section>
        </div>

        {/* Results */}
        {analysisResult && (
          <section className="mt-7 sm:mt-8">

            <div className="mb-5 sm:mb-6">
              <span className="text-sm font-semibold text-blue-600">
                ANALYSIS COMPLETE
              </span>

              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                ATS Analysis Results
              </h2>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-slate-500">
                  ATS Score
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
                  {score}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-slate-500">
                  Matching Keywords
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                  {analysisResult.matchingKeywords?.length || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-slate-500">
                  Missing Keywords
                </p>

                <p className="mt-2 text-2xl font-bold text-red-500 sm:text-3xl">
                  {analysisResult.missingKeywords?.length || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-slate-500">
                  Total JD Keywords
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {analysisResult.totalJobKeywords || 0}
                </p>
              </div>

            </div>

            {/* ATS Score */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:mt-6 sm:p-8">

              <h3 className="text-lg font-bold text-slate-900">
                ATS Compatibility Score
              </h3>

              <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full bg-slate-200 sm:h-44 sm:w-44">

                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white sm:h-36 sm:w-36">

                  <div>
                    <p className="text-3xl font-bold text-blue-600 sm:text-4xl">
                      {score}%
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Match Score
                    </p>
                  </div>

                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {analysisResult.matchingKeywords?.length || 0} matching
                keywords out of{" "}
                {analysisResult.totalJobKeywords || 0}
              </p>

            </div>

            {/* Keywords */}
            <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">

              {/* Matching */}
              <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm sm:p-6">

                <h3 className="text-lg font-bold text-slate-900">
                  Matching Keywords
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Keywords found in your resume.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {analysisResult.matchingKeywords?.map(
                    (keyword, index) => (
                      <span
                        key={index}
                        className="max-w-full break-words rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>

              </div>

              {/* Missing */}
              <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">

                <h3 className="text-lg font-bold text-slate-900">
                  Missing Keywords
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Keywords from the job description that are missing.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {analysisResult.missingKeywords?.map(
                    (keyword, index) => (
                      <span
                        key={index}
                        className="max-w-full break-words rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>

              </div>
            </div>

            {/* AI Analysis */}
            {analysisResult.aiAnalysis && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">

                <div className="border-b border-slate-200 pb-5">
                  <span className="text-sm font-semibold text-purple-600">
                    GEMINI AI
                  </span>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    AI Resume Analysis
                  </h2>
                </div>

                {/* Summary */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Summary
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                    {analysisResult.aiAnalysis.summary}
                  </p>
                </div>

                {/* AI Cards */}
                <div className="mt-7 grid gap-4 md:grid-cols-2 md:gap-6">

                  {/* Strengths */}
                  <div className="rounded-xl bg-green-50 p-4 sm:p-5">
                    <h3 className="font-bold text-green-800">
                      Strengths
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {analysisResult.aiAnalysis.strengths?.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-green-900 break-words"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-xl bg-red-50 p-4 sm:p-5">
                    <h3 className="font-bold text-red-800">
                      Weaknesses
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {analysisResult.aiAnalysis.weaknesses?.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-red-900 break-words"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div className="rounded-xl bg-blue-50 p-4 sm:p-5">
                    <h3 className="font-bold text-blue-800">
                      Suggestions
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {analysisResult.aiAnalysis.suggestions?.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-blue-900 break-words"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Missing Skills */}
                  <div className="rounded-xl bg-amber-50 p-4 sm:p-5">
                    <h3 className="font-bold text-amber-800">
                      Missing Skills
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {analysisResult.aiAnalysis.missingSkills?.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-amber-900 break-words"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                </div>
              </div>
            )}

          </section>
        )}

      </main>
    </div>
  );
}

export default Dashboard;