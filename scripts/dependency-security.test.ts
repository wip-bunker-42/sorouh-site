import { createRequire } from 'node:module'
import { describe, expect, test } from 'vitest'

type AstNode = {
  type: string
  nodes?: AstNode[]
  value?: string
  parent?: AstNode
}

type Braces = {
  (pattern: string, options?: Record<string, unknown>): string[]
  parse: (pattern: string) => AstNode
  compile: (pattern: string | AstNode) => string
  expand: (pattern: string | AstNode) => string[]
  stringify: (pattern: string | AstNode) => string
}

// Resolve the copy used by Sanity's code generator, rather than an unrelated
// direct test dependency. Removing the pnpm patch must break these tests.
let dependencyRequire = createRequire(new URL('../package.json', import.meta.url))
for (const dependency of ['sanity', '@sanity/cli', '@sanity/codegen', 'chokidar']) {
  dependencyRequire = createRequire(dependencyRequire.resolve(dependency))
}
const braces = dependencyRequire('braces') as Braces

const nestedAst = (depth: number): AstNode => {
  const root: AstNode = { type: 'root', nodes: [] }
  let node = root
  for (let index = 0; index < depth; index++) {
    const child: AstNode = { type: 'paren', nodes: [], parent: node }
    node.nodes!.push(child)
    node = child
  }
  node.nodes!.push({ type: 'text', value: 'x', parent: node })
  return root
}

describe('patched Sanity glob dependency', () => {
  const dangerousPatterns = [
    ['deep balanced braces', '{'.repeat(4_000) + 'a,b' + '}'.repeat(4_000)],
    ['unclosed braces', '{'.repeat(200) + 'a,b'],
    ['deep balanced parentheses', '('.repeat(4_000) + 'x' + ')'.repeat(4_000)],
    ['unclosed parentheses', '('.repeat(200) + 'x'],
    ['mixed nesting', '{('.repeat(60) + 'a,b' + ')}'.repeat(60)],
  ] as const

  for (const method of ['parse', 'compile', 'expand', 'stringify'] as const) {
    test.each(dangerousPatterns)(`${method} rejects %s before recursive walking`, (_, pattern) => {
      expect(() => braces[method](pattern)).toThrow(SyntaxError)
    })
  }

  test('the default glob API enforces the same nesting limit', () => {
    expect(() => braces('{'.repeat(101) + 'a,b' + '}'.repeat(101))).toThrow(SyntaxError)
  })

  for (const method of ['compile', 'expand', 'stringify'] as const) {
    test(`${method} also rejects deeply nested caller-supplied ASTs`, () => {
      expect(() => braces[method](nestedAst(4_000))).toThrow(SyntaxError)
    })
  }

  test('ordinary alternatives and ranges retain their results', () => {
    expect(braces.compile('src/{pages,components}/file-{1..3}.ts')).toBe(
      'src/(pages|components)/file-([1-3]).ts',
    )
    expect(braces.expand('src/{a,b}/file-{1..2}.ts')).toEqual([
      'src/a/file-1.ts',
      'src/a/file-2.ts',
      'src/b/file-1.ts',
      'src/b/file-2.ts',
    ])
  })

  test('100 actual nesting levels remain supported', () => {
    const pattern = '('.repeat(100) + 'x' + ')'.repeat(100)
    expect(braces.compile(pattern)).toBe(pattern)
    expect(braces.expand(pattern)).toEqual([pattern])
    expect(braces.stringify(pattern)).toBe(pattern)
  })

  test('many sibling groups do not count as nesting', () => {
    const pattern = '{a,b}/'.repeat(150)
    expect(braces.compile(pattern)).toBe('(a|b)/'.repeat(150))
  })

  test('quoted, escaped, and bracketed delimiters stay literal', () => {
    expect(braces.compile('"' + '('.repeat(200) + '"')).toBe('('.repeat(200))
    expect(braces.compile('\\{'.repeat(200))).toBe('{'.repeat(200))
    expect(braces.compile('[' + '{('.repeat(200) + ']')).toBe('[' + '{('.repeat(200) + ']')
  })
})
