import { useCallback } from 'react';

import { useRecordSelection } from './useRecordSelection';
import { Identifier } from '../types';

/**
 * Hook to Unselect the rows of a datagrid
 *
 * @example
 *
 * const unselect = useUnselect('posts');
 * unselect([123, 456]);
 */
export const useUnselect = (resource: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, { unselect }] = useRecordSelection(resource);
    return useCallback(
        (ids: Identifier[]) => {
            unselect(ids);
        },
        [unselect]
    );
};
