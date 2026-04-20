interface GalaxyTypeCardProps {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
}

const GalaxyTypeCard = ({ name, type, description, image }: GalaxyTypeCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
            {type}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <button className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300">
          了解更多
        </button>
      </div>
    </div>
  );
};

export default GalaxyTypeCard;