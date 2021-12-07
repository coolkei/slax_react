import * as React from 'react';
import {
    useGetList,
    useAuthenticated,
    Datagrid,
    TextField,
    Title,
} from 'react-admin';

const currentSort = { field: 'published_at', order: 'DESC' };

const CustomRouteLayout = ({ title = 'Posts' }) => {
    useAuthenticated();

    const { data, total, isLoading } = useGetList('posts', {
        pagination: { page: 1, perPage: 10 },
        sort: currentSort,
    });

    return !isLoading ? (
        <div>
            <Title title="Example Admin" />
            <h1>{title}</h1>
            <p>
                Found <span className="total">{total}</span> posts !
            </p>
            <Datagrid
                basePath="/posts"
                currentSort={currentSort}
                data={data}
                isLoading={isLoading}
                total={total}
                rowClick="edit"
            >
                <TextField source="id" sortable={false} />
                <TextField source="title" sortable={false} />
            </Datagrid>
        </div>
    ) : null;
};

export default CustomRouteLayout;
