// components/PdfToAudioClient.tsx
import React, { useState, useEffect } from 'react';

/**
 * Polyfill Promise.withResolvers for pdfjs-dist.
 * Applied globally, safe on both server and client.
 */
if (typeof (Promise as any).withResolvers !== 'function') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}

const PdfToAudioClient: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // pdf.js imports stored in state after dynamic load
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // Load pdfjs-dist dynamically in the browser
      const pdfjs = await import('pdfjs-dist');
      const { GlobalWorkerOptions } = await import('pdfjs-dist');

      // Set worker from CDN
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

      setPdfjsLib(pdfjs);
    })();
  }, []);

  // Extract text from each page of the PDF.
  const extractTextFromPdf = async (url: string): Promise<string> => {
    if (!pdfjsLib) throw new Error('pdfjs not loaded yet');
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error('Failed to extract PDF text:', error);
      throw error;
    }
  };

  // Use the browser's SpeechSynthesis API to speak the provided text.
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech Synthesis API is not supported in this browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);

    // Choose a natural-sounding voice (preferably US English)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => voice.lang === 'en-US') || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handler to extract text from the PDF and speak it.
  const handleConvertAndSpeak = async () => {
    if (!pdfUrl || !pdfjsLib) return;
    setLoading(true);
    try {
      const text = await extractTextFromPdf(pdfUrl);
      // For performance and API responsiveness, limit or chunk long texts.
      const limitedText = text.slice(0, 2000);
      setExtractedText(limitedText);
      speakText(limitedText);
    } catch (error) {
      console.error('Error during conversion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure voices are loaded (some browsers load them asynchronously)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () =>
        window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '1rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h2>PDF to Audio Converter</h2>
      <input
        type="text"
        value={pdfUrl}
        onChange={(e) => setPdfUrl(e.target.value)}
        placeholder="Enter PDF URL (must have CORS enabled)"
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button
        onClick={handleConvertAndSpeak}
        disabled={loading || !pdfUrl || isSpeaking || !pdfjsLib}
      >
        {!pdfjsLib
          ? 'Loading PDF engine...'
          : loading
          ? 'Processing...'
          : isSpeaking
          ? 'Speaking...'
          : 'Convert PDF to Audio'}
      </button>
      {extractedText && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Extracted Text (limited)</h3>
          <textarea
            value={extractedText}
            readOnly
            rows={6}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
      )}
    </div>
  );
};

export default PdfToAudioClient;
