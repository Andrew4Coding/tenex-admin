import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { ModelModule } from '~/modules/ModelModule';
import { ModelAction } from '~/modules/ModelModule/action';
import { ModelLoader } from '~/modules/ModelModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return ModelLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return ModelAction(args);
}

export default function ModelPage() {
  return <ModelModule />;
}
