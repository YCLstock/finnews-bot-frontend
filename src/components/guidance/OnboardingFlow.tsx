'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useGuidance } from '@/hooks/useGuidance'
interface InvestmentFocusArea {
  code: string
  name_zh: string
  name_en: string
  description: string
  sample_keywords: string[]
}
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Plus,
  X,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingFlowProps {
  onComplete?: () => void
  onCancel?: () => void
}

const STEPS = [
  { id: 'welcome', title: '歡迎', description: '開始個人化設定' },
  { id: 'investment_focus_selection', title: '投資領域', description: '選擇感興趣的領域' },
  { id: 'keyword_customization', title: '關鍵字設定', description: '自訂關鍵字偏好' },
  { id: 'analysis', title: '分析結果', description: '查看聚焦度分析' },
  { id: 'completion', title: '完成', description: '設定完成' }
]

export function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const {
    currentStep,
    investmentAreas,
    onboardingFlow,
    loading,
    startOnboarding,
    selectInvestmentFocus,
    analyzeKeywords,
    finalizeOnboarding
  } = useGuidance()

  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [customKeywords, setCustomKeywords] = useState<string[]>([])

  // 獲取當前步驟索引
  const getCurrentStepIndex = () => {
    return STEPS.findIndex(step => step.id === currentStep)
  }

  const currentStepIndex = getCurrentStepIndex()
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // 初始化
  useEffect(() => {
    if (currentStep === 'none') {
      startOnboarding()
    }
  }, [currentStep, startOnboarding])

  // 同步引導流程狀態
  useEffect(() => {
    if (onboardingFlow.baseKeywords.length > 0) {
      setCustomKeywords([...onboardingFlow.baseKeywords])
    }
  }, [onboardingFlow.baseKeywords])

  // 處理投資領域選擇
  const handleAreaSelection = (areaCode: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaCode)
        ? prev.filter(code => code !== areaCode)
        : [...prev, areaCode]
    )
  }

  // 繼續到下一步
  const handleNext = async () => {
    if (currentStep === 'investment_focus_selection') {
      if (selectedAreas.length === 0) {
        toast.error('請至少選擇一個投資領域')
        return
      }
      await selectInvestmentFocus(selectedAreas)
    } else if (currentStep === 'keyword_customization') {
      if (customKeywords.length === 0) {
        toast.error('請至少添加一個關鍵字')
        return
      }
      const result = await analyzeKeywords(customKeywords)
      if (result.success) {
        // 自動進入分析步驟
      }
    } else if (currentStep === 'analysis') {
      const result = await finalizeOnboarding(customKeywords, onboardingFlow.selectedTopics)
      if (result.success) {
        onComplete?.()
      }
    }
  }

  // 添加關鍵字
  const addKeyword = () => {
    const keyword = keywordInput.trim()
    if (keyword && !customKeywords.includes(keyword)) {
      if (customKeywords.length >= 10) {
        toast.error('最多只能添加 10 個關鍵字')
        return
      }
      setCustomKeywords(prev => [...prev, keyword])
      setKeywordInput('')
    }
  }

  // 移除關鍵字
  const removeKeyword = (keyword: string) => {
    setCustomKeywords(prev => prev.filter(k => k !== keyword))
  }

  // 渲染歡迎步驟
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          歡迎使用 FinNews-Bot
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          讓我們為您設定個人化的財經新聞推送，只需要 3-5 分鐘
        </p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          完成設定後，您將獲得：
        </p>
        <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
          <li>• 基於您興趣的精準新聞推送</li>
          <li>• AI 驅動的聚焦度分析</li>
          <li>• 持續的個人化優化建議</li>
        </ul>
      </div>
      <Button onClick={handleNext} size="lg" className="w-full">
        開始設定
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )

  // 渲染投資領域選擇
  const renderInvestmentFocusStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          選擇您感興趣的投資領域
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          可以選擇多個領域，系統會為您推薦相關關鍵字
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {investmentAreas.map((area) => (
          <div
            key={area.code}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedAreas.includes(area.code)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleAreaSelection(area.code)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {area.name_zh}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {area.sample_keywords.slice(0, 3).map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedAreas.includes(area.code) && (
                <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          取消
        </Button>
        <Button onClick={handleNext} disabled={selectedAreas.length === 0}>
          繼續
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  // 渲染關鍵字自訂步驟
  const renderKeywordCustomizationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          自訂您的關鍵字
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          基於您的選擇，我們推薦了以下關鍵字，您可以自由調整
        </p>
      </div>

      {onboardingFlow.baseKeywords.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>推薦關鍵字：</strong>
            {onboardingFlow.baseKeywords.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="keyword-input">添加關鍵字</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="keyword-input"
              placeholder="輸入關鍵字，例如：台積電、特斯拉"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <Button type="button" onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {customKeywords.length > 0 && (
          <div>
            <Label>您的關鍵字 ({customKeywords.length}/10)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {customKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setSelectedAreas([])}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <Button onClick={handleNext} disabled={customKeywords.length === 0 || loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              分析關鍵字
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )

  // 渲染分析結果步驟
  const renderAnalysisStep = () => {
    const analysis = onboardingFlow.analysisResult
    if (!analysis) return null

    const focusScore = analysis.clustering_result?.focus_score || 0
    const guidance = analysis.guidance

    return (
      <div className="space-y-6">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            關鍵字分析結果
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            我們已分析您的關鍵字設定
          </p>
        </div>

        {/* 聚焦度評分 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>聚焦度評分</span>
              <Badge variant={focusScore >= 0.7 ? "default" : focusScore >= 0.5 ? "secondary" : "destructive"}>
                {Math.round(focusScore * 100)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={focusScore * 100} className="mb-4" />
            <Alert className={
              focusScore >= 0.7 ? "border-green-200 bg-green-50 dark:bg-green-900/20" :
              focusScore >= 0.5 ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" :
              "border-red-200 bg-red-50 dark:bg-red-900/20"
            }>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{guidance?.title || '分析完成'}</strong><br />
                {guidance?.message || '關鍵字分析已完成'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 聚類結果 */}
        <Card>
          <CardHeader>
            <CardTitle>關鍵字分組</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.clustering_result?.clusters?.map((cluster: string[], index: number) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <Badge variant="outline">群組 {index + 1}</Badge>
                  {cluster.map((keyword: string, keywordIndex: number) => (
                    <Badge key={keywordIndex} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )) || (
                <p className="text-gray-500">無聚類結果</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 優化建議 */}
        {guidance?.recommendations && guidance.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>優化建議</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidance.recommendations.map((recommendation: string, index: number) => (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCustomKeywords([])}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            重新調整
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                完成設定中...
              </>
            ) : (
              <>
                完成設定
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (loading && currentStep === 'none') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>正在初始化引導流程...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>個人化設定引導</CardTitle>
            <CardDescription>
              步驟 {currentStepIndex + 1} / {STEPS.length} - {STEPS[currentStepIndex]?.title}
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent>
        {(currentStep === 'none' || currentStep === 'investment_focus_selection') && renderWelcomeStep()}
        {currentStep === 'investment_focus_selection' && renderInvestmentFocusStep()}
        {currentStep === 'keyword_customization' && renderKeywordCustomizationStep()}
        {currentStep === 'analysis' && renderAnalysisStep()}
      </CardContent>
    </Card>
  )
}