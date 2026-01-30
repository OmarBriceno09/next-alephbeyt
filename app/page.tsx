import {getAlephBeytData} from '@/sanity/sanity-utils'
import MainLayout from './components/MainLayout';

export default async function Home() {
  const fetchedData = await getAlephBeytData();


  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center py-5 overflow-x-hidden">
      <MainLayout 
        scripts={fetchedData.scripts}
        mapTreeNodes={fetchedData.mapTreeNodes}
      />
    </div>
  );
}