// https://vike.dev/onPageTransitionStart
import type { OnPageTransitionStartAsync } from 'vike/types';

const onPageTransitionStart: OnPageTransitionStartAsync = async (): ReturnType<OnPageTransitionStartAsync> => {
  // console.log('Page transition start');
  document.querySelector('body')!.classList.add('page-is-transitioning');
};

export default onPageTransitionStart;
