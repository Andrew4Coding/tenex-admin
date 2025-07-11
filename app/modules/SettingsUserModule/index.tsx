import { useLoaderData } from 'react-router';
import DataTable from '~/components/ui/data-table';
import { SettingsUserLoader } from './loader';

export const SettingsUserModule = () => {
  const { allowedUsers } = useLoaderData<typeof SettingsUserLoader>();
  return (
    <>
      <DataTable data={[]} modelName="user" />
    </>
  )
}
