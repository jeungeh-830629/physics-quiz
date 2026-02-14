'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Atom, Zap, Thermometer, Lightbulb, Waves, ChevronRight, RotateCcw, Trophy, Target, BookOpen, Clock, CheckCircle2, XCircle, Eye, ArrowLeft } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import questionsData from '@/data/questions.json'

// Types
interface Question {
  id: number
  category: string
  subcategory: string
  question: string
  choices: string[]
  answer: number
  explanation: string
}

interface UserAnswer {
  questionId: number
  selectedAnswer: number | null
  isCorrect: boolean
}

interface QuizState {
  // Setup
  mode: 'random' | 'category' | null
  selectedCategory: string | null
  questionCount: number
  // Quiz
  currentQuestionIndex: number
  questions: Question[]
  userAnswers: UserAnswer[]
  selectedAnswer: number | null
  showExplanation: boolean
  // Results
  isCompleted: boolean
  // Actions
  setMode: (mode: 'random' | 'category') => void
  setSelectedCategory: (category: string | null) => void
  setQuestionCount: (count: number) => void
  startQuiz: (questions: Question[]) => void
  selectAnswer: (answer: number) => void
  nextQuestion: () => void
  resetQuiz: () => void
}

const useQuizStore = create<QuizState>((set) => ({
  mode: null,
  selectedCategory: null,
  questionCount: 10,
  currentQuestionIndex: 0,
  questions: [],
  userAnswers: [],
  selectedAnswer: null,
  showExplanation: false,
  isCompleted: false,
  setMode: (mode) => set({ mode, selectedCategory: null }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setQuestionCount: (count) => set({ questionCount: count }),
  startQuiz: (questions) => set({
    questions,
    currentQuestionIndex: 0,
    userAnswers: [],
    selectedAnswer: null,
    showExplanation: false,
    isCompleted: false
  }),
  selectAnswer: (answer) => set({ selectedAnswer: answer, showExplanation: true }),
  nextQuestion: () => set((state) => {
    const newAnswers = [...state.userAnswers, {
      questionId: state.questions[state.currentQuestionIndex].id,
      selectedAnswer: state.selectedAnswer,
      isCorrect: state.selectedAnswer === state.questions[state.currentQuestionIndex].answer
    }]
    
    if (state.currentQuestionIndex + 1 >= state.questions.length) {
      return { 
        userAnswers: newAnswers,
        isCompleted: true 
      }
    }
    
    return {
      currentQuestionIndex: state.currentQuestionIndex + 1,
      userAnswers: newAnswers,
      selectedAnswer: null,
      showExplanation: false
    }
  }),
  resetQuiz: () => set({
    mode: null,
    selectedCategory: null,
    questionCount: 10,
    currentQuestionIndex: 0,
    questions: [],
    userAnswers: [],
    selectedAnswer: null,
    showExplanation: false,
    isCompleted: false
  })
}))

// Category colors and icons
const categoryConfig: Record<string, { color: string; bgColor: string; icon: typeof Atom; gradient: string }> = {
  '역학': { color: '#3B82F6', bgColor: '#EFF6FF', icon: Atom, gradient: 'from-blue-500 to-blue-600' },
  '전자기학': { color: '#F59E0B', bgColor: '#FFFBEB', icon: Zap, gradient: 'from-amber-500 to-amber-600' },
  '열역학': { color: '#EF4444', bgColor: '#FEF2F2', icon: Thermometer, gradient: 'from-red-500 to-red-600' },
  '광학': { color: '#8B5CF6', bgColor: '#F5F3FF', icon: Lightbulb, gradient: 'from-violet-500 to-violet-600' },
  '파동': { color: '#10B981', bgColor: '#ECFDF5', icon: Waves, gradient: 'from-emerald-500 to-emerald-600' }
}

// Custom Tooltip for PieChart
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}: {payload[0].value}문제
        </p>
      </div>
    )
  }
  return null
}

// Start Screen Component
function StartScreen() {
  const { mode, selectedCategory, questionCount, setMode, setSelectedCategory, setQuestionCount, startQuiz } = useQuizStore()
  
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {}
    questionsData.forEach((q: Question) => {
      distribution[q.category] = (distribution[q.category] || 0) + 1
    })
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      ...categoryConfig[name]
    }))
  }, [])
  
  const availableQuestions = useMemo(() => {
    let filtered = [...questionsData] as Question[]
    if (mode === 'category' && selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }
    return filtered
  }, [mode, selectedCategory])
  
  const handleStart = useCallback(() => {
    let filtered = [...questionsData] as Question[]
    if (mode === 'category' && selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }
    // Shuffle
    const shuffled = filtered.sort(() => Math.random() - 0.5)
    // Limit count
    const selected = shuffled.slice(0, questionCount === 0 ? shuffled.length : questionCount)
    startQuiz(selected)
  }, [mode, selectedCategory, questionCount, startQuiz])
  
  const totalCount = (questionsData as Question[]).length
  const selectedCount = questionCount === 0 ? availableQuestions.length : Math.min(questionCount, availableQuestions.length)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <Atom className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">물리 퀴즈</h1>
          <p className="text-gray-600">총 {totalCount}문제로 구성된 물리 퀴즈입니다</p>
        </div>
        
        {/* Category Distribution Chart */}
        <Card className="mb-6 shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              영역별 문제 분포
            </CardTitle>
            <CardDescription className="text-blue-100">
              각 영역별 문제 수를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                {categoryDistribution.map((cat) => {
                  const IconComponent = cat.icon
                  return (
                    <div 
                      key={cat.name}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: cat.bgColor }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-sm text-gray-500">{cat.value}문제</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mode Selection */}
        <Card className="mb-6 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              퀴즈 모드 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('random')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  mode === 'random' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    mode === 'random' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">전체 랜덤</h3>
                    <p className="text-sm text-gray-500">모든 영역에서 무작위 출제</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setMode('category')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  mode === 'category' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    mode === 'category' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">영역별 선택</h3>
                    <p className="text-sm text-gray-500">특정 영역만 선택하여 학습</p>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Category Selection */}
            {mode === 'category' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-3">영역 선택</p>
                <div className="flex flex-wrap gap-2">
                  {categoryDistribution.map((cat) => {
                    const IconComponent = cat.icon
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === cat.name
                            ? 'text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                        style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs opacity-75">({cat.value})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Question Count Selection */}
        <Card className="mb-6 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              문제 수 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 0].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    questionCount === count
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count === 0 ? '전체' : `${count}문제`}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              선택된 문제 수: <span className="font-semibold text-blue-600">{selectedCount}문제</span>
            </p>
          </CardContent>
        </Card>
        
        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!mode || (mode === 'category' && !selectedCategory)}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 rounded-xl"
        >
          퀴즈 시작하기
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Quiz Screen Component
function QuizScreen() {
  const { 
    questions, 
    currentQuestionIndex, 
    selectedAnswer, 
    showExplanation,
    selectAnswer, 
    nextQuestion 
  } = useQuizStore()
  
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const catConfig = categoryConfig[currentQuestion.category] || categoryConfig['역학']
  const IconComponent = catConfig.icon
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge 
                className="px-3 py-1 text-white"
                style={{ backgroundColor: catConfig.color }}
              >
                {currentQuestion.category}
              </Badge>
              <span className="text-sm text-gray-500">{currentQuestion.subcategory}</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>
        
        {/* Question Card */}
        <Card className="shadow-xl border-0 mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl leading-relaxed font-medium">
                  {currentQuestion.question}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Choices */}
        <div className="space-y-3 mb-6">
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.answer
            const showResult = showExplanation
            
            let buttonClass = 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            if (showResult) {
              if (isCorrect) {
                buttonClass = 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-200'
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-red-50 border-2 border-red-400'
              }
            } else if (isSelected) {
              buttonClass = 'bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200'
            }
            
            return (
              <button
                key={index}
                onClick={() => !showExplanation && selectAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl text-left transition-all ${buttonClass} ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                    showResult && isCorrect 
                      ? 'bg-emerald-500 text-white' 
                      : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {showResult && isCorrect ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : showResult && isSelected && !isCorrect ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className={`font-medium leading-relaxed ${
                    showResult && isCorrect 
                      ? 'text-emerald-700' 
                      : showResult && isSelected && !isCorrect
                        ? 'text-red-700'
                        : 'text-gray-800'
                  }`}>
                    {choice}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Explanation */}
        {showExplanation && (
          <Card className="shadow-lg border-0 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">해설</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Next Button */}
        {showExplanation && (
          <Button
            onClick={nextQuestion}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 rounded-xl"
          >
            {currentQuestionIndex + 1 >= questions.length ? '결과 보기' : '다음 문제'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Result Screen Component
function ResultScreen() {
  const { questions, userAnswers, resetQuiz } = useQuizStore()
  const [showReview, setShowReview] = useState(false)
  const [selectedReviewQuestion, setSelectedReviewQuestion] = useState<number | null>(null)
  
  const correctCount = userAnswers.filter(a => a.isCorrect).length
  const accuracy = Math.round((correctCount / questions.length) * 100)
  
  // Category-wise accuracy
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {}
    
    questions.forEach((q, index) => {
      if (!stats[q.category]) {
        stats[q.category] = { total: 0, correct: 0 }
      }
      stats[q.category].total++
      if (userAnswers[index]?.isCorrect) {
        stats[q.category].correct++
      }
    })
    
    return Object.entries(stats).map(([name, data]) => ({
      name,
      total: data.total,
      correct: data.correct,
      accuracy: Math.round((data.correct / data.total) * 100),
      ...categoryConfig[name]
    }))
  }, [questions, userAnswers])
  
  // Wrong questions
  const wrongQuestions = useMemo(() => {
    return questions.filter((_, index) => !userAnswers[index]?.isCorrect)
  }, [questions, userAnswers])
  
  // Result message
  const getResultMessage = () => {
    if (accuracy >= 90) return { text: '훌륭해요! 🎉', subtext: '물리 천재가 되셨군요!' }
    if (accuracy >= 70) return { text: '잘했어요! 👏', subtext: '조금만 더 하면 완벽합니다!' }
    if (accuracy >= 50) return { text: '괜찮아요! 💪', subtext: '복습하면 더 좋아질 거예요!' }
    return { text: '분발해요! 📚', subtext: '기초부터 차근차근!' }
  }
  
  const resultMessage = getResultMessage()
  
  const selectedQuestion = selectedReviewQuestion !== null ? wrongQuestions[selectedReviewQuestion] : null
  
  if (showReview && selectedQuestion) {
    const catConfig = categoryConfig[selectedQuestion.category] || categoryConfig['역학']
    const IconComponent = catConfig.icon
    const questionIndex = questions.findIndex(q => q.id === selectedQuestion.id)
    const userAnswer = userAnswers[questionIndex]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedReviewQuestion(null)}
            className="mb-4 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          
          {/* Question Detail */}
          <Card className="shadow-xl border-0 mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 text-white">{selectedQuestion.category}</Badge>
                    <span className="text-sm text-blue-100">{selectedQuestion.subcategory}</span>
                  </div>
                  <CardTitle className="text-xl leading-relaxed font-medium">
                    {selectedQuestion.question}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {/* Choices */}
          <div className="space-y-3 mb-6">
            {selectedQuestion.choices.map((choice, index) => {
              const isCorrect = index === selectedQuestion.answer
              const isSelected = userAnswer.selectedAnswer === index
              
              let buttonClass = 'bg-white border-2 border-gray-200'
              if (isCorrect) {
                buttonClass = 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-200'
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-red-50 border-2 border-red-400'
              }
              
              return (
                <div
                  key={index}
                  className={`w-full p-4 rounded-xl ${buttonClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                      isCorrect 
                        ? 'bg-emerald-500 text-white' 
                        : isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className={`font-medium leading-relaxed ${
                      isCorrect 
                        ? 'text-emerald-700' 
                        : isSelected && !isCorrect
                          ? 'text-red-700'
                        : 'text-gray-800'
                    }`}>
                      {choice}
                      {isSelected && !isCorrect && <span className="ml-2 text-red-500">(내 답안)</span>}
                      {isCorrect && <span className="ml-2 text-emerald-500">(정답)</span>}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Explanation */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">해설</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{selectedQuestion.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setShowReview(false)}
            className="mb-4 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            결과로 돌아가기
          </Button>
          
          <Card className="shadow-xl border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                틀린 문제 복습
              </CardTitle>
              <CardDescription>
                총 {wrongQuestions.length}문제를 다시 확인해보세요
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="space-y-3">
            {wrongQuestions.map((q, index) => {
              const catConfig = categoryConfig[q.category] || categoryConfig['역학']
              const IconComponent = catConfig.icon
              const questionIndex = questions.findIndex(question => question.id === q.id)
              const userAnswer = userAnswers[questionIndex]
              
              return (
                <Card 
                  key={q.id}
                  className="shadow-md border-0 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedReviewQuestion(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: catConfig.bgColor }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: catConfig.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ color: catConfig.color, borderColor: catConfig.color }}
                          >
                            {q.category}
                          </Badge>
                          <span className="text-xs text-gray-400">#{q.id}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{q.question}</p>
                        <p className="text-xs text-red-500 mt-1">
                          내 답안: {q.choices[userAnswer.selectedAnswer || 0]}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Score Card */}
        <Card className="shadow-xl border-0 mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-300" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{resultMessage.text}</h2>
              <p className="text-blue-100 mb-4">{resultMessage.subtext}</p>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-4xl font-bold">{correctCount}</p>
                  <p className="text-sm text-blue-100">맞은 개수</p>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div>
                  <p className="text-4xl font-bold">{accuracy}%</p>
                  <p className="text-sm text-blue-100">정답률</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Accuracy */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              영역별 정답률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '정답률']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category Stats Detail */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {categoryStats.map((cat) => {
                const IconComponent = cat.icon
                return (
                  <div 
                    key={cat.name}
                    className="p-3 rounded-xl border border-gray-100 bg-white"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: cat.color }}>
                      {cat.correct}/{cat.total}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Wrong Questions Review */}
        {wrongQuestions.length > 0 && (
          <Card className="shadow-xl border-0 mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-500" />
                틀린 문제 복습
              </CardTitle>
              <CardDescription>
                {wrongQuestions.length}문제를 다시 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowReview(true)}
                variant="outline"
                className="w-full h-12 text-base border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                틀린 문제 보기 ({wrongQuestions.length}문제)
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Restart Button */}
        <Button
          onClick={resetQuiz}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 rounded-xl"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          다시 시작하기
        </Button>
      </div>
    </div>
  )
}

// Main Page Component
export default function Home() {
  const { questions, isCompleted } = useQuizStore()
  
  // Determine which screen to show
  const renderScreen = () => {
    if (questions.length === 0) {
      return <StartScreen />
    }
    if (isCompleted) {
      return <ResultScreen />
    }
    return <QuizScreen />
  }
  
  return renderScreen()
}
