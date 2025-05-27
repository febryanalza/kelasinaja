export default function DecorativeBackground() {
  return (
    <div className="hidden lg:block">
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-kelasin-yellow opacity-10 rounded-full"></div>
      <div className="absolute top-20 -right-10 w-40 h-40 bg-kelasin-purple opacity-10 rounded-full"></div>
      <div className="absolute -top-10 right-40 w-24 h-24 bg-kelasin-purple opacity-10 rounded-full"></div>
      <div className="absolute bottom-10 right-20 w-16 h-16 bg-kelasin-yellow opacity-10 rounded-full"></div>
    </div>
  );
}
