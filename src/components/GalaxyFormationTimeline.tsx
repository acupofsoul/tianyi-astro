interface GalaxyFormationStage {
  stage: number;
  title: string;
  description: string;
  image: string;
}

interface GalaxyFormationTimelineProps {
  stages: GalaxyFormationStage[];
}

const GalaxyFormationTimeline = ({ stages }: GalaxyFormationTimelineProps) => {
  return (
    <div className="relative">
      {/* 时间线 */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-200 transform md:translate-x-[-50%]"></div>
      
      {/* 时间线节点 */}
      <div className="space-y-12">
        {stages.map((stage, index) => (
          <div key={stage.stage} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            {/* 内容 */}
            <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-indigo-700 mb-2">{stage.title}</h3>
                <p className="text-gray-600 text-sm">{stage.description}</p>
              </div>
            </div>
            
            {/* 时间线节点 */}
            <div className="absolute left-0 md:left-1/2 top-6 transform md:translate-x-[-50%] w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow"></div>
            
            {/* 图片 */}
            <div className={`w-full md:w-1/2 mt-4 md:mt-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
              <div className="h-40 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={stage.image} 
                  alt={stage.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalaxyFormationTimeline;