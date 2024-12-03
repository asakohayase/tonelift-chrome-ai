'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Zap, ArrowRight } from 'lucide-react'
import VoiceProcessor from '@/components/ui/VoiceProcessor';
import { ChromeAIServiceImpl, Formality, Situation, TransformResponse } from '@/lib/chromeAI';



export default function ToneTransformer() {
  const [text, setText] = useState('')
  const [situation, setSituation] = useState<Situation>('client')
  const [formality, setFormality] = useState<Formality>('formal')
  const [customContext, setCustomContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TransformResponse | null>(null)
  const [error, setError] = useState('')
  const [aiService, setAIService] = useState<ChromeAIServiceImpl | null>(null)
  const [isAIAvailable, setIsAIAvailable] = useState(false)

  useEffect(() => {
    let mounted = true;
    const initAI = async () => {
      try {
        const service = new ChromeAIServiceImpl();
        const available = await service.initialize();
        if (mounted) {
          if (available) {
            setAIService(service);
            setIsAIAvailable(true);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("AI initialization error:", error);
          setError("Chrome AI is not available in this browser");
        }
      }
    };
  
    initAI();
    
    return () => {
      mounted = false;
      aiService?.destroy();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!aiService) {
        throw new Error("AI service not available");
      }

      if (!text.trim()) {
        throw new Error("Please enter some text to transform");
      }

      const result = await aiService.transformText(text, {
        situation,
        formality,
        additionalContext: customContext.trim() || undefined
      });
      
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscriptComplete = (transcript: string) => {
    setText(transcript);
  };

  if (!isAIAvailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Browser Not Supported</AlertTitle>
          <AlertDescription>
            This feature requires Chrome Canary with experimental AI features enabled.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ToneLift{' '}
          <span className="bg-gradient-to-r from-lime-400 via-green-500 to-green-600 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="mt-2 text-gray-300">
          Elevate your communication with AI-powered tone transformation
        </p>
      </div>

      <div className="relative grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card className="border border-gray-500 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader className="rounded-t-xl bg-black text-white">
            <CardTitle className="text-xl">Transform Your Message</CardTitle>
            <CardDescription className="text-gray-100">
              Customize your message settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="situation" className="text-black">Situation</Label>
                <Select value={situation} onValueChange={(value: Situation) => setSituation(value)}>
                  <SelectTrigger id="situation">
                    <SelectValue placeholder="Select situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Business Client (B2B)</SelectItem>
                    <SelectItem value="customer_service">Customer Service (B2C)</SelectItem>
                    <SelectItem value="external_comms">Brand Communications</SelectItem>
                    <SelectItem value="feedback_to_team">Team Feedback</SelectItem>
                    <SelectItem value="feedback_to_management">Management Feedback</SelectItem>
                    <SelectItem value="personal">Personal (Family/Friends)</SelectItem> 
                    <SelectItem value="other">Other Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formality" className="text-black">
                  Tone
                </Label>
                <Select value={formality} onValueChange={(value: Formality) => setFormality(value)}>
                  <SelectTrigger id="formality">
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context" className="text-black">
                Additional Context
                <span className="ml-1 text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="context"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Add any additional context..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="text-black">Message to Transform</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[120px]"
                required
              />
              <VoiceProcessor 
                onTranscriptComplete={handleTranscriptComplete}
                isDisabled={isLoading}
              />
            </div>

            <Button 
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-lime-400 via-green-500 to-green-600 text-white hover:from-lime-500 hover:via-green-600 hover:to-green-700"
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" />
                  Transform Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Arrow between cards */}
        <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div className="flex size-12 items-center justify-center rounded-full bg-black text-white shadow-lg">
            <ArrowRight className="size-6" />
          </div>
        </div>

        {/* Result Card */}
        <Card className="border border-gray-500 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader className="rounded-t-xl bg-black text-white">
            <CardTitle className="text-xl">Transformation Result</CardTitle>
            <CardDescription className="text-gray-100">
              Enhanced message output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {result ? (
              <div className="space-y-4">
                {/* Transformed Text Section */}
                <div className="space-y-2">
                  <Label className="text-black">Transformed Message</Label>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="prose prose-gray max-w-none text-gray-700">
                      <p>{result.transformed_text}</p>
                    </div>
                  </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-2">
                  <Label className="text-black">Analysis</Label>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="space-y-4">
                      {/* Improvements */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Key Improvements:</h4>
                        <ul className="space-y-2">                    
                          {result.improvements.map((improvement, index) => (
                            <li 
                              key={index} 
                              className="flex gap-2 rounded-md bg-green-50 p-2 text-sm text-gray-600"
                            >
                              <span className="select-none text-green-500">✓</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state - just labels without placeholder content
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-black">Transformed Message</Label>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4"></div>
                </div>

                <div className="space-y-2">
                  <Label className="text-black">Analysis</Label>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-4">
                      <div className="rounded-md bg-gray-100 p-3"></div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Key Improvements:</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="border border-red-200">
            <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}