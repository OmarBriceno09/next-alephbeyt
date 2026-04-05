import {getAlephBeytData} from '@/sanity/sanity-utils'
import WindowManager from './components/WindowManager';

export default async function Home() {
  const fetchedData = await getAlephBeytData();


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
      />
    </div>
  );
}