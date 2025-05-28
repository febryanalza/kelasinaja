export default function DecorativeBackground() {
  return (
    <div className="lg:w-1/2 relative h-80 lg:h-auto flex items-center justify-center">
      <div className="relative w-full h-full flex justify-center items-center">
        <div className="absolute w-80 h-80 rounded-full bg-kelasin-purple opacity-5 animate-pulse-slower"></div>
        <div className="absolute w-64 h-64 rounded-full bg-kelasin-yellow opacity-5 animate-pulse-slowest"></div>
        <div className="w-48 h-48 bg-kelasin-purple bg-opacity-10 rounded-full flex items-center justify-center animate-float">
          <div className="w-32 h-32 bg-kelasin-yellow bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-kelasin-purple"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
