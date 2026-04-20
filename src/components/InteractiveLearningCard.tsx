import { useState } from 'react';

interface LearningCardProps {
  id: string;
  title: string;
  category: 'solar' | 'wonder' | 'galaxy';
  image: string;
  summary: string;
  details: string;
  additionalInfo?: string;
}

const InteractiveLearningCard = ({ title, category, summary, details, additionalInfo }: LearningCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = () => {
    switch (category) {
      case 'solar': return 'from-yellow-50 to-orange-50 border-yellow-100';
      case 'wonder': return 'from-blue-50 to-purple-50 border-blue-100';
      case 'galaxy': return 'from-indigo-50 to-violet-50 border-indigo-100';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'solar': return '☀️';
      case 'wonder': return '✨';
      case 'galaxy': return '🌌';
      default: return '📚';
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br ${getCategoryColor()} rounded-lg shadow-md border overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl">{getCategoryIcon()}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex justify-between items-center">
                {title}
                <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </h3>
              <p className="text-gray-600 text-sm">{summary}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-4 mb-4">
            <p className="text-gray-700 text-sm mb-4">{details}</p>
            {additionalInfo && (
              <p className="text-gray-600 text-sm italic">{additionalInfo}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              收起
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLearningCard;