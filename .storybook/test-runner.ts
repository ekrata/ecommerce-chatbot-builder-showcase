import { useDashStore } from './../src/app/[locale]/dash/useDashStore';
import { create as actualCreate, StateCreator } from 'zustand'
// if using Jest:
// import { StateCreator } from 'zustand';
// const { create: actualCreate } = jest.requireActual<typeof import('zustand')>('zustand');
import { act } from 'react-dom/test-utils'

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>()

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = <S>(createState: StateCreator<S>) => {
  const store = actualCreate(createState)
  const initialState = store.getState()
  storeResetFns.add(() => store.setState(initialState, true))
  return store
}

// .storybook/test-runner.ts

import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // Hook that is executed before the test runner starts running tests
  setup() {
    // Add your configuration here.
  },
  /* Hook to execute before a story is rendered.
   * The page argument is the Playwright's page object for the story.
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async preRender(page, context) {
    const storeResetFns = new Set<() => void>()
    useDashStore();
  },

  /* Hook to execute after a story is rendered.
   * The page argument is the Playwright's page object for the story
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async postRender(page, context) {
    // Add your configuration here.
  },
};

module.exports = config;