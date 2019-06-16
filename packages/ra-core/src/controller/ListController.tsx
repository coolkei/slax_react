import { isValidElement, ReactNode, ReactElement, useMemo } from 'react';
import inflection from 'inflection';

import { SORT_ASC } from '../reducer/admin/resource/list/queryReducer';
import { ListParams } from '../actions/listActions';
import { useCheckMinimumRequiredProps } from './checkMinimumRequiredProps';
import { Sort, AuthProvider, RecordMap, Identifier, Translate } from '../types';
import { Location } from 'history';
import { useTranslate } from '../i18n';
import useListParams from './useListParams';
import useGetList from './../fetch/useGetList';
import useRecordSelection from './useRecordSelection';
import useVersion from './useVersion';

interface ChildrenFuncParams {
    basePath: string;
    currentSort: Sort;
    data: RecordMap;
    defaultTitle: string;
    displayedFilters: any;
    filterValues: any;
    hasCreate: boolean;
    hideFilter: (filterName: string) => void;
    ids: Identifier[];
    isLoading: boolean;
    loadedOnce: boolean;
    onSelect: (ids: Identifier[]) => void;
    onToggleItem: (id: Identifier) => void;
    onUnselectItems: () => void;
    page: number;
    perPage: number;
    resource: string;
    selectedIds: Identifier[];
    setFilters: (filters: any) => void;
    setPage: (page: number) => void;
    setPerPage: (page: number) => void;
    setSort: (sort: Sort) => void;
    showFilter: (filterName: string, defaultValue: any) => void;
    translate: Translate;
    total: number;
    version: number;
}

interface Props {
    // the props you can change
    children: (params: ChildrenFuncParams) => ReactNode;
    filter?: object;
    filters?: ReactElement<any>;
    filterDefaultValues?: object;
    pagination?: ReactElement<any>;
    perPage?: number;
    sort?: Sort;
    // the props managed by react-admin
    authProvider?: AuthProvider;
    basePath: string;
    debounce?: number;
    hasCreate?: boolean;
    hasEdit?: boolean;
    hasList?: boolean;
    hasShow?: boolean;
    location: Location;
    path?: string;
    query: ListParams;
    resource: string;
    [key: string]: any;
}

const defaultSort = {
    field: 'id',
    order: SORT_ASC,
};
/**
 * List page component
 *
 * The <List> component renders the list layout (title, buttons, filters, pagination),
 * and fetches the list of records from the REST API.
 * It then delegates the rendering of the list of records to its child component.
 * Usually, it's a <Datagrid>, responsible for displaying a table with one row for each post.
 *
 * In Redux terms, <List> is a connected component, and <Datagrid> is a dumb component.
 *
 * Props:
 *   - title
 *   - perPage
 *   - sort
 *   - filter (the permanent filter to apply to the query)
 *   - actions
 *   - filters (a React component used to display the filter form)
 *   - pagination
 *
 * @example
 *     const PostFilter = (props) => (
 *         <Filter {...props}>
 *             <TextInput label="Search" source="q" alwaysOn />
 *             <TextInput label="Title" source="title" />
 *         </Filter>
 *     );
 *     export const PostList = (props) => (
 *         <List {...props}
 *             title="List of posts"
 *             sort={{ field: 'published_at' }}
 *             filter={{ is_published: true }}
 *             filters={<PostFilter />}
 *         >
 *             <Datagrid>
 *                 <TextField source="id" />
 *                 <TextField source="title" />
 *                 <EditButton />
 *             </Datagrid>
 *         </List>
 *     );
 */
const ListController = (props: Props) => {
    useCheckMinimumRequiredProps(
        'List',
        ['basePath', 'location', 'resource', 'children'],
        props
    );
    if (props.filter && isValidElement(props.filter)) {
        throw new Error(
            '<List> received a React element as `filter` props. If you intended to set the list filter elements, use the `filters` (with an s) prop instead. The `filter` prop is internal and should not be set by the developer.'
        );
    }

    const {
        basePath,
        children,
        resource,
        hasCreate,
        location,
        filterDefaultValues,
        sort = defaultSort,
        perPage = 10,
        filter,
        debounce = 500,
    } = props;

    const translate = useTranslate();
    const version = useVersion();

    const [query, queryModifiers] = useListParams({
        resource,
        location,
        filterDefaultValues,
        sort,
        perPage,
        debounce,
    });

    const [selectedIds, selectionModifiers] = useRecordSelection(resource);

    const { data, ids, total, loading, loaded } = useGetList(
        resource,
        {
            page: query.page,
            perPage: query.perPage,
        },
        { field: query.sort, order: query.order },
        { ...query.filter, ...filter },
        {
            version,
            onFailure: {
                notification: {
                    body: 'ra.notification.http_error',
                    level: 'warning',
                },
            },
        }
    );

    if (!query.page && !(ids || []).length && query.page > 1 && total > 0) {
        // query for a page that doesn't exist, check the previous page
        queryModifiers.setPage(query.page - 1);
    }

    const currentSort = useMemo(
        () => ({
            field: query.sort,
            order: query.order,
        }),
        [query.sort, query.order]
    );

    const resourceName = translate(`resources.${resource}.name`, {
        smart_count: 2,
        _: inflection.humanize(inflection.pluralize(resource)),
    });
    const defaultTitle = translate('ra.page.list', {
        name: resourceName,
    });

    return children({
        basePath,
        currentSort,
        data,
        defaultTitle,
        displayedFilters: query.displayedFilters,
        filterValues: query.filterValues,
        hasCreate,
        ids,
        isLoading: loading,
        loadedOnce: loaded,
        onSelect: selectionModifiers.select,
        onToggleItem: selectionModifiers.toggle,
        onUnselectItems: selectionModifiers.clearSelection,
        page: query.page,
        perPage: query.perPage,
        resource,
        selectedIds,
        setFilters: queryModifiers.setFilters,
        hideFilter: queryModifiers.hideFilter,
        showFilter: queryModifiers.showFilter,
        setPage: queryModifiers.setPage,
        setPerPage: queryModifiers.setPerPage,
        setSort: queryModifiers.setSort,
        translate,
        total,
        version,
    });
};

export const injectedProps = [
    'basePath',
    'currentSort',
    'data',
    'defaultTitle',
    'displayedFilters',
    'filterValues',
    'hasCreate',
    'hideFilter',
    'ids',
    'isLoading',
    'loadedOnce',
    'onSelect',
    'onToggleItem',
    'onUnselectItems',
    'page',
    'perPage',
    'refresh',
    'resource',
    'selectedIds',
    'setFilters',
    'setPage',
    'setPerPage',
    'setSort',
    'showFilter',
    'total',
    'translate',
    'version',
];

/**
 * Select the props injected by the ListController
 * to be passed to the List children need
 * This is an implementation of pick()
 */
export const getListControllerProps = props =>
    injectedProps.reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

/**
 * Select the props not injected by the ListController
 * to be used inside the List children to sanitize props injected by List
 * This is an implementation of omit()
 */
export const sanitizeListRestProps = props =>
    Object.keys(props)
        .filter(propName => !injectedProps.includes(propName))
        .reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

export default ListController;
