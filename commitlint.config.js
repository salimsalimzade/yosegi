export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feature", "refactor", "bugfix", "chore", "docs"]],
    "type-case": [2, "always", "lower-case"],
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
  },
};
