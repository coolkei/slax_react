import * as React from 'react';
import { createElement, ComponentType, useMemo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import { CoreAdminRouter } from './CoreAdminRouter';
import { Ready } from '../util';
import {
    TitleComponent,
    LoginComponent,
    LayoutComponent,
    CoreLayoutProps,
    AdminChildren,
    CatchAllComponent,
    DashboardComponent,
    LoadingComponent,
} from '../types';

export type ChildrenFunction = () => ComponentType[];

const DefaultLayout = ({ children }: CoreLayoutProps) => <>{children}</>;

export interface CoreAdminUIProps {
    catchAll?: CatchAllComponent;
    children?: AdminChildren;
    dashboard?: DashboardComponent;
    disableTelemetry?: boolean;
    layout?: LayoutComponent;
    loading?: LoadingComponent;
    loginPage?: LoginComponent | boolean;
    logout?: ComponentType;
    menu?: ComponentType;
    ready?: ComponentType;
    title?: TitleComponent;
}

export const CoreAdminUI = (props: CoreAdminUIProps) => {
    const {
        catchAll = Noop,
        children,
        dashboard,
        disableTelemetry = false,
        layout = DefaultLayout,
        loading = Noop,
        loginPage: LoginPage = false,
        logout,
        menu, // deprecated, use a custom layout instead
        ready = Ready,
        title = 'React Admin',
    } = props;

    const logoutElement = useMemo(() => logout && createElement(logout), [
        logout,
    ]);

    useEffect(() => {
        if (
            disableTelemetry ||
            process.env.NODE_ENV !== 'production' ||
            typeof window === 'undefined' ||
            typeof window.location === 'undefined' ||
            typeof Image === 'undefined'
        ) {
            return;
        }
        const img = new Image();
        img.src = `https://react-admin-telemetry.marmelab.com/react-admin-telemetry?domain=${window.location.hostname}`;
    }, [disableTelemetry]);

    return (
        <Routes>
            {LoginPage !== false && LoginPage !== true ? (
                <Route path="/login" element={<LoginPage title={title} />} />
            ) : null}
            <Route
                path="/*"
                element={
                    <CoreAdminRouter
                        catchAll={catchAll}
                        dashboard={dashboard}
                        layout={layout}
                        loading={loading}
                        logout={logoutElement}
                        menu={menu}
                        ready={ready}
                        title={title}
                    >
                        {children}
                    </CoreAdminRouter>
                }
            />
        </Routes>
    );
};

const Noop = () => null;
