import { useState } from 'react';
import DataTable from '~/components/ui/data-table';

export const SettingsTypeModule = () => {
  const [users, setUsers] = useState([]);
  return (
    <>
      <DataTable data={users} modelName="user" />
    </>
  )
}
