import React, { useState } from 'react';
import BlogPostCreator from './components/BlogPostCreator';
import SavedBlogPosts from './components/SavedBlogPosts';

const SEOAnalysisApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [url, setUrl] = useState('');
  const [numPages, setNumPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [apiLogs, setApiLogs] = useState([]);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState({});
  const [activeTab, setActiveTab] = useState('audience');
  
  // New state for blog post creation
  const [selectedHeadline, setSelectedHeadline] = useState(null);
  const [showBlogCreator, setShowBlogCreator] = useState(false);
  const [savedBlogPosts, setSavedBlogPosts] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);

  const API_BASE = 'https://builder.empromptu.ai/api_tools';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 19007707218c20063f24c9eaded8d89a',
    'X-Generated-App-ID': '8c95082e-bbaa-47e5-982a-1fbffb00d058',
    'X-Usage-Key': '3eb1b4c242425a6d0d637528a7f18fe0'
  };

  const logApiCall = (endpoint, payload, response) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [...prev, {
      timestamp,
      endpoint,
      payload: JSON.stringify(payload, null, 2),
      response: JSON.stringify(response, null, 2)
    }]);
  };

  const parseTextContent = (text) => {
    if (!text || typeof text !== 'string') {
      console.log('parseTextContent: Invalid input', typeof text, text);
      return {};
    }
    
    console.log('parseTextContent: Processing text:', text.substring(0, 500) + '...');
    
    const sections = {};
    const lines = text.split('\n');
    let currentSection = 'general';
    let currentContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      const lowerLine = trimmedLine.toLowerCase();
      
      // More flexible section detection - look for keywords anywhere in the line
      if (lowerLine.includes('target audience') || 
          lowerLine.includes('ð¯') || 
          (lowerLine.includes('audience') && !lowerLine.includes('content'))) {
        
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'target_audience';
        currentContent = [];
        console.log('Found target audience section at line:', i, trimmedLine);
        
        // Skip the header line itself
        continue;
      } 
      else if (lowerLine.includes('main topics') || 
               lowerLine.includes('ð') ||
               (lowerLine.includes('topics') && !lowerLine.includes('content'))) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'main_topics';
        currentContent = [];
        console.log('Found main topics section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('content themes') || 
               lowerLine.includes('ð¨') ||
               (lowerLine.includes('themes') && !lowerLine.includes('main'))) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'content_themes';
        currentContent = [];
        console.log('Found content themes section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('business focus') || 
               lowerLine.includes('ð¢') ||
               (lowerLine.includes('business') && !lowerLine.includes('for'))) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'business_focus';
        currentContent = [];
        console.log('Found business focus section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('high volume keywords') || 
               lowerLine.includes('high volume') || 
               lowerLine.includes('ð¥')) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'high_volume_keywords';
        currentContent = [];
        console.log('Found high volume keywords section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('long tail') || 
               lowerLine.includes('long-tail')) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'long_tail_opportunities';
        currentContent = [];
        console.log('Found long tail section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('content gaps')) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'content_gaps';
        currentContent = [];
        console.log('Found content gaps section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('competitor') && lowerLine.includes('keyword')) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'competitor_keywords';
        currentContent = [];
        console.log('Found competitor section at line:', i, trimmedLine);
        continue;
      }
      else if (lowerLine.includes('seasonal')) {
        
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'seasonal_opportunities';
        currentContent = [];
        console.log('Found seasonal section at line:', i, trimmedLine);
        continue;
      }
      
      // Add content to current section, but skip obvious header-only lines
      if (!trimmedLine.match(/^\*\*[^*]+\*\*:?\s*$/) && 
          !trimmedLine.match(/^[ð¯ðð¨ð¢ð¥ððð]+\s*[A-Z][^:]*:?\s*$/) &&
          !trimmedLine.match(/^[A-Z\s]+:?\s*$/) &&
          trimmedLine !== '--') {
        currentContent.push(line); // Keep original formatting
      }
    }
    
    // Add the last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }
    
    // Clean up sections - remove trailing help text
    Object.keys(sections).forEach(key => {
      if (sections[key]) {
        const lines = sections[key].split('\n');
        const cleanedLines = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          // Stop at common trailing phrases
          if (trimmed.toLowerCase().includes('if you need') || 
              trimmed.toLowerCase().includes('i can also help') ||
              trimmed.toLowerCase().includes('suggest content outlines') ||
              trimmed.toLowerCase().includes('feel free to ask') ||
              trimmed === '--') {
            break;
          }
          cleanedLines.push(line);
        }
        
        sections[key] = cleanedLines.join('\n').trim();
      }
    });
    
    console.log('parseTextContent: Final sections:', Object.keys(sections));
    console.log('parseTextContent: Section contents:', sections);
    return sections;
  };

  const parseHeadlinesByCategory = (text) => {
    if (!text || typeof text !== 'string') return {};
    
    const categories = {
      'how_to_guides': [],
      'listicles': [],
      'case_studies': [],
      'comparison_guides': [],
      'trend_insights': []
    };
    
    const lines = text.split('\n');
    let currentCategory = null;
    let currentHeadline = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const lowerLine = line.toLowerCase();
      
      // Detect category headers
      if (lowerLine.includes('how-to guides') || lowerLine.includes('how to guides')) {
        if (currentHeadline && currentCategory) {
          categories[currentCategory].push(currentHeadline);
        }
        currentCategory = 'how_to_guides';
        currentHeadline = null;
        continue;
      } else if (lowerLine.includes('listicles')) {
        if (currentHeadline && currentCategory) {
          categories[currentCategory].push(currentHeadline);
        }
        currentCategory = 'listicles';
        currentHeadline = null;
        continue;
      } else if (lowerLine.includes('case studies')) {
        if (currentHeadline && currentCategory) {
          categories[currentCategory].push(currentHeadline);
        }
        currentCategory = 'case_studies';
        currentHeadline = null;
        continue;
      } else if (lowerLine.includes('comparison guides')) {
        if (currentHeadline && currentCategory) {
          categories[currentCategory].push(currentHeadline);
        }
        currentCategory = 'comparison_guides';
        currentHeadline = null;
        continue;
      } else if (lowerLine.includes('trend') || lowerLine.includes('insight')) {
        if (currentHeadline && currentCategory) {
          categories[currentCategory].push(currentHeadline);
        }
        currentCategory = 'trend_insights';
        currentHeadline = null;
        continue;
      }
      
      // Skip category header lines and metadata-only lines
      if (line.match(/^\*\*[^*]+\*\*/) || 
          line.match(/^[A-Z\s]+\(\d+/) ||
          line.includes('ð') ||
          line.includes('ð¯') ||
          line.includes('ð') ||
          line.includes('Target keyword:') ||
          line.includes('Content type:') ||
          line.includes('Difficulty:') ||
          line.includes('Search intent:') ||
          line.includes('Audience Level:') ||
          line.includes('Intent:') ||
          line.includes('âï¸ Create Blog Post') ||
          line.includes('If you want me to generate') ||
          line.includes('just let me know')) {
        continue;
      }
      
      // Check if this looks like a headline (substantial text, not just metadata)
      if (currentCategory && line.length > 20 && !line.match(/^[-â¢*]\s*$/)) {
        // If we have a previous headline, save it
        if (currentHeadline) {
          categories[currentCategory].push(currentHeadline);
        }
        
        // Start a new headline - clean up the title
        const cleanTitle = line.replace(/^[-â¢*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        
        currentHeadline = {
          title: cleanTitle,
          content_type: 'guide',
          estimated_difficulty: 'intermediate',
          search_intent: 'informational',
          target_keyword: ''
        };
      }
    }
    
    // Don't forget the last headline
    if (currentHeadline && currentCategory) {
      categories[currentCategory].push(currentHeadline);
    }
    
    // Remove duplicates and clean up
    Object.keys(categories).forEach(key => {
      const seen = new Set();
      categories[key] = categories[key].filter(headline => {
        if (seen.has(headline.title)) {
          return false;
        }
        seen.add(headline.title);
        return true;
      });
    });
    
    console.log('Parsed headlines by category:', categories);
    return categories;
  };

  const generateSitemapUrls = (baseUrl) => {
    const commonPaths = [
      '',
      '/about',
      '/services',
      '/products',
      '/blog',
      '/contact',
      '/pricing',
      '/features',
      '/solutions',
      '/resources'
    ];
    
    const cleanUrl = baseUrl.replace(/\/$/, '');
    return commonPaths.map(path => cleanUrl + path).slice(0, numPages);
  };

  const runSEOAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setCurrentStep(2);
    setApiLogs([]);

    try {
      // Step 1: Generate URLs to scrape
      setProgress('Generating page URLs to analyze...');
      const urlsToScrape = generateSitemapUrls(url);
      
      // Step 2: Scrape multiple pages
      setProgress(`Scraping ${urlsToScrape.length} pages from the website...`);
      const scrapePayload = {
        created_object_name: 'website_pages',
        data_type: 'urls',
        input_data: urlsToScrape
      };

      const scrapeResponse = await fetch(`${API_BASE}/input_data`, {
        method: 'POST',
        headers,
        body: JSON.stringify(scrapePayload)
      });

      const scrapeResult = await scrapeResponse.json();
      logApiCall('/input_data', scrapePayload, scrapeResult);

      if (!scrapeResponse.ok) {
        throw new Error('Failed to scrape website pages');
      }

      // Step 3: Analyze content for target audience and topics
      setProgress('Analyzing content for target audience and key topics...');
      const audiencePayload = {
        created_object_names: ['audience_analysis'],
        prompt_string: `Analyze this website content: {website_pages}

Please provide a comprehensive analysis with these EXACT section headers:

TARGET AUDIENCE:
- Primary demographics and user types
- Key pain points (list 3-5 specific problems)
- Main interests and goals

MAIN TOPICS:
- List 5-7 core topics covered by the website
- Include both primary and secondary themes

CONTENT THEMES:
- 3-4 overarching content themes or messaging pillars

BUSINESS FOCUS:
- Clear description of what the business does and its value proposition

Format your response with clear headers and bullet points for easy reading. Use the exact headers shown above.`,
        inputs: [{
          input_object_name: 'website_pages',
          mode: 'combine_events'
        }]
      };

      const audienceResponse = await fetch(`${API_BASE}/apply_prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify(audiencePayload)
      });

      const audienceResult = await audienceResponse.json();
      logApiCall('/apply_prompt', audiencePayload, audienceResult);

      if (!audienceResponse.ok) {
        throw new Error('Failed to analyze audience and topics');
      }

      // Step 4: Research traffic-driving topics and keywords
      setProgress('Researching high-traffic keywords and search volumes...');
      const keywordPayload = {
        created_object_names: ['keyword_research'],
        prompt_string: `Based on this audience analysis: {audience_analysis}

Generate a comprehensive keyword research report with these EXACT section headers:

HIGH VOLUME KEYWORDS:
List 8-10 keywords with their estimated search volume (High/Medium/Low) and competition level (High/Medium/Low)

LONG TAIL OPPORTUNITIES:
List 8-10 long-tail keyword phrases with:
- Search intent (Informational/Commercial/Navigational)
- Difficulty level (Easy/Medium/Hard)

CONTENT GAPS:
Identify 5-6 content opportunities not currently addressed

COMPETITOR KEYWORDS:
List 5-7 keywords competitors are likely targeting

Format with clear headers and organized lists for easy scanning. Use the exact headers shown above and do not include any trailing help text.`,
        inputs: [{
          input_object_name: 'audience_analysis',
          mode: 'combine_events'
        }]
      };

      const keywordResponse = await fetch(`${API_BASE}/apply_prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify(keywordPayload)
      });

      const keywordResult = await keywordResponse.json();
      logApiCall('/apply_prompt', keywordPayload, keywordResult);

      if (!keywordResponse.ok) {
        throw new Error('Failed to research keywords');
      }

      // Step 5: Generate blog post headlines
      setProgress('Generating compelling blog post headlines...');
      const headlinesPayload = {
        created_object_names: ['blog_headlines'],
        prompt_string: `Using this audience analysis: {audience_analysis} and keyword research: {keyword_research}

Generate compelling blog post headlines organized by category. Provide ONLY the headlines, one per line, under each category header:

HOW-TO GUIDES:
[List 5 how-to headlines, one per line]

LISTICLES:
[List 5 listicle headlines, one per line]

CASE STUDIES:
[List 3 case study headlines, one per line]

COMPARISON GUIDES:
[List 4 comparison headlines, one per line]

TREND/INSIGHT ARTICLES:
[List 3 trend/insight headlines, one per line]

Make sure each headline is practical, actionable, and includes relevant keywords from the research. Do NOT include any metadata, tags, or additional text - just the headlines themselves.`,
        inputs: [
          {
            input_object_name: 'audience_analysis',
            mode: 'combine_events'
          },
          {
            input_object_name: 'keyword_research',
            mode: 'combine_events'
          }
        ]
      };

      const headlinesResponse = await fetch(`${API_BASE}/apply_prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify(headlinesPayload)
      });

      const headlinesResult = await headlinesResponse.json();
      logApiCall('/apply_prompt', headlinesPayload, headlinesResult);

      if (!headlinesResponse.ok) {
        throw new Error('Failed to generate headlines');
      }

      // Step 6: Retrieve all results
      setProgress('Compiling final SEO analysis report...');
      
      const audienceDataPayload = {
        object_name: 'audience_analysis',
        return_type: 'pretty_text'
      };

      const keywordDataPayload = {
        object_name: 'keyword_research',
        return_type: 'pretty_text'
      };

      const headlinesDataPayload = {
        object_name: 'blog_headlines',
        return_type: 'pretty_text'
      };

      const [audienceData, keywordData, headlinesData] = await Promise.all([
        fetch(`${API_BASE}/return_data`, {
          method: 'POST',
          headers,
          body: JSON.stringify(audienceDataPayload)
        }).then(async r => {
          const result = await r.json();
          logApiCall('/return_data', audienceDataPayload, result);
          return result;
        }),
        
        fetch(`${API_BASE}/return_data`, {
          method: 'POST',
          headers,
          body: JSON.stringify(keywordDataPayload)
        }).then(async r => {
          const result = await r.json();
          logApiCall('/return_data', keywordDataPayload, result);
          return result;
        }),
        
        fetch(`${API_BASE}/return_data`, {
          method: 'POST',
          headers,
          body: JSON.stringify(headlinesDataPayload)
        }).then(async r => {
          const result = await r.json();
          logApiCall('/return_data', headlinesDataPayload, result);
          return result;
        })
      ]);

      setRawData({
        audience: audienceData,
        keywords: keywordData,
        headlines: headlinesData
      });

      console.log('Raw audience data:', audienceData);
      console.log('Raw keywords data:', keywordData);

      // Parse the text content from the API responses
      const parsedAudience = parseTextContent(audienceData.value);
      const parsedKeywords = parseTextContent(keywordData.value);
      const categorizedHeadlines = parseHeadlinesByCategory(headlinesData.value);

      console.log('Parsed audience:', parsedAudience);
      console.log('Parsed keywords:', parsedKeywords);

      setResults({
        audience: parsedAudience,
        keywords: parsedKeywords,
        headlines: categorizedHeadlines,
        analyzedPages: urlsToScrape.length,
        rawData: {
          audience: audienceData.value,
          keywords: keywordData.value,
          headlines: headlinesData.value
        }
      });

      setCurrentStep(3);
      setProgress('Analysis complete!');

    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('SEO Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteObjects = async () => {
    const objectsToDelete = ['website_pages', 'audience_analysis', 'keyword_research', 'blog_headlines'];
    
    for (const objectName of objectsToDelete) {
      try {
        await fetch(`${API_BASE}/objects/${objectName}`, {
          method: 'DELETE',
          headers
        });
      } catch (err) {
        console.error(`Failed to delete ${objectName}:`, err);
      }
    }
    
    setResults(null);
    setRawData({});
    setApiLogs([]);
    setCurrentStep(1);
    alert('All data objects deleted successfully!');
  };

  const downloadCSV = () => {
    if (!results) return;
    
    let csvContent = 'Analysis Type,Content\n';
    
    // Add audience data
    if (results.rawData.audience) {
      csvContent += `"Target Audience","${results.rawData.audience.replace(/"/g, '""')}"\n`;
    }
    
    // Add keyword data
    if (results.rawData.keywords) {
      csvContent += `"Keywords","${results.rawData.keywords.replace(/"/g, '""')}"\n`;
    }
    
    // Add headlines data
    if (results.rawData.headlines) {
      csvContent += `"Headlines","${results.rawData.headlines.replace(/"/g, '""')}"\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-analysis-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // New functions for blog post creation
  const handleCreateBlogPost = (headline) => {
    setSelectedHeadline(headline);
    setShowBlogCreator(true);
  };

  const handleSaveBlogPost = (blogPostData) => {
    setSavedBlogPosts(prev => [...prev, {
      ...blogPostData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }]);
    setShowBlogCreator(false);
    setSelectedHeadline(null);
  };

  const handleDeleteBlogPost = (index) => {
    setSavedBlogPosts(prev => prev.filter((_, i) => i !== index));
  };

  const renderInfoCard = (title, content, icon, bgColor, textColor) => {
    if (!content) return null;
    
    const paragraphs = content.split('\n').filter(p => p.trim());
    
    return (
      <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 ${textColor} rounded-lg flex items-center justify-center text-xl mr-3`}>
            {icon}
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h4>
        </div>
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => {
            const trimmed = paragraph.trim();
            
            if (!trimmed) return null;
            
            if (trimmed.startsWith('-') || trimmed.startsWith('â¢') || trimmed.match(/^\d+\./)) {
              return (
                <div key={index} className="flex items-start group">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:bg-blue-600 transition-colors"></div>
                  <p className="text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                    {trimmed.replace(/^[-â¢]\s*/, '').replace(/^\d+\.\s*/, '')}
                  </p>
                </div>
              );
            }
            
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  const renderKeywordCard = (title, content, icon, bgColor, textColor) => {
    if (!content) return null;
    
    const items = content.split('\n').filter(p => p.trim());
    
    return (
      <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 ${textColor} rounded-lg flex items-center justify-center text-xl mr-3`}>
            {icon}
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h4>
        </div>
        <div className="grid gap-3">
          {items.map((item, index) => {
            const trimmed = item.trim();
            if (!trimmed) return null;
            
            const cleanItem = trimmed.replace(/^[-â¢]\s*/, '').replace(/^\d+\.\s*/, '');
            
            // Check if it contains volume/difficulty indicators
            const hasMetrics = cleanItem.match(/(High|Medium|Low|Easy|Hard)/gi);
            
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <p className="text-gray-800 dark:text-gray-200 flex-1 font-medium">
                    {cleanItem.split('(')[0].trim()}
                  </p>
                  {hasMetrics && (
                    <div className="flex gap-1 ml-2">
                      {hasMetrics.map((metric, i) => (
                        <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${
                          metric.toLowerCase() === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          metric.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          metric.toLowerCase() === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          metric.toLowerCase() === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          metric.toLowerCase() === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {metric}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeadlineCard = (headline, index) => (
    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group">
      <h5 className="font-bold text-gray-900 dark:text-white mb-4 leading-tight text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {headline.title}
      </h5>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
          ð {headline.content_type || 'guide'}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          headline.estimated_difficulty === 'beginner' ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200' :
          headline.estimated_difficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 text-yellow-800 dark:text-yellow-200' :
          'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 text-red-800 dark:text-red-200'
        }`}>
          ð¯ {headline.estimated_difficulty || 'intermediate'}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          headline.search_intent === 'commercial' ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200' :
          headline.search_intent === 'informational' ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200' :
          'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-800 dark:text-purple-200'
        }`}>
          ð {headline.search_intent || 'informational'}
        </span>
      </div>
      {headline.target_keyword && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-blue-500 mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            ð¯ Target Keyword: <span className="text-gray-900 dark:text-white font-semibold">{headline.target_keyword}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderHeadlineCategory = (title, headlines, icon, bgColor, count) => {
    if (!headlines || headlines.length === 0) return null;
    
    return (
      <div className={`${bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl mr-4 shadow-sm">
              {icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-xl">{title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{headlines.length} headlines generated</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{headlines.length}</span>
          </div>
        </div>
        
        {/* Add single Create Blog Post button for the category */}
        <div className="mb-6">
          <button
            onClick={() => {
              // Create a sample headline object for the category
              const sampleHeadline = {
                title: headlines[0]?.title || `Sample ${title} Post`,
                content_type: title.toLowerCase().includes('how-to') ? 'guide' : 
                             title.toLowerCase().includes('listicle') ? 'listicle' :
                             title.toLowerCase().includes('case') ? 'case_study' :
                             title.toLowerCase().includes('comparison') ? 'comparison' : 'insight',
                estimated_difficulty: 'intermediate',
                search_intent: 'informational',
                target_keyword: headlines[0]?.title?.split(' ').slice(0, 3).join(' ') || 'sample keyword'
              };
              handleCreateBlogPost(sampleHeadline);
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            âï¸ Create Blog Post from This Category
          </button>
        </div>
        
        <div className="grid gap-4">
          {headlines.map((headline, index) => renderHeadlineCard(headline, index))}
        </div>
      </div>
    );
  };

  const renderAudienceAnalysis = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No structured audience analysis data available</p>
          {results?.rawData?.audience && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">ð Raw Analysis Data:</h5>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {results.rawData.audience}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.business_focus && renderInfoCard(
          "Business Focus", 
          data.business_focus, 
          "ð¢", 
          "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
          "bg-blue-500 text-white"
        )}
        
        {data.target_audience && renderInfoCard(
          "Target Audience", 
          data.target_audience, 
          "ð¯", 
          "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
          "bg-green-500 text-white"
        )}
        
        {data.main_topics && renderInfoCard(
          "Main Topics", 
          data.main_topics, 
          "ð", 
          "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
          "bg-purple-500 text-white"
        )}
        
        {data.content_themes && renderInfoCard(
          "Content Themes", 
          data.content_themes, 
          "ð¨", 
          "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
          "bg-orange-500 text-white"
        )}
      </div>
    );
  };

  const renderKeywordResearch = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No structured keyword research data available</p>
          {results?.rawData?.keywords && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">ð Raw Keyword Research Data:</h5>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {results.rawData.keywords}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.high_volume_keywords && renderKeywordCard(
          "High Volume Keywords", 
          data.high_volume_keywords, 
          "ð¥", 
          "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
          "bg-red-500 text-white"
        )}
        
        {data.long_tail_opportunities && renderKeywordCard(
          "Long Tail Opportunities", 
          data.long_tail_opportunities, 
          "ð¯", 
          "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
          "bg-blue-500 text-white"
        )}
        
        {data.content_gaps && renderKeywordCard(
          "Content Gaps", 
          data.content_gaps, 
          "ð", 
          "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
          "bg-yellow-500 text-white"
        )}
        
        {data.competitor_keywords && renderKeywordCard(
          "Competitor Keywords", 
          data.competitor_keywords, 
          "ð", 
          "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
          "bg-purple-500 text-white"
        )}
      </div>
    );
  };

  const renderBlogHeadlines = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No structured blog headlines generated</p>
          {results?.rawData?.headlines && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">ð Raw Headlines Data:</h5>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {results.rawData.headlines}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {renderHeadlineCategory(
          "How-To Guides", 
          data.how_to_guides, 
          "ð ï¸", 
          "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
        )}
        
        {renderHeadlineCategory(
          "Listicles", 
          data.listicles, 
          "ð", 
          "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
        )}
        
        {renderHeadlineCategory(
          "Case Studies", 
          data.case_studies, 
          "ð", 
          "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
        )}
        
        {renderHeadlineCategory(
          "Comparison Guides", 
          data.comparison_guides, 
          "âï¸", 
          "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
        )}
        
        {renderHeadlineCategory(
          "Trend & Insight Articles", 
          data.trend_insights, 
          "ð®", 
          "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20"
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'audience', label: 'Audience Analysis', icon: 'ð¯' },
    { id: 'keywords', label: 'Keywords', icon: 'ð' },
    { id: 'headlines', label: 'Blog Headlines', icon: 'ð' }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-2xl">ð</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    SEO Analysis Tool
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Multi-page website analysis & content strategy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* NEW: Saved Blog Posts Button */}
                {savedBlogPosts.length > 0 && (
                  <button
                    onClick={() => setShowSavedPosts(true)}
                    className="relative p-3 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all duration-200 shadow-sm"
                    aria-label="View saved blog posts"
                  >
                    ð
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {savedBlogPosts.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? 'âï¸' : 'ð'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Upload Card */}
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-10">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl text-white">ð</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Website SEO Analysis
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Enter a website URL to analyze multiple pages for comprehensive SEO insights
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label htmlFor="url-input" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Website URL
                    </label>
                    <input
                      id="url-input"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg transition-all duration-200"
                      aria-describedby="url-help"
                    />
                    <p id="url-help" className="mt-3 text-gray-500 dark:text-gray-400">
                      Enter the main URL of the website you want to analyze
                    </p>
                  </div>

                  <div>
                    <label htmlFor="pages-select" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Number of Pages to Analyze
                    </label>
                    <select
                      id="pages-select"
                      value={numPages}
                      onChange={(e) => setNumPages(parseInt(e.target.value))}
                      className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200"
                    >
                      <option value={3}>3 pages</option>
                      <option value={5}>5 pages</option>
                      <option value={7}>7 pages</option>
                      <option value={10}>10 pages</option>
                    </select>
                  </div>

                  <button
                    onClick={runSEOAnalysis}
                    disabled={!url.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-2xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 shadow-lg text-lg"
                    aria-label="Start SEO analysis"
                  >
                    ð Start SEO Analysis
                  </button>
                </div>

                {error && (
                  <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                    <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Progress Screen */}
          {currentStep === 2 && loading && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full spinner"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Analyzing Website...
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8" aria-live="polite">
                    {progress}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8 shadow-inner">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm" style={{width: '60%'}}></div>
                  </div>
                  <button
                    onClick={() => {
                      setLoading(false);
                      setCurrentStep(1);
                    }}
                    className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                    aria-label="Cancel analysis"
                  >
                    Cancel Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && results && (
            <div className="space-y-8">
              {/* Results Header */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <span className="text-white text-3xl">â</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Analysis Complete!
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Analyzed {results.analyzedPages} pages from <span className="font-semibold text-blue-600 dark:text-blue-400">{url}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={downloadCSV}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-500/20 shadow-lg font-medium"
                      aria-label="Download results as CSV"
                    >
                      ð¥ Download CSV
                    </button>
                    <button
                      onClick={() => setShowRawData(!showRawData)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 shadow-lg font-medium"
                      aria-label="Show raw API data"
                    >
                      ð Raw Data
                    </button>
                    <button
                      onClick={deleteObjects}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20 shadow-lg font-medium"
                      aria-label="Delete all data objects"
                    >
                      ðï¸ Delete Objects
                    </button>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl transition-all duration-200 focus:ring-4 focus:ring-purple-500/20 shadow-lg font-medium"
                      aria-label="Start new analysis"
                    >
                      ð New Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2 text-lg">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                {activeTab === 'audience' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-2xl">ð¯</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Target Audience & Topics Analysis
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">Understanding your website's core audience and content themes</p>
                      </div>
                    </div>
                    {renderAudienceAnalysis(results.audience)}
                  </div>
                )}

                {activeTab === 'keywords' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-2xl">ð</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Keyword Research & Opportunities
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">High-impact keywords and content opportunities for your niche</p>
                      </div>
                    </div>
                    {renderKeywordResearch(results.keywords)}
                  </div>
                )}

                {activeTab === 'headlines' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-2xl">ð</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Suggested Blog Post Headlines
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">Ready-to-use content ideas organized by type and difficulty</p>
                      </div>
                    </div>
                    {renderBlogHeadlines(results.headlines)}
                  </div>
                )}
              </div>

              {/* Raw Data Modal */}
              {showRawData && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Raw API Data & Logs
                    </h3>
                    <button
                      onClick={() => setShowRawData(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      â
                    </button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {apiLogs.map((log, index) => (
                      <details key={index} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                        <summary className="p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          [{log.timestamp}] {log.endpoint}
                        </summary>
                        <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                          <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Request:</h4>
                            <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto border">
                              {log.payload}
                            </pre>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Response:</h4>
                            <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto border">
                              {log.response}
                            </pre>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NEW: Blog Post Creator Modal */}
        {showBlogCreator && selectedHeadline && (
          <BlogPostCreator
            headline={selectedHeadline}
            onClose={() => {
              setShowBlogCreator(false);
              setSelectedHeadline(null);
            }}
            onSave={handleSaveBlogPost}
          />
        )}

        {/* NEW: Saved Blog Posts Modal */}
        {showSavedPosts && (
          <SavedBlogPosts
            savedPosts={savedBlogPosts}
            onClose={() => setShowSavedPosts(false)}
            onDelete={handleDeleteBlogPost}
          />
        )}
      </div>
    </div>
  );
};

export default SEOAnalysisApp;
