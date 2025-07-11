'use client';

export default function Footer() {
  const topButtons = ['Alphabet', 'Language', 'Letter', 'Games'];
  const bottomButtons = ['Basic States', 'Symbols', 'Lexicon', 'Summary', 'Timeline'];

  const renderButtons = (labels: string[]) =>
    labels.map((label, i) => (
        <button
            key={i}
            onClick={() => alert(`Clicked on ${label}`)}
            className="w-full h-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200"
            >
            {label}
        </button>
  ));

  return (
    <footer className="fixed bottom-0 left-0 w-full h-[7vh] bg-white z-50">
      <div className="grid grid-rows-2 h-full">
        {/* Top Row (4 buttons) */}
        <div className="grid grid-cols-4">
            {renderButtons(topButtons)}
        </div>

        {/* Bottom Row (5 buttons) */}
        <div className="grid grid-cols-5">
            {renderButtons(bottomButtons)}
        </div>
      </div>
    </footer>
  );
}