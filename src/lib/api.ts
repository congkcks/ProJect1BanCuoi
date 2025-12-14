import { TestListItem, TestDetail, TestSession, TestResult, TestHistoryResponse } from "@/types/test";

const API_BASE = "https://luyende.onrender.com/api";

export const testApi = {
  async getTestList(): Promise<TestListItem[]> {
    const response = await fetch(`${API_BASE}/Home/list`);
    if (!response.ok) throw new Error("Failed to fetch test list");
    return response.json();
  },

  async getTestDetail(testId: string): Promise<TestDetail> {
    const response = await fetch(`${API_BASE}/Home/start/${testId}`);
    if (!response.ok) throw new Error("Failed to fetch test detail");
    return response.json();
  },

  async startSession(userEmail: string, testId: string): Promise<TestSession> {
    const response = await fetch(`${API_BASE}/test-session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail, testId }),
    });
    if (!response.ok) throw new Error("Failed to start session");
    return response.json();
  },

  async submitResult(sessionId: string, totalScore: number): Promise<TestResult> {
    const response = await fetch(`${API_BASE}/test-session/submit/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalScore }),
    });
    if (!response.ok) throw new Error("Failed to submit result");
    return response.json();
  },

  async getReview(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/test-session/review/${sessionId}`);
    if (!response.ok) throw new Error("Failed to fetch review");
    return response.json();
  },

  async submitAnswers(answers: Array<{
    sessionId: string;
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
  }>): Promise<any> {
    const response = await fetch(`${API_BASE}/test-session/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    if (!response.ok) throw new Error("Failed to submit answers");
    return response.json();
  },

  async getTestHistory(userEmail: string): Promise<TestHistoryResponse> {
    const response = await fetch(`${API_BASE}/test-session/user/${encodeURIComponent(userEmail)}`);
    if (!response.ok) throw new Error("Failed to fetch test history");
    return response.json();
  },
};
