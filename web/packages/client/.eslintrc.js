module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        // Works, but commented out for now until we're ready to commit to such a large refactor
        // "plugin:prettier/recommended"
    ],
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-namespace": "off",
        "no-inner-declarations": "off",
        "no-case-declarations": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "semi": [2, "always"],
        'react/prop-types': ['off'],
    },
    settings: {
        react: {
            version: "detect"
        }
    }
}