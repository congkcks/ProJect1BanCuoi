import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen, Clock } from "lucide-react";
import { apiService, LessonItem, ReadingDocDetailResponse, CauHoiItem } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReadingLessonProps { lessonId?: string }
interface QuizOption { key: string; text: string; maDapAn?: number | string }
interface QuizQuestion { id: string; text: string; options: QuizOption[]; correctKey: string; explanation?: string | null }

function formatDuration(seconds?: number): string | null { if (!seconds && seconds !== 0) return null; if (seconds! < 0) return null; const m = Math.floor(seconds! / 60); const s = Math.floor(seconds! % 60); return `${m}m${s.toString().padStart(2,"0")}s`; }
function buildYouTubeEmbed(raw?: string): string | null { if (!raw) return null; const t = raw.trim(); if (!/(youtu\.be|youtube\.com)/i.test(t)) return null; try { const u = new URL(t); if (u.hostname.includes("youtu.be")) { const id = u.pathname.slice(1); return id ? `https://www.youtube.com/embed/${id}` : null; } if (u.hostname.includes("youtube.com")) { const v = u.searchParams.get("v"); if (v) return `https://www.youtube.com/embed/${v}`; if (u.pathname.startsWith("/embed/")) return t; const parts = u.pathname.split("/").filter(Boolean); const last = parts[parts.length-1]; if (last && last.length>=5) return `https://www.youtube.com/embed/${last}`; } } catch { return null } return null }

const ReadingLesson: React.FC<ReadingLessonProps> = ({ lessonId }) => {
  const navigate = useNavigate();
  const [lesson,setLesson]=useState<LessonItem|null>(null);
  const [docDetail,setDocDetail]=useState<ReadingDocDetailResponse|null>(null);
  const [selectedDocId,setSelectedDocId]=useState<string|null>(null); // chosen baiDoc when lessonId is BH...
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [questions,setQuestions]=useState<QuizQuestion[]>([]);
  const [currentIndex,setCurrentIndex]=useState(0);
  const [selectedOption,setSelectedOption]=useState<string|null>(null);
  const [showExplanation,setShowExplanation]=useState(false);
  const [isCorrect,setIsCorrect]=useState<boolean|null>(null);
  const [score,setScore]=useState(0);
  const [answeredState,setAnsweredState]=useState<Record<number,{evaluated:boolean;isCorrect:boolean}>>({});
  const [userAnswers,setUserAnswers]=useState<Record<number,string|null>>({});
  const [userAnswerDetails,setUserAnswerDetails]=useState<Record<number,{key:string;maDapAn:number|string}>>({});
  const [isSubmitting,setIsSubmitting]=useState(false);

  // Initial fetch: either doc directly or lesson shell with list of baiDocs
  useEffect(()=>{ let cancelled=false; (async()=>{ if(!lessonId){ setError("Thiếu mã bài học."); setLoading(false); return;} setLoading(true); setError(null);
    const isDocId=/^BD\d+/i.test(lessonId);
    try {
      if(isDocId){
        const doc=await apiService.getReadingDocDetail(lessonId);
        if(cancelled) return;
        setDocDetail(doc);
        setLesson({
          maBai: doc.maBai || lessonId,
          maLoTrinh: doc.maBai || '',
          tenBai: doc.tieuDe?.trim() || 'Bài đọc',
          moTa: doc.doKho || null,
          thoiLuongPhut: 30,
          soThuTu: 0,
          ngayTao: doc.ngayTao,
          videos: [],
          baiNghes: [],
          baiDocs: [doc]
        });
      } else {
        const detail=await apiService.getLessonDetail(lessonId);
        if(cancelled) return;
        setLesson(detail.data);
        // do NOT auto pick first doc; wait for user click -> selectedDocId
      }
    } catch(e:any){ if(!cancelled) setError(e?.message||"Lỗi tải dữ liệu bài học."); }
    finally { if(!cancelled) setLoading(false); }
  })(); return()=>{ cancelled=true }; },[lessonId]);

  // Fetch doc detail when a doc is selected from list
  useEffect(()=>{ let cancelled=false; (async()=>{ if(!selectedDocId) return; try { setLoading(true); const doc=await apiService.getReadingDocDetail(selectedDocId); if(cancelled) return; setDocDetail(doc); }
    catch(e:any){ if(!cancelled) setError(e?.message||"Không tải được bài đọc."); }
    finally { if(!cancelled) setLoading(false); }
  })(); return()=>{ cancelled=true }; },[selectedDocId]);

  useEffect(()=>{ if(!docDetail?.cauHois){ setQuestions([]); setCurrentIndex(0); return;} const mapped:QuizQuestion[]=docDetail.cauHois.slice().sort((a,b)=>(a.thuTuHienThi||0)-(b.thuTuHienThi||0)).map((q:CauHoiItem)=>{ const opts=(q.dapAns||[]).slice().sort((a,b)=>(a.thuTuHienThi||0)-(b.thuTuHienThi||0)).map(a=>({key:a.nhanDapAn,text:a.noiDungDapAn,maDapAn:a.maDapAn})); const correct=(q.dapAns||[]).find(d=>d.laDapAnDung); return { id:q.maCauHoi, text:q.noiDungCauHoi, options:opts, correctKey:correct?.nhanDapAn||"", explanation:q.giaiThich||null }; }).filter(q=>q.options.length>0&&q.correctKey); setQuestions(mapped); setCurrentIndex(0); setSelectedOption(null); setShowExplanation(false); setIsCorrect(null); setScore(0); setAnsweredState({}); setUserAnswers({}); setUserAnswerDetails({}); },[docDetail]);

  const currentQuestion=questions[currentIndex];
  const totalQuestions=questions.length;
  const progressPercent=totalQuestions?((currentIndex+1)/totalQuestions)*100:0;
  const lessonTag=lesson?.maLoTrinh|| (lessonId?.startsWith('BD') ? 'Doc' : 'Lesson');
  const videoDurationLabel=formatDuration(lesson?.videos?.[0]?.thoiLuongGiay);
  const youTubeEmbed=useMemo(()=>buildYouTubeEmbed(docDetail?.duongDanFileTxt),[docDetail?.duongDanFileTxt]);
  const youTubeSource=docDetail?.duongDanFileTxt?.trim();
  const readingPassage=docDetail?.noiDung && !youTubeEmbed ? docDetail.noiDung : (!youTubeEmbed ? docDetail?.duongDanFileTxt : "");

  const handleSelectOption=(key:string)=>{ if(showExplanation) return; const option=currentQuestion?.options.find(o=>o.key===key); setSelectedOption(key); setShowExplanation(false); setIsCorrect(null); setUserAnswers(p=>({...p,[currentIndex]:key})); if(option?.maDapAn) setUserAnswerDetails(p=>({...p,[currentIndex]:{key,maDapAn:option.maDapAn}})); };
  const evaluateCurrentQuestion=(displayExplanation:boolean):boolean|null=>{ if(!currentQuestion||!selectedOption){ if(displayExplanation){ setShowExplanation(true); setIsCorrect(false);} return null;} const prev=answeredState[currentIndex]; const result=selectedOption===currentQuestion.correctKey; if(!prev?.evaluated){ if(result) setScore(p=>p+1); setAnsweredState(p=>({...p,[currentIndex]:{evaluated:true,isCorrect:result}})); } const final=prev?.evaluated?prev.isCorrect:result; if(displayExplanation){ setIsCorrect(final); setShowExplanation(true);} else { setIsCorrect(null); setShowExplanation(false);} return final; };
  const handleCheckAnswer=()=>evaluateCurrentQuestion(true);
  const handleNextQuestion=()=>{ evaluateCurrentQuestion(false); if(currentIndex<totalQuestions-1){ setCurrentIndex(i=>i+1); setSelectedOption(null); setShowExplanation(false); setIsCorrect(null);} };
  
  const handleSubmitQuiz=async()=>{ if(!docDetail?.maBaiDoc){ alert("Lỗi: Không tìm thấy mã bài đọc."); return;} const allAnswered=questions.every((q,idx)=>userAnswerDetails[idx]!==undefined); if(!allAnswered){ alert("Vui lòng chọn đáp án cho tất cả các câu hỏi trước khi nộp bài."); return;} const traLois=questions.map((q,idx)=>({maCauHoi:q.id,maDapAn:userAnswerDetails[idx]?.maDapAn||0})); const payload={thoiGianLamGiay:0,traLois}; console.log("Submit payload:",JSON.stringify(payload,null,2)); const token=localStorage.getItem('authToken'); setIsSubmitting(true); try{ const response=await fetch(`http://localhost:5153/api/BaiDoc/submit/${docDetail.maBaiDoc}`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},body:JSON.stringify(payload)}); if(!response.ok){ const errorText=await response.text(); console.error("Submit error:",errorText); alert(`Lỗi nộp bài: ${response.status} - ${errorText}`); return;} const result=await response.json(); alert("Nộp bài thành công!"); navigate(-1);} catch(e:any){ console.error("Submit exception:",e); alert(`Lỗi: ${e?.message||"Không thể nộp bài."}`);} finally{ setIsSubmitting(false);} };

  if(loading) return <div className="p-6 text-center text-sm text-slate-500">Đang tải bài học...</div>;
  if(error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if(!lesson) return null;

  const isLessonShell = !/^BD\d+/i.test(lessonId || '') && (lesson.baiDocs?.length || 0) > 1 && !docDetail;
  const docsList = isLessonShell ? lesson.baiDocs || [] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 p-6 border-l-4 border-l-blue-600">
        <div className="flex items-center justify-between mb-3">
          <button type="button" className="text-sm text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1" onClick={()=>navigate(-1)}>
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1">{lessonTag}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{lesson.tenBai}</h1>
        {lesson.moTa && <p className="mt-2 text-sm text-slate-500">{lesson.moTa}</p>}
      </section>

      {/* If multiple docs under one lesson and none selected yet: show chooser */}
      {isLessonShell && (
        <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 p-6 space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" /> Bài đọc</h2>
            <p className="text-xs text-slate-500">Chọn 1 bài để bắt đầu</p>
          </div>
          <div className="space-y-3">
            {docsList.map(d=> (
              <div key={d.maBaiDoc} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-white hover:bg-slate-50">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" /> {d.tieuDe?.trim()}</div>
                  <span className="text-xs text-slate-500">{d.doKho || 'Mức độ'}</span>
                </div>
                <Button size="sm" variant="hero" onClick={()=> setSelectedDocId(d.maBaiDoc)}>Học ngay</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLessonShell && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
      <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Nội dung bài học</span>
          {(videoDurationLabel || docDetail?.doKho) && (
            <span className="text-xs text-slate-500 flex items-center gap-3">
              {videoDurationLabel && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {videoDurationLabel}</span>}
              {docDetail?.doKho && <Badge variant="outline" className="text-[10px]">{docDetail.doKho}</Badge>}
            </span>
          )}
        </div>
        {youTubeEmbed && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-tr from-sky-100 to-blue-50">
            <div className="relative pt-[56.25%]">
              <iframe src={youTubeEmbed} title={lesson.tenBai} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
        {!youTubeEmbed && youTubeSource && /(youtu\.be|youtube\.com)/i.test(youTubeSource) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Không nhúng được video. <a href={youTubeSource} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Mở trên YouTube</a>
          </div>
        )}
        {readingPassage && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-line">{readingPassage}</div>}
        {!readingPassage && !youTubeEmbed && <p className="text-sm text-slate-500">Chưa có nội dung hiển thị.</p>}
      </section>

      {currentQuestion ? (
        <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 border-t-4 border-t-blue-600 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-slate-900">Bài tập</span>
            <span className="text-xs text-slate-500">Câu {currentIndex + 1}/{totalQuestions}</span>
          </div>
          <Progress value={progressPercent} className="h-2 mb-4" />
          <p className="font-semibold mb-4 text-slate-900">{currentQuestion.text}</p>
          <div className="flex flex-col gap-2 mb-4">
            {currentQuestion.options.map(opt=>{ const isSelected=selectedOption===opt.key; const isOptionCorrect=showExplanation && opt.key===currentQuestion.correctKey; const isWrongSelected=showExplanation && isSelected && opt.key!==currentQuestion.correctKey; let cls="flex items-center gap-3 px-3 py-2 rounded-xl border text-sm cursor-pointer transition"; if(isOptionCorrect) cls+=" border-green-500 bg-green-50 text-green-900"; else if(isWrongSelected) cls+=" border-red-500 bg-red-50 text-red-900"; else if(isSelected) cls+=" border-blue-600 bg-blue-50 text-slate-900"; else cls+=" border-slate-200 text-slate-800 hover:border-blue-500 hover:bg-blue-50"; return (<label key={opt.key} className={cls}><input type="radio" name={`question-${currentQuestion.id}`} value={opt.key} checked={isSelected} onChange={()=>handleSelectOption(opt.key)} className="h-4 w-4 accent-blue-600" /><span className="text-sm"><strong className="mr-1">{opt.key}.</strong>{opt.text}</span></label>); })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex gap-2">
              {currentIndex < totalQuestions - 1 && <Button type="button" variant="outline" className="rounded-full" onClick={handleNextQuestion}>Câu tiếp theo</Button>}
            </div>
          </div>
          {showExplanation && (
            <div className={`mt-2 rounded-xl border-l-4 px-4 py-3 text-sm ${isCorrect?"border-l-green-600 bg-green-50 text-green-900":"border-l-red-600 bg-red-50 text-red-900"}`}>
              <p className="font-semibold mb-1">Giải thích:</p>
              <p>{currentQuestion.explanation || "Chưa có giải thích chi tiết."}</p>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow border border-slate-200 p-6 text-sm text-slate-500">Bài học này chưa có câu hỏi đọc hiểu. Vui lòng quay lại sau.</section>
      )}
        </div>

        {/* Questions list sidebar */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Danh sách câu hỏi ({totalQuestions})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((q,idx)=>{
                const isAnswered=userAnswers[idx]!==undefined&&userAnswers[idx]!==null;
                const isCurrent=idx===currentIndex;
                return (
                  <button key={q.id} onClick={()=>setCurrentIndex(idx)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${isCurrent?"bg-blue-600 text-white":"bg-slate-100 text-slate-700 hover:bg-slate-200"} ${isAnswered&&!isCurrent?"ring-2 ring-green-500":""}`}>
                    <div className="flex items-center justify-between">
                      <span>Câu {idx+1}</span>
                      {isAnswered && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button onClick={handleSubmitQuiz} className="w-full mt-4 rounded-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>{isSubmitting?"Đang nộp...":"Nộp bài"}</Button>
          </section>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReadingLesson;
