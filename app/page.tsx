import {getCharacters} from '@/sanity/sanity-utils'
import {getScripts} from '@/sanity/sanity-utils'
import CharacterGrid from './components/CharacterGrid';

export default async function Home() {
  const hebrewChars = await getCharacters();
  const allScritps = await getScripts();


  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center">
        Phoenicians
      </h1>
      <CharacterGrid characters={hebrewChars} scripts={allScritps} />
    </div>
  );
}