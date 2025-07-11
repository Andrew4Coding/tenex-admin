import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RegisterModule } from '~/modules/RegisterModule';
import { RegisterAction } from '~/modules/RegisterModule/action';
import { RegisterLoader } from '~/modules/RegisterModule/loader';

export async function loader(args: LoaderFunctionArgs) {
  return RegisterLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return RegisterAction(args);
}

export default function RegisterPage() {
  return <RegisterModule />;
}
