import { redirect } from 'vike/abort';
import { PageContext } from 'vike/types';

export async function guard(pageContext: PageContext) {
  if (!pageContext.args) {
    throw redirect('/', 301);
  }
}