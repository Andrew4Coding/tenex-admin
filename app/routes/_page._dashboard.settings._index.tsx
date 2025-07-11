import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { SettingsGeneralModule } from '~/modules/SettingsGeneralModule';
import { SettingsGeneralAction } from '~/modules/SettingsGeneralModule/action';
import { SettingsGeneralLoader } from '~/modules/SettingsGeneralModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return SettingsGeneralLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return SettingsGeneralAction(args);
}

export default function SettingsGeneralPage() {
  return <SettingsGeneralModule />;
}
