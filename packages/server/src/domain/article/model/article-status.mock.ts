import { ok, err } from 'neverthrow';
import { ArticleStatus, validStatusTransition } from './article-status';

const mockToValidStatus = validStatusTransition as jest.Mock;

export const resetToValidStatusMock = () => {
  mockToValidStatus
    .mockReset()
    .mockImplementation(() => ok(ArticleStatus.Published));
};

export const mockToValidStatusError = () => {
  mockToValidStatus.mockImplementation(() => err(new Error('Invalid status')));
};
