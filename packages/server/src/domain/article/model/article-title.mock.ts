import { err, ok } from 'neverthrow';
import { ArticleTitle, toTitle } from './article-title';

const mockToTitle = toTitle as jest.Mock;

export const resetToTitleMock = () => {
  mockToTitle
    .mockReset()
    .mockImplementation(() => ok('Mocked Title' as ArticleTitle));
};

export const setToTitleError = () => {
  mockToTitle.mockImplementation(() =>
    err(new Error('Title validation error')),
  );
};
