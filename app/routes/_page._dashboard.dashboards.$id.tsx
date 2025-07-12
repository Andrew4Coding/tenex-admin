import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { DashboardsModule } from '~/modules/DashboardsModule';
import { DashboardsAction } from '~/modules/DashboardsModule/action';
import { DashboardsLoader } from '~/modules/DashboardsModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return DashboardsLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return DashboardsAction(args);
}

export default function DashboardsPage() {
  return <DashboardsModule />;
}
