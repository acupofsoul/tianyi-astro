interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  icon: string;
}

interface AstronomyKnowledgeProps {
  knowledge: KnowledgeCard[];
}

const AstronomyKnowledge = ({ knowledge }: AstronomyKnowledgeProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {knowledge.map((item) => (
        <div key={item.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg shadow-md border border-indigo-100">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <img src={item.icon} alt={item.title} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AstronomyKnowledge;