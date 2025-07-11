import {
  useParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import { SettingsTypeModule } from '~/modules/SettingsTypeModule';
import { SettingsTypeAction } from '~/modules/SettingsTypeModule/action';
import { SettingsTypeLoader } from '~/modules/SettingsTypeModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return SettingsTypeLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return SettingsTypeAction(args);
}

export default function SettingsTypePage() {
  const type = useParams().type as string;

  switch (type) {
    case 'users':
      return <SettingsTypeModule />;
  }
}
