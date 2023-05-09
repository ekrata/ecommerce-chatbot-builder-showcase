import type { Meta, StoryObj } from '@storybook/your-framework';

// 👇 Imports the required stories
import * as PageLayout from './PageLayout.stories';
import * as DocumentHeader from './DocumentHeader.stories';
import * as DocumentList from './DocumentList.stories';
import Page from './chats/page';

const meta: Meta<typeof Page> = {
  title: 'DocumentScreen',
  component: Page,
};

export default meta;
type Story = StoryObj<typeof Page>;

export const Simple: Story = {
  args: {
    user: PageLayout.Simple.args.user,
    document: DocumentHeader.Simple.args.document,
    subdocuments: DocumentList.Simple.args.documents,
  },
};
