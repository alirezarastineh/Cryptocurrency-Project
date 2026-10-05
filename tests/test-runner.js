// Lightweight Zero-Dependency Test Framework for Vanilla ES Modules

export class TestSuite {
  tests = [];
  passed = 0;
  failed = 0;

  constructor(title) {
    this.title = title;
  }

  it(description, fn) {
    this.tests.push({ description, fn });
  }

  async run(renderCallback) {
    const results = await Promise.all(
      this.tests.map(async (test) => {
        try {
          await test.fn();
          return { desc: test.description, pass: true };
        } catch (err) {
          return {
            desc: test.description,
            pass: false,
            error: err?.message || String(err),
          };
        }
      }),
    );

    this.passed = results.filter((r) => r.pass).length;
    this.failed = results.filter((r) => !r.pass).length;

    if (renderCallback) renderCallback(this, results);
    return results;
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
        );
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected deep equality with ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
        );
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toContain(expected) {
      if (!actual?.includes(expected)) {
        throw new Error(
          `Expected collection to contain ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${actual}`);
      }
    },
  };
}
