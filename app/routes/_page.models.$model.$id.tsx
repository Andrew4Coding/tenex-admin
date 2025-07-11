import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { ModelDetailModule } from '~/modules/ModelDetailModule';
import { ModelDetailAction } from '~/modules/ModelDetailModule/action';
import { ModelDetailLoader } from '~/modules/ModelDetailModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return ModelDetailLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return ModelDetailAction(args);
}

export default function ModelDetailPage() {
  return <ModelDetailModule />;
}
