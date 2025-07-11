import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { SettingsModule } from '~/modules/SettingsModule';
import { SettingsAction } from '~/modules/SettingsModule/action';
import { SettingsLoader } from '~/modules/SettingsModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return SettingsLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return SettingsAction(args);
}

export default function SettingsPage() {
  return <SettingsModule />;
}
