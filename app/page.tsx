import {getScripts} from '@/sanity/sanity-utils'
import LetterGrid from './components/LetterGrid';

export default async function Home() {
  const allScritps = await getScripts();


  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center">
        Phoenicians
      </h1>
      <LetterGrid scripts={allScritps} />
    </div>
  );
}