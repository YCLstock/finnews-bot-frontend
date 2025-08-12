'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ColdStartAlert } from '@/components/ui/cold-start-alert'
import { useGuidance } from '@/hooks/useGuidance'
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { KeywordInput } from '@/components/ui/keyword-input'

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
    finalizeOnboarding,
    resetAnalysisResult,
    navigateToStep,
    goToPreviousStep,
    canGoBack
  } = useGuidance()

  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [customKeywords, setCustomKeywords] = useState<string[]>([])
  const [stepLoading, setStepLoading] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [showColdStartAlert, setShowColdStartAlert] = useState(false)
  const [coldStartRetryCount, setColdStartRetryCount] = useState(0)

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

  // 處理投資領域選擇
  const handleAreaSelection = (areaCode: string) => {
    setSelectedAreas(prev => {
      const newSelection = prev.includes(areaCode)
        ? prev.filter(code => code !== areaCode)
        : [...prev, areaCode]
      
      // 清除錯誤狀態如果有選擇
      if (newSelection.length > 0) {
        setStepError(null)
      }
      
      return newSelection
    })
  }

  // 繼續到下一步
  const handleNext = async () => {
    setStepLoading(true)
    setStepError(null)
    
    try {
      if (currentStep === 'none' || currentStep === 'welcome') {
        const result = await startOnboarding()
        if (!result.success) {
          setStepError(result.error || '啟動引導流程失敗')
          return
        }
      } else if (currentStep === 'investment_focus_selection') {
        if (selectedAreas.length === 0) {
          setStepError('請至少選擇一個投資領域')
          toast.error('請至少選擇一個投資領域')
          return
        }
        const result = await selectInvestmentFocus(selectedAreas)
        if (!result.success) {
          const errorMsg = result.error || '選擇投資領域失敗'
          setStepError(errorMsg)
          toast.error(errorMsg)
          return
        }
      } else if (currentStep === 'keyword_customization') {
        if (customKeywords.length === 0) {
          setStepError('請至少添加一個關鍵字')
          toast.error('請至少添加一個關鍵字')
          return
        }
        const result = await analyzeKeywords(customKeywords)
        if (!result.success) {
          const errorMsg = result.error || '關鍵字分析失敗'
          setStepError(errorMsg)
          toast.error(errorMsg)
          return
        }
      } else if (currentStep === 'analysis') {
        const result = await finalizeOnboarding(customKeywords, onboardingFlow.selectedTopics)
        if (result.success) {
          onComplete?.()
        } else {
          const errorMsg = result.error || '完成設定失敗'
          setStepError(errorMsg)
          toast.error(errorMsg)
          return
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知錯誤'
      
      // 檢測是否為冷啟動錯誤
      const isColdStart = error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('fetch failed') ||
        error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error.message.includes('Network error')
      )
      
      if (isColdStart) {
        setShowColdStartAlert(true)
        setColdStartRetryCount(prev => prev + 1)
        console.log('🥶 檢測到冷啟動錯誤，顯示等待提示')
      } else {
        setStepError(errorMsg)
        toast.error(errorMsg)
      }
      
      console.error('OnboardingFlow handleNext error:', error)
    } finally {
      setStepLoading(false)
    }
  }

  // 冷啟動重試
  const handleColdStartRetry = () => {
    setShowColdStartAlert(false)
    setStepError(null)
    // 重新執行當前步驟的操作
    handleNext()
  }

  // 渲染歡迎步驟
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </div>
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">
          AI 個人化優化
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          透過智能分析提升您的新聞推送精準度，只需 2 分鐘
        </p>
      </div>
      <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="text-muted-foreground">選擇興趣</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-muted-foreground">AI 分析</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-muted-foreground">完成</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleNext} size="lg" className="flex-1 rounded-xl h-12">
          開始優化
          <Sparkles className="h-4 w-4 ml-2" />
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} size="lg" className="flex-1 rounded-xl h-12">
            稍後進行
          </Button>
        )}
      </div>
    </div>
  )

  // 渲染投資領域選擇
  const renderInvestmentFocusStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-3 bg-primary/10 rounded-2xl inline-flex mb-4">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-medium tracking-tight mb-2">
          選擇感興趣的領域
        </h2>
        <p className="text-muted-foreground">
          可選擇多個領域，AI 會基於您的選擇推薦相關關鍵字
        </p>
        {selectedAreas.length > 0 && (
          <div className="bg-primary/10 rounded-xl p-3 mt-4 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              ✓ 已選擇 {selectedAreas.length} 個領域
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investmentAreas.map((area) => (
          <div
            key={area.code}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${
              selectedAreas.includes(area.code)
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border hover:border-border/80 bg-background hover:bg-accent/10'
            }`}
            onClick={() => handleAreaSelection(area.code)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-medium mb-2 ${
                  selectedAreas.includes(area.code) ? 'text-primary' : 'text-foreground'
                }`}>
                  {area.name_zh}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {area.sample_keywords.slice(0, 3).map((keyword: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 rounded-md bg-accent/50"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 transition-colors ${
                selectedAreas.includes(area.code)
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}>
                {selectedAreas.includes(area.code) && (
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/30">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">
          <ChevronLeft className="h-4 w-4 mr-2" />
          取消
        </Button>
        <Button onClick={handleNext} disabled={selectedAreas.length === 0 || stepLoading} className="rounded-xl">
          {stepLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              處理中...
            </>
          ) : (
            <>
              下一步 ({selectedAreas.length} 個選擇)
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
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
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>推薦關鍵字：</strong>
            {onboardingFlow.baseKeywords.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <KeywordInput
        label="您的關鍵字 (最多10個)"
        value={customKeywords}
        onChange={setCustomKeywords}
        placeholder="輸入關鍵字，例如：台積電、特斯拉"
      />

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setStepError(null)
            if (!goToPreviousStep()) {
              // 如果沒有歷史記錄，手動導航到上一步
              navigateToStep('investment_focus_selection', false)
            }
          }}
          disabled={!canGoBack}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <Button onClick={handleNext} disabled={customKeywords.length === 0 || loading || stepLoading}>
          {(loading || stepLoading) ? (
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

  // 渲染完成步驟
  const renderCompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 設定完成！
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          您的個人化新聞推送已設定完成，現在可以開始接收精準的財經新聞了。
        </p>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
          <strong>設定摘要：</strong>
        </p>
        <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
          <li>• 已選擇 {selectedAreas.length} 個投資領域</li>
          <li>• 設定了 {customKeywords.length} 個關鍵字</li>
          <li>• AI 聚焦度分析已完成</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onComplete} size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          前往儀表板
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.location.href = '/subscriptions'}>
          管理訂閱設定
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
            <Alert variant={
              focusScore >= 0.7 ? "success" :
              focusScore >= 0.5 ? "warning" :
              "destructive"
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
            <CardTitle>關鍵字分組結果</CardTitle>
            <CardDescription>
              系統已將語義相關的關鍵字自動分組，相同概念的中英文詞彙會歸類在一起
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.clustering_result?.clusters?.map((cluster: string[], index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="mr-2">群組 {index + 1}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cluster.length} 個關鍵字
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.map((keyword: string, keywordIndex: number) => {
                      // 檢查是否包含合併信息 (例如: "人工智慧 (包含: AI, machine learning)")
                      const isGrouped = keyword.includes('(包含:')
                      const hasNormalization = keyword.includes('(') && keyword.includes(')')
                      
                      return (
                        <Badge 
                          key={keywordIndex} 
                          variant={isGrouped ? "default" : hasNormalization ? "secondary" : "outline"}
                          className={
                            isGrouped 
                              ? "bg-green-100 text-green-800 border-green-200 max-w-xs" 
                              : hasNormalization 
                                ? "bg-blue-100 text-blue-800 border-blue-200" 
                                : ""
                          }
                          title={isGrouped ? "此關鍵字包含多個語義相同的詞彙" : undefined}
                        >
                          {keyword}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">無聚類結果</p>
              )}
              
              {analysis.clustering_result && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>智能分組說明：</strong>
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        示例標籤
                      </Badge>
                      <span className="text-gray-600 dark:text-gray-400">
                        綠色標籤：語義相同的關鍵字已合併（如 &quot;人工智慧&quot; 包含 &quot;AI&quot;、&quot;機器學習&quot;）
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        示例標籤
                      </Badge>
                      <span className="text-gray-600 dark:text-gray-400">
                        藍色標籤：標準化處理的關鍵字
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      💡 系統自動識別中英文相同概念，避免重複分組，提升新聞推送精準度
                    </p>
                  </div>
                </div>
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
          <Button variant="outline" onClick={() => {
            setStepError(null)
            // 清除分析結果並返回到關鍵字自訂步驟
            resetAnalysisResult()
            navigateToStep('keyword_customization', false)
          }}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            重新調整
          </Button>
          <Button onClick={handleNext} disabled={loading || stepLoading}>
            {(loading || stepLoading) ? (
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
        
        {/* 冷啟動提示 */}
        {showColdStartAlert && (
          <ColdStartAlert 
            isRetrying={true}
            retryAttempt={coldStartRetryCount}
            maxRetries={5}
            onRetry={handleColdStartRetry}
            className="mt-4"
          />
        )}
        
        {/* 其他錯誤提示 */}
        {stepError && !showColdStartAlert && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {stepError}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        {(currentStep === 'none' || currentStep === 'welcome') && renderWelcomeStep()}
        {currentStep === 'investment_focus_selection' && renderInvestmentFocusStep()}
        {currentStep === 'keyword_customization' && renderKeywordCustomizationStep()}
        {currentStep === 'analysis' && renderAnalysisStep()}
        {currentStep === 'completion' && renderCompletionStep()}
      </CardContent>
    </Card>
  )
}