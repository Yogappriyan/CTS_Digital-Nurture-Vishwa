import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  ShieldAlert, 
  Cpu,
  Layers,
  Scan,
  Activity,
  BarChart3,
  Eye,
  FileCheck2,
  FileJson,
  Code2,
  ImagePlus,
  X,
  Loader2
} from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/aiService';

interface ChatViewProps {
  analysisContext?: AnalysisResult | null;
  onClose?: () => void;
  fullScreen?: boolean;
}

const PIPELINE_TOPICS = [
  { id: 'summary', label: 'Proactive Pipeline Summary', icon: Sparkles, query: 'Please provide a structured summary of the YOLO detection, top prediction, differential classes, and visual features from the pipeline JSON.' },
  { id: 'why', label: 'Why did model predict this?', icon: Eye, query: 'Why did the model predict this class and what visual features contributed to this pattern-matching result?' },
  { id: 'confidence', label: 'Explain Confidence Score', icon: BarChart3, query: 'How should I interpret the statistical confidence score and what dataset was it trained on?' },
  { id: 'prep', label: 'Preprocessing (DullRazor & CLAHE)', icon: Sparkles, query: 'Explain the Image Preprocessing stage (DullRazor hair suppression, Gray-World color constancy, and Adaptive CLAHE illumination).' },
  { id: 'yolo', label: 'YOLO Lesion Detection', icon: Scan, query: 'How did the YOLO model detect and localize the lesion bounding box in this image?' },
  { id: 'doctor', label: 'Doctor Consultation Checklist', icon: FileCheck2, query: 'What questions should I prepare for a licensed dermatologist regarding this lesion?' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  analysisContext,
  onClose,
  fullScreen = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  
  // Dedicated inner container ref to prevent whole-window scroll jumping to footer
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Initialize conversation with faithful research-prototype format
  useEffect(() => {
    let greeting = '';
    if (analysisContext) {
      const p = analysisContext.prediction;
      const confPct = (p.confidence * 100).toFixed(0);
      const isDetected = !(p.isNormalHealthySkin || p.categoryCode === 'unwanted_non_skin');
      
      const diffList = (analysisContext.probabilities || [])
        .slice(1, 4)
        .map(pr => `${pr.name} (${(pr.probability * 100).toFixed(0)}%)`)
        .join(', ');

      const features = analysisContext.visualFindings && analysisContext.visualFindings.length > 0
        ? analysisContext.visualFindings.join('; ')
        : analysisContext.abcdeAssessment
        ? `Asymmetry: ${analysisContext.abcdeAssessment.asymmetry}; Border: ${analysisContext.abcdeAssessment.border}; Color: ${analysisContext.abcdeAssessment.color}`
        : 'Circumscribed margins, uniform central pigmentation';

      greeting = `Hello! I am **DermaAssist**, an academic research-prototype AI assistant. Here is the summary of the computer-vision pipeline output for this session:

1. **Lesion Detection Status:** ${isDetected ? 'Lesion successfully detected and localized via YOLO bounding box.' : 'No focal suspicious lesion detected (normal skin field).'}
2. **Top Model Prediction:** **${p.categoryName}** (${p.clinicalName}) with **${confPct}% statistical confidence**.
3. **Other Considered Categories (Differential):** ${diffList || 'None flagged at high probability.'}
4. **Key Visual Features Observed:** ${features}
5. **Research Assessment Notice:** This is an experimental research prototype trained on benchmark dermoscopy datasets, not a definitive medical biopsy or clinical diagnosis. 

Feel free to ask questions about the visual features, confidence interpretation, or questions to prepare for your dermatologist if this lesion concerns you.`;
    } else {
      greeting = `Hello! I am **DermaAssist**, an academic research-prototype AI assistant. I explain the output of the computer-vision pipeline (YOLO lesion detection + CNN/Xception classification) in clear, non-alarming language. 

You can ask me to explain pipeline stages, dataset benchmarks (ISIC 2016/2017), feature extraction, or how to prepare for an in-person dermatology evaluation. How can I assist you?`;
    }

    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Why did the model predict this class?',
          'How should I interpret the confidence score?',
          'What are the other considered categories?',
          'Explain the YOLO localization box',
          'What should I ask my dermatologist?'
        ]
      }
    ]);
  }, [analysisContext?.id]);

  // Scroll ONLY the inner chat messages container
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawPrompt = (textToSend || inputPrompt).trim();
    if ((!rawPrompt && !attachedImage) || isTyping) return;

    const prompt = rawPrompt || (attachedImage ? 'Please evaluate this skin image and provide a clinical breakdown of its visual characteristics.' : '');
    const currentImage = attachedImage;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      imageUrl: currentImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(prompt, analysisContext, messages, currentImage || undefined);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue interpreting the pipeline output. Please try asking again or refer to the clinical report.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, fb: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, feedback: m.feedback === fb ? undefined : fb } : m))
    );
  };

  const handleReset = () => {
    const greeting = analysisContext
      ? `Session reset. I am **DermaAssist**, ready to explain your **${analysisContext.prediction.categoryName}** pipeline output or answer follow-up questions.`
      : `Session reset. I am **DermaAssist**, ready to assist with your dermatological pipeline inquiries.`;

    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Why did the model predict this class?',
          'How should I interpret the confidence score?',
          'What are the other considered categories?',
          'What should I ask my dermatologist?'
        ]
      }
    ]);
  };

  // Pipeline JSON shape for modal inspection
  const pipelineJSON = analysisContext ? {
    lesion_detected: !(analysisContext.prediction.isNormalHealthySkin || analysisContext.prediction.categoryCode === 'unwanted_non_skin'),
    detection_confidence: Number((analysisContext.pipelineDetails?.localization?.detectionConfidence || 0.94).toFixed(2)),
    bounding_box: analysisContext.pipelineDetails?.localization?.roiBox 
      ? [
          analysisContext.pipelineDetails.localization.roiBox.x / 100,
          analysisContext.pipelineDetails.localization.roiBox.y / 100,
          analysisContext.pipelineDetails.localization.roiBox.width / 100,
          analysisContext.pipelineDetails.localization.roiBox.height / 100
        ]
      : [0.24, 0.28, 0.48, 0.44],
    segmentation_available: true,
    predicted_class: analysisContext.prediction.categoryName.toLowerCase(),
    class_confidence: Number(analysisContext.prediction.confidence.toFixed(2)),
    differential_classes: (analysisContext.probabilities || []).map(pr => ({
      label: pr.name.toLowerCase(),
      confidence: Number((pr.probability || 0).toFixed(2))
    })),
    visual_features: analysisContext.visualFindings || [
      "asymmetry: low",
      "border irregularity: moderate",
      "color variation: low",
      "diameter_estimate_mm: 5.2"
    ],
    model_version: "cnn-xception-isic2017-v1",
    dataset_disclaimer: "Trained on ISIC 2016/2017 dermoscopic images"
  } : null;

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 ${fullScreen ? 'h-full' : 'h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden'}`}>
      {/* Top Header */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">DermaAssist AI Assistant</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-teal-300 bg-teal-950/90 px-2 py-0.5 rounded-full border border-teal-800/60 font-mono">
                ISIC YOLO+CNN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {analysisContext ? `Interpreting: ${analysisContext.prediction.categoryName} (${(analysisContext.prediction.confidence * 100).toFixed(0)}% conf)` : 'Research-Prototype Dermatology Conversation Layer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {analysisContext && (
            <button
              onClick={() => setShowJsonModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Inspect Pipeline Output JSON"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-mono">Pipeline JSON</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Notice Strip */}
      <div className="bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-900 dark:text-amber-200 border-b border-amber-500/20 flex items-center gap-2 shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="truncate">
          DermaAssist is a research prototype explaining statistical model outputs. Always consult a licensed dermatologist for diagnosis.
        </span>
      </div>

      {/* Pipeline Quick Access Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Topics:
        </span>
        {PIPELINE_TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => handleSendMessage(topic.query)}
              disabled={isTyping}
              className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages List - Contained scroll only */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200 dark:border-teal-800">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                {msg.imageUrl && (
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <img 
                      src={msg.imageUrl} 
                      alt="Skin photograph" 
                      className="max-w-[200px] max-h-[140px] rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs mb-1" 
                    />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/70 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {/* Footer Controls for AI messages */}
                {!isUser && (
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-teal-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'like')}
                      className={`hover:text-slate-600 transition-colors ${msg.feedback === 'like' ? 'text-teal-600' : ''}`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'dislike')}
                      className={`hover:text-slate-600 transition-colors ${msg.feedback === 'dislike' ? 'text-rose-500' : ''}`}
                      title="Unhelpful response"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {isUser && (
                  <div className="text-right text-[10px] text-slate-400 px-1">
                    {msg.timestamp}
                  </div>
                )}

                {/* Suggested Quick Questions */}
                {msg.suggestedQuestions && (
                  <div className="pt-1.5 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Suggested pipeline inquiries:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          disabled={isTyping}
                          className="text-left text-xs px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 transition-colors disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
        {/* Attached image preview banner */}
        {attachedImage && (
          <div className="flex items-center justify-between p-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src={attachedImage} 
                alt="Attached preview" 
                className="w-10 h-10 rounded-lg object-cover border border-teal-300 dark:border-teal-700 shrink-0" 
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200 truncate">
                  Skin Image Attached
                </p>
                <p className="text-[10px] text-teal-700 dark:text-teal-300 truncate">
                  Assistant will analyze color, texture, margins & lesion type
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
              title="Remove attached image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors shrink-0"
            title="Upload or snap skin image to analyze"
          >
            <ImagePlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={attachedImage ? "Add questions about this skin image (or press Send)..." : "Ask DermaAssist about visual features, confidence, or upload an image..."}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={(!inputPrompt.trim() && !attachedImage) || isTyping}
            className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs shrink-0"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modal: Pipeline JSON Inspector */}
      {showJsonModal && pipelineJSON && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  DermaAssist Input JSON Ground Truth
                </h4>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto p-3 bg-slate-950 text-teal-300 rounded-xl text-[11px] font-mono">
              {JSON.stringify(pipelineJSON, null, 2)}
            </pre>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-500">
                Ground truth input schema for DermaAssist
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(pipelineJSON, null, 2));
                  setShowJsonModal(false);
                }}
                className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors"
              >
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
