const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://tile-comfort-housing-bathrooms.trycloudflare.com/api';
const LOGIN_PATH_ENV = (import.meta as any).env?.VITE_LOGIN_PATH as string | undefined;
const REGISTER_PATH_ENV = (import.meta as any).env?.VITE_REGISTER_PATH as string | undefined;

// Types based on API responses
export interface User {
  id: number;
  username: string;
  email: string;
  streakDays?: number;
  badges?: string[];
  createdAt?: string;
}

export interface Exercise {
  id: number;
  title: string;
  description?: string;
  exerciseType: 'Reading' | 'Listening' | 'Writing' | 'Speaking';
  topic: string;
  status?: 'Completed' | 'InProgress' | 'Pending';
  materials?: Material[];
  questions?: Question[];
}

export interface Material {
  id: number;
  materialType: 'Text' | 'Audio' | 'Video';
  content: string;
}

export interface Question {
  id: number;
  questionText: string;
  options: Option[];
}

export interface Option {
  id: number;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Submission {
  id: number;
  score: number;
  isCompleted: boolean;
  submittedAt: string;
}

export interface LearningPlan {
  planId: number;
  exerciseId: number;
  status: 'Completed' | 'Pending' | 'InProgress';
  startTime: string;
  endTime: string;
}

export interface Badge {
  badgeId: number;
  badgeName: string;
  awardedAt: string;
}

export interface DashboardSummary {
  streakDays: number;
  predictedScore: number;
  completedLessons: number;
  totalLessons: number;
  studyTimeHours: number;
}

export interface DashboardProgress {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}

export interface RecentResult {
  exercise: string;
  score: number;
}

export interface DashboardStats {
  streakDays: number;
  totalScore: number;
  completedExercises: number;
  totalExercises: number;
  studyHours: number;
  progress: DashboardProgress;
  recentResults: RecentResult[];
}

// Auth (VN) types
export interface AuthLoginResponse {
  message?: string;
  token: string;
  user?: any; // Backend returns Vietnamese snake_case fields; keep generic
}

export interface AuthRegisterRequest {
  hoTen: string;
  email: string;
  matKhau: string;
}

// LoTrinh types (from backend response)
export interface LoTrinhItem {
  maLoTrinh: string;
  tenLoTrinh: string;
  moTa: string;
  thoiGianDuKien: string;
  capDo: string; // A1 | A2 | B1 | B2 | ...
  loaiLoTrinh: string; // "Chung" | "Chuyên sâu" | ...
  mucTieuDiem: number;
  tongSoBai: number;
  ngayTao: string;
  kyNangTrongTam?: string | null; // Added optional field
  chuDeBaiHoc?: string | null; // Added optional field
}

export interface LoTrinhResponse {
  message: string;
  total: number;
  data: LoTrinhItem[];
}

// Lessons list and details
export interface VideoItem {
  maVideo: string;
  tieuDeVideo: string;
  duongDanVideo: string;
  thoiLuongGiay: number;
  ngayTao: string;
}

export interface BaiNgheItem {
  maBaiNghe: string;
  maBai: string;
  tieuDe: string;
  doKho?: string | null;
  ngayTao: string;
  duongDanFile?: string | null; // legacy
  duongDanAudio?: string | null; // new
  banGhiAm?: string | null; // transcript
  tongCauHoi?: number;
  cauHois?: CauHoiItem[];
}

export interface BaiDocItem {
  maBaiDoc: string;
  maBai: string;
  tieuDe: string;
  doKho?: string | null;
  ngayTao: string;
  duongDanFileTxt: string;
}

export interface LessonItem {
  maBai: string;
  maLoTrinh: string;
  tenBai: string;
  moTa: string | null;
  thoiLuongPhut: number;
  soThuTu: number;
  ngayTao: string;
  videos: VideoItem[];
  baiNghes: BaiNgheItem[];
  baiDocs: BaiDocItem[];
}

export interface LessonsResponse {
  message: string;
  total: number;
  data: LessonItem[];
}

export interface LessonDetailResponse {
  message: string;
  data: LessonItem;
}

// Reading doc detail
export interface DapAnItem {
  maDapAn: number | string;
  maCauHoi: string;
  nhanDapAn: string; // A/B/C/D
  noiDungDapAn: string;
  thuTuHienThi: number;
  laDapAnDung: boolean;
}

export interface CauHoiItem {
  maCauHoi: string;
  noiDungCauHoi: string;
  giaiThich?: string | null;
  diem: number;
  thuTuHienThi: number;
  dapAns: DapAnItem[];
}

export interface ReadingDocDetailResponse {
  maBaiDoc: string;
  maBai: string;
  tieuDe: string;
  doKho?: string | null;
  noiDung?: string | null;
  duongDanFileTxt: string; // may be YouTube link
  ngayTao: string;
  tongCauHoi: number;
  cauHois: CauHoiItem[];
}

export interface ListeningDocDetail extends BaiNgheItem {
  tongCauHoi?: number;
  cauHois?: CauHoiItem[];
}

export interface ListeningDetailResponse {
  message?: string;
  data?: ListeningDocDetail;
}

// Lessons (Bài học)
// (removed duplicate legacy LessonItem/LessonsResponse definitions)

export interface TopicExercises {
  topic: string;
  exercises: Exercise[];
}

export interface ExercisesByTopicResponse {
  topic: string;
  exercises: Exercise[];
}

// API Service Class
export class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Try multiple endpoints until one succeeds
  private async requestWithFallback<T>(endpoints: string[], options: RequestInit = {}): Promise<T> {
    let lastErr: any = null;
    for (const ep of endpoints) {
      try {
        return await this.request<T>(ep, options);
      } catch (e) {
        lastErr = e;
        // Log which endpoint failed for easier debugging
        console.warn('API fallback failed for endpoint:', ep, e);
        // continue to next endpoint
      }
    }
    const err = new Error(`All endpoints failed. Tried: ${endpoints.join(', ')}. Last error: ${lastErr?.message || lastErr}`);
    // attach extra field for consumers that want details
    (err as any).endpointsTried = endpoints;
    throw err;
  }

  // User API
  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; userId: number }> {
    const response = await this.request<{ token: string; userId: number }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        passwordHash: credentials.password
      }),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userId', response.userId.toString());
    
    return response;
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  // Exercise API
  async getAllExercises(): Promise<Exercise[]> {
    return this.request<Exercise[]>('/exercises');
  }

  async getExercisesByTopic(): Promise<ExercisesByTopicResponse[]> {
    return this.request<ExercisesByTopicResponse[]>('/exercises/by-topic');
  }

  async getExercisesByTopicName(topicName: string): Promise<TopicExercises> {
    const allTopics = await this.getExercisesByTopic();
    const topic = allTopics.find(t => t.topic === topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} not found`);
    }
    return topic;
  }

  async getExerciseById(exerciseId: number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${exerciseId}`);
  }

  async getPendingExercises(userId: number): Promise<Exercise[]> {
    return this.request<Exercise[]>(`/users/users/${userId}/exercises/pending`);
  }

  // Submission API
  async submitExercise(submissionData: {
    userId: number;
    exerciseId: number;
    score: number;
    isCompleted: boolean;
    durationMinutes?: number;
  }): Promise<Submission> {
    return this.request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return this.request<Submission[]>(`/submissions/user/${userId}`);
  }

  // Learning Plan API
  async getLearningPlan(userId: number): Promise<LearningPlan[]> {
    return this.request<LearningPlan[]>(`/learningplans/user/${userId}`);
  }

  // Badges API
  async getUserBadges(userId: number): Promise<Badge[]> {
    return this.request<Badge[]>(`/userbadges/${userId}`);
  }

  // Dashboard API
  async getDashboardSummary(userId: number): Promise<DashboardSummary> {
    return this.request<DashboardSummary>(`/dashboard/summary/${userId}`);
  }

  async getDashboardProgress(userId: number): Promise<DashboardProgress> {
    return this.request<DashboardProgress>(`/dashboard/progress/${userId}`);
  }

  async getDashboardToday(userId: number): Promise<LearningPlan[]> {
    return this.request<LearningPlan[]>(`/dashboard/today/${userId}`);
  }

  async getDashboardRecentResults(userId: number): Promise<RecentResult[]> {
    return this.request<RecentResult[]>(`/dashboard/recent-results/${userId}`);
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    // Combine multiple dashboard endpoints
    const [summary, progress, recentResults] = await Promise.all([
      this.getDashboardSummary(userId),
      this.getDashboardProgress(userId),
      this.getDashboardRecentResults(userId)
    ]);

    return {
      streakDays: summary.streakDays,
      totalScore: summary.predictedScore,
      completedExercises: summary.completedLessons,
      totalExercises: summary.totalLessons,
      studyHours: summary.studyTimeHours,
      progress,
      recentResults
    };
  }

  // LoTrinh (Roadmaps)
  async getAvailableRoadmaps(): Promise<LoTrinhResponse> {
    // Some backends might expose different paths, try a few
    return this.requestWithFallback<LoTrinhResponse>([
      '/LoTrinh/co-san',
      '/LoTrinh',
      '/lotrinh/co-san',
      '/lotrinh'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  // Lessons APIs
  async getLessons(): Promise<LessonsResponse> {
    return this.requestWithFallback<LessonsResponse>([
      '/BaiHoc/danh-sach',
      '/BaiHoc',
      '/baihoc/danh-sach',
      '/baihoc'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  async getLessonDetail(maBai: string): Promise<LessonDetailResponse> {
    return this.requestWithFallback<LessonDetailResponse>([
      `/BaiHoc/chi-tiet/${maBai}`,
      `/BaiHoc/${maBai}`,
      `/baihoc/chi-tiet/${maBai}`,
      `/baihoc/${maBai}`
    ]);
  }

  async getReadingDocDetail(maBaiDoc: string): Promise<ReadingDocDetailResponse> {
    const res = await this.requestWithFallback<any>([
      `/BaiDoc/chi-tiet/${maBaiDoc}`,
      `/BaiDoc/${maBaiDoc}`,
      `/baidoc/chi-tiet/${maBaiDoc}`,
      `/baidoc/${maBaiDoc}`
    ]);
    return res?.data ?? res;
  }

  async getListeningDetail(maBaiNghe: string): Promise<ListeningDocDetail> {
    const res: any = await this.requestWithFallback<any>([
      `/BaiNghe/chi-tiet/${maBaiNghe}`,
      `/BaiNghe/chi-tiet?maBaiNghe=${encodeURIComponent(maBaiNghe)}`,
      `/BaiNghe/${maBaiNghe}`,
      `/bainghe/chi-tiet/${maBaiNghe}`,
      `/bainghe/chi-tiet?maBaiNghe=${encodeURIComponent(maBaiNghe)}`,
      `/bainghe/${maBaiNghe}`
    ]);
    // Unwrap common response envelopes and arrays
    const data = (res && typeof res === 'object') ? (res.data ?? res) : res;
    if (Array.isArray(data)) {
      // Try to find by id or fallback to first
      const found = data.find((it: any) => it?.maBaiNghe === maBaiNghe) ?? data[0];
      return found as ListeningDocDetail;
    }
    // Some APIs may nest again under 'item' or use different casing; keep it simple here
    return data as ListeningDocDetail;
  }

  // (removed duplicate legacy getLessons)

  // Auth (VN) APIs
  async authLogin(email: string, matKhau: string): Promise<AuthLoginResponse> {
    // Send a permissive payload for compatibility across endpoints
    const body = JSON.stringify({ email, matKhau, password: matKhau, passwordHash: matKhau, username: email });
    const candidates = [
      // Env override first
      ...(LOGIN_PATH_ENV ? [LOGIN_PATH_ENV] : []),
      // VN common
      '/Auth/dang-nhap', '/NguoiDung/dang-nhap', '/TaiKhoan/dang-nhap', '/auth/dang-nhap',
      '/Auth/dangnhap', '/NguoiDung/dangnhap', '/TaiKhoan/dangnhap', '/auth/dangnhap',
      // English common
      '/Auth/login', '/auth/login', '/Account/login', '/account/login', '/login', '/Login',
      // Legacy in this repo
      '/users/login', '/Users/login'
    ];
    const res = await this.requestWithFallback<any>(candidates, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body });

    const token: string | undefined = res?.token ?? res?.data?.token;
    if (!token) throw new Error('Đăng nhập thất bại: thiếu token');

    this.token = token;
    localStorage.setItem('authToken', token);
    if (res?.user) localStorage.setItem('currentUser', JSON.stringify(res.user));

    return { message: res?.message, token, user: res?.user } as AuthLoginResponse;
  }

  async authRegister(req: AuthRegisterRequest): Promise<any> {
    const body = JSON.stringify({
      hoTen: req.hoTen,
      email: req.email,
      matKhau: req.matKhau,
      // compatibility fields
      username: req.hoTen,
      password: req.matKhau,
      passwordHash: req.matKhau
    });
    const candidates = [
      ...(REGISTER_PATH_ENV ? [REGISTER_PATH_ENV] : []),
      '/Auth/dang-ky', '/NguoiDung/dang-ky', '/TaiKhoan/dang-ky', '/auth/dang-ky',
      '/Auth/dangky', '/NguoiDung/dangky', '/TaiKhoan/dangky', '/auth/dangky',
      '/Auth/register', '/auth/register', '/Account/register', '/account/register', '/register', '/Register',
      '/users/register', '/Users/register'
    ];
    return this.requestWithFallback<any>(candidates, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body });
  }

  async updateProfile(profileData: Record<string, unknown>): Promise<any> {
    const body = JSON.stringify(profileData);
    const headers = { 'Content-Type': 'application/json', 'Accept': '*/*' };
    const endpointGroups = [
      {
        method: 'PUT',
        endpoints: [
          '/NguoiDung/cap-nhat',
          '/NguoiDung/cap-nhat-ho-so',
          '/NguoiDung/update',
          '/NguoiDung/profile',
          '/TaiKhoan/cap-nhat',
          '/TaiKhoan/profile',
          '/Auth/cap-nhat',
          '/auth/profile',
          '/users/profile',
          '/users/me',
          '/Users/profile',
          '/Account/profile',
        ],
      },
      {
        method: 'PATCH',
        endpoints: [
          '/NguoiDung/cap-nhat',
          '/NguoiDung/cap-nhat-ho-so',
          '/NguoiDung/update',
          '/NguoiDung/profile',
          '/TaiKhoan/cap-nhat',
          '/TaiKhoan/profile',
          '/Auth/cap-nhat',
          '/auth/profile',
          '/users/profile',
          '/users/me',
          '/Users/profile',
          '/Account/profile',
        ],
      },
      {
        method: 'POST',
        endpoints: [
          '/NguoiDung/cap-nhat',
          '/NguoiDung/cap-nhat-ho-so',
          '/NguoiDung/update',
          '/NguoiDung/profile',
          '/TaiKhoan/cap-nhat',
          '/TaiKhoan/profile',
          '/Auth/cap-nhat',
          '/auth/profile',
          '/users/profile',
          '/users/me',
          '/Users/profile',
          '/Account/profile',
        ],
      },
    ];

    let lastError: unknown = null;
    for (const group of endpointGroups) {
      try {
        return await this.requestWithFallback<any>(group.endpoints, {
          method: group.method,
          headers,
          body,
        });
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }
    throw new Error('Failed to update profile');
  }

  // Utility methods
  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    const tok = this.token || localStorage.getItem('authToken');
    return !!tok;
  }

  getCurrentUserId(): number {
    return 4; // Fixed userId for testing
  }
}

// Export singleton instance
export const apiService = new ApiService();
