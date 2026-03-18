import {getAlephBeytData} from '@/sanity/sanity-utils'
import WindowManager from './components/WindowManager';

export default async function Home() {
  const fetchedData = await getAlephBeytData();


  return (
    <div className="min-h-screen overflow-hidden bg-white text-black flex flex-col items-center py-5">
      <WindowManager
        scripts={fetchedData.scripts}
        mapTreeNodes={fetchedData.mapTreeNodes}
      />
    </div>
  );
}