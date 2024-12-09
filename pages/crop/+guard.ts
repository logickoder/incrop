import { render } from 'vike/abort';
import { PageContext } from 'vike/types';

export async function guard(pageContext: PageContext) {
  if (!pageContext.args) {
    throw render(404, 'You need to provide an image to continue');
  }
}