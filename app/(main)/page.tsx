import {getAlephBeytData} from '@/sanity/sanity-utils'
import WindowManager from './components/WindowManager';

//Delete this later, for testing git file markdown
async function getMarkdown(): Promise<string> {
  const markdown_url = "https://raw.githubusercontent.com/KymBrock/Alephbeyt.org/refs/heads/main/Proto-Sinaitic/01_%D7%90%20(Aleph)_Website_Data.md?token=GHSAT0AAAAAADVRP2UEL6BG7R52UWANUGCM2OUA7BQ";

  const res = await fetch(
    markdown_url,
    { cache: "no-store" }
  );

  console.log("STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("FETCH ERROR BODY:", text);
    throw new Error(`Failed to fetch markdown: ${res.status}`);
  }

  return res.text();
}
//delete above later


export default async function Home() {
  const fetchedData = await getAlephBeytData();
  const gitMarkdown = await getMarkdown();

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