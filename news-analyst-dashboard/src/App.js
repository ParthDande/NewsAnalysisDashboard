import React, { useState, useEffect } from 'react';
import { FileText, BarChart2, Search, AlertTriangle, User, MessageCircle, DollarSign, Percent, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [selectedTool, setSelectedTool] = useState('sentiment');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const tools = [
    { 
      id: 'summarizer', 
      name: 'Summarizer', 
      icon: FileText,
      backgroundIcons: [FileText, BarChart2, Percent]
    },
    { 
      id: 'sentiment', 
      name: 'Sentiment analysis', 
      icon: MessageCircle,
      backgroundIcons: [ThumbsUp, ThumbsDown, MessageCircle]
    },
    { 
      id: 'plagiarism', 
      name: 'Plagiarism ai', 
      icon: Search,
      backgroundIcons: [Search, FileText, AlertTriangle]
    },
    { 
      id: 'fake-news', 
      name: 'Fake news analysis', 
      icon: AlertTriangle,
      backgroundIcons: [AlertTriangle, Search, DollarSign]
    },
  ];

  useEffect(() => {
    // Clear input text when changing tools
    setInputText('');
    setOutputText('');
    setAnalysisResult(null);
  }, [selectedTool]);

  useEffect(() => {
    if (analysisResult && analysisResult.type === 'sentiment') {
      setAnimationComplete(false);
      const timer = setTimeout(() => setAnimationComplete(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [analysisResult]);

  const renderFloatingIcons = (icons) => {
    return icons.flatMap((Icon, index) => 
      Array(10).fill().map((_, i) => (
        <Icon 
          key={`${index}-${i}`}
          size={24 + Math.random() * 24} 
          className="absolute text-white" 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.1 + Math.random() * 0.2
          }} 
        />
      ))
    );
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText, tool: selectedTool }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setOutputText(data.result);
      
      // Process the result based on the selected tool
      switch (selectedTool) {
        case 'sentiment':
          processSentimentResult(data.result);
          break;
        case 'summarizer':
          processSummarizerResult(data.result);
          break;
        case 'plagiarism':
          processPlagiarismResult(data.result);
          break;
        case 'fake-news':
          processFakeNewsResult(data.result);
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      setOutputText('An error occurred while processing your request.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const processSentimentResult = (result) => {
    const match = result.match(/Sentiment: (\w+) \(Score: ([\d.]+)\)/);
    if (match) {
      const [, sentiment, score] = match;
      const scoreValue = parseFloat(score);

      let positive = 0, neutral = 0, negative = 0;
      switch (sentiment.toLowerCase()) {
        case 'positive':
          positive = scoreValue * 100;
          neutral = (1 - scoreValue) * 50;
          negative = (1 - scoreValue) * 50;
          break;
        case 'neutral':
          neutral = scoreValue * 100;
          positive = (1 - scoreValue) * 50;
          negative = (1 - scoreValue) * 50;
          break;
        case 'negative':
          negative = scoreValue * 100;
          positive = (1 - scoreValue) * 50;
          neutral = (1 - scoreValue) * 50;
          break;
      }

      setAnalysisResult({
        type: 'sentiment',
        positive: Math.round(positive),
        neutral: Math.round(neutral),
        negative: Math.round(negative)
      });
    }
  };

  const processSummarizerResult = (result) => {
    // Split the result into sentences based on full stops
    const bulletPoints = result.split('.').map(point => point.trim()).filter(point => point !== '');
    setAnalysisResult({
      type: 'summarizer',
      summary: bulletPoints
    });
  };

  const processPlagiarismResult = (result) => {
    const match = result.match(/Plagiarism detected: (\d+)%/);
    if (match) {
      const plagiarismPercentage = parseInt(match[1]);
      setAnalysisResult({
        type: 'plagiarism',
        plagiarismPercentage
      });
    }
  };

  const processFakeNewsResult = (result) => {
    const match = result.match(/Fake news probability: (\d+)%/);
    if (match) {
      const fakeNewsProbability = parseInt(match[1]);
      setAnalysisResult({
        type: 'fake-news',
        fakeNewsProbability
      });
    }
  };

  const renderSentimentBars = () => {
    if (!analysisResult || analysisResult.type !== 'sentiment') return null;

    const maxSentiment = Math.max(analysisResult.positive, analysisResult.neutral, analysisResult.negative);
    const dominantSentiment = 
      maxSentiment === analysisResult.positive ? 'positive' :
      maxSentiment === analysisResult.negative ? 'negative' : 'neutral';

    const getColor = (sentiment) => {
      switch(sentiment) {
        case 'positive': return '#4CAF50';
        case 'neutral': return '#FFC107';
        case 'negative': return '#F44336';
        default: return '#000000';
      }
    };

    const getEmoji = (sentiment) => {
      switch(sentiment) {
        case 'positive': return '😊';
        case 'neutral': return '😐';
        case 'negative': return '😔';
        default: return '🤔';
      }
    };

    const circleVariants = {
      hidden: { pathLength: 0, opacity: 1 },
      visible: { 
        pathLength: maxSentiment / 100,
        opacity: 1,
        transition: { duration: 1, ease: "easeInOut" }
      }
    };

    const textVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.5 }
      }
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-2">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e0e0e0" 
              strokeWidth="10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getColor(dominantSentiment)}
              strokeWidth="10"
              strokeLinecap="round"
              initial="hidden"
              animate="visible"
              variants={circleVariants}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl mb-1">
              {getEmoji(dominantSentiment)}
            </div>
            <motion.div
              className="text-xl font-bold"
              style={{ color: getColor(dominantSentiment) }}
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              {dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)}
            </motion.div>
            <motion.div
              className="text-lg font-semibold text-gray-600"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              {Math.round(maxSentiment)}%
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    switch (analysisResult.type) {
      case 'sentiment':
        return renderSentimentBars();
      case 'summarizer':
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {analysisResult.summary.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        );
      case 'plagiarism':
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Plagiarism Detection:</h4>
            <div className="text-center mb-4">
              <span className="text-5xl font-bold">{analysisResult.plagiarismPercentage}%</span>
              <p className="text-lg">of text is likely plagiarized</p>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                <div
                  className="bg-red-600 h-4 rounded-full"
                  style={{ width: `${analysisResult.plagiarismPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                <span>Plagiarized</span>
              </div>
              <span>{analysisResult.plagiarismPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Original</span>
              </div>
              <span>{100 - analysisResult.plagiarismPercentage}%</span>
            </div>
            <p className="mt-4">
              {analysisResult.plagiarismPercentage > 20
                ? "High likelihood of plagiarism detected. Please review and cite your sources."
                : "Low likelihood of plagiarism detected. Good job on originality!"}
            </p>
          </div>
        );
      case 'fake-news':
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Fake News Analysis:</h4>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                <div
                  className="bg-yellow-400 h-4 rounded-full"
                  style={{ width: `${analysisResult.fakeNewsProbability}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold">{analysisResult.fakeNewsProbability}%</span>
            </div>
            <p className="mt-2">
              {analysisResult.fakeNewsProbability > 50
                ? "High probability of fake news. Please verify with trusted sources."
                : "Low probability of fake news. The content seems reliable."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setAnalysisResult(null);
  };

  const renderToolContent = () => {
    const currentTool = tools.find(t => t.id === selectedTool);

    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        setInputText(text);
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    };

    return (
      <div className="relative p-6">
        <div className="absolute inset-0 bg-blue-600 overflow-hidden">
          <div className="absolute inset-0">
            {renderFloatingIcons(currentTool.backgroundIcons)}
          </div>
          <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L1440,96L1440,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative z-10 bg-white p-6 rounded-lg shadow-md mt-16 mx-auto max-w-4xl">
          <div className="flex space-x-6">
            <div className="flex-1 flex flex-col">
              <div className="relative">
                <textarea
                  className="w-full h-64 p-4 pr-10 border border-gray-300 rounded mb-4 text-lg resize-none"
                  placeholder="Enter or paste your text and press 'Analyze'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={handleClearAll}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{inputText.split(/\s+/).filter(Boolean).length} Words</span>
                  <button 
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                    onClick={handlePaste}
                  >
                    Paste Text
                  </button>
                </div>
                <button 
                  className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-100 p-6 rounded-lg h-64 flex flex-col justify-center items-center">
                <h3 className="text-xl font-semibold mb-4">Analysis Result</h3>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    {renderAnalysisResult()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-72 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-3xl font-bold">News Analyst</h1>
        </div>
        <nav className="flex-grow flex flex-col">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`text-left p-6 flex items-center flex-grow ${
                selectedTool === tool.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <tool.icon className="mr-4" size={32} />
              <span className="text-lg font-medium">{tool.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{tools.find(t => t.id === selectedTool)?.name}</h2>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-lg">
              Contact us
            </button>
            <User className="text-gray-600" size={40} />
          </div>
        </header>
        <main>
          {renderToolContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;