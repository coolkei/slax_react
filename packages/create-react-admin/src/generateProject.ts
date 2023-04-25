import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { ProjectConfiguration } from './ProjectState.js';

export const generateProject = async (state: ProjectConfiguration) => {
    const projectDirectory = initializeProjectDirectory(state.name);

    copyDirectoryFiles(
        path.join(__dirname, '../templates/common'),
        projectDirectory
    );

    if (state.dataProvider !== 'none') {
        copyDirectoryFiles(
            path.join(__dirname, '../templates', state.dataProvider),
            path.join(path.join(projectDirectory, 'src')),
            ['package.json']
        );
    }

    if (state.authProvider !== 'none') {
        copyDirectoryFiles(
            path.join(__dirname, '../templates', state.authProvider),
            path.join(path.join(projectDirectory, 'src')),
            ['package.json']
        );
    }

    generateAppFile(projectDirectory, state);
    generatePackageJson(projectDirectory, state);
    generateEnvFile(projectDirectory, state);
    generateReadme(projectDirectory, state);
};

const generateAppFile = (
    projectDirectory: string,
    state: ProjectConfiguration
) => {
    fs.writeFileSync(
        path.join(projectDirectory, 'src', 'App.tsx'),
        `
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
${
    state.dataProvider !== 'none'
        ? `import { dataProvider } from './dataProvider';\n`
        : ''
}${
            state.authProvider !== 'none'
                ? `import { authProvider } from './authProvider';\n`
                : ''
        }
export const App = () => (
    <Admin
        ${
            state.dataProvider !== 'none'
                ? `dataProvider={dataProvider}\n\t`
                : ''
        }${
            state.authProvider !== 'none'
                ? `\tauthProvider={authProvider}\n\t`
                : ''
        }>
        ${state.resources
            .map(
                resource =>
                    `<Resource name="${resource}" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />`
            )
            .join('\n\t\t')}
    </Admin>
);

    `
    );
};

const generatePackageJson = (
    projectDirectory: string,
    state: ProjectConfiguration
) => {
    const dataProviderDeps = getTemplateDependencies(state.dataProvider);
    const authProviderDeps = getTemplateDependencies(state.authProvider);
    const allDeps = {
        ...BasePackageJson.dependencies,
        ...dataProviderDeps,
        ...authProviderDeps,
    };
    const allDepsNames = Object.keys(allDeps).sort();
    const dependencies = allDepsNames.reduce(
        (acc, depName) => ({
            ...acc,
            [depName]: allDeps[depName],
        }),
        {}
    );
    const packageJson = {
        name: state.name,
        ...BasePackageJson,
        dependencies,
    };

    fs.writeFileSync(
        path.join(projectDirectory, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );
};

const generateEnvFile = (
    projectDirectory: string,
    state: ProjectConfiguration
) => {
    const dataProviderEnv = getTemplateEnv(state.dataProvider);
    const authProviderEnv = getTemplateEnv(state.authProvider);

    let env = '';

    if (dataProviderEnv) {
        env += `${dataProviderEnv}\n`;
    }

    if (authProviderEnv) {
        env += `${authProviderEnv}\n`;
    }

    if (env) {
        fs.writeFileSync(path.join(projectDirectory, '.env'), env);
    }
};

const getTemplateEnv = (template: string) => {
    if (template === 'none' || template === '') {
        return undefined;
    }
    const envPath = path.join(__dirname, '../templates', template, '.env');
    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf-8');
        return env;
    }
    return undefined;
};

const BasePackageJson = {
    private: true,
    scripts: {
        dev: 'vite',
        build: 'vite build',
        serve: 'vite preview',
        'type-check': 'tsc --noEmit',
    },
    dependencies: {
        react: '^18.2.0',
        'react-admin': '^4.9.0',
        'react-dom': '^18.2.0',
    },
    devDependencies: {
        '@types/react': '^18.0.22',
        '@types/react-dom': '^18.0.7',
        '@vitejs/plugin-react': '^2.2.0',
        typescript: '^4.6.4',
        vite: '^3.2.0',
    },
};

const getTemplateDependencies = (template: string) => {
    if (template === 'none' || template === '') {
        return {};
    }
    const packageJsonPath = path.join(
        __dirname,
        '../templates',
        template,
        'package.json'
    );
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
        return JSON.parse(packageJson).dependencies;
    }
    return {};
};

const initializeProjectDirectory = (projectName: string) => {
    let projectDirectory = process.cwd();

    if (path.dirname(projectDirectory) !== projectName) {
        if (fs.existsSync(path.join(process.cwd(), projectName))) {
            throw new Error(
                `A directory named ${projectName} already exists in the current directory. Please choose a different name.`
            );
        }
        projectDirectory = path.join(process.cwd(), projectName);
        fs.mkdirSync(projectDirectory);
    }
    return projectDirectory;
};

const copyDirectoryFiles = (
    source: string,
    destination: string,
    excludes?: string[]
) => {
    fsExtra.copySync(
        source,
        destination,
        excludes && excludes.length
            ? {
                  filter: (src: string) => {
                      if (excludes.some(exclude => src.endsWith(exclude))) {
                          return false;
                      }
                      return true;
                  },
              }
            : undefined
    );
};

const generateReadme = (
    projectDirectory: string,
    state: ProjectConfiguration
) => {
    const defaultReadme = getTemplateReadme('common');
    const dataProviderReadme = getTemplateReadme(state.dataProvider);
    const authProviderReadme = getTemplateReadme(state.authProvider);

    let readme = `${defaultReadme
        .replace(`{{name}}`, state.name)
        .replace(`{{pkgManager}}`, state.installer)}`;

    if (dataProviderReadme) {
        readme += `\n${dataProviderReadme}`;
    }

    if (authProviderReadme) {
        readme += `\n${authProviderReadme}`;
    }

    if (readme) {
        fs.writeFileSync(path.join(projectDirectory, 'README.md'), readme);
    }
};

const getTemplateReadme = (template: string) => {
    if (template === 'none' || template === '') {
        return undefined;
    }
    const readmePath = path.join(
        __dirname,
        '../templates',
        template,
        'README.md'
    );
    if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, 'utf-8');
        return readme;
    }
    return undefined;
};
