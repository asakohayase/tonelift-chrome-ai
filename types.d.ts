
  
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