'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MessageSquare, Zap } from 'lucide-react'

interface TransformResponse {
  original_text: string
  transformed_text: string
  analysis: {
    tone: string
    confidence: number
    improvements: string[]
  }
}

interface Context {
  situation: string
  importance: string
  additionalContext?: string
}

export default function ToneTransformer() {
  const [text, setText] = useState('')
  const [situation, setSituation] = useState('client')
  const [importance, setImportance] = useState('high')
  const [customContext, setCustomContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TransformResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const context: Context = {
      situation,
      importance,
      additionalContext: customContext.trim() || undefined
    }

    const formData = new FormData()
    formData.append('text', text)
    formData.append('context', JSON.stringify(context))

    try {
      const response = await fetch('http://localhost:8000/process/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto min-h-screen bg-white px-4 py-8">
      <Card className="mx-auto w-full max-w-2xl border shadow-md">
        <CardHeader className="rounded-t-xl bg-[#2e6f40]  text-white shadow-md">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <MessageSquare className="mr-2 size-6" />
            Text Tone Transformer
          </CardTitle>
          <CardDescription className="text-white">
            Refine your message for impactful communication
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="situation" className="text-lg font-medium text-[#2e6f40]">Situation</Label>
                <Select value={situation} onValueChange={setSituation} >
                  <SelectTrigger id="situation" className="focus-visible:ring-[#2e6f40]" >
                    <SelectValue placeholder="Select situation" />
                  </SelectTrigger>
                  <SelectContent >
                    <SelectItem value="client">Business Client (B2B)</SelectItem>
                    <SelectItem value="customer_service">Customer Service (B2C)</SelectItem>
                    <SelectItem value="external_comms">Brand Communications</SelectItem>
                    <SelectItem value="feedback_to_team">Team Feedback</SelectItem>
                    <SelectItem value="feedback_to_management">Management Feedback</SelectItem>
                    <SelectItem value="other">Other Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importance" className="text-lg font-medium text-[#2e6f40]">
                  Importance
                  <span className="ml-1 text-sm text-[#2e6f40]">(Affects tone)</span>
                </Label>
                <Select value={importance} onValueChange={setImportance}>
                  <SelectTrigger id="importance" className="focus-visible:ring-[#2e6f40]">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Formal)</SelectItem>
                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                    <SelectItem value="low">Low (Casual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customContext" className="text-lg font-medium text-[#2e6f40]">
                Additional Context
                <span className="ml-1 text-sm text-[#2e6f40]">(Optional)</span>
              </Label>
              <Textarea
                id="customContext"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Add any additional context or specific requirements..."
                className="min-h-[80px] focus-visible:ring-[#2e6f40]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="text-lg font-medium text-[#2e6f40]">Text to Transform</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[100px] focus-visible:ring-[#2e6f40]"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded bg-[#2e6f40] px-4 py-2 font-semibold text-white transition-colors duration-300 hover:bg-[#2e6f40]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" />
                  Transform Text
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mx-auto mt-6 max-w-2xl border border-red-200">
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mx-auto mt-6 max-w-2xl border border-[#2e6f40] shadow-md">
          <CardHeader className="bg-[#2e6f40] text-white">
            <CardTitle className="text-xl font-semibold">
              Transformation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-sand-100 space-y-2 rounded-md p-4">
              <h3 className="text-lg font-semibold text-[#2e6f40]">Original Text:</h3>
              <p className="text-sm text-teal-900">{result.original_text}</p>
            </div>

            <div className="space-y-2 rounded-md bg-teal-50 p-4">
              <h3 className="text-lg font-semibold text-[#2e6f40]">Transformed Text:</h3>
              <p className="text-sm font-medium text-teal-900">{result.transformed_text}</p>
            </div>

            <div className="bg-sand-50 space-y-2 rounded-md p-4">
              <h3 className="text-lg font-semibold text-[#2e6f40]">Analysis:</h3>
              <p className="text-sm">Tone: <span className="font-medium text-teal-700">{result.analysis.tone}</span></p>
              <p className="text-sm">Confidence: <span className="font-medium text-teal-700">
                {(result.analysis.confidence * 100).toFixed(1)}%</span></p>
              <h4 className="mt-2 font-semibold text-[#2e6f40]">Improvements:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {result.analysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-[#2e6f40]">{improvement}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}