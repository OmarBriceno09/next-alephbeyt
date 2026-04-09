import {getAlephBeytData} from '@/sanity/sanity-utils'
import WindowManager from './components/WindowManager';

async function getMarkdown(path: string): Promise<string> {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/markdown?path=${encodeURIComponent(path)}`);

  if (!res.ok) {
    const text = await res.text();
    console.error("FETCH ERROR BODY:", text);
    return text;
    //throw new Error(`Failed to fetch markdown: ${res.status}`);
  }

  return res.text();
}


export default async function Home() {
  const fetchedData = await getAlephBeytData();
  const gitMarkdown = await getMarkdown("Proto-Sinaitic/01_א (Aleph)_Website_Data.md");

  return (
    <div 
      className="overflow-hidden bg-white text-black flex flex-col items-center"
      style={{
        height: "100vh",
        maxHeight: "100dvh",
        overscrollBehavior: "none"
      }}
    >
      <WindowManager
        scripts={fetchedData.scripts}
        mapTreeNodes={fetchedData.mapTreeNodes}
        letterIllustrations={fetchedData.letterIllustrations}
        testGitMarkdown={gitMarkdown}
      />
    </div>
  );
}