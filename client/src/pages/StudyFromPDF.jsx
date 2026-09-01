import { useState } from 'react';
import { api } from '../services/api.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import AnswerSection from '../components/AnswerSection.jsx';
import PdfSourceCard from '../components/PdfSourceCard.jsx';

// Three simple states this page can be in, one at a time:
// 'idle'        - nothing selected/uploaded yet
// 'uploading'   - upload + processing request in flight
// 'ready'       - document processed, ready for questions
const StudyFromPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle');
  const [uploadError, setUploadError] = useState(null);
  const [document, setDocument] = useState(null);

  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setUploadError(null);

    try {
      const result = await api.uploadPdf(selectedFile);
      setDocument(result.data);
      setUploadState('ready');
    } catch (error) {
      setUploadError(error.message);
      setUploadState('idle');
    }
  };

  const handleAsk = async () => {
    if (!questionText.trim() || !document) return;

    setIsAsking(true);
    setAskError(null);
    setAnswerResult(null);

    try {
      const result = await api.askPdfQuestion(document.documentId, questionText);
      setAnswerResult(result.data);
    } catch (error) {
      setAskError(error.message);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Study from PDF</h1>
      <p className="text-slate-600 mb-6">
        Upload your own study material and ask questions about it.
      </p>

      {uploadState !== 'ready' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-slate-600 mb-4"
          />

          {selectedFile && (
            <p className="text-sm text-slate-500 mb-4">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadState === 'uploading'}
            className="bg-medical-500 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadState === 'uploading' ? 'Processing...' : 'Upload PDF'}
          </button>

          {uploadState === 'uploading' && (
            <div className="mt-4">
              <LoadingState message="Extracting text and generating embeddings — this can take a minute or two for larger PDFs." />
            </div>
          )}

          {uploadError && (
            <div className="mt-4">
              <ErrorState message={uploadError} />
            </div>
          )}
        </div>
      )}

      {uploadState === 'ready' && document && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-green-800 font-medium">
              "{document.fileName}" processed successfully — {document.chunkCount} chunks ready.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ask a question about this document
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm"
              placeholder="e.g. What does this document say about the treatment of..."
            />
            <button
              onClick={handleAsk}
              disabled={!questionText.trim() || isAsking}
              className="mt-3 bg-medical-500 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAsking ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {isAsking && <LoadingState message="Searching your document and generating an answer..." />}
          {askError && <ErrorState message={askError} />}

          {answerResult && (
            <div className="space-y-4">
              {answerResult.message ? (
                // No relevant chunks were found — pdfRagService.js deliberately
                // returns a plain message instead of a fabricated answer here.
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium">
                  <p className="text-slate-600">{answerResult.message}</p>
                </div>
              ) : (
                <>
                  <AnswerSection answerData={answerResult.answer} />

                  {answerResult.sources && answerResult.sources.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">
                        Sourced from your document
                      </h3>
                      <div className="space-y-2">
                        {answerResult.sources.map((source, i) => (
                          <PdfSourceCard key={i} source={source} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyFromPDF;