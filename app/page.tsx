import {getScripts} from '@/sanity/sanity-utils'
import LetterGrid from './components/LetterGrid';

export default async function Home() {
  const allScripts = await getScripts();


  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-10 overflow-x-hidden">
      <LetterGrid scripts={allScripts} />
    </div>
  );
}