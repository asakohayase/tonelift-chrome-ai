import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
      [key: number]: {
        isFinal: boolean;
        [key: number]: {
          transcript: string;
        };
      };
    };
}

interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onend: () => void;
    onerror: (event: { error: string }) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    start: () => void;
    stop: () => void;
}

// Define the constructor
interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}

// Define types for Web Speech API
interface IWindow extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

type RecognitionError = {
    error: string;
    message?: string;
};

interface VoiceProcessorProps {
    onTranscriptComplete: (transcript: string) => void;
    isDisabled?: boolean;
}

const VoiceProcessor: React.FC<VoiceProcessorProps> = ({ 
    onTranscriptComplete, 
    isDisabled = false 
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const windowWithSpeech = window as IWindow;
            const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

            if (SpeechRecognitionAPI) {
                const recognitionInstance = new SpeechRecognitionAPI();
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'en-US';

                recognitionInstance.onstart = () => {
                    setIsListening(true);
                    setError('');
                };

                recognitionInstance.onerror = (event: RecognitionError) => {
                    setError('Error occurred in recognition: ' + event.error);
                    setIsListening(false);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                    const current = event.resultIndex;
                    const transcriptText = event.results[current][0].transcript;
                    
                    if (event.results[current].isFinal) {
                        setTranscript((prev) => prev + ' ' + transcriptText);
                    }
                };

                setRecognition(recognitionInstance);
            } else {
                setError('Speech recognition not supported in this browser');
            }
        }
    }, []);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, [recognition]);

    const toggleListening = useCallback(() => {
        if (!recognition) {
            setError('Speech recognition not initialized');
            return;
        }

        if (isListening) {
            recognition.stop();
            if (transcript.trim()) {
                onTranscriptComplete(transcript.trim());
            }
            setTranscript('');
        } else {
            try {
                recognition.start();
            } catch (err) {
                const error = err as Error;
                setError('Error starting recognition: ' + error.message);
            }
        }
    }, [isListening, recognition, transcript, onTranscriptComplete]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button
                    onClick={toggleListening}
                    disabled={isDisabled || !recognition}
                    variant={isListening ? "destructive" : "default"}
                    className="w-full gap-2"
                >
                    {isListening ? (
                        <>
                            <MicOff className="size-4" />
                            Stop Recording
                        </>
                    ) : (
                        <>
                            {isDisabled ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Mic className="size-4" />
                            )}
                            Start Recording
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isListening && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                        {transcript || "Listening..."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default VoiceProcessor;