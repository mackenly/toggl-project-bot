import { test, expect, describe, it } from 'vitest';
import { Env, commaSeparatedStringToArray, nameBuilder } from '../src/index'

const defaultEnv: Partial<Env> = {
    PROJECT_NAME_SEPARATOR: '-',
    WORKSPACE_IDENTIFIER: 0,
    TOGGL_AUTH: 'dummyTogglAuth',
    PROJECT_NAMES: 'dummyProjectNames',
    PROJECT_COLORS: 'dummyProjectColors',
    PROJECT_CLIENTS: 'dummyProjectClients',
    PROJECT_ESTIMATES: 'dummyProjectEstimates',
    PREMIUM_ACCOUNT: true,
};

describe('commaSeparatedStringToArray', () => {
    it('should converts comma separated string to array', () => {
        const str = 'a, b, c';
        const expected = ['a', 'b', 'c'];
        const result = commaSeparatedStringToArray(str);
        expect(result).toEqual(expected);
    });

    it('should converts a single value to an array', () => {
        const str = 'a';
        const expected = ['a'];
        const result = commaSeparatedStringToArray(str);
        expect(result).toEqual(expected);
    });

    it('should trims spaces around values', () => {
        const str = ' a     ,  b,    c ';
        const expected = ['a', 'b', 'c'];
        const result = commaSeparatedStringToArray(str);
        expect(result).toEqual(expected);
    });
});

test('nameBuilder builds project name correctly', () => {
    const name = 'Example Project'
    const date = new Date('01-01-2022')
    const env: Partial<Env> = {
        ...defaultEnv,
        PROJECT_NAME_SEPARATOR: '-',
    };
    const expected = 'Example Project - 1/2022'
    const result = nameBuilder(name, date, env as Env)
    expect(result).toEqual(expected)
})

test('nameBuilder removes excess spaces from project name', () => {
    const name = '  Example Project       '
    const date = new Date('01-01-2022')
    const env: Partial<Env> = {
        ...defaultEnv,
        PROJECT_NAME_SEPARATOR: '   + ',
    };
    const expected = 'Example Project + 1/2022'
    const result = nameBuilder(name, date, env as Env)
    expect(result).toEqual(expected)
})