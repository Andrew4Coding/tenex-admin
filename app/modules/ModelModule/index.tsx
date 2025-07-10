import { useLoaderData, useParams } from 'react-router';
import DataTable from '~/components/ui/data-table';
import { AddItemDialog } from './AddItemDialog';
import { ModelLoader } from './loader';

export const ModelModule = () => {
  const { modelFindMany, modelFields } = useLoaderData<typeof ModelLoader>();
  const param = useParams();

  return (
    <div className="flex flex-col h-full">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">{param.model}</h1>

        <AddItemDialog
          modelName={param.model || ''}
          modelFields={modelFields}
        />
      </div>
      <DataTable data={modelFindMany} className="flex-1 max-h-[calc(100vh-6rem)]" />
    </div>
  )
}
