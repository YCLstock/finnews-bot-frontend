'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface KeywordInputProps {
  value: string[]
  onChange: (keywords: string[]) => void
  maxKeywords?: number
  placeholder?: string
  label?: string
  className?: string
}

export function KeywordInput({
  value,
  onChange,
  maxKeywords = 10,
  placeholder = '輸入關鍵字...',
  label = '關鍵字',
  className,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addKeyword = () => {
    const keyword = inputValue.trim()
    if (keyword && !value.includes(keyword)) {
      if (value.length >= maxKeywords) {
        toast.error(`最多只能添加 ${maxKeywords} 個關鍵字`)
        return
      }
      onChange([...value, keyword])
      setInputValue('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onChange(value.filter(keyword => keyword !== keywordToRemove))
  }

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="flex space-x-2 mt-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
        />
        <Button type="button" onClick={addKeyword} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((keyword, index) => (
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
      )}
    </div>
  )
}
