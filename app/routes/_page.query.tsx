import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { QueryModule } from '~/modules/QueryModule';
import { QueryAction } from '~/modules/QueryModule/action';
import { QueryLoader } from '~/modules/QueryModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return QueryLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return QueryAction(args);
}

export default function QueryPage() {
  return <QueryModule />;
}
