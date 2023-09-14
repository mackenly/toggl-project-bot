import { test, expect } from 'vitest';
import { Env, commaSeparatedStringToArray, nameBuilder } from '../src/index'

test('commaSeparatedStringToArray converts comma separated string to array', () => {
    const str = 'a, b, c'
    const expected = ['a', 'b', 'c']
    const result = commaSeparatedStringToArray(str)
    expect(result).toEqual(expected)
})

test('commaSeparatedStringToArray converts a single value to an array', () => {
    const str = 'a'
    const expected = ['a']
    const result = commaSeparatedStringToArray(str)
    expect(result).toEqual(expected)
})

test('commaSeparatedStringToArray trims spaces around values', () => {
    const str = ' a     ,  b,    c '
    const expected = ['a', 'b', 'c']
    const result = commaSeparatedStringToArray(str)
    expect(result).toEqual(expected)
})

test('nameBuilder builds project name correctly', () => {
    const name = 'Example Project'
    const date = new Date('01-01-2022')
    const env: Env = { 
        PROJECT_NAME_SEPARATOR: '-',
        WORKSPACE_IDENTIFIER: 0,
        TOGGL_AUTH: 'dummyTogglAuth',
        PROJECT_NAMES: 'dummyProjectNames',
        PROJECT_COLORS: 'dummyProjectColors',
        PROJECT_CLIENTS: 'dummyProjectClients',
        PROJECT_ESTIMATES: 'dummyProjectEstimates',
        PREMIUM_ACCOUNT: true,
    }
    const expected = 'Example Project - 1/2022'
    const result = nameBuilder(name, date, env)
    expect(result).toEqual(expected)
})

test('nameBuilder removes excess spaces from project name', () => {
    const name = '  Example Project       '
    const date = new Date('01-01-2022')
    const env: Env = {
        PROJECT_NAME_SEPARATOR: '+',
        WORKSPACE_IDENTIFIER: 0,
        TOGGL_AUTH: 'dummyTogglAuth',
        PROJECT_NAMES: 'dummyProjectNames',
        PROJECT_COLORS: 'dummyProjectColors',
        PROJECT_CLIENTS: 'dummyProjectClients',
        PROJECT_ESTIMATES: 'dummyProjectEstimates',
        PREMIUM_ACCOUNT: true,
    }
    const expected = 'Example Project + 1/2022'
    const result = nameBuilder(name, date, env)
    expect(result).toEqual(expected)
})