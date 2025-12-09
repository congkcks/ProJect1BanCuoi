// Prefer same-origin '/api' in dev to leverage Vite proxy and cookies
let __API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
if (typeof window !== 'undefined') {
  const origin = window.location.origin;
  const onLocalDev = /localhost:8080$/.test(origin) || /127\.0\.0\.1:8080$/.test(origin);
  const forceProxy = ((import.meta as any).env?.VITE_DEV_PROXY ?? 'true') !== 'false';
  if (onLocalDev && forceProxy) {
    __API_BASE_URL = '/api';
  }
}
const API_BASE_URL = __API_BASE_URL || 'http://localhost:5153/api';
if (typeof window !== 'undefined') {
  console.info('[API] base url', API_BASE_URL);
}
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
  exerciseId: any;
  planId: string;
  lessonId: string | null;
  title: string;
  description?: string | null;
  status: 'Completed' | 'Pending' | 'InProgress';
  startTime: string;
  endTime: string;
  contentType?: string | null;
  progressPercent?: number;
}

export interface Badge {
  badgeId: string;
  badgeName: string;
  description?: string;
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

export interface AdminDashboardOverview {
  totalUsers: number;
  totalLessons: number;
  listeningLessons: number;
  readingLessons: number;
  writingLessons: number;
  lastUpdated?: string;
}

// Tien do hoc tap (progress) types
export interface TienDoHocTapItem {
  maTienDo: number | string;
  maBai: string;
  tenBai: string;
  maLoTrinh: string;
  trangThai: string;
  ngayHoanThanh?: string | null;
  ngayCapNhat?: string | null;
  thoiGianHocPhut: number;
  phanTramHoanThanh: number;
}

export interface TienDoHocTapListResponse {
  message?: string;
  total: number;
  data: TienDoHocTapItem[];
}

export interface UpdateTienDoPayload {
  trangThai?: string;
  thoiGianHocPhut?: number;
  phanTramHoanThanh?: number;
}

export interface AdminUser {
  maNd: string;
  hoTen: string;
  email: string;
  matKhau?: string | null;
  vaiTro?: string | null;
  soDienThoai?: string | null;
  ngayDangKy?: string | null;
  lanDangNhapCuoi?: string | null;
  anhDaiDien?: string | null;
}

export interface AdminUserCreatePayload {
  hoTen: string;
  email: string;
  matKhau: string;
  vaiTro?: string;
  soDienThoai?: string;
}

export interface AdminUserUpdatePayload {
  hoTen?: string;
  email?: string;
  matKhau?: string;
  vaiTro?: string;
  soDienThoai?: string | null;
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
  daHoanThanh?: boolean; // For authenticated users
}

export interface BaiVietItem {
  maBaiViet: string;
  maBai: string;
  tieuDe: string;
  deBai: string;
  baiMau?: string | null;
  soTuToiThieu?: number | null;
  soTuToiDa?: number | null;
  ngayTao: string;
  daHoanThanh?: boolean;
}

export interface BaiDocItem {
  maBaiDoc: string;
  maBai: string;
  tieuDe: string;
  doKho?: string | null;
  ngayTao: string;
  duongDanFileTxt: string;
  daHoanThanh?: boolean; // For authenticated users
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
  baiViets?: BaiVietItem[];
  daHoanThanhBaiHoc?: boolean; // For authenticated users
  _status?: 'completed' | 'current' | 'locked'; // UI state
}

export interface LessonsResponse {
  message: string;
  total: number;
  data: LessonItem[];
}

export type LessonContentType = 'listening' | 'reading' | 'writing';

export interface ListeningContentPayload {
  tieuDe: string;
  doKho?: string | null;
  duongDanAudio?: string | null;
  banGhiAm?: string | null;
}

export interface ReadingContentPayload {
  tieuDe: string;
  doKho?: string | null;
  duongDanFileTxt?: string | null;
  noiDung?: string | null;
}

export interface WritingContentPayload {
  tieuDe: string;
  deBai: string;
  baiMau?: string | null;
  soTuToiThieu?: number | null;
  soTuToiDa?: number | null;
}

export interface LessonContentPayload {
  type: LessonContentType;
  listening?: ListeningContentPayload;
  reading?: ReadingContentPayload;
  writing?: WritingContentPayload;
}

export interface CreateLessonPayload {
  maLoTrinh: string;
  tenBai: string;
  moTa?: string | null;
  thoiLuongPhut?: number | null;
  soThuTu?: number | null;
  content?: LessonContentPayload | null;
}

export interface UpdateLessonPayload extends Partial<CreateLessonPayload> {
  maLoTrinh?: string;
}

// Response for roadmap-specific lessons endpoint
export interface LessonsByRoadmapResponse {
  message?: string;
  maLoTrinh?: string;
  tenLoTrinh?: string;
  kyNangTrongTam?: string | string[] | null;
  chuDeBaiHoc?: string | string[] | null;
  tongSoBaiHoc?: number;
  data: LessonItem[];
}

// Lessons by Roadmap response (VN API)
export interface RoadmapLessonsResponse {
  message?: string;
  maLoTrinh: string;
  tenLoTrinh?: string;
  kyNangTrongTam?: string | string[] | null;
  chuDeBaiHoc?: string | string[] | null;
  tongSoBaiHoc?: number;
  data: Array<Partial<LessonItem> & {
    maBai: string;
    maLoTrinh: string;
    tenBai: string;
    moTa?: string | null;
    thoiLuongPhut?: number;
    soThuTu?: number;
    ngayTao?: string;
  }>;
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

export interface AdminAnswerPayload {
  nhanDapAn: string;
  noiDungDapAn: string;
  thuTuHienThi?: number | null;
  laDapAnDung: boolean;
}

export interface AdminQuestionPayload {
  noiDungCauHoi: string;
  giaiThich?: string | null;
  diem?: number | null;
  thuTuHienThi?: number | null;
  dapAns: AdminAnswerPayload[];
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
    this.token = this.getPersistedToken();
  }

  private getPersistedToken(): string | null {
    try {
      const keys = ['authToken', 'token', 'accessToken', 'jwt', 'jwtToken'];
      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val && val.trim().length > 0) {
          let t = val.trim().replace(/^"+|"+$/g, '');
          if (/^bearer\s+/i.test(t)) {
            t = t.replace(/^bearer\s+/i, '');
          }
          return t.trim();
        }
      }
    } catch {}
    return null;
  }

  private buildAuthHeader(): Record<string, string> {
    const tok = this.token || this.getPersistedToken();
    if (!tok) return {};
    const headerValue = /^bearer\s+/i.test(tok) ? tok : `Bearer ${tok}`;
    return { Authorization: headerValue };
  }

  // Lightweight request without Authorization header
  private async requestNoAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isGetOrHead = !options.method || /^(GET|HEAD)$/i.test(String(options.method));
    const baseHeaders: Record<string, string> = {
      'Accept': '*/*',
      ...(isGetOrHead ? {} : { 'Content-Type': 'application/json' }),
    };
    const config: RequestInit = {
      ...options,
      headers: {
        ...baseHeaders,
        //...authHeader,
        ...(options.headers || {}),
      },
    };
    const resp = await fetch(url, config);
    const contentType = resp.headers.get('content-type') ?? '';
    if (!resp.ok) {
      let payload: any = null;
      try {
        payload = contentType.includes('application/json') ? await resp.clone().json() : await resp.clone().text();
      } catch {}
      const err: any = new Error((payload && payload.message) || `API Error: ${resp.status}`);
      err.status = resp.status;
      err.payload = payload;
      err.endpoint = endpoint;
      throw err;
    }
    if (contentType.includes('application/json')) return (await resp.json()) as T;
    return (await resp.text()) as unknown as T;
  }

  private broadcastUnauthorized(): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('api:unauthorized'));
      } catch (error) {
        console.warn('Failed to emit unauthorized event', error);
      }
    }
  }

  // ---- Authenticated user profile ----
  async getProfile(): Promise<any> {
    // Prefer canonical backend route first
    const candidates = [
      '/NguoiDung/profile',
      '/NguoiDung/thong-tin',
      '/TaiKhoan/profile',
      '/Auth/profile',
      '/users/me',
      '/users/profile',
      '/Users/profile',
      '/Account/profile',
    ];
    return this.requestWithFallback<any>(candidates, { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  // Quick probe to determine if a valid session exists via cookie or token
  async checkSessionAuthenticated(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) return false;
      // For network errors treat as unknown -> false to keep UI safe
      return false;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    // Always re-hydrate token from localStorage in case instance state was lost
    const persisted = this.getPersistedToken() || '';
    if (!this.token && persisted) {
      this.token = persisted;
    }
    const authHeader = this.buildAuthHeader();
    const usedAuthHeader = Boolean((authHeader as Record<string, string>).Authorization);
    const isGetOrHead = !options.method || /^(GET|HEAD)$/i.test(String(options.method));
    const baseHeaders: Record<string, string> = {
      'Accept': '*/*',
      ...(isGetOrHead ? {} : { 'Content-Type': 'application/json' }),
    };
    const config: RequestInit = {
      ...options,
      headers: {
        ...baseHeaders,
        ...authHeader,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      // Debug outgoing Authorization header once per request (dev only)
      if (usedAuthHeader) {
        console.debug('[API] fetch', { url, hasAuth: usedAuthHeader, tokenPreview: (this.token || '').slice(0, 16), sentHeaders: config.headers });
      }
      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && usedAuthHeader) {
          // Suppress global unauthorized broadcast for non-critical endpoints (e.g., Dashboard),
          // to avoid logging the user out when a feature endpoint denies access.
          const profileProbe = /\/NguoiDung\/profile|\/NguoiDung\/thong-tin|\/Auth\/profile|\/users\/me|\/users\/profile|\/Users\/profile|\/Account\/profile/i.test(endpoint);
          const dashboardProbe = /\/(Dashboard|dashboard)(\/?|$)/i.test(endpoint);
          const criticalAuth = /\/(Auth|Account)\/(refresh|validate|verify|me)(\/?|$)/i.test(endpoint);
          const tokPreview = (this.token || '').toString().slice(0, 12);
          console.warn('[API] 401/403 with Authorization header', { endpoint, status: response.status, tokenPreview: tokPreview });
          if (criticalAuth && !profileProbe) {
            console.warn('[API] critical auth failure', { endpoint, status: response.status });
            this.broadcastUnauthorized();
          } else if (profileProbe || dashboardProbe) {
            console.debug('[API] unauthorized on non-critical endpoint – preserving session', { endpoint, status: response.status });
          } else {
            // Default safe behavior: keep session to prevent redirect loops; surface error to caller.
            console.warn('[API] unauthorized (suppressed logout)', { endpoint, status: response.status });
          }
        }
        let errorPayload: unknown = null;
        try {
          if (contentType.includes('application/json')) {
            errorPayload = await response.clone().json();
          } else {
            errorPayload = await response.clone().text();
          }
        } catch {
          // Ignore parse issues; payload stays null
        }

        const bodyMessage =
          (errorPayload && typeof errorPayload === 'object' && 'message' in (errorPayload as Record<string, unknown>))
            ? String((errorPayload as Record<string, unknown>).message)
            : (typeof errorPayload === 'string' && errorPayload.trim().length > 0 ? errorPayload : null);

        const error: any = new Error(bodyMessage || `API Error: ${response.status}`);
        error.status = response.status;
        error.payload = errorPayload;
        error.endpoint = endpoint;
        throw error;
      }

      if (response.status === 204 || response.status === 205) {
        return undefined as T;
      }

      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
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
        // Debug which endpoint is being attempted
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.debug('[API try]', `${API_BASE_URL}${ep}`);
        }
        return await this.request<T>(ep, options);
      } catch (e: any) {
        const status = e?.status as number | undefined;
        const isAuthFailure = status === 401 || status === 403;
        const isDashboard = /(\/Dashboard\/|\/dashboard\/|\/Dashboard$|\/dashboard$)/i.test(ep);
        const allowFallback =
          !status ||
          status === 404 ||
          status === 405 ||
          isAuthFailure ||
          isDashboard;

        if (!allowFallback) {
          throw e;
        }
        lastErr = e;
        // Log which endpoint failed for easier debugging
        console.warn('API fallback failed for endpoint:', `${API_BASE_URL}${ep}`, e);
        // continue to next endpoint
      }
    }
    if (lastErr instanceof Error) {
      (lastErr as any).endpointsTried = endpoints;
      throw lastErr;
    }

    const err = new Error(`All endpoints failed. Tried: ${endpoints.join(', ')}.`);
    (err as any).endpointsTried = endpoints;
    throw err;
  }

  private normalizePlanStatus(value: any): 'Completed' | 'Pending' | 'InProgress' {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (['completed', 'hoàn thành', 'hoan thanh'].includes(normalized)) {
      return 'Completed';
    }
  if (['inprogress', 'in-progress', 'in progress', 'đang học', 'dang hoc', 'đã mở khóa', 'da mo khoa', 'đã mở khoá', 'da mo khoá'].includes(normalized)) {
      return 'InProgress';
    }
    return 'Pending';
  }

  private normalizeLearningPlan(raw: any): LearningPlan {
    const planId = raw?.planId ?? raw?.PlanId ?? raw?.maLich ?? raw?.MaLich ?? `${Date.now()}`;
    const start = raw?.startTime ?? raw?.StartTime ?? raw?.ngayHoc ?? raw?.NgayHoc;
    const end = raw?.endTime ?? raw?.EndTime;
    const toNumber = (v: unknown): number | undefined => {
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
      return undefined;
    };

    const exerciseId = toNumber(
      raw?.exerciseId ?? raw?.ExerciseId ?? raw?.maBai ?? raw?.MaBai
    );

    return {
      exerciseId: exerciseId as any,
      planId: String(planId),
      lessonId: (raw?.lessonId ?? raw?.LessonId ?? raw?.maBai ?? raw?.MaBai ?? null) as string | null,
      title: (raw?.title ?? raw?.Title ?? raw?.tenBai ?? raw?.TenBai ?? 'Bài học') as string,
      description: (raw?.description ?? raw?.Description ?? raw?.moTa ?? raw?.MoTa ?? null) as string | null,
      status: this.normalizePlanStatus(raw?.status ?? raw?.Status),
      startTime: typeof start === 'string' && start ? start : new Date().toISOString(),
      endTime: typeof end === 'string' && end ? end : new Date().toISOString(),
      contentType: (raw?.contentType ?? raw?.ContentType ?? raw?.loaiNoiDung ?? raw?.LoaiNoiDung ?? null) as string | null,
      progressPercent:
        typeof raw?.progressPercent === 'number'
          ? raw.progressPercent
          : (typeof raw?.ProgressPercent === 'number' ? raw.ProgressPercent : undefined),
    };
  }

  // User API
  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; userId: number }> {
    // Chuyển sang dùng authLogin (chuẩn backend /Auth/dang-nhap hoặc /Auth/login) để bảo đảm token hợp lệ
    const result = await this.authLogin(credentials.email, credentials.password);
    const token = result.token;
    const userObj: any = result.user;
    const userId = typeof userObj === 'object' ? this.extractUserIdentifier(userObj) : null;
    if (!userId) {
      // fallback: cố gắng lấy từ JWT payload
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadRaw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const padded = payloadRaw + '='.repeat((4 - (payloadRaw.length % 4)) % 4);
          const binary = atob(padded);
          const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
          const json = JSON.parse(new TextDecoder('utf-8').decode(bytes));
          const claimId = json['nameid'] || json['sub'] || json['MaNd'] || json['maNd'];
          if (claimId) {
            localStorage.setItem('userId', String(claimId));
          }
        }
      } catch {}
    } else {
      localStorage.setItem('userId', userId);
    }
    this.token = token;
    localStorage.setItem('authToken', token);
    if (userObj) localStorage.setItem('currentUser', JSON.stringify(userObj));
    return { token, userId: Number(userId) || 0 };
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
    return this.request<Exercise[]>(`/users/${userId}/exercises/pending`);
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
  async getLearningPlan(userId?: string): Promise<LearningPlan[]> {
    const targets = [
      '/Dashboard/today',
      '/dashboard/today',
      ...(userId ? [
        `/Dashboard/today/${encodeURIComponent(userId)}`,
        `/dashboard/today/${encodeURIComponent(userId)}`
      ] : [])
    ];
    const raw = await this.requestWithFallback<any>(targets, { method: 'GET', headers: { 'Accept': '*/*' } });
    const payload = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return payload.map((item: any) => this.normalizeLearningPlan(item));
  }

  // Badges API
  async getUserBadges(userId?: string): Promise<Badge[]> {
    const targets = [
      '/Dashboard/badges',
      '/dashboard/badges',
      ...(userId ? [
        `/Dashboard/badges/${encodeURIComponent(userId)}`,
        `/dashboard/badges/${encodeURIComponent(userId)}`
      ] : [])
    ];
    const raw = await this.requestWithFallback<any>(targets, { method: 'GET', headers: { 'Accept': '*/*' } });
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const fallbackId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return items.map((item: any) => ({
      badgeId: String(item?.badgeId ?? item?.BadgeId ?? fallbackId),
      badgeName: item?.badgeName ?? item?.BadgeName ?? 'Huy hiệu',
      description: item?.description ?? item?.Description ?? undefined,
      awardedAt: item?.awardedAt ?? item?.AwardedAt ?? new Date().toISOString(),
    }));
  }

  // Dashboard API
  async getDashboardSummary(userId?: string): Promise<DashboardSummary> {
    const targets = [
      '/Dashboard/summary',
      '/dashboard/summary',
      ...(userId ? [
        `/Dashboard/summary/${encodeURIComponent(userId)}`,
        `/dashboard/summary/${encodeURIComponent(userId)}`
      ] : [])
    ];
    const res = await this.requestWithFallback<any>(targets, { method: 'GET', headers: { 'Accept': '*/*' } });
    return (res?.data ?? res) as DashboardSummary;
  }

  async getDashboardProgress(userId?: string): Promise<DashboardProgress> {
    const targets = [
      '/Dashboard/progress',
      '/dashboard/progress',
      ...(userId ? [
        `/Dashboard/progress/${encodeURIComponent(userId)}`,
        `/dashboard/progress/${encodeURIComponent(userId)}`
      ] : [])
    ];
    const res = await this.requestWithFallback<any>(targets, { method: 'GET', headers: { 'Accept': '*/*' } });
    return (res?.data ?? res) as DashboardProgress;
  }

  async getDashboardToday(userId?: string): Promise<LearningPlan[]> {
    return this.getLearningPlan(userId);
  }

  async getDashboardRecentResults(userId?: string): Promise<RecentResult[]> {
    const targets = [
      '/Dashboard/recent-results',
      '/dashboard/recent-results',
      ...(userId ? [
        `/Dashboard/recent-results/${encodeURIComponent(userId)}`,
        `/dashboard/recent-results/${encodeURIComponent(userId)}`
      ] : [])
    ];
    const res = await this.requestWithFallback<any>(targets, { method: 'GET', headers: { 'Accept': '*/*' } });
    const payload = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return payload.map((item: any) => ({
      exercise: item?.exercise ?? item?.Exercise ?? 'Bài tập',
      score: typeof item?.score === 'number' ? item.score : (typeof item?.Score === 'number' ? item.Score : 0),
    }));
  }

  async getDashboardStats(userId?: string): Promise<DashboardStats> {
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

  async getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
    const res = await this.requestWithFallback<any>([
      '/Dashboard/admin-overview',
      '/dashboard/admin-overview',
      '/ThongKe/admin-overview',
      '/thongke/admin-overview',
      '/ThongKe/overview',
      '/thongke/overview'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
    return (res?.data ?? res) as AdminDashboardOverview;
  }

  async getUserCountMetric(): Promise<number> {
    const payload = await this.requestWithFallback<any>([
      '/ThongKe/users/count',
      '/thongke/users/count',
      '/NguoiDung/count',
      '/nguoidung/count'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });

    if (typeof payload === 'number') {
      return payload;
    }
    if (payload?.data && typeof payload.data.count === 'number') {
      return payload.data.count;
    }
    if (typeof payload?.count === 'number') {
      return payload.count;
    }
    return 0;
  }

  // TienDoHocTap (Progress) APIs
  async getAllTienDo(): Promise<TienDoHocTapListResponse> {
    return this.requestWithFallback<TienDoHocTapListResponse>([
      '/TienDoHocTap',
      '/tiendohocTap',
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  async getTienDoByBai(maBai: string): Promise<TienDoHocTapItem> {
    const res = await this.requestWithFallback<any>([
      `/TienDoHocTap/bai/${encodeURIComponent(maBai)}`,
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
    return (res?.data ?? res) as TienDoHocTapItem;
  }

  async getTienDoByLoTrinh(maLoTrinh: string): Promise<TienDoHocTapListResponse> {
    const res = await this.requestWithFallback<any>([
      `/TienDoHocTap/lotrinh/${encodeURIComponent(maLoTrinh)}`,
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
    return (res?.data ? { total: (res?.total ?? (res?.data?.length ?? 0)), data: res.data } : res) as TienDoHocTapListResponse;
  }

  async updateTienDo(maBai: string, payload: UpdateTienDoPayload): Promise<TienDoHocTapItem> {
    const res = await this.requestWithFallback<any>([
      `/TienDoHocTap/update/${encodeURIComponent(maBai)}`,
    ], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
      body: JSON.stringify(payload),
    });
    return (res?.data ?? res) as TienDoHocTapItem;
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
    // Backend canonical: GET /api/BaiHoc -> { message, total, data }
    return this.requestWithFallback<LessonsResponse>([
      '/BaiHoc',
      '/BaiHoc/danh-sach',
      '/baihoc',
      '/baihoc/danh-sach'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  // Auth-aware lessons + nested content + completion flags
  async getAllLessonsWithContent(): Promise<LessonsResponse> {
    // Canonical path (as provided in your backend): /BaiHoc/tat-ca-bai-hoc-noi-dung
    return this.requestWithFallback<LessonsResponse>([
      '/BaiHoc/tat-ca-bai-hoc-noi-dung',
      '/baihoc/tat-ca-bai-hoc-noi-dung'
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  // Public (no-auth) variant of the detailed lessons endpoint
  async getAllLessonsWithContentPublic(): Promise<LessonsResponse> {
    const candidates = [
      '/BaiHoc/tat-ca-bai-hoc-noi-dung',
      '/baihoc/tat-ca-bai-hoc-noi-dung'
    ];
    let lastErr: any = null;
    for (const ep of candidates) {
      try {
        return await this.requestNoAuth<LessonsResponse>(ep, { method: 'GET', headers: { 'Accept': '*/*' } });
      } catch (e) {
        lastErr = e;
        // eslint-disable-next-line no-console
        console.warn('[API no-auth detailed] failed', ep, e);
      }
    }
    throw lastErr || new Error('Detailed lessons (public) failed');
  }

  async createAdminLesson(payload: CreateLessonPayload): Promise<any> {
    return this.request<any>('/BaiHoc/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': '*/*', ...this.buildAuthHeader() },
      body: JSON.stringify(payload),
    });
  }

  async updateAdminLesson(maBai: string, payload: UpdateLessonPayload): Promise<any> {
    return this.request<any>(`/BaiHoc/admin/${encodeURIComponent(maBai)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': '*/*', ...this.buildAuthHeader() },
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminLesson(maBai: string): Promise<any> {
    return this.request<any>(`/BaiHoc/admin/${encodeURIComponent(maBai)}`, {
      method: 'DELETE',
      headers: { 'Accept': '*/*', ...this.buildAuthHeader() },
    });
  }

  async createReadingQuestion(maBaiDoc: string, payload: AdminQuestionPayload): Promise<any> {
    return this.request<any>(`/BaiDoc/${encodeURIComponent(maBaiDoc)}/admin/cau-hoi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': '*/*', ...this.buildAuthHeader() },
      body: JSON.stringify(payload),
    });
  }

  async deleteReadingQuestion(maBaiDoc: string, maCauHoi: string): Promise<void> {
    await this.request<void>(`/BaiDoc/${encodeURIComponent(maBaiDoc)}/admin/cau-hoi/${encodeURIComponent(maCauHoi)}`, {
      method: 'DELETE',
      headers: { 'Accept': '*/*', ...this.buildAuthHeader() },
    });
  }

  async createListeningQuestion(maBaiNghe: string, payload: AdminQuestionPayload): Promise<any> {
    return this.request<any>(`/BaiNghe/${encodeURIComponent(maBaiNghe)}/admin/cau-hoi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': '*/*', ...this.buildAuthHeader() },
      body: JSON.stringify(payload),
    });
  }

  async deleteListeningQuestion(maBaiNghe: string, maCauHoi: string): Promise<void> {
    await this.request<void>(`/BaiNghe/${encodeURIComponent(maBaiNghe)}/admin/cau-hoi/${encodeURIComponent(maCauHoi)}`, {
      method: 'DELETE',
      headers: { 'Accept': '*/*', ...this.buildAuthHeader() },
    });
  }
  

  async getLessonsByRoadmap(maLoTrinh: string): Promise<RoadmapLessonsResponse> {
    const encoded = encodeURIComponent(maLoTrinh);
    // Canonical: /BaiHoc/lo-trinh/{maLoTrinh}
    return this.requestWithFallback<RoadmapLessonsResponse>([
      `/BaiHoc/lo-trinh/${encoded}`,
      `/BaiHoc/lo-trinh?maLoTrinh=${encoded}`,
      `/baihoc/lo-trinh/${encoded}`,
      `/baihoc/lo-trinh?maLoTrinh=${encoded}`
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
  }

  // Get lessons by roadmap with user-specific completion status (authenticated)
  async getLessonsByRoadmapWithStatus(maLoTrinh: string): Promise<any> {
    // Backend endpoint: GET /api/LoTrinh/co-san/{maLoTrinh}/bai-hoc-noi-dung with user completion data
    const encoded = encodeURIComponent(maLoTrinh);
    const candidates = [
      `/LoTrinh/co-san/${encoded}/bai-hoc-noi-dung`,
      `/loTrinh/co-san/${encoded}/bai-hoc-noi-dung`,
      `/BaiHoc/lo-trinh/${encoded}`,
      `/baihoc/lo-trinh/${encoded}`
    ];
    const res = await this.requestWithFallback<any>(candidates, { method: 'GET', headers: { 'Accept': '*/*' } });
    // Return full response object, not just .data, so component can extract metadata
    return res ?? res?.data;
  }

  async getReadingLessonsByRoadmap(maLoTrinh: string): Promise<{ message?: string; maLoTrinh?: string; tenLoTrinh?: string; kyNangTrongTam?: any; chuDeBaiHoc?: any; total?: number; data: BaiDocItem[] }> {
    const encoded = encodeURIComponent(maLoTrinh);
    const res = await this.requestWithFallback<any>([
      `/BaiDoc/lo-trinh/${encoded}`,
      `/BaiDoc/lo-trinh?maLoTrinh=${encoded}`,
      `/baidoc/lo-trinh/${encoded}`,
      `/baidoc/lo-trinh?maLoTrinh=${encoded}`
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
    // Normalize envelope shapes
    const data = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(data)) {
      return { data: data as BaiDocItem[], total: data.length };
    }
    return {
      message: data?.message ?? res?.message,
      maLoTrinh: data?.maLoTrinh ?? maLoTrinh,
      tenLoTrinh: data?.tenLoTrinh,
      kyNangTrongTam: data?.kyNangTrongTam,
      chuDeBaiHoc: data?.chuDeBaiHoc,
      total: data?.total ?? (Array.isArray(data?.data) ? data.data.length : 0),
      data: (data?.data ?? []) as BaiDocItem[]
    };
  }

  async getListeningLessonsByRoadmap(maLoTrinh: string): Promise<{ message?: string; maLoTrinh?: string; tenLoTrinh?: string; total?: number; data: BaiNgheItem[] }> {
    const encoded = encodeURIComponent(maLoTrinh);
    const res = await this.requestWithFallback<any>([
      `/BaiNghe/lo-trinh/${encoded}`,
      `/BaiNghe/lo-trinh?maLoTrinh=${encoded}`,
      `/bainghe/lo-trinh/${encoded}`,
      `/bainghe/lo-trinh?maLoTrinh=${encoded}`
    ], { method: 'GET', headers: { 'Accept': '*/*' } });
    const data = res?.data?.data ?? res?.data ?? res;
    if (Array.isArray(data)) {
      return { data: data as BaiNgheItem[], total: data.length };
    }
    return {
      message: data?.message ?? res?.message,
      maLoTrinh: data?.maLoTrinh ?? maLoTrinh,
      tenLoTrinh: data?.tenLoTrinh,
      total: data?.total ?? (Array.isArray(data?.data) ? data.data.length : 0),
      data: (data?.data ?? []) as BaiNgheItem[]
    };
  }

  async getLessonDetail(maBai: string): Promise<LessonDetailResponse> {
    // Backend canonical: GET /api/BaiHoc/{maBai}
    return this.requestWithFallback<LessonDetailResponse>([
      `/BaiHoc/${maBai}`,
      `/BaiHoc/chi-tiet/${maBai}`,
      `/baihoc/${maBai}`,
      `/baihoc/chi-tiet/${maBai}`
    ]);
  }

  // Get detailed lesson with completion status (authenticated)
  async getLessonDetailWithStatus(maBai: string): Promise<any> {
    // Backend canonical: GET /api/BaiHoc/{maBai}/bai-doc-nghe (with user-specific completion data)
    const candidates = [
      `/BaiHoc/${encodeURIComponent(maBai)}/bai-doc-nghe`,
      `/baihoc/${encodeURIComponent(maBai)}/bai-doc-nghe`,
      `/BaiHoc/${encodeURIComponent(maBai)}/chi-tiet-nguoi-dung`,
      `/BaiHoc/${encodeURIComponent(maBai)}/trang-thai`,
      `/BaiHoc/${encodeURIComponent(maBai)}`,
      `/baihoc/${encodeURIComponent(maBai)}/chi-tiet-nguoi-dung`,
      `/baihoc/${encodeURIComponent(maBai)}/trang-thai`,
      `/baihoc/${encodeURIComponent(maBai)}`
    ];
    const res = await this.requestWithFallback<any>(candidates, { method: 'GET', headers: { 'Accept': '*/*' } });
    return res?.data ?? res;
  }

  async getReadingDocDetail(maBaiDoc: string): Promise<ReadingDocDetailResponse> {
    // Backend canonical: GET /api/BaiDoc/{maBaiDoc}
    const res = await this.requestWithFallback<any>([
      `/BaiDoc/${maBaiDoc}`,
      `/BaiDoc/chi-tiet/${maBaiDoc}`,
      `/baidoc/${maBaiDoc}`,
      `/baidoc/chi-tiet/${maBaiDoc}`
    ]);
    return res?.data ?? res;
  }

  async getListeningDetail(maBaiNghe: string): Promise<ListeningDocDetail> {
    // Backend canonical: GET /api/BaiNghe/{maBaiNghe}
    const res: any = await this.requestWithFallback<any>([
      `/BaiNghe/${maBaiNghe}`,
      `/BaiNghe/chi-tiet/${maBaiNghe}`,
      `/BaiNghe/chi-tiet?maBaiNghe=${encodeURIComponent(maBaiNghe)}`,
      `/bainghe/${maBaiNghe}`,
      `/bainghe/chi-tiet/${maBaiNghe}`,
      `/bainghe/chi-tiet?maBaiNghe=${encodeURIComponent(maBaiNghe)}`
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
      // Only canonical backend endpoints to avoid accepting tokens from another legacy/auth service
      ...(LOGIN_PATH_ENV ? [LOGIN_PATH_ENV] : []),
      '/Auth/dang-nhap',
      '/Auth/login'
    ];
    const res = await this.requestWithFallback<any>(candidates, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body });

    const token: string | undefined = res?.token ?? res?.data?.token;
    if (!token) throw new Error('Đăng nhập thất bại: thiếu token');

    const cleaned = String(token).replace(/^"+|"+$/g, '').trim();
    this.token = cleaned;
    localStorage.setItem('authToken', cleaned);
    console.info('[API] stored token after login', token.slice(0, 16));
    if (res?.user) localStorage.setItem('currentUser', JSON.stringify(res.user));

    // Basic JWT structure validation (3 parts). If it fails we treat token as invalid early.
    const parts = cleaned.split('.');
    if (parts.length !== 3) {
      console.error('[API] token format invalid (expected 3 JWT parts)', cleaned);
      throw new Error('Token không hợp lệ từ máy chủ. Vui lòng thử đăng nhập lại.');
    }

    // Notify app listeners in this tab
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('auth:token-updated'));
        window.dispatchEvent(new CustomEvent('auth:logged-in'));
      }
    } catch {}

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
    // Keep it tight and aligned with backend:
    // - Primary: PUT /NguoiDung/profile
    // - Secondary: PUT /NguoiDung/cap-nhat
    // - Tertiary: PATCH /NguoiDung/profile
    // - Last resort: POST /NguoiDung/cap-nhat (supported in backend)
    // - New unified self endpoint: PUT /NguoiDung/me (updates profile + optional password)
    const endpointGroups = [
      { method: 'PUT', endpoints: ['/NguoiDung/me', '/NguoiDung/profile', '/NguoiDung/cap-nhat'] },
      { method: 'PATCH', endpoints: ['/NguoiDung/profile'] },
      { method: 'POST', endpoints: ['/NguoiDung/cap-nhat'] },
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
        // eslint-disable-next-line no-console
        console.warn('[API updateProfile] failed group', group.method, error);
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }
    throw new Error('Failed to update profile');
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword?: string): Promise<any> {
    const confirmationValue = confirmPassword ?? newPassword;
    const body = JSON.stringify({
      matKhauHienTai: currentPassword,
      matKhauCu: currentPassword,
      currentPassword,
      matKhauMoi: newPassword,
      newPassword,
      xacNhanMatKhauMoi: confirmationValue,
      confirmPassword: confirmationValue,
    });
    // Try /me with PUT first, then fall back to dedicated change-password endpoints with POST.
    try {
      return await this.request<any>('/NguoiDung/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
        body,
      });
    } catch (e: any) {
      if (e?.status && ![404, 405, 400].includes(e.status)) {
        // Surface unexpected failures (e.g. 500). Known validation issues fall through to POST handlers.
        throw e;
      }
    }

    const candidates = [
      '/Auth/doi-mat-khau',
      '/Auth/change-password',
      '/NguoiDung/doi-mat-khau',
      '/NguoiDung/change-password',
      '/nguoidung/doi-mat-khau',
      '/NguoiDung/doi-matkhau',
      '/TaiKhoan/doi-mat-khau',
      '/users/change-password',
      '/Users/change-password',
    ];

    let lastError: any = null;
    for (const endpoint of candidates) {
      try {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.debug('[API try]', `${API_BASE_URL}${endpoint}`);
        }
        return await this.request<any>(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
          body,
        });
      } catch (error: any) {
        lastError = error;
        const status = error?.status;
        const allowFallback = status === 401 || status === 403 || status === 404 || status === 405;
        if (!allowFallback) {
          throw error;
        }
        // eslint-disable-next-line no-console
        console.warn('API fallback failed for endpoint:', `${API_BASE_URL}${endpoint}`, error);
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('Không thể đổi mật khẩu.');
  }

  async adminListUsers(search?: string): Promise<{ users: AdminUser[]; total: number }> {
    // Backend canonical: GET /api/NguoiDung?search=... (Admin only)
    // Fallback: GET /api/Auth/admin/users (no search support)
    const candidates: string[] = [];
    if (search && search.trim().length > 0) {
      candidates.push(`/NguoiDung?search=${encodeURIComponent(search.trim())}`);
    }
    candidates.push('/NguoiDung');
    candidates.push('/Auth/admin/users');

    const response = await this.requestWithFallback<any>(candidates, {
      method: 'GET',
      headers: { Accept: '*/*' },
    });

    const rawItems = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

    const total = typeof response?.total === 'number' ? response.total : rawItems.length;
    const users = rawItems.map((item: any) => {
      try {
        return this.normalizeAdminUser(item);
      } catch (err) {
        console.warn('[ADMIN users] skip invalid payload item', item, err);
        return null;
      }
    }).filter(Boolean) as AdminUser[];
    return { users, total };
  }

  async adminGetUser(maNd: string): Promise<AdminUser> {
    const candidates = [
      `/NguoiDung/${encodeURIComponent(maNd)}`,
      `/Auth/admin/users/${encodeURIComponent(maNd)}`
    ];
    const response = await this.requestWithFallback<any>(candidates, {
      method: 'GET',
      headers: { Accept: '*/*' },
    });
    return this.normalizeAdminUser(response);
  }

  async adminGetNextUserId(role?: string): Promise<string> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    const candidates = [`/NguoiDung/next-id${query}`];
    const response = await this.requestWithFallback<any>(candidates, {
      method: 'GET',
      headers: { Accept: '*/*' },
    });

    if (typeof response === 'string') {
      return response;
    }

    const value = response?.maNd ?? response?.MaNd ?? response?.nextId ?? response?.NextId;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    throw new Error('Không thể tạo mã người dùng mới.');
  }

  async adminCreateUser(payload: AdminUserCreatePayload): Promise<AdminUser> {
    const candidates = ['/NguoiDung'];
    const response = await this.requestWithFallback<any>(candidates, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
      body: JSON.stringify(payload),
    });
    return this.normalizeAdminUser(response?.data ?? response);
  }

  async adminUpdateUser(maNd: string, payload: AdminUserUpdatePayload): Promise<AdminUser> {
    const candidates = [
      `/NguoiDung/${encodeURIComponent(maNd)}`
    ];
    const response = await this.requestWithFallback<any>(candidates, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
      body: JSON.stringify(payload),
    });
    return this.normalizeAdminUser(response?.data ?? response);
  }

  async adminDeleteUser(maNd: string): Promise<void> {
    const candidates = [
      `/NguoiDung/${encodeURIComponent(maNd)}`
    ];
    await this.requestWithFallback<void>(candidates, {
      method: 'DELETE',
      headers: { Accept: '*/*' },
    });
  }

  // Utility methods
  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    const tok = this.token || this.getPersistedToken();
    return !!tok;
  }

  private extractUserIdentifier(candidate: any): string | null {
    if (!candidate || typeof candidate !== 'object') {
      return null;
    }

    const keys = ['ma_nd', 'maNd', 'maNguoiDung', 'maND', 'userId', 'id'];
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(candidate, key)) {
        const value = (candidate as Record<string, unknown>)[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return String(value);
        }
      }
    }

    return null;
  }

  private normalizeAdminUser(payload: any): AdminUser {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid admin user payload');
    }

    const resolveString = (value: unknown): string | null => {
      if (value === undefined || value === null) return null;
      return String(value);
    };

    const maNd = resolveString(
      payload.maNd ?? payload.MaNd ?? payload.ma_nd ?? payload.MA_ND ?? payload.id
    );

    if (!maNd) {
      throw new Error('Missing user id in payload');
    }

    const email =
      resolveString(payload.email ?? payload.Email ?? payload.emailAddress) ?? '';
    const hoTen =
      resolveString(payload.hoTen ?? payload.HoTen ?? payload.name ?? payload.fullName) ?? '';

    return {
      maNd,
      hoTen,
      email,
      matKhau: resolveString(payload.matKhau ?? payload.MatKhau ?? payload.passwordHash ?? payload.password),
      vaiTro: resolveString(payload.vaiTro ?? payload.VaiTro ?? payload.role),
      soDienThoai: resolveString(payload.soDienThoai ?? payload.SoDienThoai ?? payload.so_dien_thoai),
      ngayDangKy: resolveString(payload.ngayDangKy ?? payload.NgayDangKy ?? payload.createdAt),
      lanDangNhapCuoi: resolveString(payload.lanDangNhapCuoi ?? payload.LanDangNhapCuoi ?? payload.lastLoginAt),
      anhDaiDien: resolveString(payload.anhDaiDien ?? payload.AnhDaiDien ?? payload.avatarUrl),
    };
  }

  getCurrentUserId(): string {
    try {
      const rawUser = localStorage.getItem('currentUser');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const fromUser = this.extractUserIdentifier(parsed);
        if (fromUser) {
          return fromUser;
        }
      }
    } catch (error) {
      console.warn('Failed to parse currentUser from storage', error);
    }

    const stored = localStorage.getItem('userId');
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }

    throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
  }
}

// Export singleton instance
export const apiService = new ApiService();

export const getUserCount = async (): Promise<number> => {
  try {
    return await apiService.getUserCountMetric();
  } catch (error) {
    console.error("getUserCount failed", error);
    throw new Error("Không thể lấy số lượng người dùng.");
  }
};
