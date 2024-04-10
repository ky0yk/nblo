import { err, ok } from 'neverthrow';
import { ArticleBody, toBody } from './article-body';

const mockToBody = toBody as jest.Mock;

export const resetToBodyMock = () => {
  mockToBody
    .mockReset()
    .mockImplementation(() => ok('Mocked Body' as ArticleBody));
};

export const setToBodyError = () => {
  mockToBody.mockImplementation(() => err(new Error('Title validation error')));
};
