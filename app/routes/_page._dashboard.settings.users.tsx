import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { SettingsUserModule } from '~/modules/SettingsUserModule';
import { SettingsUserAction } from '~/modules/SettingsUserModule/action';
import { SettingsUserLoader } from '~/modules/SettingsUserModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return SettingsUserLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return SettingsUserAction(args);
}

export default function SettingsUserPage() {
  return <SettingsUserModule />;
}
